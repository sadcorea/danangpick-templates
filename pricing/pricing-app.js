/* ===== DanangPick Pricing Simulator ===== */

// 환율 (1,000,000 VND = ? KRW)
let RATE = 55000;

// pricing-data.js에서 공통 데이터 참조
const DATA = PRICE_DATA;

// 슬라이더 범위 계산: 원가 ~ 시장최고가 * 1.3
function getSliderRange(item) {
  const min = item.cost;
  const max = Math.max(item.marketMax * 1.3, item.sell * 1.5);
  const step = getStep(max);
  return { min, max: Math.ceil(max / step) * step, step };
}

function getStep(max) {
  if (max > 10000000) return 500000;
  if (max > 5000000) return 200000;
  if (max > 1000000) return 100000;
  return 50000;
}

// 숫자 포맷
function fmtVND(n) {
  return n.toLocaleString('ko-KR') + '동';
}

function fmtKRW(vnd) {
  const krw = Math.round(vnd / 1000000 * RATE);
  return krw.toLocaleString('ko-KR') + '원';
}

// 마진율 계산
function marginRate(cost, sell) {
  if (sell === 0) return 0;
  return ((sell - cost) / sell * 100);
}

// 마진율 등급
function marginClass(rate) {
  if (rate >= 50) return 'high';
  if (rate >= 20) return 'mid';
  return 'low';
}

// 시장 내 위치 텍스트
function marketPosition(sell, min, max) {
  if (sell < min) return { text: '시장가 이하 (최저가)', cls: 'cheap' };
  const mid = (min + max) / 2;
  if (sell <= mid) return { text: '시장가 하단 (가성비)', cls: 'cheap' };
  if (sell <= max) return { text: '시장가 범위 내 (적정)', cls: 'fair' };
  return { text: '시장가 초과 (고가)', cls: 'expensive' };
}

// 시장바에서 내 위치 퍼센트
function marketPercent(sell, min, max) {
  const rangeStart = min * 0.7;
  const rangeEnd = max * 1.2;
  const pct = (sell - rangeStart) / (rangeEnd - rangeStart) * 100;
  return Math.max(2, Math.min(98, pct));
}

function marketRangePercent(min, max) {
  const rangeStart = min * 0.7;
  const rangeEnd = max * 1.2;
  const left = (min - rangeStart) / (rangeEnd - rangeStart) * 100;
  const right = (max - rangeStart) / (rangeEnd - rangeStart) * 100;
  return { left: Math.max(0, left), width: Math.min(100, right) - Math.max(0, left) };
}

// ── 저장/불러오기 (localStorage) ─────────────

const STORAGE_KEY = 'danangpick_pricing';

