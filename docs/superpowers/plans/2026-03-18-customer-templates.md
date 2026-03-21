# 다낭픽 고객 응대 템플릿 도구 — 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 다낭픽 운영자가 서비스·상황별 고객 메시지 템플릿을 핸드폰에서 버튼 하나로 복사해 메신저에 붙여넣을 수 있는 모바일 최적화 정적 웹 앱을 구축한다.

**Architecture:** 순수 HTML + CSS + 바닐라 JS (빌드 도구 없음). 카테고리별 JS 파일이 전역 `CATEGORIES` 배열에 데이터를 push하면 `app.js`가 이를 읽어 UI를 렌더링한다. `index.html`에서 템플릿 파일 → `app.js` 순으로 로드한다.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6), GitHub Pages (gh-pages 브랜치)

---

## 파일 맵

| 경로 | 역할 |
|------|------|
| `index.html` | 앱 진입점 — 탭 컨테이너, 콘텐츠 영역, script 로드 순서 |
| `css/style.css` | 모바일 최적화 스타일 (탭바, 카드, 복사 버튼) |
| `js/app.js` | CATEGORIES 읽기 → 탭/카드 렌더링 + 클립보드 복사 |
| `js/templates/_예시.js` | 새 카테고리 추가용 주석 완비 예시 파일 |
| `js/templates/common.js` | 공통 템플릿 (첫문의, 정보확인, 결제, 예약확인, 취소) |
| `js/templates/eco.js` | 에코걸 (첫상담, 견적, 세부확인, 매칭완료, 당일안내) |
| `js/templates/home-massage.js` | 홈마사지 (첫상담, 메뉴견적, 예약확인, 당일안내) |
| `js/templates/golf.js` | 골프 (코스문의, 견적, 예약확인, 픽업안내) |
| `js/templates/poolvilla.js` | 풀빌라 (문의응대, 견적, 예약확인) |
| `js/templates/karaoke.js` | 가라오케 (예약문의, 안내견적, 예약확인) |
| `js/templates/bar.js` | 바 (안내, 예약확인) |
| `js/templates/dining.js` | 다이닝 (예약문의, 예약확인) |
| `CLAUDE.md` | 프로젝트 설명 + 유지보수 가이드 (200줄 이내) |

---

## Task 1: 로컬 Git 저장소 초기화 (gh-pages 브랜치)

**Files:**
- Create: `C:\1. 다낭픽 관련\고객응대\.git\` (git init)

- [ ] **Step 1: 폴더 이동 후 git init**

```bash
cd "C:/1. 다낭픽 관련/고객응대"
git init
```

Expected: `Initialized empty Git repository`

- [ ] **Step 2: orphan 브랜치 gh-pages 생성**

```bash
git checkout --orphan gh-pages
```

Expected: `Switched to a new branch 'gh-pages'`

- [ ] **Step 3: remote 연결**

```bash
git remote add origin https://github.com/sadcorea/DanangPick.git
```

- [ ] **Step 4: git user 설정**

```bash
git config user.name "sadcorea"
git config user.email "you@example.com"
```

---

## Task 2: _예시.js — 카테고리 추가 가이드 파일

**Files:**
- Create: `js/templates/_예시.js`

- [ ] **Step 1: js/templates 디렉토리 생성 후 파일 작성**

```bash
mkdir -p "C:/1. 다낭픽 관련/고객응대/js/templates"
```

파일 내용:

```javascript
// =====================================================
// 새 카테고리(업체) 추가 방법
// =====================================================
// 1. 이 파일을 복사해서 새 파일명으로 저장
//    예) js/templates/casino.js
//
// 2. 아래 내용을 수정 (id, label, situations, templates)
//
// 3. index.html 에서 다른 template script 태그 아래에 한 줄 추가
//    <script src="js/templates/casino.js"></script>
//
// 4. 클로드에게 "카지노 카테고리 추가해줘" 라고 요청해도 됨
// =====================================================

