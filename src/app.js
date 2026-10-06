(function(){
  // ---------- UI 언어 ----------
  var uiLang = 'ko';
  try { uiLang = localStorage.getItem('polyglot-ui') || 'ko'; } catch(e){}
  if (UI_LANGS.indexOf(uiLang) < 0) uiLang = 'ko';

  function t(key){
    return (UI_STRINGS[uiLang] && UI_STRINGS[uiLang][key]) || UI_STRINGS.ko[key] || key;
  }
  function langDef(code){
    for (var i=0;i<POLYGLOT_LANGS.length;i++) if (POLYGLOT_LANGS[i].code===code) return POLYGLOT_LANGS[i];
    return null;
  }
  function langName(code){
    var L = langDef(code);
    return (L && (L.names[uiLang] || L.names.ko)) || code;
  }

  // ---------- 탭 + 패널 생성 ----------
  var tabsEl = document.getElementById('tabs');
  var mainEl = document.querySelector('main');
  var panes = {};
  var tabBtns = {};

  POLYGLOT_LANGS.forEach(function(L){
    var b = document.createElement('button');
    b.setAttribute('role','tab');
    b.dataset.lang = L.code;
    var flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = L.flag;
    var nm = document.createElement('span');
    nm.className = 'tname';
    b.appendChild(flag);
    b.appendChild(nm);
    b.addEventListener('click', function(){ activate(L.code); });
    tabsEl.appendChild(b);
    tabBtns[L.code] = b;

    var pane;
    if (L.hasContent) {
      pane = document.getElementById('pane-'+L.code);
    } else {
      pane = document.createElement('div');
      pane.className = 'pane';
      pane.id = 'pane-'+L.code;
      var soon = document.createElement('div');
      soon.className = 'soon';
      var big = document.createElement('div');
      big.className = 'big';
      big.textContent = '📝';
      var h2 = document.createElement('h2');
      var p = document.createElement('p');
      soon.appendChild(big); soon.appendChild(h2); soon.appendChild(p);
      pane.appendChild(soon);
      mainEl.appendChild(pane);
    }
    panes[L.code] = pane;
  });

  var current = POLYGLOT_LANGS[0].code;
  function activate(lang){
    current = lang;
    POLYGLOT_LANGS.forEach(function(L){
      var on = (L.code===lang);
      var b = tabBtns[L.code];
      b.classList.toggle('active', on);
      b.style.background = on ? L.accent : '';
      b.style.borderColor = on ? L.accent : '';
      b.style.color = on ? '#fff' : '';
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      panes[L.code].classList.toggle('active', on);
      panes[L.code].querySelectorAll('.entry-detail').forEach(function(d){ d.hidden = true; });
      panes[L.code].querySelectorAll('.entry-card').forEach(function(c){
        c.classList.remove('open'); c.setAttribute('aria-expanded','false');
      });
    });
    document.documentElement.style.setProperty('--accent', langDef(lang).accent);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // ---------- UI 문구 적용 ----------
  function renderUiText(){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el){
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.documentElement.lang = uiLang;
    document.getElementById('uiLangName').textContent = UI_LANG_NAMES[uiLang];
    POLYGLOT_LANGS.forEach(function(L){
      tabBtns[L.code].querySelector('.tname').textContent = langName(L.code);
      if (!L.hasContent) {
        var pane = panes[L.code];
        var nm = langName(L.code);
        pane.querySelector('h2').textContent = t('soon_title').replace('{lang}', nm);
        pane.querySelector('p').innerHTML = t('soon_desc').replace('{lang}', nm);
      }
    });
    renderUiMenu();
  }

  // ---------- UI 언어 메뉴 ----------
  var uiBtn = document.getElementById('uiLangBtn');
  var uiMenu = document.getElementById('uiLangMenu');
  function renderUiMenu(){
    uiMenu.innerHTML = '';
    UI_LANGS.forEach(function(code){
      var b = document.createElement('button');
      b.setAttribute('role','option');
      b.setAttribute('aria-selected', code===uiLang ? 'true' : 'false');
      b.textContent = UI_LANG_NAMES[code] + (code===uiLang ? ' ✓' : '');
      if (code===uiLang) b.className = 'sel';
      b.addEventListener('click', function(){
        uiLang = code;
        try { localStorage.setItem('polyglot-ui', code); } catch(e){}
        renderUiText();
        closeMenu();
      });
      uiMenu.appendChild(b);
    });
  }
  function closeMenu(){
    uiMenu.hidden = true;
    uiBtn.setAttribute('aria-expanded','false');
  }
  uiBtn.addEventListener('click', function(e){
    e.stopPropagation();
    var willOpen = uiMenu.hidden;
    uiMenu.hidden = !willOpen;
    uiBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });
  document.addEventListener('click', function(e){
    if (!uiMenu.hidden && !e.target.closest('.ui-lang-wrap')) closeMenu();
  });
  document.addEventListener('keydown', function(e){ if (e.key==='Escape') closeMenu(); });

  // ---------- 맨 위로 ----------
  var topbtn = document.getElementById('topbtn');
  window.addEventListener('scroll', function(){
    topbtn.style.display = window.scrollY>400 ? 'block' : 'none';
  }, {passive:true});
  topbtn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // ---------- 자료 아코디언 ----------
  document.querySelectorAll('.entry-card').forEach(function(card){
    card.addEventListener('click', function(){
      var detail = document.getElementById(card.dataset.entry);
      var open = detail.hidden;
      detail.hidden = !open;
      card.classList.toggle('open', open);
      card.setAttribute('aria-expanded', open?'true':'false');
      if (open) detail.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // ---------- PWA ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js', {updateViaCache:'none'}).catch(function(){});
    });
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('controllerchange', function(){
        window.location.reload();
      });
    }
    // 백그라운드에서 돌아올 때도 업데이트 확인 (이어보기에서는 내비게이션이 없어 체크가 안 돌 수 있음)
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState !== 'visible') return;
      navigator.serviceWorker.getRegistration().then(function(reg){
        if (reg) reg.update().catch(function(){});
      });
    });
  }

  renderUiText();
  activate(current);
})();
