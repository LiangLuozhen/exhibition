const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);
  const token = authHeader?.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    console.log('Decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);   // 打印具体错误原因
    return res.status(401).json({ code: 401, message: '无效的认证令牌' });
  }
};