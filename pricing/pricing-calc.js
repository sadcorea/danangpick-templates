/* ===== DanangPick 가격 계산기 ===== */

let RATE = 55000;
const STORAGE_KEY = 'danangpick_calc';
const CONFIRMED_KEY = 'danangpick_confirmed_cost';

// pricing-data.js에서 공통 데이터 참조하여 SECTIONS 생성
const SECTIONS = Object.values(PRICE_DATA).map(cat => ({
  label: cat.label,
  items: cat.items.map(item => ({
    name: item.name,
    cost: item.cost,
    margin: item.sell - item.cost,
  }))
}));

// 실제 편집용 데이터 (deep copy)
let rows = [];

function initRows() {
  rows = [];
  SECTIONS.forEach((sec, si) => {
    sec.items.forEach((item, ii) => {
      rows.push({
        id: si + '_' + ii,
        section: sec.label,
        name: item.name,
        cost: item.cost,
        margin: item.margin,
      });
    });
  });
}

function fmtN(n) { return n.toLocaleString('ko-KR'); }
function fmtKRW(vnd) { return Math.round(vnd / 1000000 * RATE).toLocaleString('ko-KR'); }

function marginRate(cost, margin) {
  const sell = cost + margin;
  if (sell === 0) return 0;
  return (margin / sell * 100);
}

function rateClass(r) {
  if (r >= 50) return 'high';
  if (r >= 20) return 'mid';
  return 'low';
}

// ── 저장/불러오기 ───────────────────────────