CATEGORIES.push({
  id: 'example',          // 영문 고유 ID (중복 안 됨)
  label: '예시카테고리',   // 탭에 표시될 이름

  situations: [
    {
      label: '첫 문의',   // 상황 그룹명

      templates: [
        {
          title: '기본 응대',   // 카드 제목
          text:                 // 실제 복사될 메시지 (백틱 문자열)
`안녕하세요 고객님 😊
다낭픽입니다.

문의 주셔서 감사합니다!
어떤 서비스가 필요하신가요?`
        },
        {
          title: '두 번째 템플릿',
          text:
`두 번째 템플릿 내용입니다.`
        }
      ]
    },

    {
      label: '견적 안내',

      templates: [
        {
          title: '견적 안내',
          text:
`견적 안내드립니다 💰

[내용 작성]`
        }
      ]
    }
  ]
});
```

- [ ] **Step 2: 파일 존재 확인**

```bash
ls "C:/1. 다낭픽 관련/고객응대/js/templates/_예시.js"
```

---

## Task 3: 템플릿 데이터 파일 (8개 카테고리)

**Files:**
- Create: `js/templates/common.js`
- Create: `js/templates/eco.js`
- Create: `js/templates/home-massage.js`
- Create: `js/templates/golf.js`
- Create: `js/templates/poolvilla.js`
- Create: `js/templates/karaoke.js`
- Create: `js/templates/bar.js`
- Create: `js/templates/dining.js`

- [ ] **Step 1: common.js 작성**

```javascript
CATEGORIES.push({
  id: 'common',
  label: '공통',
  situations: [
    {
      label: '첫 문의',
      templates: [
        {
          title: '첫 문의 응대',
          text:
`안녕하세요 고객님 😊
다낭픽입니다.

문의 주셔서 감사합니다!
원하시는 서비스와 날짜를 알려주시면 바로 안내드리겠습니다 🙏`
        }
      ]
    },
    {
      label: '정보 확인',
      templates: [
        {
          title: '기본 정보 확인 요청',
          text:
`예약을 도와드리기 위해 몇 가지 확인이 필요합니다 📋

✅ 방문 날짜 :
✅ 인원수 :
✅ 숙소 이름 또는 위치 :
✅ 예산 (1인 기준) :

편하게 말씀해 주세요 😊`
        }
      ]
    },
    {
      label: '결제 안내',
      templates: [
        {
          title: '결제 방법 안내',
          text:
`결제 안내드립니다 💳

결제는 현장에서 베트남 동(VND) 또는 달러(USD)로 진행됩니다.
카드 결제도 가능하나 현금을 권장드립니다.

추가 문의사항 있으시면 편하게 연락 주세요 😊`
        },
        {
          title: '선입금 안내',
          text:
`예약 확정을 위해 선입금이 필요합니다 💰

선입금 금액 :
계좌 정보 :
입금 기한 :

입금 확인 후 예약이 확정됩니다.
영수증 캡처 후 전달 부탁드립니다 📸`
        }
      ]
    },
    {
      label: '예약 확인',
      templates: [
        {
          title: '예약 확정 안내',
          text:
`예약이 확정되었습니다 ✅

📅 날짜 :
👥 인원 :
🏨 장소 :
⏰ 시간 :

당일 안내는 하루 전날 별도로 드리겠습니다.
궁금한 점 있으시면 언제든지 연락 주세요 😊`
        }
      ]
    },
    {
      label: '취소·변경',
      templates: [
        {
          title: '취소·변경 접수',
          text:
`취소/변경 접수 완료되었습니다 📝

처리 후 다시 연락드리겠습니다.
불편을 드려 죄송합니다 🙏`
        }
      ]
    }
  ]
});
```

- [ ] **Step 2: eco.js 작성**

```javascript
CATEGORIES.push({
  id: 'eco',
  label: '에코걸',
  situations: [
    {
      label: '첫 상담',
      templates: [
        {
          title: '에코걸 첫 상담',
          text:
`안녕하세요 고객님 😊
에코걸 서비스 문의 주셨군요!

저희 다낭픽이 직접 검증한 프리미엄 서비스입니다.
먼저 몇 가지 확인드릴게요 📋

✅ 날짜 :
✅ 인원수 :
✅ 희망 시간대 :
✅ 숙소 이름 :
✅ 예산 (1인 기준, USD) :`
        }
      ]
    },
    {
      label: '견적 안내',
      templates: [
        {
          title: '에코걸 견적',
          text:
`에코걸 견적 안내드립니다 💰

기본 요금 :
포함 내용 :
시간 :
인원 :

추가 옵션이나 특별 요청사항 있으시면 말씀해 주세요 😊`
        }
      ]
    },
    {
      label: '세부 확인',
      templates: [
        {
          title: '세부 사항 확인',
          text:
`예약 진행을 위해 세부 사항 확인드립니다 📋

📅 날짜 :
⏰ 시간 :
👥 인원 :
🏨 숙소 이름 :
🏠 객실 번호 (알고 계시면) :

확인 후 바로 안내드리겠습니다 😊`
        }
      ]
    },
    {
      label: '매칭 완료',
      templates: [
        {
          title: '매칭 완료 안내',
          text:
`매칭이 완료되었습니다 ✅

당일 세부 안내는 하루 전날 별도로 드리겠습니다.
추가 문의사항 있으시면 언제든지 연락 주세요 😊`
        }
      ]
    },
    {
      label: '당일 안내',
      templates: [
        {
          title: '당일 안내',
          text:
`안녕하세요 고객님 😊
오늘 서비스 관련 안내드립니다 📢

⏰ 미팅 시간 :
📍 미팅 장소 :

준비되셨으면 연락 주세요!
즐거운 시간 되세요 🎉`
        }
      ]
    }
  ]
});
```

- [ ] **Step 3: home-massage.js 작성**

```javascript
CATEGORIES.push({
  id: 'home-massage',
  label: '홈마사지',
  situations: [
    {
      label: '첫 상담',
      templates: [
        {
          title: '홈마사지 첫 상담',
          text:
`안녕하세요 고객님 😊
홈마사지 서비스 문의 주셨군요!

숙소로 전문 마사지사가 직접 방문하는 프리미엄 서비스입니다.
몇 가지 확인드릴게요 📋

✅ 날짜 :
✅ 시간 :
✅ 인원수 :
✅ 희망 마사지 종류 (타이/스웨디시/아로마 등) :
✅ 숙소 이름 :
✅ 객실 번호 :`
        }
      ]
    },
    {
      label: '메뉴·견적',
      templates: [
        {
          title: '홈마사지 메뉴·견적',
          text:
`홈마사지 메뉴 안내드립니다 💆

🔹 타이마사지 60분 :
🔹 스웨디시 60분 :
🔹 아로마 60분 :
🔹 발마사지 60분 :

* 90분/120분 연장 가능
* 2인 이상 동시 예약 시 할인 적용

원하시는 메뉴 알려주시면 예약 진행해 드리겠습니다 😊`
        }
      ]
    },
    {
      label: '예약 확인',
      templates: [
        {
          title: '홈마사지 예약 확정',
          text:
`홈마사지 예약이 확정되었습니다 ✅

📅 날짜 :
⏰ 시간 :
💆 메뉴 :
🏨 숙소 :
🏠 객실 번호 :

마사지사 도착 10분 전에 알림 드리겠습니다 😊`
        }
      ]
    },
    {
      label: '당일 안내',
      templates: [
        {
          title: '마사지사 출발 안내',
          text:
`안녕하세요 고객님 😊
마사지사가 곧 출발합니다 🚗

⏰ 도착 예정 시간 :
👤 마사지사 이름 :

객실 문 열어두시거나 로비에서 맞이해 주세요.
좋은 시간 되세요 💆`
        }
      ]
    }
  ]
});
```

- [ ] **Step 4: golf.js 작성**

```javascript
CATEGORIES.push({
  id: 'golf',
  label: '골프',
  situations: [
    {
      label: '코스 문의',
      templates: [
        {
          title: '골프 코스 문의 응대',
          text:
`안녕하세요 고객님 😊
골프 예약 문의 주셨군요!

다낭의 검증된 골프장을 소개해 드리겠습니다.
몇 가지 확인드릴게요 📋

✅ 라운딩 날짜 :
✅ 인원수 :
✅ 선호 코스 (있으신 경우) :
✅ 예산 (1인 기준, USD) :
✅ 캐디 포함 여부 :

다낭 주요 골프장: 몽고메리링크스 / BRG다낭 / 호이아나쇼어스 / 바나힐 / 라구나랑코`
        }
      ]
    },
    {
      label: '견적 안내',
      templates: [
        {
          title: '골프 견적',
          text:
`골프 견적 안내드립니다⛳

🏌️ 코스 :
📅 날짜 :
👥 인원 :

💰 그린피 (1인) :
💰 캐디피 (1인) :
💰 카트피 (공동) :
💰 합계 (1인 기준) :

픽업 서비스 필요하신가요? 별도 안내 가능합니다 😊`
        }
      ]
    },
    {
      label: '예약 확인',
      templates: [
        {
          title: '골프 예약 확정',
          text:
`골프 예약이 확정되었습니다 ✅⛳

🏌️ 코스 :
📅 날짜 :
⏰ 티오프 시간 :
👥 인원 :
🚗 픽업 여부 :

티오프 전날 최종 안내 다시 드리겠습니다 😊`
        }
      ]
    },
    {
      label: '픽업 안내',
      templates: [
        {
          title: '당일 픽업 안내',
          text:
`안녕하세요 고객님 😊
오늘 골프 라운딩 안내드립니다 ⛳

🚗 픽업 시간 :
📍 픽업 장소 (숙소 앞) :
🏌️ 코스 도착 예정 :

좋은 라운딩 되세요! 🏌️`
        }
      ]
    }
  ]
});
```

- [ ] **Step 5: poolvilla.js 작성**

```javascript
CATEGORIES.push({
  id: 'poolvilla',
  label: '풀빌라',
  situations: [
    {
      label: '문의 응대',
      templates: [
        {
          title: '풀빌라 문의 응대',
          text:
`안녕하세요 고객님 😊
풀빌라 문의 주셨군요!

다낭 프라이빗 풀빌라 안내드리겠습니다 🏊
몇 가지 확인드릴게요 📋

✅ 체크인 날짜 :
✅ 체크아웃 날짜 :
✅ 인원수 :
✅ 예산 (1박 기준, USD) :
✅ 선호 시설 (바베큐/자쿠지/키친 등) :`
        }
      ]
    },
    {
      label: '견적 안내',
      templates: [
        {
          title: '풀빌라 견적',
          text:
`풀빌라 견적 안내드립니다 🏊

🏡 빌라명 :
📅 기간 :
👥 최대 인원 :
💰 1박 요금 :
💰 총 요금 :

포함 시설 :
✅ 프라이빗 풀
✅

추가 문의 있으시면 편하게 말씀해 주세요 😊`
        }
      ]
    },
    {
      label: '예약 확인',
      templates: [
        {
          title: '풀빌라 예약 확정',
          text:
`풀빌라 예약이 확정되었습니다 ✅🏊

🏡 빌라명 :
📅 체크인 :
📅 체크아웃 :
👥 인원 :

체크인 전날 상세 안내 드리겠습니다 😊`
        }
      ]
    }
  ]
});
```

- [ ] **Step 6: karaoke.js 작성**

```javascript
CATEGORIES.push({
  id: 'karaoke',
  label: '가라오케',
  situations: [
    {
      label: '예약 문의',
      templates: [
        {
          title: '가라오케 예약 문의 응대',
          text:
`안녕하세요 고객님 😊
가라오케 문의 주셨군요!

다낭 프리미엄 가라오케 안내드리겠습니다 🎤
몇 가지 확인드릴게요 📋

✅ 날짜 :
✅ 시간 :
✅ 인원수 :
✅ 예산 (총 기준, USD) :`
        }
      ]
    },
    {
      label: '안내·견적',
      templates: [
        {
          title: '가라오케 견적',
          text:
`가라오케 견적 안내드립니다 🎤

🏢 업체명 :
📅 날짜 :
⏰ 시간 :
👥 인원 :
💰 룸 요금 :
💰 기본 주류 포함 여부 :
💰 합계 :

한국 노래 최신곡 완비, 개인 서비스 포함입니다 😊`
        }
      ]
    },
    {
      label: '예약 확인',
      templates: [
        {
          title: '가라오케 예약 확정',
          text:
`가라오케 예약이 확정되었습니다 ✅🎤

🏢 업체명 :
📅 날짜 :
⏰ 시간 :
👥 인원 :
📍 위치 :

도착 시 다낭픽 예약이라고 말씀해 주세요 😊`
        }
      ]
    }
  ]
});
```

- [ ] **Step 7: bar.js 작성**

```javascript
CATEGORIES.push({
  id: 'bar',
  label: '바',
  situations: [
    {
      label: '안내',
      templates: [
        {
          title: '바 안내',
          text:
`안녕하세요 고객님 😊
바 문의 주셨군요! 🍸

다낭픽 추천 바 안내드리겠습니다.

📅 방문 날짜 :
⏰ 방문 시간 :
👥 인원수 :

분위기/선호 스타일 알려주시면 맞춤 추천해 드리겠습니다 😊`
        }
      ]
    },
    {
      label: '예약 확인',
      templates: [
        {
          title: '바 예약 확정',
          text:
`바 예약이 확정되었습니다 ✅🍸

🏢 업체명 :
📅 날짜 :
⏰ 시간 :
👥 인원 :
📍 위치 :

즐거운 밤 되세요 🎉`
        }
      ]
    }
  ]
});
```

- [ ] **Step 8: dining.js 작성**

```javascript
CATEGORIES.push({
  id: 'dining',
  label: '다이닝',
  situations: [
    {
      label: '예약 문의',
      templates: [
        {
          title: '다이닝 예약 문의 응대',
          text:
`안녕하세요 고객님 😊
다이닝 문의 주셨군요! 🍽️

다낭픽 검증 레스토랑 안내드리겠습니다.
몇 가지 확인드릴게요 📋

✅ 날짜 :
✅ 시간 :
✅ 인원수 :
✅ 음식 선호 (해산물/스테이크/베트남식 등) :
✅ 예산 (1인 기준, USD) :
✅ 특별 요청 (생일/기념일 등) :`
        }
      ]
    },
    {
      label: '예약 확인',
      templates: [
        {
          title: '다이닝 예약 확정',
          text:
`다이닝 예약이 확정되었습니다 ✅🍽️

🍴 레스토랑 :
📅 날짜 :
⏰ 시간 :
👥 인원 :
📍 위치 :

도착 시 다낭픽 예약이라고 말씀해 주세요 😊
좋은 식사 되세요 🍽️`
        }
      ]
    }
  ]
});
```

---

## Task 4: CSS (모바일 최적화)

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: css 디렉토리 생성 후 style.css 작성**

```bash
mkdir -p "C:/1. 다낭픽 관련/고객응대/css"
```

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
  color: #333;
  min-height: 100vh;
}

/* 헤더 */
.header {
  background: #1a1a2e;
  color: #fff;
  padding: 14px 16px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h1 {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* 탭바 */
.tab-bar {
  background: #fff;
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-bottom: 2px solid #eee;
  position: sticky;
  top: 46px;
  z-index: 99;
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  flex-shrink: 0;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #1a1a2e;
  font-weight: 700;
  border-bottom-color: #e94560;
}

/* 콘텐츠 영역 */
.content {
  padding: 16px;
  max-width: 640px;
  margin: 0 auto;
}

/* 상황 섹션 */
.situation {
  margin-bottom: 24px;
}

.situation-label {
  font-size: 13px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  padding-left: 4px;
}

/* 템플릿 카드 */
.template-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.template-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a2e;
}

.template-preview {
  font-size: 13px;
  color: #777;
  line-height: 1.5;
  margin-bottom: 12px;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 복사 버튼 */
.copy-btn {
  width: 100%;
  padding: 10px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:active {
  background: #2d2d44;
  transform: scale(0.98);
}

.copy-btn.copied {
  background: #27ae60;
}
```

