/**
 * Notion API에서 데이터를 fetch해서 JSON으로 저장
 * GitHub Actions가 매일 오후 2시에 실행합니다
 * 
 * 환경 변수 필요:
 * - NOTION_TOKEN: Notion API token
 * - PROJECTS_DB: Projects DB ID
 * - ABOUT_DB: About DB ID
 * - VAULT_DB: Vault DB ID
 * - SETTINGS_DB: Settings DB ID
 */

const fs = require('fs');
const path = require('path');

// GitHub Secrets 환경 변수에서 설정 가져오기
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_IDS = {
  PROJECTS: process.env.PROJECTS_DB,
  ABOUT: process.env.ABOUT_DB,
  VAULT: process.env.VAULT_DB,
  SETTINGS: process.env.SETTINGS_DB
};

// 프로젝트 번호 → 폴더명 매핑
const PROJECT_FOLDER_MAP = {
  '01': '99das',
  '02': 'ridp',
  '03': 'iplex',
  '04': 'valoo',
  '05': 'whybox'
};

// 프로젝트별 이미지 개수 및 확장자 (실제 파일 기준)
const PROJECT_IMAGE_INFO = {
  '01': { count: 14, extensions: ['jpg'] },
  '02': { count: 18, extensions: ['jpg'] },
  '03': { count: 21, extensions: ['gif', 'jpg'] }, // iplex: gif와 jpg 혼용
  '04': { count: 3, extensions: ['jpg'] },
  '05': { count: 27, extensions: ['gif', 'jpg'] }  // whybox: img1~16은 gif 또는 jpg
};

// 환경 변수 검증
if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN 환경 변수가 설정되지 않았습니다');
  process.exit(1);
}

for (const [key, value] of Object.entries(DATABASE_IDS)) {
  if (!value) {
    console.error(`❌ ${key} 환경 변수가 설정되지 않았습니다`);
    process.exit(1);
  }
}

// Notion API 호출
async function notionFetch(endpoint, options = {}) {
  const url = `https://api.notion.com/v1${endpoint}`;
  
  const response = await fetch(url, {
    method: options.method || 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    ...(options.body && { body: JSON.stringify(options.body) })
  });

  if (!response.ok) {
    const errorText = await response.text();
    const detail = errorText ? ` - ${errorText}` : '';
    throw new Error(`Notion API Error [${response.status}]: ${response.statusText}${detail}`);
  }

  return response.json();
}

const databaseSchemaCache = new Map();

// 데이터베이스 스키마 가져오기
async function getDatabaseSchema(databaseId) {
  if (databaseSchemaCache.has(databaseId)) {
    return databaseSchemaCache.get(databaseId);
  }

  const schema = await notionFetch(`/databases/${databaseId}`, { method: 'GET' });
  databaseSchemaCache.set(databaseId, schema);
  return schema;
}

// 데이터베이스 쿼리
async function queryDatabase(databaseId, options = {}) {
  try {
    const schema = await getDatabaseSchema(databaseId);
    const properties = schema.properties || {};
    const propertyEntries = Object.entries(properties);

    const orderProp = propertyEntries.find(([name]) => name.toLowerCase() === 'order');

    // options.sortDirection으로 정렬 방향 지정 가능 (기본값: descending)
    const sortDirection = options.sortDirection || 'descending';
    
    const sorts = orderProp
      ? [{ property: orderProp[0], direction: sortDirection }]
      : undefined;

    const body = {};
    if (sorts) body.sorts = sorts;

    const response = await notionFetch(`/databases/${databaseId}/query`, {
      body
    });

    return response.results.map(page => formatPageData(page));
  } catch (error) {
    console.error(`❌ 데이터베이스 쿼리 실패:`, error.message);
    return [];
  }
}

// Notion 페이지 데이터 포맷팅
function formatPageData(page) {
  const props = page.properties;
  const data = {};

  for (const key in props) {
    const prop = props[key];

    try {
      switch (prop.type) {
        case 'title':
          data[key] = prop.title.map(t => t.plain_text).join('');
          break;

        case 'rich_text':
          data[key] = prop.rich_text.map(t => t.plain_text).join('');
          break;

        case 'number':
          data[key] = prop.number;
          break;

        case 'select':
          data[key] = prop.select ? prop.select.name : null;
          break;

        case 'multi_select':
          data[key] = prop.multi_select.map(t => t.name);
          break;

        case 'date':
          data[key] = prop.date ? prop.date.start : null;
          break;

        case 'checkbox':
          data[key] = prop.checkbox;
          break;

        case 'url':
          data[key] = prop.url;
          break;

        case 'files':
          // 파일/이미지 처리 (S3 URL 그대로 저장)
          data[key] = prop.files.map(f => {
            if (f.type === 'file') return f.file.url;
            if (f.type === 'external') return f.external.url;
            return null;
          }).filter(Boolean);
          break;

        default:
          data[key] = null;
      }
    } catch (error) {
      console.warn(`⚠️ 속성 파싱 오류 (${key}):`, error.message);
      data[key] = null;
    }
  }

  return data;
}

