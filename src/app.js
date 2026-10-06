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

  // ---------- PWA + 자동 업데이트 ----------
  var updateTriggered = false;
  var hadController = false;
  try { hadController = !!navigator.serviceWorker.controller; } catch(e){}
  if ('serviceWorker' in navigator) {
    // 첫 설치가 아닐 때만 SW 교체 후 새로고침 (첫 설치 직후 1회 리로드는 방지)
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      if (hadController || updateTriggered) window.location.reload();
      hadController = true;
    });
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js', {updateViaCache:'none'}).catch(function(){});
      setTimeout(function(){ checkAppVersion(false); }, 3000);
    });
    // 백그라운드에서 돌아오거나 주기적으로 서버 버전을 확인
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState !== 'visible') return;
      checkAppVersion(false);
    });
    setInterval(function(){ checkAppVersion(false); }, 5*60*1000);
  }

  // ---------- 버전 폴링: 서버에 새 빌드가 있으면 SW 교체 후 새로고침 ----------
  var updateStatusKey = null;
  function setUpdateStatus(key){
    updateStatusKey = key;
    var el = document.getElementById('updateStatus');
    if (!el) return;
    if (!key) { el.hidden = true; return; }
    el.textContent = t(key);
    el.hidden = false;
  }
  // 구 SW(우회 로직이 없던 버전)의 런타임 캐시에 박힌 version.txt를 먼저 제거.
  // 제거하지 않으면 폴링이 매번 묵은 버전을 읽어 새 버전을 영원히 못 감지함.
  function purgeVersionCache(){
    try {
      if (!('caches' in window)) return Promise.resolve();
      return caches.keys().then(function(keys){
        return Promise.all(keys.map(function(k){
          return caches.open(k).then(function(c){
            return c.keys().then(function(reqs){
              return Promise.all(reqs.map(function(r){
                return r.url.indexOf('/version.txt') !== -1 ? c.delete(r) : null;
              }));
            });
          });
        }));
      });
    } catch(e){ return Promise.resolve(); }
  }
  function checkAppVersion(manual){
    purgeVersionCache().then(function(){
      return fetch('version.txt', {cache:'no-store'});
    }).then(function(r){
      if (!r.ok) throw 0;
      return r.text();
    }).then(function(v){
      v = (v || '').trim();
      if (!v || v === APP_VERSION) {
        if (manual) setUpdateStatus('update_latest');
        return;
      }
      if (manual) setUpdateStatus('update_applying');
      applyUpdate(v, manual);
    }).catch(function(){
      if (manual) setUpdateStatus(null);
    });
  }
  function applyUpdate(v, manual){
    var already = false;
    try { already = sessionStorage.getItem('pg-upd') === v; } catch(e){}
    if (already && !manual) return;
    try { sessionStorage.setItem('pg-upd', v); } catch(e){}
    updateTriggered = true;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(function(reg){
        if (reg) reg.update().catch(function(){});
      }).catch(function(){});
    }
    setTimeout(function(){
      // controllerchange에서 이미 새로고침됐으면 이 코드는 실행 안 됨
      if (manual) forceFresh();
      else window.location.reload();
    }, 8000);
  }
  // 확실한 갈아엎기: 캐시+SW 등록을 제거 후 새로고침 (localStorage 설정은 유지됨).
  // 수동 "업데이트 확인"의 마지막 수단. 쿠키 지우기와 같은 효과.
  function forceFresh(){
    var p = Promise.resolve();
    try {
      if ('caches' in window) {
        p = caches.keys().then(function(keys){
          return Promise.all(keys.map(function(k){ return caches.delete(k); }));
        });
      }
    } catch(e){}
    p.then(function(){
      if ('serviceWorker' in navigator) return navigator.serviceWorker.getRegistration();
    }).then(function(reg){
      if (reg) return reg.unregister();
    }).then(function(){
      window.location.reload();
    }).catch(function(){
      window.location.reload();
    });
  }
  var updateBtn = document.getElementById('updateBtn');
  if (updateBtn) updateBtn.addEventListener('click', function(e){
    e.stopPropagation();
    setUpdateStatus(null);
    checkAppVersion(true);
  });

  renderUiText();
  renderView();
})();
