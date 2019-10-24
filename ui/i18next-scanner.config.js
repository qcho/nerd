module.exports = {
  input: [
    'src/trainer/**/*.{js,jsx,ts,tsx}',
    // Use ! to filter out files or directories
    '!src/trainer/**/*.spec.{js,jsx,ts,tsx}',
    '!src/trainer/i18n/**',
    '!**/node_modules/**',
  ],
  output: './public/locales/',
  options: {
    debug: false,
    func: {
      list: ['i18next.t', 'i18n.t', 't'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    lngs: ['en', 'es'],
    defaultLng: 'en',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: '{{lng}}/{{ns}}.json',
      savePath: '{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: false,
    keySeparator: false,
  },
};