---

## Task 5: app.js

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: js 디렉토리 확인 후 app.js 작성**

```javascript
// app.js — 탭 렌더링 + 클립보드 복사 로직
// CATEGORIES 배열은 templates/*.js 파일들이 채워줌

let currentCategoryIndex = 0;

function renderTabs() {
  const tabBar = document.getElementById('tab-bar');
  tabBar.innerHTML = '';

  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i === 0 ? ' active' : '');
    btn.textContent = cat.label;
    btn.addEventListener('click', () => selectCategory(i));
    tabBar.appendChild(btn);
  });
}

function selectCategory(index) {
  currentCategoryIndex = index;

  // 탭 활성화
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  // 스크롤 탭 중앙 정렬
  const tabBar = document.getElementById('tab-bar');
  const activeBtn = tabBar.children[index];
  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  renderContent(CATEGORIES[index]);
}

function renderContent(category) {
  const content = document.getElementById('content');
  content.innerHTML = '';

  category.situations.forEach((sit, sitIdx) => {
    const section = document.createElement('div');
    section.className = 'situation';

    const label = document.createElement('div');
    label.className = 'situation-label';
    label.textContent = sit.label;
    section.appendChild(label);

    sit.templates.forEach((tmpl, tmplIdx) => {
      const card = document.createElement('div');
      card.className = 'template-card';

      const title = document.createElement('div');
      title.className = 'template-title';
      title.textContent = tmpl.title;

      const preview = document.createElement('div');
      preview.className = 'template-preview';
      preview.textContent = tmpl.text;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '📋 복사';
      btn.addEventListener('click', () => copyText(btn, tmpl.text));

      card.appendChild(title);
      card.appendChild(preview);
      card.appendChild(btn);
      section.appendChild(card);
    });

    content.appendChild(section);
  });
}

function copyText(btn, text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => flashCopied(btn));
  } else {
    // 구형 브라우저 폴백
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    flashCopied(btn);
  }
}

function flashCopied(btn) {
  btn.textContent = '복사됨 ✓';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = '📋 복사';
    btn.classList.remove('copied');
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  renderTabs();
  if (CATEGORIES.length > 0) renderContent(CATEGORIES[0]);
});
```

