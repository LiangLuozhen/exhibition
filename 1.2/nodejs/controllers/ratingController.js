const pool = require('../config/db');

// 提交/更新评分评论
exports.upsertRating = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!exhibitionId) {
      return res.status(400).json({ code: 400, message: '展览ID不能为空' });
    }
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ code: 400, message: '评分必须在1-5之间' });
    }

    // 检查展览是否存在
    const [exhRows] = await pool.query('SELECT id FROM detailData WHERE id = ?', [exhibitionId]);
    if (exhRows.length === 0) {
      return res.status(404).json({ code: 404, message: '展览不存在' });
    }

    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 实现覆盖
    const sql = `
      INSERT INTO ratings (user_id, exhibition_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        comment = VALUES(comment)
    `;
    await pool.query(sql, [userId, exhibitionId, rating || null, comment || null]);

    res.json({ code: 0, message: '评价成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取某个展览的所有评分评论（公开）
exports.getExhibitionRatings = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const locale = req.locale;

    if (!exhibitionId) {
      return res.status(400).json({ code: 400, message: '展览ID不能为空' });
    }

    // 查询评分评论，并关联用户表获取用户昵称
    const sql = `
      SELECT 
        r.user_id,
        u.nickname,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at
      FROM ratings r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.exhibition_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.query(sql, [exhibitionId]);

    // 计算平均分和总评论数（可选，但可以单独提供）
    const statsSql = `
      SELECT 
        COUNT(*) AS total_comments,
        AVG(rating) AS avg_rating
      FROM ratings
      WHERE exhibition_id = ?
    `;
    const [statsRows] = await pool.query(statsSql, [exhibitionId]);
    const stats = statsRows[0] || { total_comments: 0, avg_rating: null };

    res.json({
      code: 0,
      data: {
        list: rows,
        total_comments: stats.total_comments,
        avg_rating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取当前用户对某展览的评分评论（用于前端预填）
exports.getUserRating = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const userId = req.user.id;

    const sql = 'SELECT rating, comment FROM ratings WHERE user_id = ? AND exhibition_id = ?';
    const [rows] = await pool.query(sql, [userId, exhibitionId]);

    if (rows.length === 0) {
      return res.json({ code: 0, data: null });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取当前用户的所有评分评论（个人中心）
exports.getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const locale = req.locale;

    const nameField = locale === 'zh' ? 'd.name_cn' : 'd.name_en';
    const provinceField = locale === 'zh' ? 'd.province_cn' : 'd.province_en';
    const cityField = locale === 'zh' ? 'd.city_cn' : 'd.city_en';

    const sql = `
      SELECT 
        r.exhibition_id,
        ${nameField} AS exhibition_name,
        ${provinceField} AS province,
        ${cityField} AS city,
        d.picture_url AS pictureUrl,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at
      FROM ratings r
      INNER JOIN detailData d ON r.exhibition_id = d.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.query(sql, [userId]);

    res.json({ code: 0, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};