// VAULT 동적 렌더링

// Vault 아이템 HTML 생성
function createVaultItemHTML(item) {
  return `
    <div class="study-item" data-full-image="${item.fullImage}">
      <img src="${item.thumbnailImage}" alt="Study item">
    </div>
  `;
}

// Vault 렌더링
async function renderVault(vaultItems) {
  const container = document.querySelector('.study-grid-container');
  if (!container) return;
  
  // 로딩 표시
  container.innerHTML = '<div style="text-align: center; padding: 50px; color: #E3C1B0;">Loading vault...</div>';
  
  try {
    const vaultData = vaultItems || await getVaultData();
    
    if (!vaultData || vaultData.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 50px; color: #E3C1B0;">No items found</div>';
      return;
    }
    
    // HTML 생성
    const vaultHTML = vaultData.map(item => createVaultItemHTML(item)).join('');
    container.innerHTML = vaultHTML;
    
    // 클릭 이벤트 등록
    initVaultEvents();
    
  } catch (error) {
    console.error('Failed to render vault:', error);
    container.innerHTML = '<div style="text-align: center; padding: 50px; color: #E3C1B0;">Error loading vault</div>';
  }
}

// Vault 이벤트 초기화
function initVaultEvents() {
  const studyItems = document.querySelectorAll(".study-item");

  studyItems.forEach((item) => {
    // 이미지 드래그 방지
    item.addEventListener("dragstart", function(e) {
      e.preventDefault();
      return false;
    });
    
    // 이미지 오른쪽 클릭 방지
    item.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      return false;
    });

    item.addEventListener("click", function () {
      const existingPopup = document.querySelector(".study-popup");
      if (existingPopup) {
        existingPopup.remove();
      }

      const popup = document.createElement("div");
      popup.className = "study-popup";

      const content = document.createElement("div");
      content.className = "study-popup-content";

      const img = document.createElement("img");
      img.src = this.dataset.fullImage;
      // 팝업 이미지도 드래그 방지
      img.addEventListener("dragstart", function(e) {
        e.preventDefault();
        return false;
      });
      img.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        return false;
      });
      content.appendChild(img);

      const closeBtn = document.createElement("div");
      closeBtn.className = "study-popup-close";

      popup.appendChild(content);
      popup.appendChild(closeBtn);
      document.body.appendChild(popup);

      popup.offsetHeight;
      requestAnimationFrame(() => popup.classList.add("active"));

      const closePopup = () => {
        popup.classList.remove("active");
        setTimeout(() => {
          popup.remove();
          document.body.classList.remove("modal-open-study");
        }, 300);

        document.removeEventListener("keydown", handleEsc);
        closeBtn.removeEventListener("click", closePopup);
        popup.removeEventListener("click", handleOutsideClick);
      };

      const handleEsc = (e) => {
        if (e.key === "Escape") closePopup();
      };

      const handleOutsideClick = (e) => {
        if (e.target === popup) closePopup();
      };

      document.addEventListener("keydown", handleEsc);
      closeBtn.addEventListener("click", closePopup);
      popup.addEventListener("click", handleOutsideClick);

      document.body.classList.add("modal-open-study");
    });
  });
}

