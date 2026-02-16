// 프로젝트 동적 렌더링
window.PASSWORD_AUTHORIZED = window.PASSWORD_AUTHORIZED || false;

// 프로젝트 HTML 생성
function createProjectHTML(project) {
  const isLocked = project.status === 'LOCKED';
  const titleClass = isLocked ? 'project_title_blur' : 'project_title';
  const lockIcon = isLocked ? 'img/lock.svg' : 'img/unlock.svg';
  
  return `
    <div class="main_line"></div>
    <ul class="project">
      <li data-color="${project.thumbColor}" data-project-id="${project.id}">
        <div class="project_number">${project.number}</div>
        <div class="${titleClass}">${project.title}</div>
        <div class="project_text">
          <span class="project_sub">${project.techType}</span>
          <span class="project_sub">${project.year}</span>
          <span class="project_sub">${project.category}</span>
          <span class="project_sub"><img src="${lockIcon}"></span>
        </div>
      </li>
    </ul>
  `;
}

// 프로젝트 리스트 렌더링
async function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  
  try {
    const projectList = projects || await getProjects();
    
    if (!projectList || projectList.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 50px; color: #E3C1B0;">No projects found</div>';
      return;
    }
    
    // HTML 생성
    const projectsHTML = projectList.map(project => createProjectHTML(project)).join('');
    const finalHTML = projectsHTML + '<div class="main_line"></div><ul class="project"></ul>';
    
    container.innerHTML = finalHTML;
    
    // 프로젝트 데이터를 전역 변수에 저장 (모달에서 사용)
    window.projectsData = {};
    projectList.forEach(project => {
      window.projectsData[project.title] = {
        title: project.title,
        subtitle: project.subtitle,
        type: project.projectType,
        date: project.date,
        part: project.part,
        client: project.client,
        color: project.mainColor,
        mo_color: project.modalTextColor,
        mo_bg: project.modalBgColor,
        mo_bg_pc: project.modalBgColorPC,
        images: project.images
      };
    });
    
    // 이벤트 리스너 재등록
    initProjectEvents();
    
  } catch (error) {
    console.error('Failed to render projects:', error);
    container.innerHTML = '<div style="text-align: center; padding: 50px; color: #E3C1B0;">Error loading projects</div>';
  }
}

// 프로젝트 이벤트 초기화
function initProjectEvents() {
  // 프로젝트 호버 효과
  document.querySelectorAll(".project li").forEach((project) => {
    project.addEventListener("mouseover", function () {
      let color = this.getAttribute("data-color");
      this.style.setProperty("--hover-color", color);

      const elements = [
        "#clock2",
        "#main-title",
        "#main-title a",
        ".header h1",
        ".header h2",
      ].map((selector) => document.querySelector(selector));

      elements.forEach((el) => {
        if (el) el.style.color = color;
      });

      this.querySelector(".project_title_blur, .project_title").style.color = color;
    });

    project.addEventListener("mouseleave", function () {
      this.style.removeProperty("--hover-color");

      const elements = [
        "#clock2",
        "#main-title",
        "#main-title a",
        ".header h1",
        ".header h2",
      ].map((selector) => document.querySelector(selector));

      elements.forEach((el) => {
        if (el) el.style.color = "#E3C1B0";
      });

      this.querySelector(".project_title_blur, .project_title").style.color = "";
    });
  });

  // 프로젝트 클릭 이벤트
  document.querySelectorAll(".project li").forEach((project) => {
    project.addEventListener("click", function () {
      const projectTitle = this.querySelector(".project_title_blur, .project_title").textContent.trim();
      const isLocked = this.querySelector('img[src="img/lock.svg"]') !== null;
      
      console.log(`프로젝트 클릭: ${projectTitle}, 잠금: ${isLocked}`);

      const isAuthorized = window.PASSWORD_AUTHORIZED === true;

      if (isLocked && !isAuthorized) {
        console.log('비밀번호 팝업 호출');
        showPasswordPopup(projectTitle);
      } else {
        console.log('프로젝트 콘텐츠 표시');
        showProjectContent(projectTitle);
      }
    });
  });
}

// 비밀번호 팝업 표시
function showPasswordPopup(projectTitle) {
  console.log('✅ showPasswordPopup 함수 시작');
  console.log('projectTitle:', projectTitle);
  
  const popup = document.getElementById("popup-container");
  console.log('popup 요소:', popup);
  
  if (!popup) {
    console.error('❌ popup-container를 찾을 수 없습니다!');
    return;
  }
  
  console.log('현재 popup 클래스:', popup.className);
  popup.classList.remove("hidden");
  popup.classList.add("active");
  console.log('수정 후 popup 클래스:', popup.className);
  console.log('✅ 비밀번호 팝업이 표시되었습니다');

  const passwordInput = document.getElementById("password-input");
  console.log('passwordInput 요소:', passwordInput);
  
  const submitBtn = document.getElementById("submit-password");
  console.log('submitBtn 요소:', submitBtn);
  
  if (!passwordInput || !submitBtn) {
    console.error('❌ passwordInput 또는 submitBtn을 찾을 수 없습니다!');
    return;
  }
  
  passwordInput.value = "";
  passwordInput.focus();

  // 기존 이벤트 리스너 제거
  submitBtn.onclick = null;
  passwordInput.onkeypress = null;
  popup.onclick = null;

  const closePasswordPopup = () => {
    popup.classList.remove("active");
    popup.classList.add("hidden");
    document.removeEventListener("keydown", escHandler);
  };

  const escHandler = (e) => {
    if (e.key === "Escape") {
      closePasswordPopup();
    }
  };

  const checkPassword = () => {
    const password = passwordInput.value;
    console.log('비밀번호 확인:', password);
    if (checkProjectPassword(password)) {
      window.PASSWORD_AUTHORIZED = true;
      alert("✅ 비밀번호 확인 완료! 프로젝트를 엽니다...");
      closePasswordPopup();
      setTimeout(() => {
        showProjectContent(projectTitle);
      }, 500);
    } else {
      alert("❌ 비밀번호가 일치하지 않습니다. 다시 시도해주세요!");
      passwordInput.value = "";
      passwordInput.focus();
    }
  };

  // 새로운 이벤트 리스너 등록
  console.log('이벤트 리스너 등록 시작');
  submitBtn.onclick = checkPassword;
  
  passwordInput.onkeypress = (e) => {
    if (e.key === "Enter") {
      checkPassword();
    }
  };

  document.addEventListener("keydown", escHandler, { once: true });

  popup.onclick = (e) => {
    if (e.target === popup) {
      closePasswordPopup();
    }
  };
  
  console.log('이벤트 리스너 등록 완료');
}

