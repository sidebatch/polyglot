(function(){
  var APP_VERSION = '__APP_VERSION__'; // build.mjs가 커밋 해시로 치환 — 버전 폴링용
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

  // ---------- 탭 + 패널 생성 (자료 많은 언어 먼저) ----------
  var tabsEl = document.getElementById('tabs');
  var mainEl = document.querySelector('main');
  var panes = {};
  var tabBtns = {};

  function contentCount(code){
    var p = document.getElementById('pane-'+code);
    return p ? p.querySelectorAll('.entry').length : 0;
  }
  var orderedLangs = POLYGLOT_LANGS.slice().sort(function(a,b){
    return contentCount(b.code) - contentCount(a.code);
  });

  orderedLangs.forEach(function(L){
    var b = document.createElement('button');
    b.setAttribute('role','tab');
    b.dataset.lang = L.code;
    var flag = document.createElement('img');
    flag.className = 'flag';
    flag.src = L.flag;
    flag.alt = '';
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

  var current = orderedLangs[0].code;
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

  // ---------- 보기 모드 (탭 / 그리드) ----------
  var viewMode = 'tabs';
  try { viewMode = localStorage.getItem('polyglot-view') || 'tabs'; } catch(e){}
  if (viewMode !== 'grid') viewMode = 'tabs';

  var tabbarEl = document.querySelector('.tabbar');
  var plazaEl = document.getElementById('plaza');
  var plazaGrid = document.getElementById('plazaGrid');
  var langheadEl = document.getElementById('langhead');

  function entryCount(code){
    return contentCount(code);
  }
  function buildPlaza(){
    plazaGrid.innerHTML = '';
    POLYGLOT_LANGS.slice().sort(function(a,b){ return entryCount(b.code) - entryCount(a.code); })
    .forEach(function(L){
      var n = entryCount(L.code);
      var has = n > 0;
      var c = document.createElement('button');
      c.className = 'plaza-card' + (has ? '' : ' dim');
      c.style.setProperty('--ac', L.accent);
      var img = document.createElement('img');
      img.className = 'flag'; img.src = L.flag; img.alt = '';
      var nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = langName(L.code);
      var st = document.createElement('div');
      st.className = 'st ' + (has ? 'has' : 'soon');
      if (has) st.style.color = L.accent;
      st.textContent = has ? t('card_mats').replace('{n}', n) : t('card_soon');
      c.appendChild(img); c.appendChild(nm); c.appendChild(st);
      c.addEventListener('click', function(){ openLangGrid(L.code); });
      plazaGrid.appendChild(c);
    });
  }
  function openLangGrid(code){
    activate(code);
    plazaEl.hidden = true;
    mainEl.hidden = false;
    langheadEl.hidden = false;
    document.getElementById('langheadFlag').src = langDef(code).flag;
    document.getElementById('langheadName').textContent = langName(code);
    window.scrollTo({top:0});
  }
  function backToPlaza(){
    langheadEl.hidden = true;
    mainEl.hidden = true;
    plazaEl.hidden = false;
    window.scrollTo({top:0});
  }
  function renderView(){
    var isGrid = viewMode === 'grid';
    tabbarEl.style.display = isGrid ? 'none' : '';
    if (isGrid) { backToPlaza(); }
    else {
      plazaEl.hidden = true; langheadEl.hidden = true; mainEl.hidden = false;
      activate(current);
    }
    renderSettingsMenu();
  }
  document.getElementById('langBack').addEventListener('click', backToPlaza);

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
    buildPlaza();
    if (!langheadEl.hidden) {
      document.getElementById('langheadName').textContent = langName(current);
    }
    renderSettingsMenu();
    if (updateStatusKey) setUpdateStatus(updateStatusKey);
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
    if (willOpen) closeSettings();
  });
  document.addEventListener('click', function(e){
    if (!uiMenu.hidden && !e.target.closest('.ui-lang-wrap')) closeMenu();
    if (!setMenu.hidden && !e.target.closest('.settings-wrap')) closeSettings();
  });
  document.addEventListener('keydown', function(e){
    if (e.key==='Escape'){ closeMenu(); closeSettings(); }
  });

  // ---------- 설정 메뉴 (보기 모드) ----------
  var setBtn = document.getElementById('settingsBtn');
  var setMenu = document.getElementById('settingsMenu');
  var viewOpts = document.getElementById('viewOpts');
  function renderSettingsMenu(){
    viewOpts.innerHTML = '';
    [['tabs', t('view_tabs')], ['grid', t('view_grid')]].forEach(function(pair){
      var b = document.createElement('button');
      b.className = 'view-opt';
      var label = document.createElement('span'); label.textContent = pair[1];
      var chk = document.createElement('span'); chk.className = 'chk';
      chk.textContent = pair[0]===viewMode ? '✓' : '';
      b.appendChild(label); b.appendChild(chk);
      b.addEventListener('click', function(){
        viewMode = pair[0];
        try { localStorage.setItem('polyglot-view', viewMode); } catch(e){}
        closeSettings();
        renderView();
      });
      viewOpts.appendChild(b);
    });
  }
  function closeSettings(){
    setMenu.hidden = true;
    setBtn.setAttribute('aria-expanded','false');
  }
  setBtn.addEventListener('click', function(e){
    e.stopPropagation();
    var willOpen = setMenu.hidden;
    setMenu.hidden = !willOpen;
    setBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen) closeMenu();
  });

  // ---------- 맨 위로 ----------
  var topbtn = document.getElementById('topbtn');
  window.addEventListener('scroll', function(){
    topbtn.style.display = window.scrollY>400 ? 'block' : 'none';
  }, {passive:true});
  topbtn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // ---------- 자료 아코디언 ----------
  function setEntryOpen(card, detail, open){
    detail.hidden = !open;
    card.classList.toggle('open', open);
    card.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.querySelectorAll('.entry-card').forEach(function(card){
    card.addEventListener('click', function(){
      var detail = document.getElementById(card.dataset.entry);
      var open = detail.hidden;
      setEntryOpen(card, detail, open);
      if (open) {
        try { history.replaceState(null, '', '#' + card.dataset.entry); } catch(e){}
        detail.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // ---------- 딥링크: #entry-... 해시로 해당 카드 바로 열기 ----------
  function openFromHash(){
    var id = (window.location.hash || '').slice(1);
    if (!id) return;
    var detail = document.getElementById(id);
    if (!detail || !detail.classList.contains('entry-detail')) return;
    var card = document.querySelector('.entry-card[data-entry="' + id + '"]');
    if (!card) return;
    var pane = detail.closest('.pane');
    if (pane) {
      var code = pane.id.replace('pane-', '');
      if (viewMode === 'grid') openLangGrid(code); else activate(code);
    }
    setEntryOpen(card, detail, true);
    setTimeout(function(){ detail.scrollIntoView({behavior:'smooth', block:'start'}); }, 60);
  }
  window.addEventListener('hashchange', openFromHash);
  // 초기 호출은 파일 끝의 renderView() 뒤에서 (초기화가 연 카드를 닫지 않도록)

  // ---------- 링크 공유 ----------
  var toastTimer = null;
  function showToast(msg){
    var toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2000);
  }
  document.querySelectorAll('.share-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-share');
      var url = window.location.origin + window.location.pathname + '#' + id;
      var card = btn.closest('.entry-card');
      var titleEl = card ? card.querySelector('.entry-title') : null;
      var title = titleEl ? titleEl.textContent : 'Polyglot';
      if (navigator.share) {
        navigator.share({title:'Polyglot', text:title, url:url}).catch(function(){});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function(){ showToast(t('link_copied')); }).catch(function(){});
      }
    });
  });

  // ---------- NEW 배지: 지난 방문 때 없던 자료에 표시 ----------
  (function(){
    var KEY = 'polyglot-seen';
    var cards = document.querySelectorAll('.entry-card[data-entry]');
    var ids = [];
    cards.forEach(function(c){ ids.push(c.getAttribute('data-entry')); });
    var seen = null;
    try { seen = JSON.parse(window.localStorage.getItem(KEY) || 'null'); } catch(e){}
    if (Array.isArray(seen)) {
      var seenSet = {};
      seen.forEach(function(id){ seenSet[id] = true; });
      cards.forEach(function(c){
        if (!seenSet[c.getAttribute('data-entry')]) {
          var b = c.querySelector('.new-badge');
          if (b) b.hidden = false;
        }
      });
    }
    try { window.localStorage.setItem(KEY, JSON.stringify(ids)); } catch(e){}
  })();

  // ---------- PWA ----------
  // 네트워크 우선 전략(Still과 동일): 온라인이면 항상 최신 셸을 가져오므로
  // 일반 새로고침만으로 업데이트가 반영됨. 오프라인이면 캐시로 폴백.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js', {updateViaCache:'none'}).catch(function(){});
    });
  }

  // ---------- 수동 업데이트 확인 ----------
  var updateStatusKey = null;
  function setUpdateStatus(key){
    updateStatusKey = key;
    var el = document.getElementById('updateStatus');
    if (!el) return;
    if (!key) { el.hidden = true; return; }
    el.textContent = t(key);
    el.hidden = false;
  }
  function checkAppVersion(){
    fetch('version.txt', {cache:'no-store'}).then(function(r){
      if (!r.ok) throw 0;
      return r.text();
    }).then(function(v){
      v = (v || '').trim();
      if (!v || v === APP_VERSION) { setUpdateStatus('update_latest'); return; }
      setUpdateStatus('update_applying');
      setTimeout(function(){ window.location.reload(); }, 800);
    }).catch(function(){ setUpdateStatus(null); });
  }
  var updateBtn = document.getElementById('updateBtn');
  if (updateBtn) updateBtn.addEventListener('click', function(e){
    e.stopPropagation();
    setUpdateStatus(null);
    checkAppVersion();
  });

  renderUiText();
  renderView();
  openFromHash();
})();
