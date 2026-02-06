// Notion 데이터를 가져와서 JSON 파일로 저장하는 스크립트
const fs = require('fs');
const path = require('path');

// 환경 변수에서 설정 가져오기
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PROJECTS_DB = process.env.PROJECTS_DB;
const ABOUT_DB = process.env.ABOUT_DB;
const VAULT_DB = process.env.VAULT_DB;
const SETTINGS_DB = process.env.SETTINGS_DB;

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Notion API 헤더
const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
};

// 데이터베이스 쿼리
async function queryDatabase(databaseId, sorts = []) {
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sorts })
  });
  
  if (!response.ok) {
    throw new Error(`Notion API 에러: ${response.status}`);
  }
  
  const data = await response.json();
  return data.results;
}

// 이미지 URL 추출
function extractImageUrl(property) {
  if (!property?.files?.[0]) return null;
  const file = property.files[0];
  return file.file?.url || file.external?.url || null;
}

// 이미지 배열 추출
function extractImages(property) {
  if (!property?.files) return [];
  return property.files.map(file => file.file?.url || file.external?.url).filter(Boolean);
}

function getTitleText(property) {
  if (!property?.title?.length) return '';
  return property.title.map(text => text.plain_text).join('');
}

function getRichText(property) {
  if (!property?.rich_text?.length) return '';
  return property.rich_text.map(text => text.plain_text).join('');
}

function getNumberValue(property) {
  return typeof property?.number === 'number' ? property.number : null;
}

function getSelectName(property) {
  return property?.select?.name || '';
}

function getMultiSelectNames(property, separator) {
  if (!property?.multi_select?.length) return '';
  return property.multi_select.map(item => item.name).join(separator);
}

function getDateOrText(property) {
  if (property?.date?.start) return property.date.start;
  return getRichText(property);
}

// 프로젝트 데이터 가져오기
async function getProjects() {
  const results = await queryDatabase(PROJECTS_DB, [{ property: 'Order', direction: 'descending' }]);
  
  return results.map(page => {
    const props = page.properties;
    return {
      id: getRichText(props['Project ID']) || page.id,
      title: getTitleText(props.Name),
      subtitle: getRichText(props.Subtitle),
      description: getRichText(props.Description),
      date: getRichText(props.Date),
      projectType: getRichText(props.ProjectType),
      part: getRichText(props.Part),
      client: getRichText(props.Client),
      tags: props.Tags?.multi_select?.map(tag => tag.name) || [],
      status: getSelectName(props.Status) || 'UNLOCKED',
      thumbColor: getRichText(props.ThumbColor) || '#E3C1B0',
      mainColor: getRichText(props.MainColor) || '#000000',
      modalTextColor: getRichText(props.ModalTextColor) || '#FFFFFF',
      modalBgColor: getRichText(props.ModalBgColor) || '#000000',
      thumbnailImage: extractImageUrl(props.ThumbnailImage),
      coverImage: extractImageUrl(props.CoverImage),
      images: extractImages(props.Images),
      order: getNumberValue(props.Order) || 0,
      number: getNumberValue(props.Number) !== null ? String(getNumberValue(props.Number)) : getRichText(props.Number),
      year: getNumberValue(props.Year) !== null ? String(getNumberValue(props.Year)) : getRichText(props.Year),
      techType: getMultiSelectNames(props.TechType, ' · '),
      category: getMultiSelectNames(props.Category, ', ')
    };
  });
}

// ABOUT 데이터 가져오기
async function getAboutData() {
  const results = await queryDatabase(ABOUT_DB, [{ property: 'StartDate', direction: 'descending' }]);
  
  return results.map(page => {
    const props = page.properties;
    return {
      section: getSelectName(props.Section),
      title: getTitleText(props.Name) || getRichText(props.Name),
      startDate: getDateOrText(props.StartDate),
      endDate: getDateOrText(props.EndDate),
      detail: getRichText(props.Detail),
      link: props.Link?.url || '',
      order: getNumberValue(props.Order) || 0
    };
  });
}

// VAULT 데이터 가져오기
async function getVaultData() {
  const results = await queryDatabase(VAULT_DB, [{ property: 'Order', direction: 'descending' }]);
  
  return results.map(page => {
    const props = page.properties;
    return {
      id: getRichText(props.ID),
      title: getTitleText(props.Name) || getRichText(props.Name),
      thumbnailImage: extractImageUrl(props.ThumbnailImage),
      fullImage: extractImageUrl(props.FullImage),
      order: getNumberValue(props.Order) || 0
    };
  });
}

// SETTINGS 데이터 가져오기
async function getSettings() {
  const results = await queryDatabase(SETTINGS_DB);
  
  const settings = {};
  results.forEach(page => {
    const key = getTitleText(page.properties.Key) || getRichText(page.properties.Key);
    const value = getRichText(page.properties.Value) || getTitleText(page.properties.Value);
    if (key) {
      settings[key] = value;
    }
  });
  
  return settings;
}

// 메인 실행
async function main() {
  try {
    console.log('📦 Notion 데이터 가져오기 시작...');
    
    const [projects, about, vault, settings] = await Promise.all([
      getProjects(),
      getAboutData(),
      getVaultData(),
      getSettings()
    ]);
    
    const data = {
      projects,
      about,
      vault,
      settings,
      lastUpdated: new Date().toISOString()
    };
    
    // data 폴더 생성
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // JSON 파일로 저장
    fs.writeFileSync(
      path.join(dataDir, 'notion-data.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    console.log('✅ 데이터 저장 완료:', {
      projects: projects.length,
      about: about.length,
      vault: vault.length
    });
    
    console.log(`📅 업데이트 시간: ${data.lastUpdated}`);
    
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

main();
