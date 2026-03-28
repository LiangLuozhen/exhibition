const express = require('express');
const cors = require('cors');
const localeMiddleware = require('./middleware/locale');

const app = express();

// 中间件
app.use(cors());                // 允许跨域（小程序无需严格配置）
app.use(express.json());
app.use(localeMiddleware);      // 解析语言

// 路由
app.use('/api/exhibitions', require('./routes/exhibitions'));
app.use('/api/statistics', require('./routes/statistics'));

app.use('/api/users', require('./routes/users'));        // 新增用户路由
app.use('/api/favorites', require('./routes/favorites')); // 新增收藏路由

app.use('/api/ratings', require('./routes/ratings')); // 新增

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});