/* 오른쪽 마우스 클릭 방지 */
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
});

/* 드래그앤드롭 방지 */
document.addEventListener('dragstart', function(e) {
  e.preventDefault();
  return false;
});

/* 드래그 방지 (전체) */
document.addEventListener('drag', function(e) {
  e.preventDefault();
  return false;
});

/* 이미지 드래그 방지 */
document.addEventListener('mousedown', function(e) {
  if (e.button === 2) { // 오른쪽 버튼
    e.preventDefault();
    return false;
  }
});

/* Notion 데이터 로드 및 초기화 */
$(document).ready(async function() {
  try {
    console.log("🚀 페이지 초기화 시작...");
    
    // about-content.html 먼저 로드
    await new Promise((resolve, reject) => {
      $('#about-menu-container').load('about-content.html', function(response, status, xhr) {
        if (status === 'error') {
          console.error('Error loading about content:', xhr.status, xhr.statusText);
          reject(xhr);
        } else {
          console.log('✅ about-content.html 로드 완료');
          resolve();
        }
      });
    });
    
    // Notion 데이터 로드
    const data = await loadAllData();
    
    // 현재 페이지 확인
    const isVaultPage = window.location.pathname.includes('vault.html');
    const isIndexPage = !isVaultPage;
    
    // 페이지별 렌더링
    if (isIndexPage) {
      console.log("📄 Index 페이지 렌더링");
      if (typeof renderProjects === 'function') {
        await renderProjects(data.projects);
      }
      if (typeof renderAbout === 'function') {
        await renderAbout(data.about, data.settings);
      }
    } else if (isVaultPage) {
      console.log("🖼️ Vault 페이지 렌더링");
      if (typeof renderVault === 'function') {
        await renderVault(data.vault);
      }
      if (typeof renderAbout === 'function') {
        await renderAbout(data.about, data.settings);
      }
    }
    
    console.log("✅ 페이지 초기화 완료!");
    
    // About 메뉴 이벤트 초기화
    initializeAboutMenu();
    
  } catch (error) {
    console.error("❌ 페이지 초기화 실패:", error);
  }
});

/* ABOUT 콘텐츠 동적 로드 - Notion API로 대체됨 */
// $(document).ready(function() {
//   $('#about-menu-container').load('about-content.html', function(response, status, xhr) {
//     if (status === 'error') {
//       console.error('Error loading about content: ' + xhr.status + ' ' + xhr.statusText);
//     } else {
//       // 콘텐츠 로드 후 스크립트 초기화
//       initializeAboutMenu();
//     }
//   });
// });

function initializeAboutMenu() {
  // ABOUT 메뉴 X 버튼 클릭 이벤트
  $(".about_menu_icon").on("click", function () {
    console.log("About close button clicked");
    $(".about_menu").removeClass("active");
    $(".menu_li_about a").removeClass("active");
    document.body.style.overflow = "auto";
    $("#nav-1 .slide1").css({ opacity: 0 });
  });
}

/* 메뉴 스크립트 */
console.log("hi");
$("#nav-1 a").on("click", function () {
  var position = $(this).parent().position();
  var width = $(this).parent().width();
  $("#nav-1 .slide1").css({ opacity: 1, left: +position.left, width: width });
});

$("#nav-1 a").on("mouseover", function () {
  var position = $(this).parent().position();
  var width = $(this).parent().width();
  $("#nav-1 .slide1").css({ opacity: 1, left: +position.left, width: width });
});

$("#nav-1 li:not(.menu_li_about)").on("mouseleave", function () {
  if (!$(".about_menu").hasClass("active")) {
    $("#nav-1 .slide1").css({ opacity: 0 });
  }
});

