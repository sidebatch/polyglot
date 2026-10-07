// Polyglot 기능 테스트 (jsdom) — 딥링크 · 공유 · 칩 · NEW 배지
// 실행: node tests/run-tests.js  (먼저 node build.mjs 로 docs/ 갱신)
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'index.html'), 'utf8');
const results = [];
const ok = (n, c) => results.push([n, !!c]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ALL_IDS = ['entry-ja-1', 'entry-ja-2', 'entry-ja-3', 'entry-en-1', 'entry-ru-1', 'mindset-tree'];

function makeDom(opts = {}) {
  return new JSDOM(html, {
    url: 'https://sidebatch.github.io/polyglot/' + (opts.hash || ''),
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(w) {
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.scrollTo = function () {};
      if (opts.tab) w.localStorage.setItem('polyglot-tab', opts.tab);
      if (opts.view) w.localStorage.setItem('polyglot-view', opts.view);
      if (opts.seen) w.localStorage.setItem('polyglot-seen', JSON.stringify(opts.seen));
      if (opts.setup) opts.setup(w);
    },
  });
}

(async () => {
  // 1. 딥링크: 탭 모드
  {
    const dom = makeDom({ hash: '#entry-ja-2', tab: 'ja' }); await wait(120);
    const d = dom.window.document;
    ok('deep tab: ja-2 open', d.getElementById('entry-ja-2').hidden === false &&
       d.querySelector('[data-entry="entry-ja-2"]').classList.contains('open'));
    dom.window.close();
  }
  // 2. 딥링크: 그리드 모드
  {
    const dom = makeDom({ hash: '#entry-ja-2', view: 'grid' }); await wait(120);
    const d = dom.window.document;
    ok('deep grid: ja opened + detail open',
       d.getElementById('plaza').hidden === true &&
       d.getElementById('pane-ja').hidden === false &&
       d.getElementById('entry-ja-2').hidden === false &&
       d.getElementById('langhead').hidden === false);
    dom.window.close();
  }
  // 3. 딥링크: 마인드셋
  {
    const dom = makeDom({ hash: '#mindset-tree' }); await wait(120);
    const d = dom.window.document;
    ok('deep mindset: open', d.getElementById('mindset-tree').hidden === false);
    dom.window.close();
  }
  // 4. 잘못된 해시: 무해
  {
    const dom = makeDom({ hash: '#nope' }); await wait(120);
    const d = dom.window.document;
    ok('bad hash: nothing open', [...d.querySelectorAll('.entry-detail')].every(x => x.hidden));
    dom.window.close();
  }
  // 5. 카드 수동 열기 → 해시 갱신
  {
    const dom = makeDom({ tab: 'ja' }); await wait(120);
    const w = dom.window, d = w.document;
    d.querySelector('[data-entry="entry-ja-1"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(30);
    ok('manual open sets hash', w.location.hash === '#entry-ja-1');
    dom.window.close();
  }
  // 6. 칩 표시 + 구 요소 제거 + 공유 버튼 위치
  {
    const dom = makeDom(); await wait(120);
    const d = dom.window.document;
    ok('chips on all 6 cards', d.querySelectorAll('.entry-card .chip svg').length === 6);
    ok('no legacy chev/share on card face', d.querySelectorAll('.chev, .entry-share').length === 0);
    ok('share buttons (6) inside details',
       d.querySelectorAll('.share-btn').length === 6 &&
       [...d.querySelectorAll('.share-btn')].every(b => b.closest('.entry-detail')));
    dom.window.close();
  }
  // 7. 공유: 클립보드 폴백 + 토스트
  {
    let copied = null;
    const dom = makeDom({ setup(w) {
      Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: (t) => { copied = t; return Promise.resolve(); } }, configurable: true });
    } });
    await wait(120);
    const w = dom.window, d = w.document;
    d.querySelector('.share-btn[data-share="entry-ja-1"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(30);
    ok('share copies url with hash', !!copied && copied.includes('#entry-ja-1'));
    ok('toast shows copied msg', d.getElementById('toast').classList.contains('show'));
    dom.window.close();
  }
  // 8. 공유: navigator.share 경로
  {
    let shared = null;
    const dom = makeDom({ setup(w) {
      w.navigator.share = (data) => { shared = data; return Promise.resolve(); };
    } });
    await wait(120);
    const w = dom.window, d = w.document;
    d.querySelector('.share-btn[data-share="mindset-tree"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(30);
    ok('navigator.share called', !!shared && shared.url.includes('#mindset-tree'));
    dom.window.close();
  }
  // 9. NEW 배지: 첫 방문
  {
    const dom = makeDom(); await wait(120);
    const d = dom.window.document;
    ok('new first visit: no badges', [...d.querySelectorAll('.new-badge')].every(b => b.hidden === true));
    const saved = JSON.parse(dom.window.localStorage.getItem('polyglot-seen') || '[]');
    ok('new first visit: seen saved', ALL_IDS.every(id => saved.includes(id)));
    dom.window.close();
  }
  // 10. NEW 배지: 새 자료 2개
  {
    const seenBefore = ALL_IDS.filter(id => id !== 'entry-ja-3' && id !== 'mindset-tree');
    const dom = makeDom({ seen: seenBefore }); await wait(120);
    const d = dom.window.document;
    const badge = (id) => d.querySelector(`[data-entry="${id}"] .new-badge`);
    ok('new returning: ja-3 + mindset badges on', badge('entry-ja-3').hidden === false && badge('mindset-tree').hidden === false);
    ok('new returning: others off', badge('entry-ja-1').hidden === true && badge('entry-en-1').hidden === true);
    dom.window.close();
  }
  // 11. NEW 배지: 새 자료 없음
  {
    const dom = makeDom({ seen: ALL_IDS }); await wait(120);
    const d = dom.window.document;
    ok('new none: all badges off', [...d.querySelectorAll('.new-badge')].every(b => b.hidden === true));
    dom.window.close();
  }

  let fail = 0;
  for (const [n, p] of results) { console.log((p ? 'PASS' : 'FAIL') + ' - ' + n); if (!p) fail++; }
  console.log(`\n${results.length - fail} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
