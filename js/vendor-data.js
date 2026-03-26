/* ===== 다낭픽 업체 + 메뉴 통합 데이터 =====
 *
 * 구글시트 「가맹점」 헤더 20개 항목 + 메뉴(원가/판매가) 통합 관리
 * 업체관리.html 에서 사용
 *
 * 수정 방법:
 *   - 업체 추가/수정은 업체관리 앱에서 직접 가능
 *   - 이 파일은 초기 시드 데이터 + localStorage 병합용
 */

const VENDOR_DATA_VERSION = 2;

// 카테고리 목록 (드롭다운용)
const VENDOR_CATEGORIES = [
  '휴식·케어', '유흥·나이트', '다이닝', '골프', '풀빌라', '에코', '가라오케', '마사지', '숙박·레저'
];

// 초기 시드 데이터 — 구글시트 14개 업체 + 기존 메뉴 가격 통합
const VENDOR_SEED = {
  "GM001": {
    name: "맥심스파",
    category: "휴식·케어",
    contact: { kakao: "https://open.kakao.com/o/s0tgA4Ah", phone: "0375 048 199" },
    hours: "11:00-24:00",
    address: "Lô 54 Trần Bạch Đằng, Bắc Mỹ Phú, Ngũ Hành Sơn, Đà Nẵng",
    priceRange: "800000~1000000",
    commission: 15,
    settlement: { bank: "신한은행", account: "110-123-456789", holder: "홍길동" },
    grab: { available: true, cost: "" },
    capacity: 12,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-01-24",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/qidVJkgfRF8KGmPZ6",
    menus: []
  },

  "GM002": {
    name: "에스코비치 바",
    category: "유흥·나이트",
    contact: { kakao: "", phone: "0236 3955 668" },
    hours: "08:00~24:00",
    address: "Lot 12-13 Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/inTPdA1C9xfTi9Dv6",
    menus: []
  },

  "GM003": {
    name: "므엉탄 스카이라운지",
    category: "유흥·나이트",
    contact: { kakao: "", phone: "" },
    hours: "",
    address: "270 Vo Nguyen Giap, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/aBemaktzSxxosgZ57",
    menus: []
  },

  "GM004": {
    name: "판도라 라운지",
    category: "유흥·나이트",
    contact: { kakao: "", phone: "0967 264 947" },
    hours: "19:00~03:00",
    address: "7 Hà Bổng, Phước Mỹ, Sơn Trà, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "접대 직원: 대학생 및 직장인 일반인 / 카톡: thutkao234",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/BBfp5Q2yq5qMXVQx7",
    menus: [
      // 양주
      { name: "로얄살루트 21년", cost: 0, sell: 11000000, group: "양주" },
      { name: "Ballantine 21", cost: 0, sell: 7500000, group: "양주" },
      { name: "Balvenie 12", cost: 0, sell: 6000000, group: "양주" },
      { name: "Ballantine 17", cost: 0, sell: 5500000, group: "양주" },
      { name: "Glenfiddich 12", cost: 0, sell: 3800000, group: "양주" },
      { name: "골든 블루 12", cost: 0, sell: 3400000, group: "양주" },
      { name: "Ballantine 12", cost: 0, sell: 3200000, group: "양주" },
      { name: "잭다니엘", cost: 0, sell: 3200000, group: "양주" },
      { name: "조니워커 블랙", cost: 0, sell: 3200000, group: "양주" },
      { name: "데킬라 호세 쿠에르보", cost: 0, sell: 2500000, group: "양주" },
      { name: "예거마이스터", cost: 0, sell: 2400000, group: "양주" },
      // 와인
      { name: "와인 1865 카베르네 소비뇽", cost: 0, sell: 4900000, group: "와인" },
      { name: "빈 555 쉬라즈", cost: 0, sell: 3900000, group: "와인" },
      // 맥주
      { name: "호가든", cost: 0, sell: 200000, group: "맥주" },
      { name: "버드와이저", cost: 0, sell: 180000, group: "맥주" },
      { name: "블랑1664", cost: 0, sell: 180000, group: "맥주" },
      { name: "삿포로", cost: 0, sell: 160000, group: "맥주" },
      { name: "하이네켄", cost: 0, sell: 160000, group: "맥주" },
      { name: "실버타이거", cost: 0, sell: 150000, group: "맥주" },
      { name: "타이거", cost: 0, sell: 150000, group: "맥주" },
      { name: "라루", cost: 0, sell: 120000, group: "맥주" },
      // 소주
      { name: "화요 25도(500ml)", cost: 0, sell: 1300000, group: "소주" },
      { name: "화요 17도(375ml)", cost: 0, sell: 800000, group: "소주" },
      { name: "참이슬/진로", cost: 0, sell: 400000, group: "소주" },
      { name: "좋은데이 청춘", cost: 0, sell: 350000, group: "소주" },
      // 기타
      { name: "아가씨 팁 1시간", cost: 0, sell: 250000, group: "기타" },
    ]
  },

  "GM005": {
    name: "로마 바 라운지",
    category: "유흥·나이트",
    contact: { kakao: "@romadanang", phone: "0886 453 216" },
    hours: "",
    address: "21 Nguyễn Cao Luyện, Đà Nẵng",
    priceRange: "",
    commission: 20,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "룸비 첫 2시간 무료 / 이후 1시간 200K",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/b7RZv2t5cyCSrnSk9",
    menus: [
      // 콤보세트
      { name: "위스키 콤보", cost: 0, sell: 4300000, group: "콤보세트" },
      { name: "소주 콤보", cost: 0, sell: 2900000, group: "콤보세트" },
      { name: "맥주 콤보", cost: 0, sell: 2500000, group: "콤보세트" },
      { name: "맥주타워 콤보", cost: 0, sell: 2500000, group: "콤보세트" },
      // 레이디
      { name: "레이디 위스키", cost: 0, sell: 300000, group: "레이디" },
      { name: "레이디 드링크", cost: 0, sell: 200000, group: "레이디" },
      // 기타
      { name: "아가씨 TC", cost: 0, sell: 300000, group: "기타" },
    ]
  },

  "GM006": {
    name: "보스 라운지 바",
    category: "유흥·나이트",
    contact: { kakao: "", phone: "" },
    hours: "",
    address: "174 Phạm Văn Đồng, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "메뉴/요금 정보 추가 예정",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/gBYhafsKyHHFUfL18",
    menus: []
  },

  "GM007": {
    name: "랑짜이 (Làng Chài)",
    category: "다이닝",
    contact: { kakao: "https://pf.kakao.com/_zKKxaG", phone: "0905 785 672" },
    hours: "11:00~01:00",
    address: "10 Võ Văn Kiệt, Phước Mỹ, Sơn Trà, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/wZGSo5qkRed6Xxau6",
    menus: []
  },

  "GM008": {
    name: "목식당 (MỘC Seafood)",
    category: "다이닝",
    contact: { kakao: "", phone: "0905 665 058" },
    hours: "10:30~22:30",
    address: "26 Tô Hiến Thành, Phước Mỹ, Sơn Trà, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/9Vj5LSjGjsaodaUJ8",
    menus: []
  },

  "GM009": {
    name: "풍투이 스파",
    category: "휴식·케어",
    contact: { kakao: "@pungtuispa", phone: "" },
    hours: "",
    address: "Lô 17+18-H2 Phạm Văn Đồng, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/u8x3gJaB63TWiH698",
    menus: []
  },

  "GM010": {
    name: "뉴라이프 스파",
    category: "휴식·케어",
    contact: { kakao: "@newlifedanang", phone: "032 985 2482" },
    hours: "",
    address: "127 Nguyễn Xuân Khoát, An Hải, Sơn Trà, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/ZGpZ7AntaezBWmWA8",
    menus: []
  },

  "GM011": {
    name: "허벌스파",
    category: "휴식·케어",
    contact: { kakao: "https://pf.kakao.com/_fPYsxj/chat", phone: "0901 825 789" },
    hours: "09:00~22:00",
    address: "201 Dương Đình Nghệ, An Hải Bắc, Sơn Trà, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/LftHT3kQF6JZfY6i8",
    menus: []
  },

  "GM012": {
    name: "호핑투어",
    category: "숙박·레저",
    contact: { kakao: "@cap3jjang", phone: "0932 447 617" },
    hours: "",
    address: "Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "",
    menus: []
  },

  "GM013": {
    name: "옥린 스파 (Ngọc Linh Spa)",
    category: "휴식·케어",
    contact: { kakao: "", phone: "0935 148 690" },
    hours: "",
    address: "04 Phan Tôn, Đà Nẵng",
    priceRange: "",
    commission: 10,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-02-22",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/Nc8DpmjM9D5JH9da7",
    menus: []
  },

  "GM014": {
    name: "때밀이POOLSPA",
    category: "마사지",
    contact: { kakao: "@DNPOOLSPA121", phone: "094 836 6121" },
    hours: "09:00~24:00",
    address: "121 Duong Dinh Nghe, An Hai Bac, Son Tra, Da Nang",
    priceRange: "90분 800,000 VND",
    commission: 20,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 6,
    bookingHours: "",
    notes: "완전 건전 - 마사지 30분 + 때밀이 + 스킨케어 + 개인 욕조",
    registeredAt: "2026-03-21",
    status: "운영중",
    mapLink: "https://maps.app.goo.gl/dPuRX3UpvUku23w58",
    menus: [
      { name: "90분 코스 (마사지+때밀이+스킨케어+욕조)", cost: 0, sell: 800000, group: "코스" },
    ]
  },

  "GM015": {
    name: "에코걸",
    category: "에코",
    contact: { kakao: "", phone: "" },
    hours: "24시간",
    address: "다낭 전역 출장",
    priceRange: "4,500,000~6,700,000 VND",
    commission: 0,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "",
    registeredAt: "2026-03-26",
    status: "운영중",
    mapLink: "",
    menus: [
      { name: "8시간", cost: 4000000, sell: 4500000, group: "에코가이드" },
      { name: "12시간", cost: 5200000, sell: 5700000, group: "에코가이드" },
      { name: "24시간", cost: 6200000, sell: 6700000, group: "에코가이드" },
    ]
  },

  "GM016": {
    name: "홈마사지",
    category: "마사지",
    contact: { kakao: "", phone: "" },
    hours: "24시간",
    address: "다낭 전역 출장 (호텔·빌라·에어비앤비)",
    priceRange: "500,000~2,100,000 VND",
    commission: 0,
    settlement: { bank: "", account: "", holder: "" },
    grab: { available: false, cost: "" },
    capacity: 0,
    bookingHours: "",
    notes: "23시 이후 할증 200,000 VND",
    registeredAt: "2026-03-26",
    status: "운영중",
    mapLink: "",
    menus: [
      // 일반 마사지
      { name: "일반 60분", cost: 350000, sell: 500000, group: "일반 마사지" },
      { name: "일반 90분", cost: 450000, sell: 600000, group: "일반 마사지" },
      { name: "일반 120분", cost: 550000, sell: 700000, group: "일반 마사지" },
      // VIP 마사지
      { name: "전립선 마사지", cost: 950000, sell: 1200000, group: "VIP 마사지" },
      { name: "봄봄 1회", cost: 1400000, sell: 1700000, group: "VIP 마사지" },
      { name: "마사지 + 봄봄", cost: 1700000, sell: 2100000, group: "VIP 마사지" },
      { name: "누루 추가", cost: 200000, sell: 300000, group: "VIP 마사지" },
      { name: "23시 이후 할증", cost: 100000, sell: 200000, group: "추가요금" },
    ]
  }
};