// About 메뉴 클릭 이벤트 수정
$(".menu_li_about").on("click", function (e) {
  e.preventDefault();
  console.log("About menu clicked"); // 디버깅용
  $(".about_menu").toggleClass("active");
  $(this).find("a").toggleClass("active");

  if ($(".about_menu").hasClass("active")) {
    document.body.style.overflow = "hidden";
    var position = $(this).position();
    var width = $(this).width();
    $("#nav-1 .slide1").css({ opacity: 1, left: +position.left, width: width });
  } else {
    document.body.style.overflow = "auto";
    $("#nav-1 .slide1").css({ opacity: 0 });
  }
});

// Dawoon Kim 클릭 이벤트 수정
$(".header a").on("click", function (e) {
  e.preventDefault();
  console.log("Dawoon Kim clicked"); // 디버깅용
  $(".about_menu").toggleClass("active");
  $(".menu_li_about a").toggleClass("active");

  if ($(".about_menu").hasClass("active")) {
    document.body.style.overflow = "hidden";
    // $(".about_menu").remove("active");
    var position = $(".menu_li_about2").position();
    var width = $(".menu_li_about2").width();
    $("#nav-1 .slide2").css({ opacity: 1, left: +position.left, width: width });

    // 슬라이드 바 위치 조정
    // var position = $(".menu_li_about2").position();
    // var width = $(".menu_li_about2").width();
  } else {
    document.body.style.overflow = "auto";
    setTimeout(() => {
      var position = $(".index_menu").position();
      var width = $(".index_menu").width();
      $("#gnb  li.slide2").css({
        opacity: 1,
        left: +position.left,
        width: width,
      });
    }, 10);
    // closex();
    // $(".about_menu").add("active");
    // $("#nav-1 .slide1").css({ opacity: 0 });
    // var position2 = $(".index_menu").position().left;
    // var width2 = $(".index_menu").width();
    // $("#nav-1 .slide2").css({ opacity: 1, left: +position2, width: width2 });
  }
});

// About 닫기 버튼 클릭 이벤트 수정
$(".about_menu_icon").on("click", function () {
  console.log("Close button clicked"); // 디버깅용
  $(".about_menu").removeClass("active");
  $(".menu_li_about a").removeClass("active");
  document.body.style.overflow = "auto";
  $("#nav-1 .slide1").css({ opacity: 0 });
});

// ESC 키로 About 패널 닫기
$(document).on("keydown", function (e) {
  if (e.key === "Escape" && $(".about_menu").hasClass("active")) {
    $(".about_menu").removeClass("active");
    $(".menu_li_about a").removeClass("active");
    document.body.style.overflow = "auto";
    $("#nav-1 .slide1").css({ opacity: 0 });
  }
});

// 초기 슬라이드 위치 설정
if ($(".about_menu").hasClass("active")) {
  var position = $(".menu_li_about").position();
  var width = $(".menu_li_about").width();
  $("#nav-1 .slide1").css({ opacity: 1, left: +position.left, width: width });
}
var currentPage;
/* 어바웃 메뉴 시간 스크립트 */
function updateClock() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const dateString = `${year}.${month}.${day}`;
  const timeString = `${hours}:${minutes}:${seconds}`;
  const fullString = `${dateString} ${timeString}`;
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    clockElement.textContent = fullString;
  }
}
// 매 초마다 시계 업데이트
setInterval(updateClock, 1000);
// 페이지 로드 시에도 시계 업데이트
updateClock();

//* 메인 년도 시계
function updateClock2() {
  const now = new Date();
  const year = now.getFullYear();

  const dateString = `© ${year}`;
  const fullString = `${dateString}`;
  const clock2Element = document.getElementById("clock2");
  if (clock2Element) {
    clock2Element.textContent = fullString;
  }
}
// 매 초마다 시계 업데이트
setInterval(updateClock2, 1000);
// 페이지 로드 시에도 시계 업데이트
updateClock2();

//* 어바웃 년도 시계
function updateClock3() {
  const now = new Date();
  const year = now.getFullYear();

  const dateString = `© ${year}`;
  const fullString = `${dateString}`;
  const clock3Element = document.getElementById("clock3");
  if (clock3Element) {
    clock3Element.textContent = fullString;
  }
}
// 매 초마다 시계 업데이트
setInterval(updateClock3, 1000);
// 페이지 로드 시에도 시계 업데이트
updateClock3();