function saveCalc() {
  const data = {
    version: PRICE_DATA_VERSION,
    rows: rows.map(r => ({ id: r.id, cost: r.cost, margin: r.margin })),
    customRows: rows.filter(r => r.custom).map(r => ({ id: r.id, name: r.name, section: r.section, cost: r.cost, margin: r.margin, custom: true })),
    rate: RATE
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadCalc() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // 버전이 다르면 저장 데이터 무시 (pricing-data.js가 업데이트된 것)
    if (data.version !== PRICE_DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    if (data.rate) {
      RATE = data.rate;
      const el = document.getElementById('rate-input');
      if (el) el.value = RATE;
    }
    // 기존 항목 원가+마진 복원
    if (data.rows) {
      data.rows.forEach(saved => {
        const row = rows.find(r => r.id === saved.id);
        if (row) {
          row.cost = saved.cost;
          row.margin = saved.margin;
        }
      });
    }
    // 커스텀 항목 복원
    if (data.customRows) {
      data.customRows.forEach(cr => {
        if (!rows.find(r => r.id === cr.id)) {
          rows.push(cr);
        }
      });
    }
    return true;
  } catch(e) { return false; }
}

function resetCalc() {
  localStorage.removeItem(STORAGE_KEY);
  initRows();
  loadConfirmedCost(); // 확정 원가가 있으면 적용
  render();
  showToast('초기화 완료');
}

// ── 원가 확정 ───────────────────────────────

function confirmCost() {
  const costs = {};
  rows.filter(r => !r.custom).forEach(r => { costs[r.id] = r.cost; });
  localStorage.setItem(CONFIRMED_KEY, JSON.stringify(costs));
  showToast('원가 확정 완료');
}

function loadConfirmedCost() {
  try {
    const raw = localStorage.getItem(CONFIRMED_KEY);
    if (!raw) return false;
    const costs = JSON.parse(raw);
    rows.forEach(r => {
      if (costs[r.id] !== undefined) {
        r.cost = costs[r.id];
        r.margin = (r.cost + r.margin) - r.cost; // 판매가 유지하면서 마진 재계산은 불필요 (cost만 교체)
      }
    });
    return true;
  } catch(e) { return false; }
}

function resetConfirmedCost() {
  localStorage.removeItem(CONFIRMED_KEY);
  localStorage.removeItem(STORAGE_KEY);
  initRows();
  render();
  showToast('확정 원가 해제, 기본값 복원');
}

// ── JSON 내보내기/불러오기 ───────────────────

function exportJSON() {
  const data = {
    type: 'danangpick_calc',
    date: new Date().toISOString().slice(0, 10),
    rate: RATE,
    rows: rows.map(r => ({
      name: r.name,
      section: r.section,
      cost: r.cost,
      margin: r.margin,
      sell: r.cost + r.margin,
      custom: r.custom || false,
    }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '가격데이터_' + data.date + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('JSON 내보내기 완료');
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
        if (!data.rows) { showToast('잘못된 파일 형식'); return; }
        if (data.rate) {
          RATE = data.rate;
          const el = document.getElementById('rate-input');
          if (el) el.value = RATE;
        }
        // 기존 항목 매칭
        data.rows.forEach(imported => {
          const row = rows.find(r => r.name === imported.name && r.section === imported.section);
          if (row) {
            row.cost = imported.cost;
            row.margin = imported.margin;
          } else if (imported.custom) {
            rows.push({
              id: 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
              section: imported.section,
              name: imported.name,
              cost: imported.cost,
              margin: imported.margin,
              custom: true,
            });
          }
        });
        render();
        saveCalc();
        showToast('JSON 불러오기 완료');
      } catch(err) {
        showToast('파일 읽기 오류');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

// ── 렌더링 ──────────────────────────────────

function render() {
  const tbody = document.getElementById('calc-body');
  let html = '';
  let currentSection = '';
  let totalCost = 0, totalMargin = 0;

  rows.forEach((row, idx) => {
    const sell = row.cost + row.margin;
    const rate = marginRate(row.cost, row.margin);
    const rc = rateClass(rate);
    totalCost += row.cost;
    totalMargin += row.margin;

    // 섹션 구분 행
    if (row.section !== currentSection) {
      currentSection = row.section;
      html += `<tr class="section-row"><td colspan="6">${currentSection}</td></tr>`;
    }

    html += `
      <tr>
        <td class="cell-name">${row.name}${row.custom ? `<button class="btn-del" onclick="deleteRow(${idx})">x</button>` : ''}</td>
        <td class="cell-input">
          <input type="text" inputmode="numeric"
                 value="${fmtN(row.cost)}"
                 data-idx="${idx}" data-field="cost"
                 onfocus="onFocus(this)" onblur="onBlur(this)">
          <span class="sub-krw">${fmtKRW(row.cost)}원</span>
        </td>
        <td class="cell-input">
          <input type="text" inputmode="numeric"
                 value="${fmtN(row.margin)}"
                 data-idx="${idx}" data-field="margin"
                 onfocus="onFocus(this)" onblur="onBlur(this)">
          <span class="sub-krw">${fmtKRW(row.margin)}원</span>
        </td>
        <td class="cell-auto">
          <span class="val-sell">${fmtN(sell)}동</span>
          <span class="sub-krw">${fmtKRW(sell)}원</span>
        </td>
        <td class="cell-rate">
          <span class="rate-badge ${rc}">${rate.toFixed(1)}%</span>
        </td>
      </tr>
    `;
  });

  // 합계 행
  const totalSell = totalCost + totalMargin;
  const totalRate = totalSell > 0 ? (totalMargin / totalSell * 100) : 0;
  html += `
    <tr class="total-row">
      <td class="cell-name">합계</td>
      <td class="cell-auto"><strong>${fmtN(totalCost)}동</strong><br><span class="sub-krw">${fmtKRW(totalCost)}원</span></td>
      <td class="cell-auto"><strong>${fmtN(totalMargin)}동</strong><br><span class="sub-krw">${fmtKRW(totalMargin)}원</span></td>
      <td class="cell-auto"><strong>${fmtN(totalSell)}동</strong><br><span class="sub-krw">${fmtKRW(totalSell)}원</span></td>
      <td class="cell-rate"><span class="rate-badge ${rateClass(totalRate)}">${totalRate.toFixed(1)}%</span></td>
    </tr>
  `;

  // 항목 추가 버튼
  html += `
    <tr class="add-row">
      <td colspan="5">
        <button class="btn-add" onclick="addRow()">+ 항목 추가</button>
      </td>
    </tr>
  `;

  tbody.innerHTML = html;
}

// ── 항목 추가/삭제 ──────────────────────────

function addRow() {
  const name = prompt('품목 이름을 입력하세요');
  if (!name || !name.trim()) return;
  rows.push({
    id: 'custom_' + Date.now(),
    section: '추가 항목',
    name: name.trim(),
    cost: 0,
    margin: 0,
    custom: true,
  });
  render();
  saveCalc();
  showToast('항목 추가됨');
}

function deleteRow(idx) {
  rows.splice(idx, 1);
  render();
  saveCalc();
  showToast('항목 삭제됨');
}

// ── 입력 처리 ───────────────────────────────

function onFocus(el) {
  // 포커스 시 숫자만 표시
  const idx = parseInt(el.dataset.idx);
  const field = el.dataset.field;
  el.value = rows[idx][field];
  el.select();
}

function onBlur(el) {
  const idx = parseInt(el.dataset.idx);
  const field = el.dataset.field;
  const val = parseInt(el.value.replace(/[^0-9-]/g, '')) || 0;
  rows[idx][field] = val;
  render();
  saveCalc();
}

function onRateChange(el) {
  RATE = parseInt(el.value) || 55000;
  render();
  saveCalc();
}

// ── 메모장 저장 ─────────────────────────────

function exportTxt() {
  const now = new Date();
  const date = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  let txt = '다낭픽 가격표 (' + date + ')\n';
  txt += '환율: 1,000,000 VND = ' + fmtN(RATE) + '원\n';
  txt += '='.repeat(70) + '\n\n';

  let currentSection = '';
  let totalCost = 0, totalMargin = 0;

  rows.forEach(row => {
    if (row.section !== currentSection) {
      currentSection = row.section;
      txt += '[ ' + currentSection + ' ]\n';
      txt += '-'.repeat(70) + '\n';
      txt += padR('품목', 18) + padR('원가', 16) + padR('마진', 16) + padR('판매가', 16) + '마진율\n';
      txt += '-'.repeat(70) + '\n';
    }
    const sell = row.cost + row.margin;
    const rate = marginRate(row.cost, row.margin);
    totalCost += row.cost;
    totalMargin += row.margin;

    txt += padR(row.name, 18);
    txt += padR(fmtN(row.cost) + '동', 16);
    txt += padR(fmtN(row.margin) + '동', 16);
    txt += padR(fmtN(sell) + '동', 16);
    txt += rate.toFixed(1) + '%\n';

    txt += padR('', 18);
    txt += padR('(' + fmtKRW(row.cost) + '원)', 16);
    txt += padR('(' + fmtKRW(row.margin) + '원)', 16);
    txt += padR('(' + fmtKRW(sell) + '원)', 16);
    txt += '\n';
  });

  const totalSell = totalCost + totalMargin;
  const totalRate = totalSell > 0 ? (totalMargin / totalSell * 100) : 0;
  txt += '\n' + '='.repeat(70) + '\n';
  txt += padR('합계', 18);
  txt += padR(fmtN(totalCost) + '동', 16);
  txt += padR(fmtN(totalMargin) + '동', 16);
  txt += padR(fmtN(totalSell) + '동', 16);
  txt += totalRate.toFixed(1) + '%\n';

  // 다운로드
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '다낭픽_가격표_' + date + '.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('메모장 저장 완료');
}

function padR(str, len) {
  // 한글은 2칸 차지 보정
  let w = 0;
  for (const c of str) w += (c.charCodeAt(0) > 127 ? 2 : 1);
  return str + ' '.repeat(Math.max(0, len - w));
}

// ── 초기화 ──────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initRows();
  loadConfirmedCost(); // 확정 원가 먼저 적용
  const loaded = loadCalc(); // 그 위에 작업 데이터 복원
  render();
  if (loaded) showToast('저장된 데이터 불러옴');
});
