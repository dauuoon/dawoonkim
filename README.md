# 🌐 Dawoon Kim — Portfolio Website  
[https://dawoonkim.me](https://dawoonkim.me)

I’m a UX/UI designer, and this website is a portfolio I built to organize my design projects and apply the web development skills I’ve learned on my own.

---

## 🛠️ Tech Stack | 사용 기술

- **Language / 언어**: HTML5, CSS3, JavaScript (Vanilla JS)
- **CMS / 콘텐츠 관리**: Notion API (Database Integration)
- **Styling / 스타일링**: Custom CSS
- **Design Tools / 디자인 툴**: Figma, Adobe Illustrator, Adobe Photoshop
- **Deployment / 배포**: GitHub Pages

---

## 📦 Notion CMS 통합 (Notion Database Integration)

이 포트폴리오는 Notion 데이터베이스를 CMS로 사용하여 프로젝트, 어바웃, 볼트(Vault) 콘텐츠를 동적으로 로드합니다.

### 1️⃣ Notion 데이터베이스 구조

총 **4개의 데이터베이스**가 필요합니다:

#### 🗂️ PROJECT 데이터베이스
| 속성 이름 | 타입 | 설명 |
|---------|------|------|
| TITLE | Title | 프로젝트 제목 |
| SUBTITLE | Rich Text | 프로젝트 부제목 |
| DESCRIPTION | Rich Text | 프로젝트 설명 |
| CREATED_AT | Date | 프로젝트 생성일 |
| TAGS | Multi-select | 태그 (예: UX/UI, Web) |
| IS_LOCKED | Checkbox | 비밀번호 보호 여부 |
| THUMBNAIL_IMAGE | Files & media | 썸네일 이미지 |
| COVER_IMAGE | Files & media | 커버 이미지 |
| DETAIL_IMAGES | Files & media | 상세 이미지 (다수) |
| ORDER | Number | 표시 순서 (낮을수록 먼저) |

#### 📝 ABOUT 데이터베이스
| 속성 이름 | 타입 | 설명 |
|---------|------|------|
| SECTION | Select | 섹션명 (Education, Career 등) |
| TITLE | Title | 항목 제목 |
| FROM_DATE | Date | 시작일 |
| TO_DATE | Date | 종료일 ("PRESENT" 사용 가능) |
| DESCRIPTION | Rich Text | 설명 |
| ORDER | Number | 표시 순서 |

#### 🖼️ VAULT 데이터베이스
| 속성 이름 | 타입 | 설명 |
|---------|------|------|
| TITLE | Title | 볼트 아이템 제목 |
| THUMBNAIL_IMAGE | Files & media | 썸네일 이미지 |
| FULL_IMAGE | Files & media | 전체 크기 이미지 |
| ORDER | Number | 표시 순서 |

#### ⚙️ SETTINGS 데이터베이스
| 속성 이름 | 타입 | 설명 |
|---------|------|------|
| KEY | Title | 설정 키 (예: "PASSWORD") |
| VALUE | Rich Text | 설정 값 |

**중요:** SETTINGS 데이터베이스에 `KEY = "PASSWORD"`인 항목을 생성하고, `VALUE`에 원하는 비밀번호를 **평문**으로 입력하세요. (MD5 해싱은 자동 처리됩니다)

### 2️⃣ 자동 업데이트 (GitHub Actions)

이 프로젝트는 **GitHub Actions**가 Notion 데이터를 가져와
`data/notion-data.json`로 저장합니다. 브라우저에서는 JSON만 읽어
**API 토큰이 노출되지 않습니다.**

#### 설정 요약
1. **Notion Integration 생성 및 연결**
2. **GitHub Secrets 등록**
   - `NOTION_TOKEN`, `PROJECTS_DB`, `ABOUT_DB`, `VAULT_DB`, `SETTINGS_DB`
3. **워크플로우 실행**
   - Actions → Update Notion Data → Run workflow

매일 **오후 2시(KST)** 자동으로 업데이트됩니다.

