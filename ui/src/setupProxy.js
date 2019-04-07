const proxy = require("http-proxy-middleware");

const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

async function addKeys(language, ns, keys) {
  if (keys["_t"] !== undefined) {
    delete keys["_t"];
  }
  var languagePath = path.join(process.env.LOCALES_LOCATION, `${language}/${ns}.json`);
  var fileKeys = keys;
  if (fs.existsSync(languagePath)) {
    var readJson = JSON.parse(fs.readFileSync(languagePath, "utf8"));
    fileKeys = {...fileKeys, ...readJson};
  }
  fs.writeFileSync(languagePath, JSON.stringify(fileKeys, null, 2));
}

module.exports = function(app) {
  app.use(
    proxy("/api", { target: process.env.API_URL, changeOrigin: true }),
  );
  app.use("/locales/add/:language/:ns", bodyParser.urlencoded({ extended: true }), function (req, res, next) {
    const { language, ns } = req.params;
    addKeys(language, ns, req.body);
    next();
  });
};
