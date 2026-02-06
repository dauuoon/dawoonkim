// Notion 데이터 로드 (빌드된 JSON 파일에서)
// GitHub Actions가 매일 오후 2시에 자동으로 데이터를 업데이트합니다

let cachedData = null;

async function loadNotionData() {
  if (cachedData) return cachedData;
  
  try {
    const response = await fetch('data/notion-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }
    cachedData = await response.json();
    console.log('✅ Notion 데이터 로드 완료 (마지막 업데이트:', cachedData.lastUpdated, ')');
    return cachedData;
  } catch (error) {
    console.error('❌ 데이터 로드 실패:', error);
    throw error;
  }
}

// 프로젝트 데이터 가져오기
async function getProjects() {
  const data = await loadNotionData();
  return data.projects || [];
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

// SETTINGS 데이터 가져오기
async function getSettings() {
  const data = await loadNotionData();
  return data.settings || {};
}

// 전체 데이터 한번에 로드
async function loadAllData() {
  try {
    const data = await loadNotionData();
    
    // 패스워드 설정
    if (data.settings && data.settings.PASSWORD) {
      window.NOTION_PASSWORD_HASH = CryptoJS.MD5(data.settings.PASSWORD).toString();
      console.log('✅ 패스워드 설정 완료');
    } else {
      console.warn('⚠️ SETTINGS에서 패스워드를 찾을 수 없습니다');
    }
    
    return {
      projects: data.projects || [],
      about: data.about || [],
      vault: data.vault || [],
      settings: data.settings || {}
    };
  } catch (error) {
    console.error('Failed to load data:', error);
    return { projects: [], about: [], vault: [], settings: {} };
  }
}