// ── 구글시트 API 설정 ──
var SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzy02Be1A9uRk0aropMyBoUPA4z5z_rQlcOy4xnhgCu_-k-3p1BlY7OvOl8u1_DMnqt/exec';

// ── 데이터 관리 함수 ──

// 동기 로드 (localStorage 또는 시드 데이터 — 즉시 반환)
function loadVendors() {
  var saved = localStorage.getItem('danangpick_vendors');
  if (saved) {
    return JSON.parse(saved);
  }
  // 캐시 없으면 시드 데이터 사용
  localStorage.setItem('danangpick_vendors', JSON.stringify(VENDOR_SEED));
  return JSON.parse(JSON.stringify(VENDOR_SEED));
}

// 비동기 로드 (구글시트 API에서 최신 데이터 가져오기)
function loadVendorsFromSheet(callback) {
  fetch(SHEET_API_URL)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      // API 데이터를 localStorage에 캐시
      localStorage.setItem('danangpick_vendors', JSON.stringify(data));
      localStorage.setItem('danangpick_vendors_lastSync', new Date().toISOString());
      callback(null, data);
    })
    .catch(function(err) {
      console.warn('시트 API 로드 실패, 로컬 데이터 사용:', err);
      callback(err, null);
    });
}

function saveVendors(vendors) {
  localStorage.setItem('danangpick_vendors', JSON.stringify(vendors));
  localStorage.setItem('danangpick_vendors_version', String(VENDOR_DATA_VERSION));
}

function getNextVendorId(vendors) {
  var maxNum = 0;
  Object.keys(vendors).forEach(function(id) {
    var num = parseInt(id.replace('GM', ''), 10);
    if (num > maxNum) maxNum = num;
  });
  var next = maxNum + 1;
  return 'GM' + String(next).padStart(3, '0');
}

function exportVendorsJSON(vendors) {
  var json = JSON.stringify(vendors, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'danangpick-vendors-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importVendorsJSON(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      callback(null, data);
    } catch (err) {
      callback('JSON 파싱 오류: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// VND 포맷 (1,200,000 → "1,200K" 또는 "1,200,000")
function formatVND(amount, useK) {
  if (!amount || amount === 0) return '-';
  if (useK !== false && amount >= 1000) {
    return (amount / 1000).toLocaleString() + 'K';
  }
  return amount.toLocaleString() + ' VND';
}