---

## Task 6: index.html

**Files:**
- Create: `index.html`

- [ ] **Step 1: index.html 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <title>다낭픽 응대 템플릿</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <div class="header">
    <h1>🎯 다낭픽 응대 템플릿</h1>
  </div>

  <div id="tab-bar" class="tab-bar"></div>

  <div id="content" class="content"></div>

  <!-- 템플릿 파일: 순서 무관, 단 app.js보다 먼저 로드 -->
  <script>const CATEGORIES = [];</script>
  <script src="js/templates/common.js"></script>
  <script src="js/templates/eco.js"></script>
  <script src="js/templates/home-massage.js"></script>
  <script src="js/templates/golf.js"></script>
  <script src="js/templates/poolvilla.js"></script>
  <script src="js/templates/karaoke.js"></script>
  <script src="js/templates/bar.js"></script>
  <script src="js/templates/dining.js"></script>
  <!-- 새 카테고리 추가 시 위 줄 아래에 script 태그 한 줄 추가 -->

  <script src="js/app.js"></script>

</body>
</html>
```

---

## Task 7: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md 작성 (내용은 별도 Task 8로)**

---

## Task 8: CLAUDE.md 내용 작성

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md 작성**

```markdown
# 업체(카테고리) 추가 방법: js/templates/_예시.js 파일을 참고해서 새 업체를 등록하세요.

