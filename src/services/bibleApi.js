import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bible-api.deno.dev/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= 3) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    const backoff = new Promise((resolve) => {
      setTimeout(() => resolve(), config.__retryCount * 1000);
    });

    await backoff;
    return api(config);
  }
);

const displayNames = {
  'genesis': 'Génesis',
  'exodus': 'Éxodo',
  'exodo': 'Éxodo',
  'leviticus': 'Levítico',
  'levitico': 'Levítico',
  'numbers': 'Números',
  'numeros': 'Números',
  'deuteronomy': 'Deuteronomio',
  'deuteronomio': 'Deuteronomio',
  'joshua': 'Josué',
  'josue': 'Josué',
  'judges': 'Jueces',
  'jueces': 'Jueces',
  'ruth': 'Rut',
  'rut': 'Rut',
  '1 samuel': '1-Samuel',
  '1-samuel': '1-Samuel',
  '2 samuel': '2-Samuel',
  '2-samuel': '2-Samuel',
  '1 kings': '1-Reyes',
  '1-reyes': '1-Reyes',
  '2 kings': '2-Reyes',
  '2-reyes': '2-Reyes',
  '1 chronicles': '1-Crónicas',
  '1-cronicas': '1-Crónicas',
  '2 chronicles': '2-Crónicas',
  '2-cronicas': '2-Crónicas',
  'ezra': 'Esdras',
  'esdras': 'Esdras',
  'nehemiah': 'Nehemías',
  'nehemias': 'Nehemías',
  'esther': 'Ester',
  'ester': 'Ester',
  'job': 'Job',
  'psalms': 'Salmos',
  'salmos': 'Salmos',
  'proverbs': 'Proverbios',
  'proverbios': 'Proverbios',
  'ecclesiastes': 'Eclesiastés',
  'eclesiastes': 'Eclesiastés',
  'song of solomon': 'Cantares',
  'cantares': 'Cantares',
  'isaiah': 'Isaías',
  'isaias': 'Isaías',
  'jeremiah': 'Jeremías',
  'jeremias': 'Jeremías',
  'lamentations': 'Lamentaciones',
  'lamentaciones': 'Lamentaciones',
  'ezekiel': 'Ezequiel',
  'ezequiel': 'Ezequiel',
  'daniel': 'Daniel',
  'hosea': 'Oseas',
  'oseas': 'Oseas',
  'joel': 'Joel',
  'amos': 'Amós',
  'amos': 'Amós',
  'obadiah': 'Abdías',
  'abdias': 'Abdías',
  'jonah': 'Jonás',
  'jonas': 'Jonás',
  'micah': 'Miqueas',
  'miqueas': 'Miqueas',
  'nahum': 'Nahúm',
  'nahum': 'Nahúm',
  'habakkuk': 'Habacuc',
  'habacuc': 'Habacuc',
  'zephaniah': 'Sofonías',
  'sofonias': 'Sofonías',
  'haggai': 'Hageo',
  'hageo': 'Hageo',
  'zechariah': 'Zacarías',
  'zacarias': 'Zacarías',
  'malachi': 'Malaquías',
  'malaquias': 'Malaquías',
  'matthew': 'Mateo',
  'mateo': 'Mateo',
  'mark': 'Marcos',
  'marcos': 'Marcos',
  'luke': 'Lucas',
  'lucas': 'Lucas',
  'john': 'Juan',
  'juan': 'Juan',
  'acts': 'Hechos',
  'hechos': 'Hechos',
  'romans': 'Romanos',
  'romanos': 'Romanos',
  '1 corinthians': '1-Corintios',
  '1-corintios': '1-Corintios',
  '2 corinthians': '2-Corintios',
  '2-corintios': '2-Corintios',
  'galatians': 'Gálatas',
  'galatas': 'Gálatas',
  'ephesians': 'Efesios',
  'efesios': 'Efesios',
  'philippians': 'Filipenses',
  'filipenses': 'Filipenses',
  'colossians': 'Colosenses',
  'colosenses': 'Colosenses',
  '1 thessalonians': '1-Tesalonicenses',
  '1-tesalonicenses': '1-Tesalonicenses',
  '2 thessalonians': '2-Tesalonicenses',
  '2-tesalonicenses': '2-Tesalonicenses',
  '1 timothy': '1-Timoteo',
  '1-timoteo': '1-Timoteo',
  '2 timothy': '2-Timoteo',
  '2-timoteo': '2-Timoteo',
  'titus': 'Tito',
  'tito': 'Tito',
  'philemon': 'Filemón',
  'filemon': 'Filemón',
  'hebrews': 'Hebreos',
  'hebreos': 'Hebreos',
  'james': 'Santiago',
  'santiago': 'Santiago',
  '1 peter': '1-Pedro',
  '1-pedro': '1-Pedro',
  '2 peter': '2-Pedro',
  '2-pedro': '2-Pedro',
  '1 john': '1-Juan',
  '1-juan': '1-Juan',
  '2 john': '2-Juan',
  '2-juan': '2-Juan',
  '3 john': '3-Juan',
  '3-juan': '3-Juan',
  'jude': 'Judas',
  'judas': 'Judas',
  'revelation': 'Apocalipsis',
  'apocalipsis': 'Apocalipsis',
};