function saveToStorage() {
  const data = { version: PRICE_DATA_VERSION, sellValues, rate: RATE };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // 버전이 다르면 저장 데이터 무시
    if (data.version !== PRICE_DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    if (data.sellValues) {
      sellValues = data.sellValues;
    }
    if (data.rate) {
      RATE = data.rate;
      const rateInput = document.getElementById('rate-input');
      if (rateInput) rateInput.value = RATE;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── 렌더링 ──────────────────────────────────

let currentTab = 'eco';
let sellValues = {};

function initSellValues() {
  // 기본값 세팅
  Object.keys(DATA).forEach(cat => {
    DATA[cat].items.forEach((item, i) => {
      const key = cat + '_' + i;
      if (!sellValues[key]) sellValues[key] = item.sell;
    });
  });
}

function renderTabs() {
  const bar = document.getElementById('tab-bar');
  bar.innerHTML = '';
  Object.keys(DATA).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (cat === currentTab ? ' active' : '');
    btn.textContent = DATA[cat].label;
    btn.onclick = () => {
      currentTab = cat;
      renderTabs();
      renderContent();
    };
    bar.appendChild(btn);
  });
}

function renderContent() {
  const wrap = document.getElementById('content');
  const cat = DATA[currentTab];
  let html = '';

  cat.items.forEach((item, i) => {
    const key = currentTab + '_' + i;
    const sell = sellValues[key];
    const margin = sell - item.cost;
    const rate = marginRate(item.cost, sell);
    const mClass = marginClass(rate);
    const pos = marketPosition(sell, item.marketMin, item.marketMax);
    const pct = marketPercent(sell, item.marketMin, item.marketMax);
    const range = marketRangePercent(item.marketMin, item.marketMax);
    const slider = getSliderRange(item);

    html += `
      <div class="price-card">
        <div class="price-card-name">${item.name}</div>

        <div class="price-grid">
          <div class="price-cell cost">
            <div class="price-cell-label">원가</div>
            <div class="price-cell-vnd">${fmtVND(item.cost)}</div>
            <div class="price-cell-krw">${fmtKRW(item.cost)}</div>
          </div>
          <div class="price-cell sell">
            <div class="price-cell-label">판매가</div>
            <div class="price-cell-vnd">${fmtVND(sell)}</div>
            <div class="price-cell-krw">${fmtKRW(sell)}</div>
          </div>
          <div class="price-cell margin ${margin < 0 ? 'negative' : ''}">
            <div class="price-cell-label">마진</div>
            <div class="price-cell-vnd">${margin < 0 ? '-' : ''}${fmtVND(Math.abs(margin))}</div>
            <div class="price-cell-krw">${fmtKRW(Math.abs(margin))}</div>
          </div>
        </div>

        <span class="margin-badge ${mClass}">마진율 ${rate.toFixed(1)}%</span>

        <div class="slider-row">
          <label>판매가 조절</label>
          <input type="range"
                 min="${slider.min}" max="${slider.max}" step="${slider.step}"
                 value="${sell}"
                 data-key="${key}"
                 oninput="onSlideInput(this)"
                 onchange="onSlideChange(this)">
          <span class="slider-val" id="sv_${key}">${fmtVND(sell)}</span>
        </div>

        <div class="market-bar-wrap">
          <div class="market-bar-label">경쟁사 시장가 범위</div>
          <div class="market-bar-track">
            <div class="market-bar-range" style="left:${range.left}%;width:${range.width}%"></div>
            <div class="market-bar-mine" style="left:${pct}%"></div>
          </div>
          <div class="market-bar-labels">
            <span>${fmtVND(item.marketMin)}</span>
            <span>${fmtVND(item.marketMax)}</span>
          </div>
          <div class="market-position ${pos.cls}">${pos.text}</div>
        </div>
      </div>
    `;
  });

  // 요약 카드
  let totalCost = 0, totalSell = 0;
  cat.items.forEach((item, i) => {
    totalCost += item.cost;
    totalSell += sellValues[currentTab + '_' + i];
  });
  const totalMargin = totalSell - totalCost;
  const totalRate = marginRate(totalCost, totalSell);

  html += `
    <div class="summary-card">
      <h3>${cat.label} 요약</h3>
      <div class="summary-row">
        <span class="label">총 원가</span>
        <span class="value">${fmtVND(totalCost)} (${fmtKRW(totalCost)})</span>
      </div>
      <div class="summary-row">
        <span class="label">총 판매가</span>
        <span class="value">${fmtVND(totalSell)} (${fmtKRW(totalSell)})</span>
      </div>
      <div class="summary-row">
        <span class="label">총 마진</span>
        <span class="value positive">${fmtVND(totalMargin)} (${fmtKRW(totalMargin)})</span>
      </div>
      <div class="summary-row">
        <span class="label">평균 마진율</span>
        <span class="value positive">${totalRate.toFixed(1)}%</span>
      </div>
    </div>
  `;

  // 리셋 버튼
  html += `
    <div class="reset-bar">
      <button class="reset-btn" onclick="resetCurrent()">
        ${cat.label} 초기화
      </button>
      <button class="reset-btn reset-all" onclick="resetAll()">
        전체 초기화
      </button>
    </div>
  `;

  wrap.innerHTML = html;
}

function onSlideInput(el) {
  const key = el.dataset.key;
  sellValues[key] = parseInt(el.value);
  // 슬라이더 값만 빠르게 표시 (전체 리렌더 없이)
  document.getElementById('sv_' + key).textContent = fmtVND(sellValues[key]);
}

function onSlideChange(el) {
  const key = el.dataset.key;
  sellValues[key] = parseInt(el.value);
  renderContent();
  saveToStorage();
}

function resetCurrent() {
  DATA[currentTab].items.forEach((item, i) => {
    sellValues[currentTab + '_' + i] = item.sell;
  });
  renderContent();
  saveToStorage();
}

function resetAll() {
  Object.keys(DATA).forEach(cat => {
    DATA[cat].items.forEach((item, i) => {
      sellValues[cat + '_' + i] = item.sell;
    });
  });
  renderContent();
  clearStorage();
}

function onRateChange(el) {
  RATE = parseInt(el.value) || 55000;
  renderContent();
  saveToStorage();
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  const loaded = loadFromStorage();
  initSellValues();
  renderTabs();
  renderContent();
  if (loaded) {
    showSaveNotice('저장된 가격 불러옴');
  }
});