---

# 다낭픽 고객 응대 템플릿 — 운영 가이드

> 유지보수·템플릿 수정·업체 추가는 Claude에게 위임.

---

## 이 프로젝트가 하는 일

다낭픽 운영자가 고객에게 카카오톡·텔레그램 메시지를 보낼 때
서비스·상황별 템플릿을 버튼 하나로 클립보드에 복사하는 웹 도구.

접속 URL: https://sadcorea.github.io/DanangPick/

---

## 파일 구조

```
고객응대/
├── CLAUDE.md                  ← 이 파일
├── index.html                 ← 앱 진입점 (script 로드 순서 중요)
├── css/
│   └── style.css              ← 모바일 최적화 스타일
└── js/
    ├── app.js                 ← 탭 렌더링 + 복사 로직
    └── templates/
        ├── _예시.js           ← 새 카테고리 추가 시 복사 원본
        ├── common.js          ← 공통
        ├── eco.js             ← 에코걸
        ├── home-massage.js    ← 홈마사지
        ├── golf.js            ← 골프
        ├── poolvilla.js       ← 풀빌라
        ├── karaoke.js         ← 가라오케
        ├── bar.js             ← 바
        └── dining.js          ← 다이닝
```

---

## GitHub 설정

| 항목 | 값 |
|------|----|
| 저장소 | sadcorea/DanangPick |
| 브랜치 | gh-pages (main과 완전 분리) |
| 로컬 경로 | C:\1. 다낭픽 관련\고객응대\ |
| GitHub Pages 설정 | Settings → Pages → Branch: gh-pages / root |

