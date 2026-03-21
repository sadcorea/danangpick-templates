> **업무 마무리 전 필수:** 이 CLAUDE.md 안의 카테고리(js/templates/ 파일 목록·파일 구조 표 등)를 이 폴더 기준으로 최신화할 것. 다른 폴더는 건드리지 않음.

## 프로젝트 개요

다낭픽 고객 응대 템플릿 도구입니다. 카카오톡 등 메신저 응대 시 자주 쓰는 메시지를 카테고리별로 모아 두고, 버튼 한 번으로 클립보드에 복사할 수 있도록 만든 모바일 전용 정적 웹앱입니다. 빌드 도구 없이 HTML/CSS/JS 파일만으로 구성되며, GitHub Pages로 배포됩니다.

**접속 URL:** https://sadcorea.github.io/danangpick-templates/

---

## 가격 도구 (시뮬레이터 & 계산기)

> 상세 문서: [`docs/PRICING-TOOL.md`](docs/PRICING-TOOL.md)

- `pricing.html` — 시뮬레이터 (슬라이더, 시장가 비교)
- `pricing-calc.html` — 계산기 (원가/마진 직접 입력)
- **원가/판매가 변경은 `pricing/pricing-data.js` 에서만** (버전 번호도 올릴 것)

---

## 파일 구조

### 고객 응대 템플릿

| 경로 | 역할 |
|------|------|
| `index.html` | 진입점. CATEGORIES 초기화 → 템플릿 파일 로드 → app.js 로드 순서 고정 |
| `css/style.css` | 전체 스타일 (모바일 최적화) |
| `js/app.js` | 탭 렌더링, 카드 렌더링, 복사 로직 |
| `js/templates/_예시.js` | 새 카테고리 추가용 예시 파일 |
| `js/templates/common.js` | 공통 응대 템플릿 |
| `js/templates/eco.js` | 에코가이드 템플릿 |
| `js/templates/home-massage.js` | 홈케어/마사지 템플릿 |
| `js/templates/golf.js` | 골프 템플릿 |
| `js/templates/poolvilla.js` | 풀빌라 템플릿 |
| `js/templates/karaoke.js` | 노래방 템플릿 |
| `js/templates/bar.js` | 바/클럽 템플릿 |
| `js/templates/dining.js` | 식당 템플릿 |

### 가격 시뮬레이터 & 계산기

| 경로 | 역할 |
|------|------|
| `pricing.html` | 가격 시뮬레이터 페이지 |
| `pricing-calc.html` | 가격 계산기 페이지 |
| `pricing/pricing-data.js` | **공통 원가/판매가 데이터 (원가 변경 시 여기만 수정)** |
| `pricing/pricing-app.js` | 시뮬레이터 로직 |
| `pricing/pricing-calc.js` | 계산기 로직 |
| `pricing/pricing-style.css` | 시뮬레이터 스타일 |
| `pricing/pricing-calc.css` | 계산기 스타일 |

### 문서

| 경로 | 역할 |
|------|------|
| `docs/PRICING-TOOL.md` | 가격 도구 상세 문서 |
| `docs/에코_홈마사지_원가and판매가.md` | 원가/판매가/마진 분석 (경쟁사 조사) |

---

## GitHub 설정

| 항목 | 값 |
|------|-----|
| 저장소 | sadcorea/danangpick-templates (Public) |
| 배포 브랜치 | gh-pages |
| 로컬 경로 | `C:\1. 다낭픽 관련\고객응대\` |

**배포 명령어:**
```
git add . && git commit -m "변경 내용 설명" && git push origin gh-pages
```

**⚠️ GitHub Pages 최초 활성화는 브라우저에서 수동으로:**
1. https://github.com/sadcorea/danangpick-templates/settings/pages 접속
2. Branch → `gh-pages` / `/ (root)` 선택 → Save
3. 이유: GitHub CLI 토큰에 Pages API 권한 없음 (pages:write 스코프 미포함)
   → 재발급 필요 시 GitHub Settings → Developer settings → Fine-grained tokens

---

## 새 카테고리(업체) 추가 방법

1. `js/templates/_예시.js` 파일을 복사해서 새 파일명으로 저장
   - 예: `js/templates/casino.js`

2. 파일 내 `id`, `label`, `situations`, `templates` 를 원하는 내용으로 수정
   - `id`: 영문 고유값 (다른 파일과 중복 안 됨)
   - `label`: 탭에 표시될 한글 이름

3. `index.html` 에서 기존 script 태그 아래, 주석 위에 한 줄 추가:
   ```html
   <script src="js/templates/casino.js"></script>
   ```

4. 저장 후 배포:
   ```
   git add . && git commit -m "카지노 카테고리 추가" && git push origin gh-pages
   ```

---

## 기존 템플릿 수정 방법

1. `js/templates/` 폴더에서 수정할 파일을 열기
2. 해당 `text:` 백틱 안의 내용을 직접 수정
3. 저장 후 배포 명령어 실행

---

## 중요 주의사항

- `index.html` 에서 `const CATEGORIES = [];` 선언이 **반드시 모든 템플릿 script보다 먼저** 위치해야 합니다.
- `js/app.js` 는 **반드시 모든 템플릿 script 뒤에** 로드해야 합니다.
- 이 순서가 바뀌면 CATEGORIES 배열을 읽지 못해 화면이 빈 채로 표시됩니다.

---

## Claude 작업 원칙

- **⚠️ 작업 저장소: `sadcorea/danangpick-templates` 만 사용**
  - `sadcorea/DanangPick` (블로그 자동발행용 별도 저장소) 에는 절대 커밋·푸시 금지
  - 로컬 경로 `C:\1. 다낭픽 관련\고객응대\` 에서만 git 작업할 것
- 카테고리는 파일 하나에 하나 (`js/templates/이름.js`)
- **템플릿** 스타일 → `css/style.css` / 로직 → `js/app.js`
- **가격 도구** 스타일 → `pricing/pricing-style.css`, `pricing/pricing-calc.css` / 로직 → `pricing/pricing-app.js`, `pricing/pricing-calc.js` / 데이터 → `pricing/pricing-data.js`
- 디자인 기조: **블랙골드 럭셔리** (Cormorant Garamond + Noto Sans KR, 골드 그라데이션, 다크 배경) — 템플릿/가격 도구 모두 동일
- `index.html` 은 script 태그 추가/제거 외에는 수정 최소화
