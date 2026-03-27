// =====================================================
// 다낭픽 업체관리 — App Logic
// =====================================================

(function () {
  'use strict';

  var vendors = loadVendors();
  var editingId = null; // 편집 모드 시 업체 ID

  // ── 초기화 ──
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initRegisterForm();
    initListPanel();
    initQuotePanel();
    initBookingTransfer();

    // 구글시트에서 최신 데이터 가져오기
    loadVendorsFromSheet(function (err, data) {
      if (!err && data) {
        vendors = data;
        showToast('✅ 시트 동기화 완료');
        // 현재 보고 있는 탭 갱신
        var activeTab = document.querySelector('.vendor-tabs .tab-btn.active');
        if (activeTab) {
          var tabId = activeTab.getAttribute('data-tab');
          if (tabId === 'list') renderVendorList();
          if (tabId === 'quote') refreshQuoteVendorSelect();
        }
        // 등록 폼 ID 갱신
        document.getElementById('f-id').value = getNextVendorId(vendors);
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭 전환
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initTabs() {
    var tabs = document.querySelectorAll('.vendor-tabs .tab-btn');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');

        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        document.getElementById('panel-' + tabId).classList.add('active');

        // 탭 전환 시 데이터 갱신
        if (tabId === 'list') renderVendorList();
        if (tabId === 'quote') refreshQuoteVendorSelect();
      });
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭1: 업체 등록
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initRegisterForm() {
    // 카테고리 드롭다운
    var catSelect = document.getElementById('f-category');
    VENDOR_CATEGORIES.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });

    // 자동 ID
    document.getElementById('f-id').value = getNextVendorId(vendors);

    // 그랩 토글
    var grabToggle = document.getElementById('f-grab');
    grabToggle.addEventListener('click', function () {
      this.classList.toggle('on');
      this.nextElementSibling.textContent = this.classList.contains('on') ? '예' : '아니오';
    });

    // 메뉴 추가 버튼
    document.getElementById('add-menu-btn').addEventListener('click', function () {
      addMenuRow();
    });

    // 폼 제출
    document.getElementById('vendor-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveVendorFromForm();
    });

    // JSON 내보내기
    document.getElementById('export-btn').addEventListener('click', function () {
      exportVendorsJSON(vendors);
    });

    // JSON 불러오기
    document.getElementById('import-file').addEventListener('change', function (e) {
      if (e.target.files.length === 0) return;
      importVendorsJSON(e.target.files[0], function (err, data) {
        if (err) { showToast('❌ ' + err); return; }
        vendors = data;
        saveVendors(vendors);
        showToast('✅ 데이터 불러오기 완료');
        resetForm();
      });
      e.target.value = '';
    });

    // 폼 초기화
    document.getElementById('reset-form-btn').addEventListener('click', function () {
      editingId = null;
      resetForm();
      showToast('폼 초기화됨');
    });
  }

  function addMenuRow(data) {
    var container = document.getElementById('menu-rows');
    var row = document.createElement('div');
    row.className = 'menu-row';
    row.innerHTML =
      '<input type="text" class="form-input menu-name" placeholder="메뉴명" value="' + (data ? escHtml(data.name) : '') + '">' +
      '<input type="number" class="form-input menu-cost" placeholder="원가" value="' + (data ? (data.cost || '') : '') + '">' +
      '<input type="number" class="form-input menu-sell" placeholder="판매가" value="' + (data ? (data.sell || '') : '') + '">' +
      '<input type="text" class="form-input menu-group" placeholder="그룹" value="' + (data ? escHtml(data.group || '') : '') + '">' +
      '<button type="button" class="menu-del">✕</button>';

    row.querySelector('.menu-del').addEventListener('click', function () {
      row.remove();
    });
    container.appendChild(row);
  }

  function collectFormData() {
    return {
      name: val('f-name'),
      category: val('f-category'),
      contact: {
        kakao: val('f-kakao'),
        phone: val('f-phone')
      },
      hours: val('f-hours'),
      address: val('f-address'),
      priceRange: val('f-price-range'),
      commission: parseInt(val('f-commission')) || 0,
      settlement: {
        bank: val('f-bank'),
        account: val('f-account'),
        holder: val('f-holder')
      },
      grab: {
        available: document.getElementById('f-grab').classList.contains('on'),
        cost: val('f-grab-cost')
      },
      capacity: parseInt(val('f-capacity')) || 0,
      bookingHours: val('f-booking-hours'),
      notes: val('f-notes'),
      registeredAt: new Date().toISOString().slice(0, 10),
      status: val('f-status'),
      mapLink: val('f-map'),
      menus: collectMenus()
    };
  }

  function collectMenus() {
    var rows = document.querySelectorAll('#menu-rows .menu-row');
    var menus = [];
    rows.forEach(function (row) {
      var name = row.querySelector('.menu-name').value.trim();
      if (!name) return;
      menus.push({
        name: name,
        cost: parseInt(row.querySelector('.menu-cost').value) || 0,
        sell: parseInt(row.querySelector('.menu-sell').value) || 0,
        group: row.querySelector('.menu-group').value.trim()
      });
    });
    return menus;
  }

  function saveVendorFromForm() {
    var data = collectFormData();
    if (!data.name) { showToast('❌ 업체명을 입력하세요'); return; }
    if (!data.category) { showToast('❌ 카테고리를 선택하세요'); return; }

    var id;
    if (editingId) {
      id = editingId;
      data.registeredAt = vendors[id].registeredAt; // 등록일 유지
    } else {
      id = document.getElementById('f-id').value;
    }

    vendors[id] = data;
    saveVendors(vendors);
    showToast('✅ ' + data.name + ' 저장 완료!');
    editingId = null;
    resetForm();
  }

  function resetForm() {
    document.getElementById('vendor-form').reset();
    document.getElementById('menu-rows').innerHTML = '';
    document.getElementById('f-id').value = getNextVendorId(vendors);
    document.getElementById('f-grab').classList.remove('on');
    document.getElementById('f-grab').nextElementSibling.textContent = '아니오';
    document.getElementById('submit-btn').textContent = '업체 저장';
    editingId = null;
  }

  function fillFormForEdit(id) {
    var v = vendors[id];
    if (!v) return;

    editingId = id;
    document.getElementById('f-id').value = id;
    document.getElementById('f-name').value = v.name || '';
    document.getElementById('f-category').value = v.category || '';
    document.getElementById('f-kakao').value = (v.contact && v.contact.kakao) || '';
    document.getElementById('f-phone').value = (v.contact && v.contact.phone) || '';
    document.getElementById('f-hours').value = v.hours || '';
    document.getElementById('f-booking-hours').value = v.bookingHours || '';
    document.getElementById('f-address').value = v.address || '';
    document.getElementById('f-map').value = v.mapLink || '';
    document.getElementById('f-price-range').value = v.priceRange || '';
    document.getElementById('f-commission').value = v.commission || '';
    document.getElementById('f-capacity').value = v.capacity || '';
    document.getElementById('f-bank').value = (v.settlement && v.settlement.bank) || '';
    document.getElementById('f-account').value = (v.settlement && v.settlement.account) || '';
    document.getElementById('f-holder').value = (v.settlement && v.settlement.holder) || '';
    document.getElementById('f-grab-cost').value = (v.grab && v.grab.cost) || '';
    document.getElementById('f-status').value = v.status || '운영중';
    document.getElementById('f-notes').value = v.notes || '';

    // 그랩 토글
    var grabEl = document.getElementById('f-grab');
    if (v.grab && v.grab.available) {
      grabEl.classList.add('on');
      grabEl.nextElementSibling.textContent = '예';
    } else {
      grabEl.classList.remove('on');
      grabEl.nextElementSibling.textContent = '아니오';
    }

    // 메뉴
    document.getElementById('menu-rows').innerHTML = '';
    if (v.menus && v.menus.length > 0) {
      v.menus.forEach(function (m) { addMenuRow(m); });
    }

    document.getElementById('submit-btn').textContent = '업체 수정 저장';

    // 탭 전환
    document.querySelectorAll('.vendor-tabs .tab-btn').forEach(function (t) { t.classList.remove('active'); });
    document.querySelector('[data-tab="register"]').classList.add('active');
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('panel-register').classList.add('active');

    window.scrollTo(0, 0);
    showToast('📝 ' + v.name + ' 편집 모드');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭2: 업체 목록
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var currentFilter = '전체';
  var searchQuery = '';

  function initListPanel() {
    // 검색
    document.getElementById('vendor-search').addEventListener('input', function () {
      searchQuery = this.value.trim().toLowerCase();
      renderVendorList();
    });
  }

  function renderVendorList() {
    // 필터 바
    var filterBar = document.getElementById('filter-bar');
    var categories = ['전체'];
    Object.keys(vendors).forEach(function (id) {
      var cat = vendors[id].category;
      if (cat && categories.indexOf(cat) === -1) categories.push(cat);
    });
    filterBar.innerHTML = '';
    categories.forEach(function (cat) {
      var chip = document.createElement('button');
      chip.className = 'filter-chip' + (cat === currentFilter ? ' active' : '');
      chip.textContent = cat;
      chip.addEventListener('click', function () {
        currentFilter = cat;
        renderVendorList();
      });
      filterBar.appendChild(chip);
    });

    // 필터링
    var ids = Object.keys(vendors).filter(function (id) {
      var v = vendors[id];
      if (!v.name) return false;
      if (currentFilter !== '전체' && v.category !== currentFilter) return false;
      if (searchQuery && v.name.toLowerCase().indexOf(searchQuery) === -1) return false;
      return true;
    });

    // 카운트
    document.getElementById('vendor-count').innerHTML =
      '<strong>' + ids.length + '</strong>개 업체';

    // 카드 렌더링
    var list = document.getElementById('vendor-list');
    list.innerHTML = '';

    ids.forEach(function (id) {
      var v = vendors[id];
      var card = document.createElement('div');
      card.className = 'vendor-card';
      card.innerHTML = buildVendorCard(id, v);

      // 헤더 클릭 → 펼치기/접기
      card.querySelector('.vendor-card-header').addEventListener('click', function () {
        card.classList.toggle('open');
      });

      // 전체 메뉴 복사
      var copyAllBtn = card.querySelector('.copy-all-menu');
      if (copyAllBtn) {
        copyAllBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var text = buildMenuText(v);
          copyToClipboard(text, this);
        });
      }

      // 고객용 복사 (판매가만)
      var copyCustomerBtn = card.querySelector('.copy-customer-menu');
      if (copyCustomerBtn) {
        copyCustomerBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var text = buildCustomerMenuText(v);
          copyToClipboard(text, this);
        });
      }

      // 편집
      var editBtn = card.querySelector('.btn-edit');
      if (editBtn) {
        editBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          fillFormForEdit(id);
        });
      }

      // 삭제
      var delBtn = card.querySelector('.btn-delete');
      if (delBtn) {
        delBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (confirm(v.name + '을(를) 삭제하시겠습니까?')) {
            delete vendors[id];
            saveVendors(vendors);
            renderVendorList();
            showToast('🗑️ ' + v.name + ' 삭제됨');
          }
        });
      }

      // 내부 정보 토글
      var intToggle = card.querySelector('.internal-toggle');
      if (intToggle) {
        intToggle.addEventListener('click', function (e) {
          e.stopPropagation();
          var sec = card.querySelector('.internal-section');
          sec.classList.toggle('open');
          this.textContent = sec.classList.contains('open') ? '▲ 내부 정보 접기' : '▼ 내부 정보 보기';
        });
      }

      // 개별 메뉴 복사
      card.querySelectorAll('.copy-single-menu').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          copyToClipboard(this.getAttribute('data-text'), this);
        });
      });

      list.appendChild(card);
    });
  }

  function buildVendorCard(id, v) {
    var html = '';
    // 헤더
    html += '<div class="vendor-card-header">';
    html += '<div><span class="vendor-card-name">' + escHtml(v.name) + '</span>';
    html += '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + escHtml(id) + '</div></div>';
    html += '<span class="vendor-card-category">' + escHtml(v.category || '') + '</span>';
    html += '</div>';

    // 바디
    html += '<div class="vendor-card-body">';

    // 기본 정보
    if (v.contact && (v.contact.phone || v.contact.kakao)) {
      html += infoRow('연락처', (v.contact.phone || '') + (v.contact.kakao ? ' / ' + v.contact.kakao : ''));
    }
    if (v.hours) html += infoRow('영업시간', v.hours);
    if (v.address) html += infoRow('주소', v.address);
    if (v.mapLink) html += infoRow('지도', '<a href="' + escHtml(v.mapLink) + '" target="_blank" style="color:var(--gold);font-size:12px;">구글맵 열기</a>');
    if (v.priceRange) html += infoRow('가격대', v.priceRange);
    if (v.capacity) html += infoRow('수용인원', v.capacity + '명');
    if (v.notes) html += infoRow('특이사항', v.notes);
    if (v.status === '중지') html += infoRow('상태', '<span style="color:#ff5050;">중지</span>');

    // 메뉴
    if (v.menus && v.menus.length > 0) {
      html += '<div style="margin-top:12px;">';
      html += buildMenuTable(v);
      html += '<div class="copy-all-wrap">';
      html += '<button class="copy-menu-btn copy-customer-menu">📋 고객용 복사</button>';
      html += '<button class="copy-menu-btn copy-all-menu">📋 전체 복사 (원가 포함)</button>';
      html += '</div>';
      html += '</div>';
    }

    // 내부 정보 (접기)
    html += '<div class="internal-toggle">▼ 내부 정보 보기</div>';
    html += '<div class="internal-section">';
    html += infoRow('소개비율', (v.commission || 0) + '%');
    if (v.settlement && v.settlement.bank) {
      html += infoRow('정산계좌', v.settlement.bank + ' ' + v.settlement.account + ' (' + v.settlement.holder + ')');
    }
    html += infoRow('그랩', (v.grab && v.grab.available ? '예' : '아니오') + (v.grab && v.grab.cost ? ' / ' + v.grab.cost : ''));
    html += infoRow('등록일', v.registeredAt || '');
    html += '</div>';

    // 편집/삭제
    html += '<div class="vendor-actions">';
    html += '<button class="btn-edit">✏️ 편집</button>';
    html += '<button class="btn-delete">🗑️ 삭제</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function buildMenuTable(v) {
    var html = '<table class="vendor-menu-table">';
    html += '<tr><th>메뉴</th><th>판매가</th><th></th></tr>';

    var currentGroup = '';
    v.menus.forEach(function (m) {
      if (m.group && m.group !== currentGroup) {
        currentGroup = m.group;
        html += '<tr><td colspan="3" class="vendor-menu-group">── ' + escHtml(currentGroup) + '</td></tr>';
      }
      var priceText = formatVND(m.sell);
      var copyText = m.name + ' ' + priceText;
      html += '<tr>';
      html += '<td>' + escHtml(m.name) + '</td>';
      html += '<td style="color:var(--gold-light);font-weight:500;">' + priceText + '</td>';
      html += '<td style="width:50px;text-align:right;"><button class="copy-single-menu copy-menu-btn" data-text="' + escHtml(copyText) + '" style="padding:4px 8px;font-size:10px;">복사</button></td>';
      html += '</tr>';
    });
    html += '</table>';
    return html;
  }

  function buildMenuText(v) {
    var lines = ['📋 ' + v.name + ' 메뉴 (전체)', ''];
    var currentGroup = '';
    v.menus.forEach(function (m) {
      if (m.group && m.group !== currentGroup) {
        currentGroup = m.group;
        if (lines.length > 2) lines.push('');
        lines.push('【 ' + currentGroup + ' 】');
      }
      var costStr = m.cost ? ' (원가: ' + formatVND(m.cost) + ')' : '';
      lines.push('• ' + m.name + ': ' + formatVND(m.sell) + costStr);
    });
    return lines.join('\n');
  }

  function buildCustomerMenuText(v) {
    var lines = ['📋 ' + v.name, ''];
    var currentGroup = '';
    v.menus.forEach(function (m) {
      if (m.group && m.group !== currentGroup) {
        currentGroup = m.group;
        if (lines.length > 2) lines.push('');
        lines.push('【 ' + currentGroup + ' 】');
      }
      lines.push('• ' + m.name + ': ' + formatVND(m.sell));
    });
    if (v.address) {
      lines.push('');
      lines.push('📍 ' + v.address);
    }
    return lines.join('\n');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭3: 견적 생성기
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initQuotePanel() {
    document.getElementById('q-vendor').addEventListener('change', function () {
      renderQuoteMenus(this.value);
    });

    document.getElementById('q-copy-btn').addEventListener('click', function () {
      var text = document.getElementById('q-preview').textContent;
      copyToClipboard(text, this);
    });
  }

  function refreshQuoteVendorSelect() {
    var select = document.getElementById('q-vendor');
    var currentVal = select.value;
    select.innerHTML = '<option value="">업체를 선택하세요</option>';

    // 메뉴가 있는 업체만 표시
    Object.keys(vendors).forEach(function (id) {
      var v = vendors[id];
      if (!v.menus || v.menus.length === 0) return;
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = v.name + ' (' + v.category + ')';
      select.appendChild(opt);
    });

    if (currentVal && vendors[currentVal]) {
      select.value = currentVal;
    }
  }

  function renderQuoteMenus(vendorId) {
    var container = document.getElementById('q-menu-list');
    var totalEl = document.getElementById('q-total');
    var previewEl = document.getElementById('q-preview');
    var copyBtn = document.getElementById('q-copy-btn');

    container.innerHTML = '';
    totalEl.style.display = 'none';
    previewEl.style.display = 'none';
    copyBtn.style.display = 'none';

    if (!vendorId || !vendors[vendorId]) return;

    var v = vendors[vendorId];
    var currentGroup = '';

    v.menus.forEach(function (m, idx) {
      if (m.group && m.group !== currentGroup) {
        currentGroup = m.group;
        var groupDiv = document.createElement('div');
        groupDiv.className = 'vendor-menu-group';
        groupDiv.textContent = '── ' + currentGroup;
        groupDiv.style.padding = '10px 0 4px';
        container.appendChild(groupDiv);
      }

      var item = document.createElement('div');
      item.className = 'menu-check-item';
      item.innerHTML =
        '<input type="checkbox" data-idx="' + idx + '" data-price="' + (m.sell || 0) + '">' +
        '<span class="menu-check-name">' + escHtml(m.name) + '</span>' +
        '<span class="menu-check-price">' + formatVND(m.sell) + '</span>' +
        '<input type="number" class="menu-check-qty" value="1" min="1" max="99">';

      item.querySelector('input[type="checkbox"]').addEventListener('change', function () { updateQuote(vendorId); });
      item.querySelector('.menu-check-qty').addEventListener('input', function () { updateQuote(vendorId); });

      container.appendChild(item);
    });
  }

  function updateQuote(vendorId) {
    var v = vendors[vendorId];
    var items = document.querySelectorAll('#q-menu-list .menu-check-item');
    var selected = [];
    var total = 0;

    items.forEach(function (item) {
      var cb = item.querySelector('input[type="checkbox"]');
      if (!cb.checked) return;
      var idx = parseInt(cb.getAttribute('data-idx'));
      var qty = parseInt(item.querySelector('.menu-check-qty').value) || 1;
      var price = parseInt(cb.getAttribute('data-price')) || 0;
      var m = v.menus[idx];
      selected.push({ name: m.name, sell: price, qty: qty, subtotal: price * qty });
      total += price * qty;
    });

    var totalEl = document.getElementById('q-total');
    var previewEl = document.getElementById('q-preview');
    var copyBtn = document.getElementById('q-copy-btn');
    var bookingBtn = document.getElementById('q-booking-btn');

    if (selected.length === 0) {
      totalEl.style.display = 'none';
      previewEl.style.display = 'none';
      copyBtn.style.display = 'none';
      if (bookingBtn) bookingBtn.style.display = 'none';
      return;
    }

    // 합계
    totalEl.style.display = 'block';
    document.getElementById('q-total-amount').textContent = formatVND(total);

    // 미리보기
    var lines = ['📋 다낭픽 견적서', '', '🏢 ' + v.name, ''];
    selected.forEach(function (s) {
      var qtyStr = s.qty > 1 ? ' x' + s.qty : '';
      var subStr = s.qty > 1 ? ' = ' + formatVND(s.subtotal) : '';
      lines.push('• ' + s.name + ' ' + formatVND(s.sell) + qtyStr + subStr);
    });
    lines.push('');
    lines.push('💰 합계: ' + formatVND(total));
    lines.push('');
    lines.push('문의: 다낭픽');

    previewEl.textContent = lines.join('\n');
    previewEl.style.display = 'block';
    copyBtn.style.display = 'block';
    if (bookingBtn) bookingBtn.style.display = 'block';
  }

  // 견적 → 예약 전환 (예약관리 페이지로 이동)
  function initBookingTransfer() {
    var btn = document.getElementById('q-booking-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var vendorId = document.getElementById('q-vendor').value;
      if (!vendorId || !vendors[vendorId]) {
        showToast('업체를 먼저 선택하세요');
        return;
      }
      var v = vendors[vendorId];
      var items = document.querySelectorAll('#q-menu-list .menu-check-item');
      var productParts = [];
      items.forEach(function (item) {
        var cb = item.querySelector('input[type="checkbox"]');
        if (!cb.checked) return;
        var idx = parseInt(cb.getAttribute('data-idx'));
        var qty = parseInt(item.querySelector('.menu-check-qty').value) || 1;
        var m = v.menus[idx];
        productParts.push(m.name + (qty > 1 ? ' x' + qty : ''));
      });
      if (productParts.length === 0) { showToast('메뉴를 선택하세요'); return; }

      var data = { category: v.category, partner: v.name, product: productParts.join(', ') };
      var url = encodeURI('예약관리.html') + '?transfer=1&data=' + encodeURIComponent(JSON.stringify(data));
      window.location.href = url;
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 유틸리티
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function val(id) { return document.getElementById(id).value.trim(); }

  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function infoRow(label, value) {
    return '<div class="vendor-info-row"><div class="vendor-info-label">' + label + '</div><div class="vendor-info-value">' + (value || '-') + '</div></div>';
  }

  function showToast(msg) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        flashCopiedBtn(btn);
      }).catch(function () {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flashCopiedBtn(btn); } catch (e) {}
    document.body.removeChild(ta);
  }

  function flashCopiedBtn(btn) {
    if (!btn) return;
    var original = btn.textContent;
    btn.textContent = '복사됨 ✓';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1500);
  }

})();