document.addEventListener("DOMContentLoaded", function () {
  const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

  // ✅ Matter.js 엔진 생성
  const engine = Engine.create({
    enableSleeping: true, // 충돌 후 안정화되면 수면 상태로 전환
    gravity: {
      x: 0,
      y: 1.4, // 과도한 중력은 스택 불안정 초래 → 완화
      scale: 0.0006,
    },
  });

  // 충돌 해상도 안정성을 위해 반복 횟수 상향
  engine.positionIterations = 8; // 기본 6
  engine.velocityIterations = 6; // 기본 4
  engine.constraintIterations = 4; // 기본 2
  const render = Render.create({
    canvas: document.getElementById("matterCanvas"),
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: "transparent",
    },
  });

  // ✅ 개체 초기 위치 설정 (랜덤)
  const objects = [
    {
      texture: "img/image1.png",
      x: Math.random() * window.innerWidth,
      y: -185,
      width: 180,
      height: 90,
    },
    {
      texture: "img/image2.png",
      x: Math.random() * window.innerWidth,
      y: -220,
      width: 200,
      height: 100,
    },
    {
      texture: "img/image3.png",
      x: Math.random() * window.innerWidth,
      y: -280,
      width: 220,
      height: 110,
    },
    {
      texture: "img/image4.png",
      x: Math.random() * window.innerWidth,
      y: -330,
      width: 200,
      height: 100,
    },
    {
      texture: "img/image5.png",
      x: Math.random() * window.innerWidth,
      y: -370,
      width: 180,
      height: 90,
    },
  ];

  var scaleFactor = 0.7;
  if (window.innerWidth < 400) {
    scaleFactor = (0.7 * 190) / 400;
  } else if (window.innerWidth < 800) {
    scaleFactor = (0.7 * 241) / 400;
  } else if (window.innerWidth < 1024) {
    scaleFactor = (0.7 * 340) / 400;
  }
  // ✅ Matter.js 개체 생성
  const bodies = objects.map((obj) => {
    return Bodies.rectangle(
      obj.x,
      obj.y,
      obj.width * scaleFactor,
      obj.height * scaleFactor,
      {
        // 과도한 튀김/진동 방지용 물리 파라미터 조정
        density: 0.001,
        restitution: 0.25, // 반발계수 낮춤 (에너지 누적 방지)
        friction: 0.35,
        frictionStatic: 0.6,
        frictionAir: 0.02,
        sleepThreshold: 25, // 안정 시 수면 상태 진입을 빠르게
        chamfer: { radius: 4 }, // 모서리 걸림 완화로 떨림 감소
        render: {
          sprite: {
            texture: obj.texture,
            xScale: scaleFactor,
            yScale: scaleFactor,
          },
        },
      }
    );
  });

  // ✅ 바닥 & 벽 생성
  const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight,
    window.innerWidth,
    10,
    { isStatic: true, render: { fillStyle: "transparent" } }
  );
  const leftWall = Bodies.rectangle(
    0,
    window.innerHeight / 2,
    10,
    window.innerHeight,
    { isStatic: true, render: { fillStyle: "transparent" } }
  );
  const rightWall = Bodies.rectangle(
    window.innerWidth,
    window.innerHeight / 2,
    10,
    window.innerHeight,
    { isStatic: true, render: { fillStyle: "transparent" } }
  );

  // ✅ 개체를 시간차를 두고 추가
  function addBodiesWithDelay(bodies, delay) {
    bodies.forEach((body, index) => {
      setTimeout(() => {
        World.add(engine.world, body);
      }, index * delay);
    });
  }
  addBodiesWithDelay(bodies, 500);

  // ✅ 벽과 바닥 추가
  World.add(engine.world, [ground, leftWall, rightWall]);

  // ✅ 마우스 컨트롤 추가
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.1, // 드래그 시 과도한 진동 완화
      render: { visible: false },
    },
  });

  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  // ✅ Matter.js 엔진 실행
  Matter.Runner.run(engine);
  Render.run(render);

  // ✅ 스크롤 시 중력 조정
  window.addEventListener("scroll", () => {
    let scrollY = window.scrollY;
    // 스크롤에 따른 중력 증가값을 완만하게, 상한도 낮춤
    let newGravity = 0.8 + scrollY / 500;
    engine.world.gravity.y = Math.min(newGravity, 2.5);
  });

  // ✅ 창 크기 변경 시 반응형 조정
  window.addEventListener("resize", () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
  });

  // 모달 닫기 시 애니메이션 (render-projects.js와 연동)
  document.querySelector(".modal-close").addEventListener("click", function () {
    const modal = document.querySelector(".project-modal");
    modal.classList.add("disable");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }, 800);
  });

  // About 메뉴 관련 코드 (jQuery 사용)
  $(document).ready(function () {
    // About 메뉴 클릭
    $(".menu_li_about a").click(function (e) {
      e.preventDefault();
      console.log("About clicked");
      $(".about_menu").toggleClass("active");
      $(this).addClass("active");

      if ($(".about_menu").hasClass("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }

      // 슬라이드 바 위치 조정
      var position = $(this).parent().position();
      var width = $(this).parent().width();
      $("#nav-1 .slide1").css({
        opacity: 1,
        left: position.left,
        width: width,
      });
    });

    // About 메뉴 닫기
    $(".about_menu_icon").click(function () {
      console.log("Close clicked");
      $(".about_menu").removeClass("active");
      $(".menu_li_about a").removeClass("active");
      document.body.style.overflow = "auto";
      $("#nav-1 .slide1").css({ opacity: 0 });
    });

    // ESC 키로 About 메뉴 닫기
    $(document).keydown(function (e) {
      if (e.key === "Escape" && $(".about_menu").hasClass("active")) {
        $(".about_menu").removeClass("active");
        $(".menu_li_about a").removeClass("active");
        document.body.style.overflow = "auto";
        $("#nav-1 .slide1").css({ opacity: 0 });
      }
    });

    // 메뉴 호버 효과
    $("#nav-1 a").hover(
      function () {
        var position = $(this).parent().position();
        var width = $(this).parent().width();
        $("#nav-1 .slide1").css({
          opacity: 1,
          left: position.left,
          width: width,
        });
      },
      function () {
        if (!$(".about_menu").hasClass("active")) {
          $("#nav-1 .slide1").css({ opacity: 0 });
        }
      }
    );
  });

  // 스크롤 위치에 따라 탑 버튼을 보여주거나 숨기는 함수
  // 이 함수는 이벤트 리스너 안에서 정의되거나 호출되어야 합니다.
  var xxxx = document.querySelector(".project-modal");
  const topButton = document.querySelector(".top-button");
  topButton.addEventListener("click", function () {
    xxxx.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
  xxxx.addEventListener("scroll", function () {
    if (xxxx.scrollTop > 200) {
      topButton.classList.add("visible");
    } else {
      topButton.classList.remove("visible");
    }
  });

  function toggleTopButtonVisibility() {
    // const topButton = document.querySelector(".top-button");
    // if (topButton) {
    //   // 탑 버튼 요소가 존재하는지 확인
    //   if (window.scrollY > 200) {
    //     // 200px 이상 스크롤했을 때
    //     topButton.classList.add("visible");
    //   } else {
    //     topButton.classList.remove("visible");
    //   }
    // }
  }

  // 페이지의 DOM 트리가 완전히 로드되고 파싱되었을 때 실행
  window.addEventListener("DOMContentLoaded", function () {
    // 여기에 기존 script.js 파일의 모든 코드를 넣으세요.
    // 예시:
    // const navLinks = document.querySelectorAll('#nav-1 li a');
    // const slide1 = document.querySelector('#nav-1 .slide1');
    // 등등...

    // *************** 기존 script.js 코드 시작 ***************

    // 네비게이션 메뉴의 모든 링크
    const navLinks = document.querySelectorAll("#nav-1 li a");

    // 슬라이드 바 요소들
    const slide1 = document.querySelector("#nav-1 .slide1");
    const slide2 = document.querySelector("#nav-1 .slide2");

    // ABOUT 링크와 닫기 버튼
    var aboutLink = document.querySelector(".menu_li_about2 a");
    const closeButton = document.querySelector(".about_menu_icon");

    // !!! 여기에 765번째 줄 오류가 발생했던 코드 !!!
    if (aboutLink) {
      // aboutLink 요소가 존재하는지 확인하는 조건문 추가
      aboutLink.addEventListener("click", function () {
        navLinks.forEach((link) => {
          link.style.opacity = "60%"; // 모든 링크 opacity 초기화
        });
        // 슬라이드 바 위치 조정
        const position = this.parentElement.offsetLeft;
        const width = this.parentElement.offsetWidth;
        if (slide1 && slide2) {
          // 슬라이드 바 요소가 존재하는지 확인
          slide1.style.left = position + "px";
          slide1.style.width = width + "px";
          slide2.style.left = position + "px";
          slide2.style.width = width + "px";
        }
      });
    } else {
      console.error("ABOUT 링크 요소를 찾을 수 없습니다."); // 디버깅을 위해 콘솔에 로그 남김
    }

    // !!! 여기에 378번째 줄 오류가 발생했던 코드 !!!
    // 378번째 줄 근처 코드를 정확히 알려주시면 해당 부분도 수정해드릴 수 있습니다.
    // 임시로 오류 방지 조건문 추가
    // 예시: 어떤 요소를 찾아서 textContent를 읽으려 했다면...
    // const someElement = document.querySelector('.some-selector'); // 예시 선택자
    // if (someElement) {
    //     console.log(someElement.textContent); // 오류 발생했던 코드
    // } else {
    //     console.error(".some-selector 요소를 찾을 수 없습니다.");
    // }

    // 닫기 버튼 클릭 시 ABOUT 활성화 상태 초기화
    if (closeButton) {
      // closeButton 요소가 존재하는지 확인

      closeButton.addEventListener("click", function () {
        if (aboutLink) {
          // aboutLink가 존재하는 경우에만 opacity 변경
          aboutLink.style.opacity = "60%"; // ABOUT 링크 opacity 초기화
        }

        // 현재 페이지에 따라 원래 활성화된 메뉴 상태로 복원
        navLinks.forEach((link) => {
          if (
            (currentPage === "" || currentPage === "index.html") &&
            link.textContent === "PROJECT"
          ) {
            // WORK를 PROJECT로 변경
            activateMenu(link);
          } else if (
            currentPage === "vault.html" &&
            link.textContent === "VAULT"
          ) {
            activateMenu(link);
          }
        });
      });

      function closex() {
        if (aboutLink) {
          // aboutLink가 존재하는 경우에만 opacity 변경
          aboutLink.style.opacity = "60%"; // ABOUT 링크 opacity 초기화
        }

        // 현재 페이지에 따라 원래 활성화된 메뉴 상태로 복원
        navLinks.forEach((link) => {
          if (
            (currentPage === "" || currentPage === "index.html") &&
            link.textContent === "PROJECT"
          ) {
            // WORK를 PROJECT로 변경
            activateMenu(link);
          } else if (
            currentPage === "vault.html" &&
            link.textContent === "VAULT"
          ) {
            activateMenu(link);
          }
        });
      }
    } else {
      console.error("ABOUT 닫기 버튼 요소를 찾을 수 없습니다."); // 디버깅 로그
    }

    // 메뉴 활성화 함수 (DOM 조작 포함)
    function activateMenu(link) {
      if (link && slide1 && slide2) {
        // link 및 슬라이드 바 요소가 존재하는지 확인
        link.style.opacity = "1";
        const position = link.parentElement.offsetLeft;
        const width = link.parentElement.offsetWidth;
        // slide1.style.opacity = "1";
        // slide1.style.left = position + "px";
        // slide1.style.width = width + "px";
        slide2.style.opacity = "1";
        slide2.style.left = position + "px";
        slide2.style.width = width + "px";
      }
    }

    // 페이지 로드 시 초기 메뉴 활성화 (DOM 조작 포함)
    navLinks.forEach((link) => {
      if (link) {
        // link 요소가 존재하는지 확인
        if (
          (currentPage === "" || currentPage === "index.html") &&
          link.textContent === "PROJECT"
        ) {
          activateMenu(link);
        } else if (
          currentPage === "vault.html" &&
          link.textContent === "VAULT"
        ) {
          activateMenu(link);
        }
      }
    });

    // Vault 페이지 비밀번호 제거 완료 (2026-02-11)
    // 더 이상 vault 페이지에 비밀번호 보호 없음

    // *************** 기존 script.js 코드 끝 ***************

    // 스크롤 이벤트 리스너 (탑 버튼 관련)
    window.addEventListener("scroll", toggleTopButtonVisibility);

    // 페이지 로드 시 초기 탑 버튼 상태 설정 (스크롤 위치 확인)
    toggleTopButtonVisibility();

    // 다른 DOM 조작 및 이벤트 리스너 코드들도 모두 이 안에 넣습니다.
  }); // <-- DOMContentLoaded 이벤트 리스너 끝
});

function showPasswordPrompt(projectId) {
  const passwordPrompt = document.querySelector(".password-prompt");
  const passwordInput = passwordPrompt.querySelector('input[type="password"]');

  // 입력창 초기화
  passwordInput.value = "";

  // 모달 표시 전에 포커스 준비
  passwordInput.readOnly = false;
  passwordInput.tabIndex = 1;

  // 모달 표시
  passwordPrompt.style.display = "flex";

  // 즉시 포커스 시도
  passwordInput.focus();

  // DOM 업데이트 후 포커스
  requestAnimationFrame(() => {
    passwordInput.focus();
    // 마지막 포커스 시도
    setTimeout(() => {
      passwordInput.click();
      passwordInput.focus();
    }, 100);
  });

  // 비밀번호 확인 이벤트
  function checkPassword(e) {
    if (e.key === "Enter" || e.type === "click") {
      const password = passwordInput.value;
      if (password === projectData[projectId].password) {
        passwordPrompt.style.display = "none";
        showProjectContent(projectId);
        // 이벤트 리스너 제거
        passwordInput.removeEventListener("keyup", checkPassword);
        passwordPrompt
          .querySelector("button")
          .removeEventListener("click", checkPassword);
      } else {
        alert("비밀번호가 일치하지 않습니다.");
        passwordInput.value = "";
        passwordInput.focus();
      }
    }
  }

  // 이벤트 리스너 설정
  passwordInput.addEventListener("keyup", checkPassword);
  passwordPrompt
    .querySelector("button")
    .addEventListener("click", checkPassword);
}

// 현재 페이지에 따른 메뉴 활성화
document.addEventListener("DOMContentLoaded", function () {
  // 현재 페이지 URL 가져오기
  currentPage = window.location.pathname.split("/").pop();

  // 네비게이션 메뉴의 모든 링크
  const navLinks = document.querySelectorAll("#nav-1 li a");

  // 슬라이드 바 요소들
  const slide1 = document.querySelector("#nav-1 .slide1");
  const slide2 = document.querySelector("#nav-1 .slide2");

  // ABOUT 링크와 닫기 버튼
  var aboutLink = document.querySelector(".menu_li_about2 a");
  const closeButton = document.querySelector(".about_menu_icon");

  // ABOUT 클릭 시 다른 활성화 상태 초기화
  if (aboutLink) {
    aboutLink.addEventListener("click", function () {
      navLinks.forEach((link) => {
        link.style.opacity = "60%"; // 모든 링크 opacity 초기화
      });
      // 슬라이드 바 위치 조정
      const position = this.parentElement.offsetLeft;
      const width = this.parentElement.offsetWidth;
      // slide1.style.left = position + "px";
      // slide1.style.width = width + "px";
      slide2.style.left = position + "px";
      slide2.style.width = width + "px";
    });
  }

  // 닫기 버튼 클릭 시 ABOUT 활성화 상태 초기화
  if (closeButton) {
    closeButton.addEventListener("click", function () {
      aboutLink.style.opacity = "60%"; // ABOUT 링크 opacity 초기화
      // 현재 페이지에 따라 원래 활성화된 메뉴 상태로 복원
      navLinks.forEach((link) => {
        if (
          (currentPage === "" || currentPage === "index.html") &&
          link.textContent === "PROJECT-"
        ) {
          // WORK를 PROJECT로 변경
          activateMenu(link);
        } else if (currentPage === "vault.html" && link.textContent === "VAULT") {
          activateMenu(link);
        }
      });
    });
  }

  // 메뉴 활성화 함수
  function activateMenu(link) {
    link.style.opacity = "1";
    const position = link.parentElement.offsetLeft;
    const width = link.parentElement.offsetWidth;
    // slide1.style.opacity = "1";
    // slide1.style.left = position + "px";
    // slide1.style.width = width + "px";
    slide2.style.opacity = "1";
    slide2.style.left = position + "px";
    slide2.style.width = width + "px";
  }

  // 페이지 로드 시 초기 메뉴 활성화
  navLinks.forEach((link) => {
    if (
      (currentPage === "" || currentPage === "index.html") &&
      link.textContent === "PROJECT"
    ) {
      // WORK를 PROJECT로 변경
      activateMenu(link);
    } else if (currentPage === "vault.html" && link.textContent === "VAULT") {
      activateMenu(link);
    }
  });

  window.PASSWORD_AUTHORIZED = window.PASSWORD_AUTHORIZED || false;

  // Vault 페이지 비밀번호 체크
  if (currentPage === "vault.html") {
    const vaultContent = document.querySelector(".vault-content");
    const popup = document.getElementById("vault-popup-container");
    const passwordInput = document.getElementById("vault-password-input");
    const submitButton = document.getElementById("vault-submit-password");
    const nav = document.querySelector("#nav-1");
    const footer = document.querySelector(".footer");

    // null 체크
    if (!popup || !passwordInput || !submitButton) {
      console.error("Vault 요소를 찾을 수 없습니다!", {popup, passwordInput, submitButton});
      return;
    }

    // 비밀번호 확인
    function checkVaultPassword() {
      const password = passwordInput.value;
      if (!password) {
        alert("비밀번호를 입력해주세요!");
        return;
      }

      const hashedInput = CryptoJS.MD5(password).toString();
      console.log("입력된 비밀번호 해시:", hashedInput);
      console.log("저장된 VAULT 해시:", window.NOTION_PASSWORD_HASH);

      if (hashedInput === window.NOTION_PASSWORD_HASH) {
        // 비밀번호가 일치하면
        console.log("✅ 비밀번호 일치!");
        popup.classList.remove("active");
        popup.classList.add("hidden");
        if (vaultContent) vaultContent.style.display = "block";
        document.body.style.overflow = "auto";
        if (nav) nav.style.display = "flex";
        if (footer) footer.style.display = "block";
        window.PASSWORD_AUTHORIZED = true;
        document.documentElement.style.display = "block";
      } else {
        console.log("❌ 비밀번호 불일치!");
        alert("비밀번호가 일치하지 않습니다. 다시 시도해주세요!");
        passwordInput.value = "";
        passwordInput.focus();
      }
    }

    // 페이지 로드 시 팝업 표시 여부 결정
    const isAuthorized = window.PASSWORD_AUTHORIZED === true;
    console.log("이미 인증됨?", isAuthorized);

    if (!isAuthorized) {
      popup.classList.remove("hidden");
      popup.classList.add("active");
      document.body.style.overflow = "hidden";
      if (nav) nav.style.display = "none";
      if (footer) footer.style.display = "none";
      if (vaultContent) vaultContent.style.display = "none";
      passwordInput.focus();
    } else {
      // 이미 인증된 경우
      popup.classList.add("hidden");
      if (vaultContent) vaultContent.style.display = "block";
      document.body.style.overflow = "auto";
      if (nav) nav.style.display = "flex";
      if (footer) footer.style.display = "block";
      document.documentElement.style.display = "block";
    }

    // ESC 키로 메인 페이지로 이동
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        window.location.href = "index.html";
      }
    });

    // 팝업 배경 클릭 시 메인 페이지로 이동
    popup.addEventListener("click", function (e) {
      if (e.target === popup) {
        window.location.href = "index.html";
      }
    });

    // 확인 버튼 클릭 이벤트
    submitButton.onclick = checkVaultPassword;

    // Enter 키 이벤트
    passwordInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        checkVaultPassword();
      }
    });
  }

  // vault 페이지 진입 시 즉시 비밀번호 체크
  if (window.location.pathname.includes("vault.html")) {
    checkVaultAuthorization();
  }
});

