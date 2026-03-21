# 다낭픽 고객 응대 템플릿 도구 — 설계 문서

작성일: 2026-03-18

---

## 목적

다낭픽 운영자가 고객에게 메시지를 보낼 때, 서비스·상황별 템플릿을 한 번의 탭으로
클립보드에 복사해 카카오톡·텔레그램에 바로 붙여넣을 수 있도록 한다.

---

## 사용 환경

- 주 기기: 핸드폰 (카카오톡·텔레그램 앱)
- 보조 기기: 노트북
- 접속 방법: 핸드폰 브라우저 즐겨찾기 → GitHub Pages URL

---

## 호스팅

- 저장소: `sadcorea/DanangPick` (기존 사용 중)
- 브랜치: `gh-pages` (main과 완전 분리된 orphan 브랜치)
- URL: `https://sadcorea.github.io/DanangPick/`
- 로컬 경로: `C:\1. 다낭픽 관련\고객응대\`

---

## 파일 구조

```
고객응대/
├── CLAUDE.md
├── index.html
├── css/style.css
└── js/
    ├── app.js
    └── templates/
        ├── _예시.js          ← 새 카테고리 추가 시 이 파일 복사
        ├── common.js
        ├── eco.js
        ├── home-massage.js
        ├── golf.js
        ├── poolvilla.js
        ├── karaoke.js
        ├── bar.js
        └── dining.js
```

---

## UI 구조

1. 상단 탭 (좌우 스크롤): 공통 | 에코걸 | 홈마사지 | 골프 | 풀빌라 | 가라오케 | 바 | 다이닝
2. 상황 버튼: 탭 선택 시 해당 카테고리의 상황 목록 표시
3. 템플릿 카드: 제목 + 내용 미리보기 + [복사] 버튼
4. 복사 성공 시 버튼 텍스트 "복사됨 ✓" 로 1.5초간 표시

---

## 템플릿 데이터 구조

각 `templates/*.js` 파일은 전역 배열 `CATEGORIES`에 객체를 push한다.

```javascript
CATEGORIES.push({
  id: 'eco',
  label: '에코걸',
  situations: [
    {
      label: '첫 문의',
      templates: [
        { title: '첫 문의 응대', text: '...' }
      ]
    }
  ]
});
```

`app.js`는 `CATEGORIES` 배열을 읽어 UI를 렌더링한다.
새 카테고리 추가 = `_예시.js`를 복사 후 내용 작성 + `index.html`에 script 태그 한 줄 추가.

---

## 업데이트 워크플로우

```
클로드에게 수정 요청
  → 클로드가 파일 수정
  → git commit + push origin gh-pages
  → GitHub Pages 자동 반영 (수 분 내)
```

---

## CLAUDE.md 요구사항

- 200줄 이내
- 첫 줄: `_예시.js`를 이용해 업체 등록하라는 안내
- 파일 구조, GitHub 브랜치, 배포 방법, 템플릿 수정·추가 방법 포함
