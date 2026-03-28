const pool = require('../config/db');

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { exhibitionId } = req.body;
    const userId = req.user.id;

    if (!exhibitionId) {
      return res.status(400).json({ code: 400, message: '展览ID不能为空' });
    }

    // 检查展览是否存在
    const [exhRows] = await pool.query('SELECT id FROM detailData WHERE id = ?', [exhibitionId]);
    if (exhRows.length === 0) {
      return res.status(404).json({ code: 404, message: '展览不存在' });
    }

    // 检查是否已收藏
    const [favRows] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND exhibition_id = ?', [userId, exhibitionId]);
    if (favRows.length > 0) {
      return res.status(400).json({ code: 400, message: '已经收藏过该展览' });
    }

    await pool.query('INSERT INTO favorites (user_id, exhibition_id) VALUES (?, ?)', [userId, exhibitionId]);
    res.json({ code: 0, message: '收藏成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 取消收藏
exports.removeFavorite = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query('DELETE FROM favorites WHERE user_id = ? AND exhibition_id = ?', [userId, exhibitionId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '未找到该收藏记录' });
    }
    res.json({ code: 0, message: '取消收藏成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取当前用户的收藏列表
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const locale = req.locale;

    // 根据语言选择字段
    const nameField = locale === 'zh' ? 'd.name_cn' : 'd.name_en';
    const provinceField = locale === 'zh' ? 'd.province_cn' : 'd.province_en';
    const cityField = locale === 'zh' ? 'd.city_cn' : 'd.city_en';

    const sql = `
      SELECT 
        d.id,
        ${nameField} AS name,
        d.picture_url AS pictureUrl,
        ${provinceField} AS province,
        ${cityField} AS city,
        d.start_date AS startDate,
        d.end_date AS endDate,
        d.status,
        f.created_at AS favoritedAt
      FROM favorites f
      INNER JOIN detailData d ON f.exhibition_id = d.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await pool.query(sql, [userId]);

    // 添加状态文本
    const statusTextMap = {
      zh: ['未开始', '进行中', '已结束'],
      en: ['Not Started', 'Ongoing', 'Ended']
    };
    const list = rows.map(row => ({
      ...row,
      statusText: statusTextMap[locale][row.status]
    }));

    res.json({ code: 0, data: list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 检查当前用户是否已收藏某展览（可选，前端可用）
exports.checkFavorite = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT 1 FROM favorites WHERE user_id = ? AND exhibition_id = ?', [userId, exhibitionId]);
    res.json({ code: 0, data: { isFavorited: rows.length > 0 } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};