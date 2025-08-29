
// const fs = require('fs');
// const path = require('path');
// const { detectLocale } = require('./middleware'); // 中间件

// // 加载所有语言包
// const locales = {};
// const localeFiles = fs.readdirSync(__dirname + '/locales');
// localeFiles.forEach(file => {
//   const locale = file.replace('.json', '');
//   locales[locale] = require(`./locales/${file}`);
// });

// // 默认语言
// const DEFAULT_LOCALE = 'zh-CN';

// /**
//  * 翻译函数
//  * @param {string} key - 语言键
//  * @param {string} locale - 语言代码，如 'en-US'
//  * @returns {string}
//  */
// function t(key, locale = DEFAULT_LOCALE) {
//   const lang = locales[locale] || locales[DEFAULT_LOCALE];
//   return lang[key] || key; // 找不到返回 key
// }

// module.exports = { t, detectLocale, locales, DEFAULT_LOCALE };


const fs = require('fs');
const path = require('path');
const { detectLocale } = require('./middleware');

// 正确获取语言包目录路径（使用path.resolve避免相对路径问题）
const localesDir = path.resolve(__dirname, 'locales');

// 加载所有语言包
const locales = {};
try {
  const localeFiles = fs.readdirSync(localesDir);

  localeFiles.forEach(file => {
    // 只处理json文件
    if (path.extname(file) === '.json') {
      const locale = path.basename(file, '.json'); // 提取文件名（不含扩展名）
      const filePath = path.join(localesDir, file);

      // 安全加载JSON文件
      try {
        locales[locale] = require(filePath);
        console.log(`Loaded locale: ${locale}`);
      } catch (err) {
        console.error(`Failed to load locale file ${file}:`, err.message);
      }
    }
  });
} catch (err) {
  console.error('Failed to read locales directory:', err.message);
}

// 默认语言
const DEFAULT_LOCALE = 'zh-CN';

/**
 * 翻译函数
 * @param {string} key - 语言键
 * @param {string} locale - 语言代码，如 'en-US'
 * @param {Object} replacements - 替换变量（可选）
 * @returns {string} 翻译后的文本
 */
function t(key, locale = DEFAULT_LOCALE, replacements = {}) {
  // 查找语言包，找不到则使用默认语言
  const lang = locales[locale] || locales[DEFAULT_LOCALE] || {};

  // 找不到对应翻译时返回原始key
  let text = lang[key] || key;

  // 替换文本中的变量（如 {{count}}）
  Object.keys(replacements).forEach(prop => {
    text = text.replace(new RegExp(`{{${prop}}}`, 'g'), replacements[prop]);
  });

  return text;
}

module.exports = {
  t,
  detectLocale,
  DEFAULT_LOCALE,
  availableLocales: Object.keys(locales)
};