export function formatBookName(book) {
  if (!book) return '';
  const lower = book.toLowerCase();
  return displayNames[lower] || book.charAt(0).toUpperCase() + book.slice(1);
}

const bookGroups = {
  'Pentateuco': ['Genesis', 'Exodo', 'Levitico', 'Numeros', 'Deuteronomio'],
  'Históricos': ['Josue', 'Jueces', 'Rut', '1-Samuel', '2-Samuel', '1-Reyes', '2-Reyes', '1-Cronicas', '2-Cronicas', 'Esdras', 'Nehemias', 'Ester'],
  'Poéticos': ['Job', 'Salmos', 'Proverbios', 'Eclesiastes', 'Cantares'],
  'Profetas Mayores': ['Isaias', 'Jeremias', 'Lamentaciones', 'Ezequiel', 'Daniel'],
  'Profetas Menores': ['Oseas', 'Joel', 'Amos', 'Abdias', 'Jonas', 'Miqueas', 'Nahum', 'Habacuc', 'Sofonias', 'Hageo', 'Zacarias', 'Malaquias'],
  'Evangelios': ['Mateo', 'Marcos', 'Lucas', 'Juan'],
  'Historia': ['Hechos'],
  'Cartas Paulinas': ['Romanos', '1-Corintios', '2-Corintios', 'Galatas', 'Efesios', 'Filipenses', 'Colosenses', '1-Tesalonicenses', '2-Tesalonicenses', '1-Timoteo', '2-Timoteo', 'Tito', 'Filemon'],
  'Cartas Generales': ['Hebreos', 'Santiago', '1-Pedro', '2-Pedro', '1-Juan', '2-Juan', '3-Juan', 'Judas'],
  'Profecía': ['Apocalipsis'],
};

export const bibleBooks = Object.entries(bookGroups).map(([group, names]) => ({
  group,
  books: names.map((n) => n.toLowerCase()),
}));

let cachedBookList = null;
let cachedBookChapters = null;

async function fetchBookList() {
  if (cachedBookList) return cachedBookList;
  const { data } = await api.get('/books');
  cachedBookList = data;
  cachedBookChapters = {};
  for (const book of data) {
    cachedBookChapters[book.names[0].toLowerCase()] = book.chapters;
  }
  return data;
}

export const bookChapters = new Proxy({}, {
  get(_target, prop) {
    if (cachedBookChapters && cachedBookChapters[prop] !== undefined) {
      return cachedBookChapters[prop];
    }
    return 0;
  },
});

