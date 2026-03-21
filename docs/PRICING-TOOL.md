# 가격 시뮬레이터 & 계산기

내부 관리용 가격 도구. 블랙골드 럭셔리 디자인, 빌드 도구 없이 브라우저에서 바로 사용.

---

## 페이지

| 페이지 | 파일 | 용도 |
|--------|------|------|
| 시뮬레이터 | `pricing.html` | 슬라이더로 판매가 조절, 경쟁사 시장가 비교 바 |
| 계산기 | `pricing-calc.html` | 전 항목 테이블, 원가/마진 직접 입력 |

---

## 파일 구조

| 경로 | 역할 |
|------|------|
| `pricing.html` | 시뮬레이터 메인 페이지 |
| `pricing-calc.html` | 계산기 메인 페이지 |
| `pricing/pricing-data.js` | **공통 원가/판매가 데이터 (여기서만 수정)** |
| `pricing/pricing-app.js` | 시뮬레이터 로직 (data 참조) |
| `pricing/pricing-calc.js` | 계산기 로직 (data 참조) |
| `pricing/pricing-style.css` | 시뮬레이터 스타일 |
| `pricing/pricing-calc.css` | 계산기 스타일 |
| `docs/에코_홈마사지_원가and판매가.md` | 원가/판매가/마진 분석 문서 (경쟁사 조사 포함) |

---

## 원가/판매가 변경 방법

1. `pricing/pricing-data.js` 열기
2. `PRICE_DATA` 안의 `cost`(원가), `sell`(추천 판매가), `marketMin/marketMax`(시장가 범위) 수정
3. 맨 위 `PRICE_DATA_VERSION` 숫자를 1 올리기 → 브라우저 저장 데이터 자동 초기화
4. 시뮬레이터/계산기 모두 자동 반영

---

## 주요 기능

### 공통
- 환율 조절 (기본 1,000,000 VND = 55,000원)
- 동/원 동시 표기
- localStorage 자동 저장 (새로고침해도 유지)
- 메모장 저장 (.txt 다운로드)
- 초기화 (확정값 또는 기본값으로 복원)
- 시뮬레이터 ↔ 계산기 네비게이션

### 시뮬레이터 (pricing.html)
- 카테고리 탭: 에코가이드 / 일반마사지 / VIP
- 판매가 슬라이더 + 실시간 마진 계산
- 경쟁사 시장가 범위 바 (내 위치 시각화)
- 마진율 배지 (초록/골드/빨강)
- **판매가 확정**: 현재 판매가를 기준값으로 저장

### 계산기 (pricing-calc.html)
- 전 항목 한 화면 나열
- 원가/마진 직접 입력 → 판매가/마진율 자동 계산
- **원가 확정**: 현재 원가를 기준값으로 저장 (초기화 시 이 값 사용)
- 항목 추가/삭제 (커스텀 항목)
- 합계 행 (총 원가/마진/판매가/평균 마진율)

---

## 데이터 흐름

```
pricing-data.js (원본 데이터)
  ├── pricing-app.js → DATA로 참조 → 시뮬레이터
  └── pricing-calc.js → SECTIONS로 변환 → 계산기

localStorage:
  - danangpick_pricing: 시뮬레이터 판매가 저장
  - danangpick_calc: 계산기 원가/마진 저장
  - danangpick_confirmed_sell: 시뮬레이터 확정 판매가
  - danangpick_confirmed_cost: 계산기 확정 원가
```

---

## 카테고리 (pricing-data.js 기준)

| 카테고리 | 항목 수 | 항목 |
|----------|---------|------|
| 에코가이드 | 5 | 4시간 B1, 4시간 B2, 8시간 B2, 12시간 B2, 24시간 B2 |
| 홈마사지 (일반) | 3 | 60분, 90분, 120분 |
| 홈마사지 (VIP) | 6 | 전립선 60/90분, 봄봄, 마사지+봄봄, 누루, 22시할증 |