// ── 판매가 확정 ─────────────────────────────

const CONFIRMED_SELL_KEY = 'danangpick_confirmed_sell';

function confirmSell() {
  localStorage.setItem(CONFIRMED_SELL_KEY, JSON.stringify(sellValues));
  showSaveNotice('판매가 확정 완료');
}

// resetAll에서 확정 판매가 반영
(function() {
  const origResetAll = resetAll;
  resetAll = function() {
    const raw = localStorage.getItem(CONFIRMED_SELL_KEY);
    if (raw) {
      try {
        const confirmed = JSON.parse(raw);
        Object.keys(DATA).forEach(cat => {
          DATA[cat].items.forEach((item, i) => {
            const key = cat + '_' + i;
            sellValues[key] = confirmed[key] || item.sell;
          });
        });
        renderContent();
        clearStorage();
        showSaveNotice('확정 판매가로 초기화');
        return;
      } catch(e) {}
    }
    origResetAll();
  };
})();

// ── 메모장 저장 ─────────────────────────────

function exportTxt() {
  const now = new Date();
  const date = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  let txt = '다낭픽 가격표 - 시뮬레이터 (' + date + ')\n';
  txt += '환율: 1,000,000 VND = ' + RATE.toLocaleString('ko-KR') + '원\n';
  txt += '='.repeat(70) + '\n\n';

  Object.keys(DATA).forEach(cat => {
    const section = DATA[cat];
    txt += '[ ' + section.label + ' ]\n';
    txt += '-'.repeat(70) + '\n';

    section.items.forEach((item, i) => {
      const key = cat + '_' + i;
      const sell = sellValues[key];
      const margin = sell - item.cost;
      const rate = sell > 0 ? (margin / sell * 100) : 0;

      txt += item.name + '\n';
      txt += '  원가: ' + item.cost.toLocaleString('ko-KR') + '동 (' + fmtKRW(item.cost) + ')\n';
      txt += '  판매가: ' + sell.toLocaleString('ko-KR') + '동 (' + fmtKRW(sell) + ')\n';
      txt += '  마진: ' + margin.toLocaleString('ko-KR') + '동 (' + fmtKRW(margin) + ')  [' + rate.toFixed(1) + '%]\n\n';
    });
  });

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '다낭픽_시뮬레이터_' + date + '.txt';
  a.click();
  URL.revokeObjectURL(url);
  showSaveNotice('메모장 저장 완료');
}

// ── JSON 내보내기/불러오기 ───────────────────

function exportJSON() {
  const date = new Date().toISOString().slice(0, 10);
  const data = {
    type: 'danangpick_sim',
    date,
    rate: RATE,
    items: []
  };
  Object.keys(DATA).forEach(cat => {
    DATA[cat].items.forEach((item, i) => {
      const key = cat + '_' + i;
      data.items.push({
        name: item.name,
        section: DATA[cat].label,
        cost: item.cost,
        sell: sellValues[key],
        margin: sellValues[key] - item.cost,
      });
    });
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '가격데이터_시뮬_' + date + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showSaveNotice('JSON 내보내기 완료');
}

function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.items && !data.rows) { showSaveNotice('잘못된 파일 형식'); return; }
        if (data.rate) {
          RATE = data.rate;
          const el = document.getElementById('rate-input');
          if (el) el.value = RATE;
        }
        const list = data.items || data.rows;
        list.forEach(imported => {
          // 이름으로 매칭
          Object.keys(DATA).forEach(cat => {
            DATA[cat].items.forEach((item, i) => {
              if (item.name === imported.name) {
                const key = cat + '_' + i;
                sellValues[key] = imported.sell || (imported.cost + imported.margin);
              }
            });
          });
        });
        renderContent();
        saveToStorage();
        showSaveNotice('JSON 불러오기 완료');
      } catch(err) {
        showSaveNotice('파일 읽기 오류');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function showSaveNotice(msg) {
  let el = document.getElementById('save-notice');
  if (!el) {
    el = document.createElement('div');
    el.id = 'save-notice';
    el.className = 'save-notice';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}
