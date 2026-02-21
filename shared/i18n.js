/**
 * Shared i18n module for Daily Micro Games.
 * 
 * Usage in games:
 *   <script src="/shared/i18n.js"></script>
 *   <script>
 *     const TRANSLATIONS = { de: {...}, en: {...}, it: {...}, es: {...}, fr: {...} };
 *     const { t, lang, onLangChange } = initI18n(TRANSLATIONS);
 *   </script>
 * 
 * Each translatable element uses data-i18n="key" attribute.
 * Call translatePage() after DOM is ready.
 */

const SUPPORTED_LANGS = ['de', 'en', 'it', 'es', 'fr'];
const LANG_LABELS = { de: '🇩🇪', en: '🇬🇧', it: '🇮🇹', es: '🇪🇸', fr: '🇫🇷' };

function getStoredLang() {
  try { return localStorage.getItem('dg-lang'); } catch { return null; }
}

function setStoredLang(lang) {
  try { localStorage.setItem('dg-lang', lang); } catch {}
}

function detectLang() {
  const params = new URLSearchParams(location.search);
  if (params.has('lang') && SUPPORTED_LANGS.includes(params.get('lang'))) return params.get('lang');
  const stored = getStoredLang();
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(nav)) return nav;
  return 'de';
}

function initI18n(translations) {
  let currentLang = detectLang();
  setStoredLang(currentLang);
  const listeners = [];

  function t(key) {
    const dict = translations[currentLang] || translations['de'] || {};
    return dict[key] !== undefined ? dict[key] : (translations['de']?.[key] ?? key);
  }

  function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
  }

  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    setStoredLang(lang);
    document.documentElement.lang = lang;
    translatePage();
    updateSelectorHighlight();
    listeners.forEach(fn => fn(lang));
  }

  function onLangChange(fn) { listeners.push(fn); }

  function updateSelectorHighlight() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  function injectLangSelector() {
    const bar = document.querySelector('.back-bar');
    if (!bar) return;
    
    // Make back-bar flex
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'space-between';

    const selector = document.createElement('div');
    selector.className = 'lang-selector';
    selector.style.cssText = 'display:flex;gap:4px;';

    SUPPORTED_LANGS.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'lang-btn' + (lang === currentLang ? ' active' : '');
      btn.dataset.lang = lang;
      btn.textContent = LANG_LABELS[lang];
      btn.title = lang.toUpperCase();
      btn.style.cssText = 'background:none;border:1px solid transparent;border-radius:4px;cursor:pointer;font-size:1.1rem;padding:2px 5px;opacity:0.5;transition:opacity 0.15s;';
      btn.addEventListener('click', () => setLang(lang));
      selector.appendChild(btn);
    });

    bar.appendChild(selector);
    updateSelectorHighlight();

    // Style for active state
    const style = document.createElement('style');
    style.textContent = '.lang-btn.active{opacity:1!important;border-color:#ffcc00!important;} .lang-btn:hover{opacity:0.8;}';
    document.head.appendChild(style);
  }

  // Auto-inject on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { injectLangSelector(); translatePage(); });
  } else {
    injectLangSelector();
    translatePage();
  }

  document.documentElement.lang = currentLang;

  return { t, lang: () => currentLang, setLang, onLangChange, translatePage };
}
