/* Polyglot i18n — 콘텐츠 언어 목록 + 인터페이스 번역.
   자료(콘텐츠) 자체는 건드리지 않고, 껍데기(UI 문구)만 번역한다.
   UI 언어 추가 = UI_LANGS·UI_LANG_NAMES·UI_STRINGS에 한 줄씩 추가. */
var POLYGLOT_LANGS = [
  {code:'ja', flag:'🇯🇵', accent:'#b3402e', hasContent:true,
   names:{ko:'일본어',ja:'日本語',en:'Japanese',fr:'Japonais',ru:'Японский',es:'Japonés',de:'Japanisch',zh:'日语',ar:'اليابانية'}},
  {code:'en', flag:'🇬🇧', accent:'#274b73',
   names:{ko:'영어',ja:'英語',en:'English',fr:'Anglais',ru:'Английский',es:'Inglés',de:'Englisch',zh:'英语',ar:'الإنجليزية'}},
  {code:'fr', flag:'🇫🇷', accent:'#3a5fb0',
   names:{ko:'프랑스어',ja:'フランス語',en:'French',fr:'Français',ru:'Французский',es:'Francés',de:'Französisch',zh:'法语',ar:'الفرنسية'}},
  {code:'ru', flag:'🇷🇺', accent:'#6e4a7e',
   names:{ko:'러시아어',ja:'ロシア語',en:'Russian',fr:'Russe',ru:'Русский',es:'Ruso',de:'Russisch',zh:'俄语',ar:'الروسية'}},
  {code:'es', flag:'🇪🇸', accent:'#c2701e',
   names:{ko:'스페인어',ja:'スペイン語',en:'Spanish',fr:'Espagnol',ru:'Испанский',es:'Español',de:'Spanisch',zh:'西班牙语',ar:'الإسبانية'}},
  {code:'de', flag:'🇩🇪', accent:'#4d4d4d',
   names:{ko:'독일어',ja:'ドイツ語',en:'German',fr:'Allemand',ru:'Немецкий',es:'Alemán',de:'Deutsch',zh:'德语',ar:'الألمانية'}},
  {code:'zh', flag:'🇨🇳', accent:'#c9a227',
   names:{ko:'중국어',ja:'中国語',en:'Chinese',fr:'Chinois',ru:'Китайский',es:'Chino',de:'Chinesisch',zh:'中文',ar:'الصينية'}},
  {code:'ar', flag:'🇸🇦', accent:'#1e7a5a',
   names:{ko:'아랍어',ja:'アラビア語',en:'Arabic',fr:'Arabe',ru:'Арабский',es:'Árabe',de:'Arabisch',zh:'阿拉伯语',ar:'العربية'}}
];

var UI_LANGS = ['ko','en','ja','fr','ru','es','de','zh','ar'];
var UI_LANG_NAMES = {ko:'한국어',ja:'日本語',en:'English',fr:'Français',ru:'Русский',es:'Español',de:'Deutsch',zh:'中文',ar:'العربية'};

var UI_STRINGS = {
  ko: {
    hero_sub: '대화·사진·노트에서 모은 언어별 레퍼런스',
    soon_title: '{lang} 노트 준비 중',
    soon_desc: '정리할 {lang} 노트가 생기면<br>이 탭에 같은 형식으로 추가됩니다.',
    footer_tag: 'Polyglot · 언어별 레퍼런스',
    topbtn: '맨 위로'
  },
  ja: {
    hero_sub: '会話・写真・ノートから集めた言語別レファレンス',
    soon_title: '{lang}ノート準備中',
    soon_desc: '{lang}のノートができたら<br>このタブに同じ形式で追加されます。',
    footer_tag: 'Polyglot · 言語別レファレンス',
    topbtn: 'トップへ'
  },
  en: {
    hero_sub: 'A language reference collected from chats, photos, and notes',
    soon_title: '{lang} notes coming soon',
    soon_desc: 'Once {lang} notes are ready,<br>they will appear here in the same format.',
    footer_tag: 'Polyglot · A language reference',
    topbtn: 'Back to top'
  },
  fr: {
    hero_sub: 'Un référentiel de langues issu de conversations, photos et notes',
    soon_title: 'Notes de {lang} en préparation',
    soon_desc: 'Quand les notes de {lang} seront prêtes,<br>elles apparaîtront ici dans le même format.',
    footer_tag: 'Polyglot · Référentiel par langue',
    topbtn: 'Haut de page'
  },
  ru: {
    hero_sub: 'Языковой справочник из переписок, фото и заметок',
    soon_title: 'Заметки: {lang} — скоро',
    soon_desc: 'Когда появятся заметки: {lang},<br>они будут добавлены сюда в том же формате.',
    footer_tag: 'Polyglot · Справочник по языкам',
    topbtn: 'Наверх'
  },
  es: {
    hero_sub: 'Una referencia de idiomas recopilada de chats, fotos y notas',
    soon_title: 'Notas de {lang} próximamente',
    soon_desc: 'Cuando las notas de {lang} estén listas,<br>aparecerán aquí en el mismo formato.',
    footer_tag: 'Polyglot · Referencia por idiomas',
    topbtn: 'Volver arriba'
  },
  de: {
    hero_sub: 'Eine Sprachenreferenz aus Chats, Fotos und Notizen',
    soon_title: '{lang}-Notizen in Vorbereitung',
    soon_desc: 'Sobald {lang}-Notizen fertig sind,<br>erscheinen sie hier im gleichen Format.',
    footer_tag: 'Polyglot · Sprachenreferenz',
    topbtn: 'Nach oben'
  },
  zh: {
    hero_sub: '从对话、照片和笔记中收集的语言参考',
    soon_title: '{lang}笔记准备中',
    soon_desc: '{lang}笔记整理好后，<br>将以相同格式添加到此标签页。',
    footer_tag: 'Polyglot · 语言参考',
    topbtn: '回到顶部'
  },
  ar: {
    hero_sub: 'مرجع لغات جُمع من المحادثات والصور والملاحظات',
    soon_title: 'ملاحظات {lang} قريبًا',
    soon_desc: 'عندما تصبح ملاحظات {lang} جاهزة،<br>ستظهر هنا بالتنسيق نفسه.',
    footer_tag: 'Polyglot · مرجع اللغات',
    topbtn: 'العودة إلى الأعلى'
  }
};
