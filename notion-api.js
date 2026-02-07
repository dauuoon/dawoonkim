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
    
    // 패스워드 설정 (로컬 passwords.js에서 가져옴)
    if (typeof getPasswordHash === 'function') {
      const hash = getPasswordHash();
      if (hash) {
        window.NOTION_PASSWORD_HASH = hash;
        console.log('✅ 패스워드 설정 완료');
      } else {
        console.warn('⚠️ CryptoJS가 로드되지 않았습니다. 비밀번호 해싱 불가');
      }
    } else {
      console.warn('⚠️ passwords.js 파일을 찾을 수 없습니다');
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
