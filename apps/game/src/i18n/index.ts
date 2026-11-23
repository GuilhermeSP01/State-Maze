import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

const resources = {
  en: { translation: en },
  'pt-BR': { translation: ptBR satisfies typeof en },
};

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = i18n.resolvedLanguage ?? language;
});

export const i18nReady = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'pt-BR'],
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'state-maze.language',
      caches: ['localStorage'],
      convertDetectedLanguage: (language) =>
        language.toLowerCase().split('-')[0] === 'pt' ? 'pt-BR' : language,
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
