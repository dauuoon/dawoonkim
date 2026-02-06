// ABOUT 동적 렌더링

// Section별로 그룹화
function groupBySection(aboutData) {
  const grouped = {
    EXPERIENCE: [],
    EDUCATION: [],
    CERTIFICATE: [],
    RESEARCH: []
  };
  
  aboutData.forEach(item => {
    if (grouped[item.section]) {
      grouped[item.section].push(item);
    }
  });
  
  return grouped;
}

// Date 포맷팅
function formatDate(startDate, endDate) {
  if (!endDate || endDate === '') {
    return `${startDate} -`;
  }
  return `${startDate} - ${endDate}`;
}

// ABOUT HTML 생성 (섹션 데이터만)
async function renderAbout(aboutData, settings) {
  const hasData = Array.isArray(aboutData) && aboutData.length > 0;
  const grouped = hasData ? groupBySection(aboutData) : {
    EXPERIENCE: [],
    EDUCATION: [],
    CERTIFICATE: [],
    RESEARCH: []
  };
  
  let html = '';
  
  // EXPERIENCE
  if (grouped.EXPERIENCE.length > 0) {
    html += '<div class="about_title"><p>EXPERIENCE</p></div>';
    grouped.EXPERIENCE.forEach(item => {
      html += `
        <div class="about_group">
          <p class="about_date">${formatDate(item.startDate, item.endDate)}</p>
          <p class="about_text"><b>${item.title}</b> ${item.detail}</p>
        </div>
      `;
    });
  }
  
  // EDUCATION
  if (grouped.EDUCATION.length > 0) {
    html += '<div class="about_title"><p>EDUCATION</p></div>';
    grouped.EDUCATION.forEach(item => {
      html += `
        <div class="about_group">
          <p class="about_date">${formatDate(item.startDate, item.endDate)}</p>
          <p class="about_text"><b>${item.title}</b> ${item.detail}</p>
        </div>
      `;
    });
  }
  
  // CERTIFICATE
  if (grouped.CERTIFICATE.length > 0) {
    html += '<div class="about_title"><p>CERTIFICATE</p></div>';
    grouped.CERTIFICATE.forEach(item => {
      html += `
        <div class="about_group">
          <p class="about_date">${item.startDate}</p>
          <p class="about_text">${item.detail}<b> ${item.title}</b></p>
        </div>
      `;
    });
  }
  
  // RESEARCH PAPERS
  if (grouped.RESEARCH.length > 0) {
    html += '<div class="about_title"><p>RESEARCH PAPERS</p></div>';
    grouped.RESEARCH.forEach(item => {
      const linkHtml = item.link ? ` <a href="${item.link}" target="_blank" style="text-decoration: underline;">[Link]</a>` : '';
      html += `
        <div class="about_group">
          <p class="about_date">${item.startDate}</p>
          <p class="about_text"><b>${item.title}</b>${linkHtml}</p>
        </div>
      `;
    });
  }
  
  // about-sections-container에 삽입
  const container = document.getElementById('about-sections-container');
  if (container) {
    container.innerHTML = html;
  }

  const countEl = document.getElementById('projects-count');
  if (countEl) {
    const count = settings && settings.TOTAL_PROJECTS_COUNT ? settings.TOTAL_PROJECTS_COUNT : countEl.textContent;
    countEl.textContent = count;
  }
}