// 프로젝트 상세 표시
let modalLoadToken = 0;

function showProjectContent(projectTitle) {
  const project = window.projectsData[projectTitle];
  if (!project) {
    console.error('Project not found:', projectTitle);
    return;
  }
  
  const modal = document.querySelector(".project-modal");

  document.documentElement.style.setProperty("--project-color", project.color);
  document.documentElement.style.setProperty("--project-mo-color", project.mo_color);
  document.documentElement.style.setProperty("--project-mo-bg", project.mo_bg);
  document.documentElement.style.setProperty("--project-mo-bg-pc", project.mo_bg_pc);

  modal.querySelector(".project-title").textContent = project.title;
  modal.querySelector(".project-subtitle").textContent = project.subtitle;
  modal.querySelector(".project-type").textContent = project.type;
  modal.querySelector(".project-part").textContent = project.part;
  modal.querySelector(".project-date").textContent = project.date;
  modal.querySelector(".project-client").textContent = project.client;

  const modalBody = modal.querySelector(".modal-body");

  modalBody.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading Images... <span class="loading-progress">0%</span></div>
    </div>
  `;

  modal.style.display = "block";
  requestAnimationFrame(() => {
    modal.classList.remove("disable");
  });
  document.body.style.overflow = "hidden";

  const currentToken = ++modalLoadToken;

  // 프로젝트별 이미지 링크 매핑 (프로젝트명/파일명 → URL)
  const imageLinkMap = {
    // 특정 이미지에만 링크 추가
    // 예: 'whybox/img7': 'https://example.com',
    //     'whybox/img8': 'https://example.com/other',
    //     'iplex/img5': 'https://example.com/iplex'
  };

  // 프로젝트명/파일명 추출 함수
  function getImageKey(path) {
    // "img/projects/whybox/img7.jpg" → "whybox/img7"
    const parts = path.split('/');
    const projectName = parts[2]; // "whybox"
    const fileName = parts[3].split('.')[0]; // "img7"
    return `${projectName}/${fileName}`;
  }

  // 순차 로딩으로 변경 (동시 요청 최소화)
  async function loadImagesSequentially() {
    const loadedImages = [];
    for (let index = 0; index < project.images.length; index++) {
      const src = project.images[index];
      
      try {
        if (currentToken !== modalLoadToken) return;

        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error(`Failed to load: ${src}`));
          image.src = src;
          image.alt = `${project.title} - image ${index + 1}`;
        });

        // 이미지와 원본 src 경로를 함께 저장
        loadedImages.push({ img, src });

        const progress = Math.round(((index + 1) / project.images.length) * 100);
        const progressEl = modal.querySelector(".loading-progress");
        if (progressEl) progressEl.textContent = `${progress}%`;

      } catch (error) {
        console.warn(`⚠️ 이미지 로드 실패 (${index + 1}/${project.images.length}):`, error);
        continue;
      }
    }

    if (currentToken !== modalLoadToken) return;

    if (loadedImages.length === 0) {
      modalBody.innerHTML = '<div class="error-message">이미지를 불러올 수 없습니다.</div>';
      return;
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "project-images";

    loadedImages.forEach(({ img, src }) => {
      const imgClone = img.cloneNode(true);
      imgClone.style.display = "block";
      imgClone.style.width = "100%";
      
      // 이미지 드래그 방지
      imgClone.addEventListener("dragstart", function(e) {
        e.preventDefault();
        return false;
      });
      
      // 이미지 오른쪽 클릭 방지
      imgClone.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        return false;
      });
      
      // 프로젝트명/파일명 키 생성
      const imageKey = getImageKey(src);
      const linkUrl = imageLinkMap[imageKey];
      
      // 링크가 있으면 <a> 태그로 감싸기
      if (linkUrl) {
        const link = document.createElement("a");
        link.href = linkUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "block";
        // 링크 드래그 방지
        link.addEventListener("dragstart", function(e) {
          e.preventDefault();
          return false;
        });
        // 링크 오른쪽 클릭 방지
        link.addEventListener("contextmenu", function(e) {
          e.preventDefault();
          return false;
        });
        link.appendChild(imgClone);
        imageContainer.appendChild(link);
      } else {
        imageContainer.appendChild(imgClone);
      }
    });

    modalBody.style.opacity = "0";
    setTimeout(() => {
      modalBody.innerHTML = "";
      modalBody.appendChild(imageContainer);
      modalBody.style.opacity = "1";
    }, 300);
  }

  loadImagesSequentially();
}
