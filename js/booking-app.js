// =====================================================
// 다낭픽 예약관리 — App Logic
// =====================================================

(function () {
  'use strict';

  var API = 'https://script.google.com/macros/s/AKfycbyhL4GlFm3WXEhCYB9T3-DH9fri5edWCIt-i-hopkQck0s7ni08k8Jg-WJBGKm7ljNlUA/exec';

  var vendors = loadVendors(); // vendor-data.js
  var bookings = [];
  var statusFilter = '전체';
  var periodFilter = 30;
  var searchKeyword = '';

  // ── 초기화 ──
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initRegisterTab();
    initManageTab();

    // URL 파라미터로 견적→예약 전환 처리
    handleTransferParams();

    // 시트 동기화
    loadVendorsFromSheet(function (err, data) {
      if (!err && data) {
        vendors = data;
        showToast('✅ 시트 동기화 완료');
        refreshCategories();
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭 전환
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initTabs() {
    var tabs = document.querySelectorAll('.booking-tabs .tab-btn');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        document.getElementById('panel-' + tabId).classList.add('active');

        if (tabId === 'register') refreshCategories();
        if (tabId === 'manage') loadBookings();
        if (tabId === 'dashboard') loadDashboard();
      });
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭1: 예약 등록
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initRegisterTab() {
    document.getElementById('b-category').addEventListener('change', function () {
      loadPartners(this.value);
    });

    document.getElementById('b-submit-btn').addEventListener('click', submitBooking);

    document.getElementById('bm-close-btn').addEventListener('click', function () {
      document.getElementById('bookingModal').classList.remove('active');
    });

    document.getElementById('bm-copy-btn').addEventListener('click', function () {
      copyToClipboard(document.getElementById('bm-message').textContent, this);
    });

    document.getElementById('bm-kakao-btn').addEventListener('click', function () {
      var url = this.getAttribute('data-kakao');
      if (url) window.open(url, '_blank');
    });

    // 오늘 날짜
    var d = new Date();
    document.getElementById('b-date').value = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');

    refreshCategories();
  }

  function refreshCategories() {
    var sel = document.getElementById('b-category');
    var cur = sel.value;
    sel.innerHTML = '<option value="">선택하세요</option>';
    VENDOR_CATEGORIES.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      sel.appendChild(opt);
    });
    if (cur) sel.value = cur;
  }

  function loadPartners(category) {
    var sel = document.getElementById('b-partner');
    sel.innerHTML = '<option value="">선택하세요</option>';
    if (!category) return;
    Object.keys(vendors).forEach(function (id) {
      var v = vendors[id];
      if (v.category === category && v.status !== '중지') {
        var opt = document.createElement('option');
        opt.value = v.name; opt.textContent = v.name;
        sel.appendChild(opt);
      }
    });
  }

  function submitBooking() {
    var category = document.getElementById('b-category').value;
    var partner = document.getElementById('b-partner').value;
    var product = document.getElementById('b-product').value.trim();
    var bookingDate = document.getElementById('b-date').value;
    var bookingTime = document.getElementById('b-time').value;
    var persons = document.getElementById('b-persons').value;
    var grab = document.querySelector('input[name="b-grab"]:checked').value;
    var customerName = document.getElementById('b-customer').value.trim();
    var phone = document.getElementById('b-phone').value.trim();
    var request = document.getElementById('b-request').value.trim();

    if (!category) { showToast('❌ 카테고리를 선택하세요'); return; }
    if (!partner) { showToast('❌ 업체를 선택하세요'); return; }
    if (!product) { showToast('❌ 상품명을 입력하세요'); return; }
    if (!bookingDate) { showToast('❌ 예약일을 선택하세요'); return; }
    if (!bookingTime) { showToast('❌ 예약시간을 선택하세요'); return; }

    var data = {
      category: category, partner: partner, product: product,
      bookingDate: bookingDate, bookingTime: bookingTime,
      persons: persons || '1', grab: grab,
      customerName: customerName, phone: phone, request: request
    };

    var btn = document.getElementById('b-submit-btn');
    btn.disabled = true;
    btn.textContent = '등록 중...';

    var url = API + '?action=saveBooking&data=' + encodeURIComponent(JSON.stringify(data));

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (result) {
        btn.disabled = false;
        btn.textContent = '📅 예약 등록';

        if (!result || !result.success) {
          showToast('❌ 예약 실패: ' + (result ? result.error : '알 수 없는 오류'));
          return;
        }

        document.getElementById('bm-number').textContent = result.bookingNumber;
        document.getElementById('bm-partner').textContent = result.partnerName || partner;
        document.getElementById('bm-message').textContent = result.message || '';

        var kakaoBtn = document.getElementById('bm-kakao-btn');
        if (result.kakaoInfo) {
          var kakaoUrl = result.kakaoInfo;
          if (kakaoUrl.startsWith('@')) kakaoUrl = 'https://open.kakao.com/me/' + kakaoUrl;
          if (kakaoUrl.startsWith('https://')) {
            kakaoBtn.setAttribute('data-kakao', kakaoUrl);
            kakaoBtn.style.display = 'flex';
          } else { kakaoBtn.style.display = 'none'; }
        } else { kakaoBtn.style.display = 'none'; }

        document.getElementById('bookingModal').classList.add('active');

        // 폼 초기화
        document.getElementById('b-product').value = '';
        document.getElementById('b-product-tags').innerHTML = '';
        document.getElementById('b-customer').value = '';
        document.getElementById('b-phone').value = '';
        document.getElementById('b-request').value = '';
        document.getElementById('b-persons').value = '1';
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = '📅 예약 등록';
        showToast('❌ 네트워크 오류: ' + err.message);
      });
  }

  // 견적→예약 전환 (URL 파라미터)
  function handleTransferParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('transfer') !== '1') return;

    var dataStr = params.get('data');
    if (!dataStr) return;

    try {
      var d = JSON.parse(decodeURIComponent(dataStr));
      if (d.category) {
        document.getElementById('b-category').value = d.category;
        loadPartners(d.category);
        setTimeout(function () {
          if (d.partner) document.getElementById('b-partner').value = d.partner;
        }, 50);
      }
      if (d.product) {
        document.getElementById('b-product').value = d.product;
        // 태그 표시
        var tagsEl = document.getElementById('b-product-tags');
        tagsEl.innerHTML = '';
        d.product.split(', ').forEach(function (p) {
          var tag = document.createElement('span');
          tag.className = 'booking-product-tag';
          tag.textContent = p;
          tagsEl.appendChild(tag);
        });
      }
      showToast('📅 견적 → 예약 전환됨');
    } catch (e) {}

    // URL에서 파라미터 제거
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭2: 예약 관리
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initManageTab() {
    // 상태 필터
    var statusBar = document.getElementById('bk-status-filter');
    ['전체', '대기', '확정', '완료', '취소'].forEach(function (s) {
      var chip = document.createElement('button');
      chip.className = 'filter-chip' + (s === '전체' ? ' active' : '');
      chip.textContent = s;
      chip.addEventListener('click', function () {
        statusFilter = s;
        statusBar.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        renderBookings();
      });
      statusBar.appendChild(chip);
    });

    // 기간 필터
    var periodBar = document.getElementById('bk-period-filter');
    [{ label: '오늘', val: 1 }, { label: '7일', val: 7 }, { label: '30일', val: 30 }, { label: '전체', val: 365 }].forEach(function (p) {
      var chip = document.createElement('button');
      chip.className = 'filter-chip' + (p.val === 30 ? ' active' : '');
      chip.textContent = p.label;
      chip.addEventListener('click', function () {
        periodFilter = p.val;
        periodBar.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        loadBookings();
      });
      periodBar.appendChild(chip);
    });

    // 검색
    document.getElementById('bk-search').addEventListener('input', function () {
      searchKeyword = this.value.trim().toLowerCase();
      renderBookings();
    });
  }

  function loadBookings() {
    var listEl = document.getElementById('bk-list');
    listEl.innerHTML = '<div class="bk-loading">불러오는 중...</div>';

    fetch(API + '?action=getBookingList&days=' + periodFilter)
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (!result || !result.success) {
          listEl.innerHTML = '<div class="bk-empty">데이터를 불러올 수 없습니다</div>';
          return;
        }
        bookings = result.bookings || [];
        renderBookings();
      })
      .catch(function (err) {
        listEl.innerHTML = '<div class="bk-empty">❌ 네트워크 오류</div>';
      });
  }

  function renderBookings() {
    var filtered = bookings.filter(function (b) {
      if (statusFilter !== '전체' && b.status !== statusFilter) return false;
      if (searchKeyword) {
        var haystack = [b.bookingNumber, b.customerName, b.partner, b.phone, b.product].join(' ').toLowerCase();
        if (haystack.indexOf(searchKeyword) === -1) return false;
      }
      return true;
    });

    document.getElementById('bk-count').innerHTML = '검색 결과: <strong>' + filtered.length + '</strong>건';

    var listEl = document.getElementById('bk-list');
    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="bk-empty">예약이 없습니다</div>';
      return;
    }

    var html = '';
    filtered.forEach(function (b) {
      html += '<div class="bk-card" data-id="' + esc(b.bookingNumber) + '">';
      html += '<div class="bk-card-header">';
      html += '<div class="bk-card-left">';
      html += '<div class="bk-card-number">' + esc(b.bookingNumber) + '</div>';
      html += '<div class="bk-card-partner">' + esc(b.partner) + '</div>';
      html += '<div class="bk-card-date">' + esc(b.bookingDate) + ' ' + esc(b.bookingTime || '') + '</div>';
      html += '</div>';
      html += '<span class="bk-badge bk-badge-' + esc(b.status) + '">' + esc(b.status) + '</span>';
      html += '</div>';

      html += '<div class="bk-card-body">';
      html += infoRow('고객명', b.customerName);
      html += infoRow('연락처', b.phone);
      html += infoRow('카테고리', b.category);
      html += infoRow('상품', b.product);
      html += infoRow('인원', b.persons);
      html += infoRow('그랩', b.grab);
      html += infoRow('요청사항', b.request);

      // 상태 변경 버튼
      html += '<div class="bk-actions">';
      if (b.status === '대기') {
        html += '<button class="bk-action-btn bk-btn-confirm" data-num="' + esc(b.bookingNumber) + '" data-status="확정">확정</button>';
        html += '<button class="bk-action-btn bk-btn-cancel" data-num="' + esc(b.bookingNumber) + '" data-status="취소">취소</button>';
      } else if (b.status === '확정') {
        html += '<button class="bk-action-btn bk-btn-complete" data-num="' + esc(b.bookingNumber) + '" data-status="완료">완료</button>';
        html += '<button class="bk-action-btn bk-btn-cancel" data-num="' + esc(b.bookingNumber) + '" data-status="취소">취소</button>';
      }
      html += '</div>';
      html += '</div></div>';
    });

    listEl.innerHTML = html;

    // 카드 접기/펼치기
    listEl.querySelectorAll('.bk-card-header').forEach(function (hdr) {
      hdr.addEventListener('click', function () {
        hdr.parentElement.classList.toggle('open');
      });
    });

    // 상태 변경 버튼
    listEl.querySelectorAll('.bk-action-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var num = btn.getAttribute('data-num');
        var newStatus = btn.getAttribute('data-status');
        updateStatus(num, newStatus, btn);
      });
    });
  }

  function updateStatus(bookingNumber, newStatus, btn) {
    btn.disabled = true;
    btn.textContent = '처리 중...';

    var url = API + '?action=updateBookingStatus&bookingNumber=' + encodeURIComponent(bookingNumber) + '&newStatus=' + encodeURIComponent(newStatus);

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (!result || !result.success) {
          showToast('❌ 상태 변경 실패');
          btn.disabled = false;
          return;
        }
        showToast('✅ ' + bookingNumber + ' → ' + newStatus);
        loadBookings(); // 새로고침
      })
      .catch(function () {
        showToast('❌ 네트워크 오류');
        btn.disabled = false;
      });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 탭3: 대시보드
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function loadDashboard() {
    var todayStats = document.getElementById('dash-today-stats');
    var monthStats = document.getElementById('dash-month-stats');
    var todayList = document.getElementById('dash-today-list');

    todayStats.innerHTML = '<div class="bk-loading">불러오는 중...</div>';
    monthStats.innerHTML = '';
    todayList.innerHTML = '';

    fetch(API + '?action=getDashboard')
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (!result || !result.success) {
          todayStats.innerHTML = '<div class="bk-empty">데이터 없음</div>';
          return;
        }

        // 오늘 예약 수
        todayStats.innerHTML =
          stat(result.todayCount || 0, '오늘 예약') +
          stat((result.monthStatus && result.monthStatus['대기']) || 0, '대기') +
          stat((result.monthStatus && result.monthStatus['확정']) || 0, '확정');

        // 월간 요약
        var ms = result.monthSales || {};
        monthStats.innerHTML =
          stat(ms.count || 0, '총 예약') +
          stat(formatNum(ms.total || 0), '총 매출') +
          stat(formatNum(ms.commission || 0), '수수료');

        // 오늘 예약 리스트
        var today = result.todayBookings || [];
        if (today.length === 0) {
          todayList.innerHTML = '<div style="padding:16px 0;color:var(--text-muted);font-size:13px;text-align:center;">오늘 예약 없음</div>';
        } else {
          var html = '';
          today.forEach(function (b) {
            html += '<div class="dash-today-item">';
            html += '<div><strong>' + esc(b.partner) + '</strong> <span style="color:var(--text-muted);font-size:12px;">' + esc(b.bookingTime || '') + '</span></div>';
            html += '<span class="bk-badge bk-badge-' + esc(b.status) + '">' + esc(b.status) + '</span>';
            html += '</div>';
          });
          todayList.innerHTML = html;
        }
      })
      .catch(function () {
        todayStats.innerHTML = '<div class="bk-empty">❌ 네트워크 오류</div>';
      });
  }

  function stat(value, label) {
    return '<div class="dash-stat"><div class="dash-stat-num">' + value + '</div><div class="dash-stat-label">' + label + '</div></div>';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 유틸리티
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function infoRow(label, value) {
    return '<div class="bk-info-row"><div class="bk-info-label">' + label + '</div><div class="bk-info-value">' + (esc(value) || '-') + '</div></div>';
  }

  function formatNum(n) {
    if (!n) return '0';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flashBtn(btn); }).catch(function () { fallbackCopy(text, btn); });
    } else { fallbackCopy(text, btn); }
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); flashBtn(btn); } catch (e) {}
    document.body.removeChild(ta);
  }

  function flashBtn(btn) {
    if (!btn) return;
    var orig = btn.textContent;
    btn.textContent = '복사됨 ✓';
    btn.classList.add('copied');
    setTimeout(function () { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
  }

})();
