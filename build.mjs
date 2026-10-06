// Polyglot build script — src/ → docs/ (배포본)
// 사용법: node build.mjs
// - src/app.js, src/styles.css를 esbuild로 minify 후 src/index.html에 인라인
// - HTML 주석 제거 + 공백 압축 → docs/index.html (GitHub Pages 배포 대상)
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';

mkdirSync('docs', { recursive: true });

execSync('npx -y esbuild src/app.js --minify --outfile=/tmp/pg_app.min.js', { stdio: 'inherit' });
execSync('npx -y esbuild src/styles.css --minify --outfile=/tmp/pg_styles.min.css', { stdio: 'inherit' });

let html = readFileSync('src/index.html', 'utf8');
const js = readFileSync('/tmp/pg_app.min.js', 'utf8').trim();
const css = readFileSync('/tmp/pg_styles.min.css', 'utf8').trim();

html = html.replace(
  '<link rel="stylesheet" href="styles.css">',
  '<style>' + css + '</style>'
);
html = html.replace(
  '<script src="app.js"></script>',
  '<script>' + js + '</script>'
);

// 보수적 HTML 압축: 주석 제거, 태그 사이 공백 제거, 빈 줄 제거
html = html.replace(/<!--[\s\S]*?-->/g, '');
html = html.replace(/>\s+</g, '><');
html = html.split('\n').map((l) => l.trim()).filter((l) => l.length).join('\n');

writeFileSync('docs/index.html', html);
console.log('built docs/index.html — ' + html.length + ' bytes');

// 정적 애셋 복사 (PWA)
cpSync('src/manifest.webmanifest', 'docs/manifest.webmanifest');
cpSync('src/icons', 'docs/icons', { recursive: true });
var sw = readFileSync('src/sw.js', 'utf8');
var ver = 'v1';
try { ver = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch (e) {}
writeFileSync('docs/sw.js', sw.replace('__VERSION__', ver));
console.log('copied manifest, icons, sw.js (' + ver + ')');
