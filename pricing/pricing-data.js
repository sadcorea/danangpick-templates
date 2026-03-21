/* ===== DanangPick 공통 가격 데이터 =====
 *
 * 원가/판매가/시장가를 여기서만 관리합니다.
 * pricing-app.js (시뮬레이터)와 pricing-calc.js (계산기) 모두 이 파일을 참조합니다.
 *
 * 수정 방법:
 *   cost     = 원가 (VND)
 *   sell     = 추천 판매가 (VND)
 *   marketMin/marketMax = 경쟁사 시장가 범위 (VND)
 */

// 버전: 원가/판매가 변경 시 이 숫자를 올리면 저장된 데이터가 자동 초기화됩니다
const PRICE_DATA_VERSION = 3;

const PRICE_DATA = {
  eco: {
    label: '에코가이드',
    items: [
      { name: '8시간',  cost: 4000000, sell: 4500000, marketMin: 4000000, marketMax: 6000000 },
      { name: '12시간', cost: 5200000, sell: 5700000, marketMin: 5000000, marketMax: 7000000 },
      { name: '24시간', cost: 6200000, sell: 6700000, marketMin: 6000000, marketMax: 8000000 },
    ]
  },
  massage: {
    label: '홈마사지 (일반)',
    items: [
      { name: '일반 60분',  cost: 350000, sell: 500000, marketMin: 400000, marketMax: 600000 },
      { name: '일반 90분',  cost: 450000, sell: 600000, marketMin: 500000, marketMax: 700000 },
      { name: '일반 120분', cost: 550000, sell: 700000, marketMin: 600000, marketMax: 800000 },
    ]
  },
  vip: {
    label: '홈마사지 (VIP)',
    items: [
      { name: '전립선 마사지',  cost: 950000,  sell: 1200000, marketMin: 1000000, marketMax: 1500000 },
      { name: '봄봄 1회',       cost: 1400000, sell: 1700000, marketMin: 1500000, marketMax: 2500000 },
      { name: '마사지 + 봄봄',  cost: 1700000, sell: 2100000, marketMin: 1800000, marketMax: 3000000 },
      { name: '누루 추가',      cost: 200000,  sell: 300000,  marketMin: 300000,  marketMax: 500000 },
      { name: '23시 이후 할증', cost: 100000,  sell: 200000,  marketMin: 100000,  marketMax: 300000 },
    ]
  }
};
