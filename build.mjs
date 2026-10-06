// Polyglot build script — src/ → docs/ (배포본)
// 사용법: node build.mjs
// - src/app.js, src/styles.css를 esbuild로 minify 후 src/index.html에 인라인
// - HTML 주석 제거 + 공백 압축 → docs/index.html (GitHub Pages 배포 대상)
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';

mkdirSync('docs', { recursive: true });

var ver = 'v1';
try { ver = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch (e) {}
writeFileSync('docs/version.txt', ver);

// app.js에 빌드 버전 주입 (업데이트 폴링용)
var appSrc = readFileSync('src/app.js', 'utf8').replace('__APP_VERSION__', ver);
writeFileSync('/tmp/pg_app_src.js', appSrc);

var jsFiles = ['src/i18n.js', '/tmp/pg_app_src.js'];
var jsMin = jsFiles.map(function(f, i){
  var out = '/tmp/pg_s' + i + '.min.js';
  execSync('npx -y esbuild ' + f + ' --minify --outfile=' + out, { stdio: 'inherit' });
  return readFileSync(out, 'utf8').trim();
}).join('\n');
execSync('npx -y esbuild src/styles.css --minify --outfile=/tmp/pg_styles.min.css', { stdio: 'inherit' });

let html = readFileSync('src/index.html', 'utf8');
const css = readFileSync('/tmp/pg_styles.min.css', 'utf8').trim();

html = html.replace(
  '<link rel="stylesheet" href="styles.css">',
  '<style>' + css + '</style>'
);
html = html.replace(
  /<script src="i18n\.js"><\/script>\s*<script src="app\.js"><\/script>/,
  '<script>' + jsMin + '</script>'
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
writeFileSync('docs/sw.js', sw.replace('__VERSION__', ver));
console.log('copied manifest, icons, sw.js (' + ver + ')');
