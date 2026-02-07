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
    throw new Error(`Notion API Error [${response.status}]: ${response.statusText}`);
  }

  return response.json();
}

// 데이터베이스 쿼리
async function queryDatabase(databaseId) {
  try {
    const response = await notionFetch(`/databases/${databaseId}/query`, {
      body: {
        filter: {
          property: 'status',
          select: {
            equals: 'UNLOCKED'
          }
        },
        sorts: [
          {
            property: 'order',
            direction: 'ascending'
          }
        ]
      }
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

// 프로젝트 데이터 가져오기
async function getProjects() {
  try {
    console.log('  📥 Projects 데이터베이스 쿼리 중...');
    const projects = await queryDatabase(DATABASE_IDS.PROJECTS);
    
    // 이미지 경로 변환
    const processedProjects = projects.map(project => ({
      ...project,
      images: convertImagesToLocalPaths(project.images, project.number)
    }));
    
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
    console.log(`  ✅ ${about.length}개 항목 로드됨`);
    return about;
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
    console.log(`  ✅ ${vault.length}개 항목 로드됨`);
    return vault;
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
    console.log(`  ✅ Settings 로드됨`);
    return settings.length > 0 ? settings[0] : {};
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