---

## 배포 방법 (수정 후)

```bash
cd "C:/1. 다낭픽 관련/고객응대"
git add .
git commit -m "업데이트 내용"
git push origin gh-pages
```

GitHub Pages가 수 분 내 자동 반영됨.

---

## 새 카테고리(업체) 추가 방법

1. `js/templates/_예시.js` 복사 → 새 파일명으로 저장 (예: `casino.js`)
2. 파일 내 id, label, situations, templates 내용 수정
3. `index.html` 하단 script 목록에 한 줄 추가:
   ```html
   <script src="js/templates/casino.js"></script>
   ```
4. 저장 후 git push

또는 Claude에게 "카지노 카테고리 추가해줘" 라고 요청.

---

## 템플릿 수정 방법

해당 카테고리 파일(`js/templates/xxx.js`) 열어서 `text:` 뒤 내용 수정.
또는 Claude에게 "에코걸 첫 상담 템플릿 이렇게 바꿔줘" 라고 요청.

---

## 주의사항

- `index.html`에서 `const CATEGORIES = [];` 줄이 template script들보다 **먼저** 있어야 함
- `app.js`는 반드시 template script들 **다음에** 로드
- `gh-pages` 브랜치는 main 브랜치와 완전 분리 — main에 push하지 말 것

---

