import proxy from 'http-proxy-middleware';

import { join } from 'path';
import { urlencoded } from 'body-parser';
import { existsSync, readFileSync, writeFileSync } from 'fs';

async function addKeys(language, ns, keys) {
  if (keys['_t'] !== undefined) {
    delete keys['_t'];
  }
  var languagePath = join(process.env.LOCALES_LOCATION, `${language}/${ns}.json`);
  var fileKeys = keys;
  if (existsSync(languagePath)) {
    var readJson = JSON.parse(readFileSync(languagePath, 'utf8'));
    fileKeys = { ...fileKeys, ...readJson };
  }
  writeFileSync(languagePath, JSON.stringify(fileKeys, null, 2));
}

export default function(app) {
  app.use(proxy('/api', { target: process.env.API_URL, changeOrigin: true }));
  app.use('/locales/add/:language/:ns', urlencoded({ extended: true }), function(req, res, next) {
    const { language, ns } = req.params;
    addKeys(language, ns, req.body);
    next();
  });
}
