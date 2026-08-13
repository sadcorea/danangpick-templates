// =====================================================
// 가라오케 견적 계산기 위젯
// -----------------------------------------------------
// 카드 형태로 가라오케 탭 안에 들어간다.
// js/templates/karaoke.js 의 { widget: 'karaoke-quote' } 항목이 이 파일을 부른다.
//
// ⚠️ 가격을 고칠 때는 아래 PRICE / DRINKS 두 곳만 고치면 된다.
//    단, karaoke.js 의 고정 문구 템플릿에도 같은 숫자가 들어 있으므로
//    양쪽을 함께 고쳐야 두 벌이 되지 않는다.
//    정본: docs/운영/가라오케_단가표.md (다낭픽 관련 폴더)
// =====================================================

(function () {

  var PRICE = {
    long:  230,   // 롱타임 (12시간 애프터 동반)
    short: 160,   // 숏타임 (동반 외출 2시간)
    tc:     40,   // 티씨 (룸에서 초이스만)
    roomS:  30,   // 작은방 시간당
    roomL:  40    // 큰방 시간당
  };

  var DRINKS = [
    { v: 140, name: '맥주세트' },
    { v: 170, name: '소주세트' },
    { v: 200, name: '양주세트' },
    { v: 240, name: '베트남위스키' },
    { v: 370, name: '발렌타인 17년' },
    { v: 420, name: '맥캘란 12년' }
  ];

  // 롱타임 2인 이상 → 룸비 이 시간만큼 무료 (초과분은 정상 청구)
  var FREE_ROOM_HOURS = 2;
  var FREE_ROOM_MIN_LONG = 2;

  function money(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  // --- 계산 ---------------------------------------------------

  function calc(s) {
    var people = s.nLong + s.nShort + s.nTc;

    var freeHours = s.nLong >= FREE_ROOM_MIN_LONG
      ? Math.min(FREE_ROOM_HOURS, s.hours)
      : 0;
    var paidHours = s.hours - freeHours;

    var roomFull = s.roomRate * s.hours;
    var roomCost = s.roomRate * paidHours;

    var total = s.drink + roomCost
      + PRICE.long * s.nLong
      + PRICE.short * s.nShort
      + PRICE.tc * s.nTc;

    return {
      people:    people,
      freeHours: freeHours,
      roomFull:  roomFull,
      roomCost:  roomCost,
      total:     total,
      perHead:   people > 0 ? Math.round(total / people) : 0
    };
  }

  // --- 견적 줄 만들기 ------------------------------------------

  function lines(s, r) {
    var out = [];

    out.push({
      name: s.drinkName,
      sub:  '룸 1개 기준 · 인원과 무관',
      val:  money(s.drink)
    });

    if (s.nLong) out.push({
      name: '롱타임', sub: money(PRICE.long) + ' × ' + s.nLong + '명',
      val: money(PRICE.long * s.nLong)
    });
    if (s.nShort) out.push({
      name: '숏타임', sub: money(PRICE.short) + ' × ' + s.nShort + '명',
      val: money(PRICE.short * s.nShort)
    });
    if (s.nTc) out.push({
      name: '티씨', sub: money(PRICE.tc) + ' × ' + s.nTc + '명',
      val: money(PRICE.tc * s.nTc)
    });

    var roomSub = s.roomName + ' ' + money(s.roomRate) + '/시간 × ' + s.hours + '시간';

    if (r.freeHours > 0 && r.roomCost === 0) {
      out.push({
        name: '룸비', sub: roomSub + ' — 롱타임 ' + FREE_ROOM_MIN_LONG + '분 이상 혜택',
        was: money(r.roomFull), val: '무료', free: true
      });
    } else if (r.freeHours > 0) {
      out.push({
        name: '룸비',
        sub: roomSub + ' — ' + r.freeHours + '시간 무료, '
             + (s.hours - r.freeHours) + '시간분만 청구',
        was: money(r.roomFull), val: money(r.roomCost)
      });
    } else {
      out.push({ name: '룸비', sub: roomSub, val: money(r.roomCost) });
    }

    return out;
  }

  function condText(s, r) {
    var who = [];
    if (s.nLong)  who.push('롱타임 ' + s.nLong + '명');
    if (s.nShort) who.push('숏타임 ' + s.nShort + '명');
    if (s.nTc)    who.push('티씨 ' + s.nTc + '명');
    return (r.people ? r.people + '명 · ' : '')
      + s.drinkName + ' · ' + (who.join(' · ') || '파트너 미선택')
      + ' · ' + s.roomName + ' ' + s.hours + '시간';
  }

  function overtimeText(s, r) {
    return r.freeHours > 0
      ? '무료 ' + r.freeHours + '시간을 넘기시면 시간당 ' + money(s.roomRate) + '만 추가됩니다'
      : '시간이 늘어나면 룸비만 시간당 ' + money(s.roomRate) + ' 추가됩니다';
  }

  // --- 고객 전송용 문구 ----------------------------------------

  function plainText(s, r) {
    var out = ['[가라오케 견적]', '', condText(s, r), ''];

    out.push('총 ' + money(r.total)
      + (r.people ? '  (1인당 ' + money(r.perHead) + ')' : ''));
    out.push('');

    lines(s, r).forEach(function (l) {
      out.push('· ' + l.name + (l.sub ? ' ' + l.sub : '') + '  ' + l.val);
    });

    out.push('', '현장에서 추가로 내실 금액은 없습니다.');
    out.push('(' + overtimeText(s, r) + ')');
    out.push('', '결제는 달러가 유리 / 예약은 다낭픽으로');
    return out.join('\n');
  }

  // --- 전체 메뉴표 (접이식) ------------------------------------
  // 숫자는 PRICE / DRINKS 에서 그대로 뽑는다. 따로 적어두지 않는다.

  function menuHtml() {
    var drinkRows = DRINKS.map(function (d) {
      var sub = d.name === '양주세트'
        ? '<span class="qc-msub">골든블루 · 조니워커 · 봄베이 · 예거</span>' : '';
      return '<tr><td>' + d.name + sub + '</td><td class="qc-p">' + money(d.v) + '</td></tr>';
    }).join('');

    // 인원별 1인당 — 맥주세트 + 전원 롱타임, 작은방 2시간 기준.
    // 고정값을 적지 않고 위와 같은 계산기로 뽑는다.
    var headRows = [1, 2, 3, 4, 5, 6].map(function (n) {
      var s = {
        drink: DRINKS[0].v, roomRate: PRICE.roomS, hours: 2,
        nLong: n, nShort: 0, nTc: 0
      };
      var r = calc(s);
      var note = r.roomCost > 0 ? '<span class="qc-msub">룸비 작은방 2시간 포함</span>' : '';
      return '<tr><td>' + n + '명' + note + '</td>'
        + '<td class="qc-p">' + money(r.total) + '</td>'
        + '<td class="qc-p">' + money(r.perHead) + '</td></tr>';
    }).join('');

    return '' +
      '<details class="qc-menu"><summary>전체 가격표 보기</summary>' +

        '<div class="qc-mtitle">술 — 룸 1개 기준, 택1</div>' +
        '<table class="qc-mtable">' + drinkRows + '</table>' +

        '<div class="qc-mtitle">파트너 — 1인 기준, 택1</div>' +
        '<table class="qc-mtable">' +
          '<tr><td>롱타임<span class="qc-msub">12시간 애프터 동반</span></td>' +
            '<td class="qc-p">' + money(PRICE.long) + '</td></tr>' +
          '<tr><td>숏타임<span class="qc-msub">동반 외출 2시간 후 귀가</span></td>' +
            '<td class="qc-p">' + money(PRICE.short) + '</td></tr>' +
          '<tr><td>티씨<span class="qc-msub">룸에서 초이스만, 2시간</span></td>' +
            '<td class="qc-p">' + money(PRICE.tc) + '</td></tr>' +
        '</table>' +
        '<ul class="qc-notes">' +
          '<li>롱타임·숏타임을 하지 않으면 티씨가 필요하다</li>' +
          '<li>동반 외출하면 티씨가 따로 붙지 않는다</li>' +
        '</ul>' +

        '<div class="qc-mtitle">룸비 — 시간당, 별도</div>' +
        '<table class="qc-mtable">' +
          '<tr><td>작은방</td><td class="qc-p">' + money(PRICE.roomS) + ' / 시간</td></tr>' +
          '<tr><td>큰방</td><td class="qc-p">' + money(PRICE.roomL) + ' / 시간</td></tr>' +
        '</table>' +
        '<div class="qc-promo">🎁 <b>롱타임 ' + FREE_ROOM_MIN_LONG + '분 이상이면 룸비 '
          + FREE_ROOM_HOURS + '시간 무료</b><br>초과분만 시간당으로 계산된다.</div>' +

        '<div class="qc-mtitle">인원별 1인당 — 맥주세트 + 전원 롱타임</div>' +
        '<table class="qc-mtable">' +
          '<tr><th>인원</th><th class="qc-p">합계</th><th class="qc-p">1인당</th></tr>'
          + headRows +
        '</table>' +
        '<ul class="qc-notes">' +
          '<li>2명부터는 룸비 ' + FREE_ROOM_HOURS + '시간이 무료다</li>' +
          '<li>초과 시간은 시간당으로 추가된다</li>' +
        '</ul>' +

      '</details>';
  }

  // --- 렌더 ----------------------------------------------------

  WIDGETS['karaoke-quote'] = function (template) {

    var card = el('<div class="template-card qc-card"></div>');

    var drinkOpts = DRINKS.map(function (d, i) {
      return '<option value="' + i + '"' + (i === 0 ? ' selected' : '') + '>'
        + d.name + ' — ' + money(d.v) + '</option>';
    }).join('');

    card.innerHTML =
      '<div class="template-title">' + (template.title || '견적 계산기') + '</div>' +

      '<div class="qc-total">' +
        '<div class="qc-amount"></div>' +
        '<div class="qc-per"></div>' +
        '<div class="qc-cond"></div>' +
      '</div>' +

      '<ul class="qc-lines"></ul>' +

      '<div class="qc-noextra">현장에서 추가로 내실 금액은 없습니다' +
        '<span class="qc-overtime"></span></div>' +

      '<div class="qc-ctrl">' +
        '<div><label>술 (룸 단위 · 택1)</label>' +
          '<select class="qc-drink">' + drinkOpts + '</select></div>' +
        '<div><label>룸</label><select class="qc-room">' +
          '<option value="' + PRICE.roomS + '" selected>작은방 — ' + money(PRICE.roomS) + '/시간</option>' +
          '<option value="' + PRICE.roomL + '">큰방 — ' + money(PRICE.roomL) + '/시간</option>' +
        '</select></div>' +
        '<div><label>이용 시간</label><select class="qc-hours">' +
          '<option value="1">1시간</option><option value="2" selected>2시간</option>' +
          '<option value="3">3시간</option><option value="4">4시간</option>' +
        '</select></div>' +
        '<div><label>롱타임 인원</label>' +
          '<input type="number" class="qc-long" min="0" max="12" value="4"></div>' +
        '<div><label>숏타임 인원</label>' +
          '<input type="number" class="qc-short" min="0" max="12" value="0"></div>' +
        '<div><label>티씨만</label>' +
          '<input type="number" class="qc-tc" min="0" max="12" value="0"></div>' +
      '</div>' +

      '<button class="qc-copy"><span class="btn-text">견적 문구 복사</span></button>' +

      menuHtml();

    var q = function (sel) { return card.querySelector(sel); };

    function state() {
      var d = DRINKS[+q('.qc-drink').value] || DRINKS[0];
      var rate = +q('.qc-room').value;
      return {
        drink:     d.v,
        drinkName: d.name,
        roomRate:  rate,
        roomName:  rate === PRICE.roomL ? '큰방' : '작은방',
        hours:     +q('.qc-hours').value,
        nLong:     Math.max(0, parseInt(q('.qc-long').value, 10)  || 0),
        nShort:    Math.max(0, parseInt(q('.qc-short').value, 10) || 0),
        nTc:       Math.max(0, parseInt(q('.qc-tc').value, 10)    || 0)
      };
    }

    function render() {
      var s = state();
      var r = calc(s);

      q('.qc-amount').textContent = money(r.total);
      q('.qc-per').textContent = r.people > 0
        ? '1인당 ' + money(r.perHead)
        : '인원을 입력해 주세요';
      q('.qc-cond').textContent = condText(s, r);

      q('.qc-lines').innerHTML = lines(s, r).map(function (l) {
        return '<li>'
          + '<span class="qc-name">' + l.name
          + (l.sub ? '<span class="qc-sub">' + l.sub + '</span>' : '')
          + '</span>'
          + (l.was ? '<span class="qc-val qc-was">' + l.was + '</span>' : '')
          + '<span class="qc-val' + (l.free ? ' qc-free' : '') + '">' + l.val + '</span>'
          + '</li>';
      }).join('');

      q('.qc-overtime').textContent = overtimeText(s, r);
    }

    ['.qc-drink', '.qc-room', '.qc-hours', '.qc-long', '.qc-short', '.qc-tc']
      .forEach(function (sel) {
        q(sel).addEventListener('change', render);
        q(sel).addEventListener('input', render);
      });

    q('.qc-copy').addEventListener('click', function () {
      var s = state();
      copyText(q('.qc-copy'), plainText(s, calc(s)));
    });

    render();
    return card;
  };

})();