// 이미지 URL을 로컬 경로로 변환
function convertImagesToLocalPaths(images, projectNumber) {
  if (!images || images.length === 0) return [];

  const folderName = PROJECT_FOLDER_MAP[projectNumber];
  if (!folderName) {
    console.warn(`⚠️ 프로젝트 번호 ${projectNumber}에 해당하는 폴더를 찾을 수 없습니다`);
    return [];
  }

  // S3 URL을 로컬 경로로 변환
  return images.map((url, index) => {
    if (typeof url === 'string' && url.includes('amazonaws')) {
      // 이미지 확장자 결정
      const extension = url.includes('.gif') ? 'gif' : url.includes('.png') ? 'png' : 'jpg';
      return `img/projects/${folderName}/img${index + 1}.${extension}`;
    }
    return url;
  });
}

// Vault 이미지 URL을 로컬 경로로 변환
function convertVaultImagesToLocalPaths(vaultItems) {
  if (!vaultItems || vaultItems.length === 0) return [];
  
  return vaultItems.map((item, index) => {
    // order 필드가 있으면 사용, 없으면 index + 1
    const vaultNumber = item.order !== undefined && item.order > 0 ? item.order : index + 1;
    
    return {
      ...item,
      thumbnailImage: item.thumbnailImage && item.thumbnailImage.includes('amazonaws') 
        ? `path/thumbnail/vault/vault${vaultNumber}.png` 
        : item.thumbnailImage,
      fullImage: item.fullImage && item.fullImage.includes('amazonaws') 
        ? `path/full/vault/vault${vaultNumber}.png` 
        : item.fullImage
    };
  });
}

// 프로젝트 데이터를 프론트엔드 형식으로 변환
function normalizeProjectForFrontend(project) {
  const number = project.Number || project.number || '';
  const folderName = PROJECT_FOLDER_MAP[number];
  
  // Notion에 images가  비어있으면 로컬 파일 시스템에서 읽기
  let images = project.images || [];
  if (images.length === 0 && folderName) {
    const projectImagesPath = path.join(__dirname, '..', 'img', 'projects', folderName);
    
    try {
      if (fs.existsSync(projectImagesPath)) {
        // 실제 파일 목록을 읽어서 정렬
        const files = fs.readdirSync(projectImagesPath)
          .filter(file => /^img\d+\.(jpg|gif|png)$/i.test(file))
          .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
          });
        
        images = files.map(file => `img/projects/${folderName}/${file}`);
        console.log(`  📁 ${folderName}: ${images.length}개 이미지 파일 발견`);
      }
    } catch (error) {
      console.warn(`  ⚠️ ${folderName} 이미지 폴더 읽기 실패:`, error.message);
    }
  } else if (images.length > 0) {
    // S3 URL이 있으면 로컬 경로로 변환
    images = convertImagesToLocalPaths(images, number);
  }
  
  return {
    id: project['Project ID'] || `proj_${number}`,
    title: project.Title || '',
    subtitle: project.Subtitle || '',
    description: project.Description || '',
    date: project.Date || '',
    projectType: project.ProjectType || '',
    part: project.Part || '',
    client: project.Client || '',
    tags: project.tags || [],
    status: project.Status || 'UNLOCKED',
    thumbColor: project.ThumbColor || '#000000',
    mainColor: project.MainColor || '#000000',
    modalTextColor: project.ModalTextColor || '#000000',
    modalBgColor: project.ModalBgColor || '#FFFFFF',
    thumbnailImage: project.thumbnailImage || null,
    coverImage: project.coverImage || null,
    images: images,
    order: project.Order || 0,
    number: number,
    year: project.Year || new Date().getFullYear(),
    category: Array.isArray(project.Category) ? project.Category[0] : (project.Category || ''),
    techType: Array.isArray(project.TechType) ? project.TechType[0] : (project.TechType || '')
  };
}

