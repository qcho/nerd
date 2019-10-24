import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { moment } from '../helpers/utils';

import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const isDev = process.env.NODE_ENV === 'development';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ['cookie', 'localStorage'],
    },
    fallbackLng: 'es',
    saveMissing: isDev,
    debug: isDev,
  });

i18n.on('languageChanged', lng => moment.locale(lng));

export default i18n;