export async function getBooks() {
  const books = await fetchBookList();
  const grouped = {};

  for (const book of books) {
    const name = book.names[0];
    let found = false;
    for (const [group, names] of Object.entries(bookGroups)) {
      if (names.includes(name)) {
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(name.toLowerCase());
        found = true;
        break;
      }
    }
  }

  return Object.entries(grouped).map(([group, booksArr]) => ({
    group,
    books: booksArr,
  }));
}

export async function getChapters(bookId) {
  await fetchBookList();
  const chapters = cachedBookChapters[bookId.toLowerCase()] || 0;
  if (!chapters) return Promise.reject(new Error('Libro no encontrado'));
  return Array.from({ length: chapters }, (_, i) => i + 1);
}

export async function getVerses(bookId, chapter) {
  const response = await api.get(`/read/rv1960/${bookId}/${chapter}`);
  return parseChapterResponse(response.data, bookId);
}

export async function getPassage(bookId, chapter, startVerse, endVerse) {
  const sv = Number(startVerse);
  const ev = Number(endVerse);
  const verseParam = (ev && ev !== sv) ? `${sv}-${ev}` : String(sv);
  const response = await api.get(`/read/rv1960/${bookId}/${chapter}/${verseParam}`);
  return parseVerseResponse(response.data, bookId, chapter);
}

export async function searchVerses(query, version = 'rv1960') {
  const { data } = await api.get(`/read/${version}/search`, {
    params: { q: query, take: 20 },
  });
  return data;
}

export const verseOfDayList = [
  { book: 'juan', chapter: 3, verse: 16, text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna.' },
  { book: 'jeremías', chapter: 29, verse: 11, text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.' },
  { book: 'salmos', chapter: 23, verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
  { book: 'romanos', chapter: 8, verse: 28, text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.' },
  { book: 'proverbios', chapter: 3, verse: 5, text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.' },
  { book: 'mateo', chapter: 11, verse: 28, text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.' },
  { book: 'isaías', chapter: 41, verse: 10, text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.' },
  { book: 'filipenses', chapter: 4, verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' },
  { book: 'salmos', chapter: 91, verse: 1, text: 'El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.' },
  { book: 'josué', chapter: 1, verse: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.' },
  { book: 'isaías', chapter: 40, verse: 31, text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.' },
  { book: 'mateo', chapter: 6, verse: 33, text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.' },
];

export function getVerseOfDay() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % verseOfDayList.length;
  return verseOfDayList[index];
}

function parseChapterResponse(data, bookId) {
  if (!data || !data.vers) return null;
  const displayName = formatBookName(bookId);
  return {
    reference: `${displayName} ${data.chapter}`,
    text: data.vers.map((v) => v.verse).join(' '),
    verses: data.vers.map((v) => ({
      book_name: displayName,
      book_id: bookId,
      chapter: data.chapter,
      verse: v.number,
      text: v.verse,
    })),
    translation_name: 'Reina Valera 1960',
    translation: 'rv1960',
    book: displayName,
    chapter: data.chapter,
  };
}

function parseVerseResponse(data, bookId, chapter) {
  const displayName = formatBookName(bookId);
  const verses = Array.isArray(data) ? data : [data];

  if (!verses.length || !verses[0].verse) return null;

  return {
    reference: verses.length === 1
      ? `${displayName} ${chapter}:${verses[0].number}`
      : `${displayName} ${chapter}:${verses[0].number}-${verses[verses.length - 1].number}`,
    text: verses.map((v) => v.verse).join(' '),
    verses: verses.map((v) => ({
      book_name: displayName,
      book_id: bookId,
      chapter,
      verse: v.number,
      text: v.verse,
    })),
    translation_name: 'Reina Valera 1960',
    translation: 'rv1960',
    book: displayName,
    chapter,
  };
}

export function getShareText(reference, text) {
  const snippet = text.length > 200 ? text.substring(0, 200) + '...' : text;
  return `${reference}: "${snippet}" — Página Bíblica`;
}