// About 데이터를 프론트엔드 형식으로 변환
function normalizeAboutForFrontend(about) {
  return {
    id: about.ID || '',
    section: about.Section || '',
    title: about.Title || '',
    detail: about.Detail || '',
    startDate: about.StartDate || '',
    endDate: about.EndDate || '',
    link: about.Link || null
  };
}

// Vault 데이터를 프론트엔드 형식으로 변환
function normalizeVaultForFrontend(vault) {
  const order = vault.Order || 1;
  return {
    id: vault.ID || `va_${order}`,
    order: order,
    thumbnailImage: vault.thumbnailImage || `path/thumbnail/vault/vault${order}.png`,
    fullImage: vault.fullImage || `path/full/vault/vault${order}.png`
  };
}

// 프로젝트 데이터 가져오기
async function getProjects() {
  try {
    console.log('  📥 Projects 데이터베이스 쿼리 중...');
    const projects = await queryDatabase(DATABASE_IDS.PROJECTS);
    
    // 프론트엔드 형식으로 변환 (정렬은 queryDatabase에서 이미 함)
    const processedProjects = projects.map(normalizeProjectForFrontend);
    
    console.log(`  ✅ ${processedProjects.length}개 프로젝트 로드됨`);
    return processedProjects;
  } catch (error) {
    console.error('  ❌ Projects 로드 실패:', error.message);
    return [];
  }
}

// ABOUT 데이터 가져오기
async function getAboutData() {
  try {
    console.log('  📥 About 데이터베이스 쿼리 중...');
    const about = await queryDatabase(DATABASE_IDS.ABOUT);
    
    // 프론트엔드 형식으로 변환
    const processedAbout = about.map(normalizeAboutForFrontend);
    
    console.log(`  ✅ ${processedAbout.length}개 항목 로드됨`);
    return processedAbout;
  } catch (error) {
    console.error('  ❌ About 로드 실패:', error.message);
    return [];
  }
}

// VAULT 데이터 가져오기
async function getVaultData() {
  try {
    console.log('  📥 Vault 데이터베이스 쿼리 중...');
    const vault = await queryDatabase(DATABASE_IDS.VAULT);
    
    // 프론트엔드 형식으로 변환 (정렬은 queryDatabase에서 이미 함)
    const processedVault = vault.map(normalizeVaultForFrontend);
    
    console.log(`  ✅ ${processedVault.length}개 항목 로드됨`);
    return processedVault;
  } catch (error) {
    console.error('  ❌ Vault 로드 실패:', error.message);
    return [];
  }
}

// SETTINGS 데이터 가져오기
async function getSettings() {
  try {
    console.log('  📥 Settings 데이터베이스 쿼리 중...');
    const settings = await queryDatabase(DATABASE_IDS.SETTINGS);
    
    if (!settings || settings.length === 0) {
      console.warn('  ⚠️ Settings 데이터가 없습니다');
      return {};
    }
    
    // Key-Value 쌍으로 변환
    const settingsObj = {};
    if (Array.isArray(settings)) {
      settings.forEach(item => {
        const key = item.Key;
        const value = item.Value;
        if (key && value !== undefined) {
          settingsObj[key] = value;
        }
      });
    }
    
    console.log(`  ✅ Settings 로드됨 (${Object.keys(settingsObj).length}개 속성)`);
    return settingsObj;
  } catch (error) {
    console.error('  ❌ Settings 로드 실패:', error.message);
    return {};
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Notion 데이터 fetch 시작...\n');

  try {
    // 모든 데이터베이스에서 데이터 fetch
    console.log('📦 Notion 데이터베이스에서 데이터 가져오는 중...');
    const [projects, about, vault, settings] = await Promise.all([
      getProjects(),
      getAboutData(),
      getVaultData(),
      getSettings()
    ]);

    // 데이터 구성
    const outputData = {
      projects: projects,
      about: about,
      vault: vault,
      settings: settings,
      lastUpdated: new Date().toISOString()
    };

    // data 폴더 생성
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`📁 디렉토리 생성: ${dataDir}`);
    }

    // JSON 파일로 저장
    const outputPath = path.join(dataDir, 'notion-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

    console.log(`\n✅ 데이터 저장 완료`);
    console.log(`  📂 파일: ${outputPath}`);
    console.log(`  📊 요약:`);
    console.log(`    • Projects: ${projects.length}개`);
    console.log(`    • About: ${about.length}개`);
    console.log(`    • Vault: ${vault.length}개`);
    console.log(`  🕐 마지막 업데이트: ${outputData.lastUpdated}`);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 실행
main().catch(error => {
  console.error('❌ 치명적 오류:', error);
  process.exit(1);
});
