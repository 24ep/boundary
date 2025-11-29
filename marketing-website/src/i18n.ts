import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import thTranslations from './locales/th.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  th: {
    translation: thTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    saveMissing: true,
    parseMissingKeyHandler: (key) => `No translation found: ${key}`,
    
    detection: {
      order: ['navigator', 'htmlTag', 'cookie', 'localStorage', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18nextLng',
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n; 