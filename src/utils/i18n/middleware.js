// utils/i18n/middleware.js
const SUPPORTED_LANGUAGES = ['zh-CN', 'en-US'];
const DEFAULT_LANGUAGE = 'zh-CN';

function detectLocale(req, res, next) {
  let locale = DEFAULT_LANGUAGE;

  if (req.query.lang && SUPPORTED_LANGUAGES.includes(req.query.lang)) {
    locale = req.query.lang;
  } else if (req.headers['x-language'] && SUPPORTED_LANGUAGES.includes(req.headers['x-language'])) {
    locale = req.headers['x-language'];
  } else if (req.headers['accept-language']) {
    const matched = req.headers['accept-language']
      .split(',')
      .map(lang => lang.trim().split(';')[0])
      .find(lang => SUPPORTED_LANGUAGES.includes(lang));
    if (matched) {
      locale = matched;
    }
  }

  req.locale = locale;
  next();
}

module.exports = { detectLocale };