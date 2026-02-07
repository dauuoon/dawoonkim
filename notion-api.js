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
  return (data.projects || []).map(normalizeProject);
}

// ABOUT 데이터 가져오기
async function getAboutData() {
  const data = await loadNotionData();
  return data.about || [];
}

// VAULT 데이터 가져오기
async function getVaultData() {
  const data = await loadNotionData();
  return data.vault || [];
}

// 프로젝트 데이터 형식 변환 (Notion API 필드명 → 기존 필드명)
function normalizeProject(project) {
  return {
    id: project['Project ID'] || `proj_${project.Number}`,
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
    images: project.images || [],
    order: project.Order || 0,
    number: project.Number || '',
    year: project.Year || new Date().getFullYear(),
    category: Array.isArray(project.Category) ? project.Category[0] : (project.Category || ''),
    techType: Array.isArray(project.TechType) ? project.TechType[0] : (project.TechType || '')
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
    
    // 패스워드 설정 (Notion settings에서 가져옴)
    if (data.settings) {
      // settings.Key === "PASSWORD" && settings.Value = "26d01" 형식 처리
      let password = null;
      if (data.settings.Key === 'PASSWORD' && data.settings.Value) {
        password = data.settings.Value;
      } else if (data.settings.VAULT_PASSWORD) {
        // 기존 형식 호환성
        password = data.settings.VAULT_PASSWORD;
      }
      
      if (password && typeof CryptoJS !== 'undefined') {
        const hash = CryptoJS.MD5(password).toString();
        window.NOTION_PASSWORD_HASH = hash;
        console.log('✅ 패스워드 설정 완료 (Notion 데이터에서)');
      } else if (password) {
        console.warn('⚠️ CryptoJS가 로드되지 않았습니다. 비밀번호 해싱 불가');
      }
    }
    
    return {
      projects: (data.projects || []).map(normalizeProject),
      about: data.about || [],
      vault: data.vault || [],
      settings: data.settings || {}
    };
  } catch (error) {
    console.error('Failed to load data:', error);
    return { projects: [], about: [], vault: [], settings: {} };
  }
}
