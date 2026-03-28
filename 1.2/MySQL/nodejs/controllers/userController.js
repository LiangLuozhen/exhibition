const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { secret, expiresIn } = require('../config/jwt');

// 注册
exports.register = async (req, res) => {
  try {
    const { nickname, phone, password } = req.body;
    if (!nickname || !phone || !password) {
      return res.status(400).json({ code: 400, message: '昵称、手机号、密码不能为空' });
    }

    // 检查手机号是否已存在
    const [existRows] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existRows.length > 0) {
      return res.status(400).json({ code: 400, message: '手机号已注册' });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (nickname, phone, password) VALUES (?, ?, ?)',
      [nickname, phone, hashedPassword]
    );

    res.json({ code: 0, message: '注册成功', data: { userId: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ code: 400, message: '手机号和密码不能为空' });
    }

    // 查询用户
    const [rows] = await pool.query('SELECT id, nickname, phone, password FROM users WHERE phone = ?', [phone]);
    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' });
    }

    const user = rows[0];
    // 比对密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, nickname: user.nickname },
      secret,
      { expiresIn }
    );

    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};