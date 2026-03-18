// =====================================================
// 다낭픽 응대 템플릿 - App Logic
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
  renderTabs();
  if (CATEGORIES.length > 0) {
    renderContent(CATEGORIES[0]);
  }
});

// --- Tab Bar ---

function renderTabs() {
  var tabBar = document.getElementById('tab-bar');
  tabBar.innerHTML = '';

  CATEGORIES.forEach(function (category, index) {
    var btn = document.createElement('button');
    btn.className = 'tab-btn' + (index === 0 ? ' active' : '');
    btn.textContent = category.label;
    btn.addEventListener('click', function () {
      selectCategory(index);
    });
    tabBar.appendChild(btn);
  });
}

function selectCategory(index) {
  var tabBar = document.getElementById('tab-bar');
  var tabs = tabBar.querySelectorAll('.tab-btn');

  tabs.forEach(function (tab, i) {
    if (i === index) {
      tab.classList.add('active');
      tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    } else {
      tab.classList.remove('active');
    }
  });

  renderContent(CATEGORIES[index]);
}

// --- Content Rendering ---

function renderContent(category) {
  var content = document.getElementById('content');
  content.innerHTML = '';

  if (!category || !category.situations) return;

  category.situations.forEach(function (situation) {
    var situationDiv = document.createElement('div');
    situationDiv.className = 'situation';

    var label = document.createElement('div');
    label.className = 'situation-label';
    label.textContent = situation.label;
    situationDiv.appendChild(label);

    situation.templates.forEach(function (template) {
      var card = document.createElement('div');
      card.className = 'template-card';

      // 텍스트 영역 (좌측)
      var body = document.createElement('div');
      body.className = 'card-body';

      var title = document.createElement('div');
      title.className = 'template-title';
      title.textContent = template.title;

      var preview = document.createElement('div');
      preview.className = 'template-preview';
      preview.textContent = template.text;

      body.appendChild(title);
      body.appendChild(preview);

      // 복사 버튼 (우측 정사각형)
      var copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      var btnSpan = document.createElement('span');
      btnSpan.className = 'btn-text';
      btnSpan.textContent = '복사';
      copyBtn.appendChild(btnSpan);
      copyBtn.addEventListener('click', function () {
        copyText(copyBtn, template.text);
      });

      card.appendChild(body);
      card.appendChild(copyBtn);
      situationDiv.appendChild(card);
    });

    content.appendChild(situationDiv);
  });
}

// --- Copy Logic ---

function copyText(btn, text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(function () {
        flashCopied(btn);
      })
      .catch(function () {
        fallbackCopy(btn, text);
      });
  } else {
    fallbackCopy(btn, text);
  }
}

function fallbackCopy(btn, text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    flashCopied(btn);
  } catch (e) {
    // copy failed silently
  }
  document.body.removeChild(textarea);
}

function flashCopied(btn) {
  var span = btn.querySelector('.btn-text');
  var original = span ? span.textContent : btn.textContent;
  if (span) span.textContent = '복사됨 ✓';
  else btn.textContent = '복사됨 ✓';
  btn.classList.add('copied');
  setTimeout(function () {
    if (span) span.textContent = original;
    else btn.textContent = original;
    btn.classList.remove('copied');
  }, 1500);
}