## Claude 운영 원칙

- 각 카테고리는 독립 파일 — 수정 시 해당 파일만 건드림
- 전체 구조 변경 없이 파일 추가만으로 카테고리 확장
- 스타일 수정: `css/style.css`
- 탭·복사 로직 수정: `js/app.js`
```

---

## Task 9: Git 커밋 + GitHub push + Pages 활성화

**Files:** 없음 (git 작업)

- [ ] **Step 1: 전체 파일 스테이징 및 첫 커밋**

```bash
cd "C:/1. 다낭픽 관련/고객응대"
git add .
git commit -m "feat: 다낭픽 고객 응대 템플릿 도구 초기 구축

- 8개 카테고리 (공통/에코걸/홈마사지/골프/풀빌라/가라오케/바/다이닝)
- 모바일 최적화 UI + 원클릭 클립보드 복사
- 모듈식 템플릿 구조 (_예시.js 기반 확장)"
```

- [ ] **Step 2: gh-pages 브랜치로 push**

```bash
git push -u origin gh-pages
```

- [ ] **Step 3: GitHub Pages 활성화 안내**

브라우저에서 수동 설정 필요:
1. https://github.com/sadcorea/DanangPick/settings/pages 접속
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **/ (root)**
4. Save 클릭
5. 수 분 후 https://sadcorea.github.io/DanangPick/ 접속 확인

- [ ] **Step 4: 접속 확인**

핸드폰 브라우저에서 `https://sadcorea.github.io/DanangPick/` 열어서
탭 전환, 복사 버튼 동작 확인.

---
