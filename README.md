# Polyglot

대화·사진·노트에서 모은 언어별 레퍼런스.

- 🇯🇵 일본어: 동사 て형(1·2·3류), 형용사(い/な), 〜たい/〜たくない
- 🇬🇧 영어: 준비 중
- 🇫🇷 프랑스어: 준비 중

모바일 우선. 탭으로 언어 전환, 언어별 자료 목록 → 아코디언 상세.

🌐 https://sidebatch.github.io/polyglot/

## 구조

```
src/           소스 (직접 수정하는 곳)
  index.html   마크업 (탭·패널은 JS가 생성)
  styles.css   스타일
  i18n.js      콘텐츠 언어 8개 + UI 번역 9개 (ko/ja/en/fr/ru/es/de/zh/ar)
  app.js       탭/아코디언/UI언어 로직
docs/          빌드 결과물 (배포본, Pages가 여기서 서빙)
build.mjs      빌드 스크립트 (esbuild로 압축 후 docs/index.html 생성)
```

## 빌드 & 배포

```sh
node build.mjs   # docs/index.html 재생성
```

수정 → 빌드 → 커밋 → 푸시 순서로 작업. Pages는 `main` 브랜치의 `docs/` 폴더를 서빙한다.
배포본은 압축되어 있어 소스 보기로는 원본 코드를 바로 가져가기 어렵다.

## PWA

`manifest.webmanifest` + `sw.js` + 아이콘 포함. 폰 브라우저에서
'홈 화면에 추가'로 설치하면 단독 앱처럼 실행되고 오프라인에서도 열린다.
아이콘은 `src/icons/`에서 PIL로 생성 (빌드 시 `docs/icons/`로 복사).
