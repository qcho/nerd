import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-xhr-backend";

const isDev = process.env.NODE_ENV === 'development';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    saveMissing: isDev,
    debug: isDev
  });

export default i18n;
