// Notion 데이터 로드 (GitHub Actions가 매일 갱신한 JSON 파일에서)
// scripts/fetch-notion.js가 매일 오후 2시에 Notion에서 데이터를 fetch해서 JSON으로 저장합니다

let cachedData = null;

async function loadNotionData() {
  if (cachedData) return cachedData;
  
  try {
    console.log('🔄 로컬 데이터 로드 중...');
    const response = await fetch('data/notion-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }
    cachedData = await response.json();
    console.log('✅ 데이터 로드 완료 (마지막 업데이트:', cachedData.lastUpdated, ')');
    return cachedData;
  } catch (error) {
    console.error('❌ 데이터 로드 실패:', error);
    throw error;
  }
}

// 프로젝트 데이터 가져오기
async function getProjects() {
  const data = await loadNotionData();
  const projects = (data.projects || []).map(normalizeProject);
  // Order 기준으로 정렬
  return projects.sort((a, b) => a.order - b.order);
}

// ABOUT 데이터 가져오기
async function getAboutData() {
  const data = await loadNotionData();
  return (data.about || []).map(normalizeAbout);
}

// VAULT 데이터 가져오기
async function getVaultData() {
  const data = await loadNotionData();
  const vault = (data.vault || []).map(normalizeVault);
  // Order 기준으로 정렬
  return vault.sort((a, b) => a.order - b.order);
}

// 프로젝트 번호 → 폴더명 매핑
const PROJECT_FOLDER_MAP = {
  '01': '99das',
  '02': 'ridp',
  '03': 'iplex',
  '04': 'valoo',
  '05': 'whybox'
};

// 프로젝트 데이터 형식 변환 (Notion API 필드명 → 기존 필드명)
function normalizeProject(project) {
  const number = project.Number || '';
  const folderName = PROJECT_FOLDER_MAP[number];
  
  // Notion에 images가 없으면 로컬 경로 자동 생성
  let images = project.images || [];
  if (images.length === 0 && folderName) {
    // 프로젝트별 이미지 개수 추정 (실제 파일 존재 여부는 로드 시 확인)
    const imageCount = 30; // 최대 30개까지 시도
    images = Array.from({length: imageCount}, (_, i) => 
      `img/projects/${folderName}/img${i + 1}.jpg`
    );
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

// Vault 데이터 형식 변환
function normalizeVault(vaultItem) {
  const order = vaultItem.Order || 1;
  return {
    id: vaultItem.ID || `va_${order}`,
    order: order,
    thumbnailImage: vaultItem.thumbnailImage || `path/thumbnail/vault/vault${order}.png`,
    fullImage: vaultItem.fullImage || `path/full/vault/vault${order}.png`
  };
}

// About 데이터 형식 변환
function normalizeAbout(aboutItem) {
  return {
    id: aboutItem.ID || '',
    section: aboutItem.Section || '',
    title: aboutItem.Title || '',
    detail: aboutItem.Detail || '',
    startDate: aboutItem.StartDate || '',
    endDate: aboutItem.EndDate || '',
    link: aboutItem.Link || null
  };
}

// SETTINGS 데이터 가져오기
async function getSettings() {
  const data = await loadNotionData();
  return data.settings || {};
}

// 전체 데이터 한번에 로드
async function loadAllData() {
  try {
    const data = await loadNotionData();
    
    // 패스워드 설정 (로컬 passwords.js에서 가져옴 - 보안상 Notion에서 가져오지 않음)
    if (typeof getPasswordHash === 'function') {
      const hash = getPasswordHash();
      if (hash) {
        window.NOTION_PASSWORD_HASH = hash;
        console.log('✅ 패스워드 설정 완료 (로컬 passwords.js에서)');
      } else {
        console.warn('⚠️ CryptoJS가 로드되지 않았습니다. 비밀번호 해싱 불가');
      }
    } else {
      console.warn('⚠️ passwords.js 파일을 찾을 수 없습니다 (필수 아님)');
    }
    
    const projects = (data.projects || []).map(normalizeProject).sort((a, b) => a.order - b.order);
    const about = (data.about || []).map(normalizeAbout);
    const vault = (data.vault || []).map(normalizeVault).sort((a, b) => a.order - b.order);
    
    return {
      projects: projects,
      about: about,
      vault: vault,
      settings: data.settings || {}
    };
  } catch (error) {
    console.error('Failed to load data:', error);
    return { projects: [], about: [], vault: [], settings: {} };
  }
}
