// 从 Accept-Language 头解析语言，默认为中文
module.exports = (req, res, next) => {
  let lang = req.headers['accept-language'] || 'zh-CN';
  if (lang.startsWith('zh')) {
    req.locale = 'zh';
  } else if (lang.startsWith('en')) {
    req.locale = 'en';
  } else {
    req.locale = 'zh'; // 默认中文
  }
  next();
};