function checkVaultAuthorization() {
  // 이미 인증된 상태인지 확인
  const isAuthorized = window.PASSWORD_AUTHORIZED === true;
  if (!isAuthorized) {
    // 인증되지 않은 경우 팝업 표시
    document.getElementById("vault-popup-container").classList.remove("hidden");
  } else {
    // 인증된 경우 컨텐츠 표시
    document.querySelector(".vault-content").classList.add("authorized");
  }
}

// 비밀번호 확인 후 처리
function handleVaultAuthorization() {
  // 비밀번호 확인 로직...
  if (passwordIsCorrect) {
    window.PASSWORD_AUTHORIZED = true;
    document.getElementById("vault-popup-container").classList.add("hidden");
    document.querySelector(".vault-content").classList.add("authorized");
  }
}

// 모달 열기
function openModal() {
  document.body.classList.add("modal-open");
  // ... 기존 모달 열기 코드 ...
}

// 모달 닫기
function closeModal() {
  document.body.classList.remove("modal-open");
  // ... 기존 모달 닫기 코드 ...
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("vault.html")) {
    const isAuthorized = window.PASSWORD_AUTHORIZED === true;
    const popupContainer = document.getElementById("vault-popup-container");
    const vaultContent = document.querySelector(".vault-content");

    if (!isAuthorized) {
      // 비인증 상태
      vaultContent.style.display = "none";
      document.body.classList.add("popup-open");

      // 페이지 표시 및 팝업 열기
      requestAnimationFrame(() => {
        document.documentElement.style.display = "";
        popupContainer.style.display = "flex";
      });
    } else {
      // 인증 상태
      popupContainer.style.display = "none";
      vaultContent.style.display = "block";
    }
  }
});

// MD5 해시 함수 (외부 라이브러리 사용)
function md5(string) {
  return CryptoJS.MD5(string).toString();
}
// 비밀번호 체크 함수 확인
function checkProjectPassword(input) {
  // 입력값과 저장된 해시값 비교
  const hashedInput = CryptoJS.MD5(input).toString();
  console.log("입력 해시:", hashedInput); // 디버깅용
  console.log("저장된 해시:", window.NOTION_PASSWORD_HASH); // Notion에서 가져온 해시 사용
  console.log("일치 여부:", hashedInput === window.NOTION_PASSWORD_HASH);
  return hashedInput === window.NOTION_PASSWORD_HASH;
}
