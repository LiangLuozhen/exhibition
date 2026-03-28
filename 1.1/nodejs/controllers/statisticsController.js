const pool = require('../config/db');

// 获取各省份展览数量
exports.getProvinceStats = async (req, res) => {
  try {
    const locale = req.locale;
    const provinceField = locale === 'zh' ? 'province_cn' : 'province_en';

    const sql = `
      SELECT ${provinceField} AS province, COUNT(*) AS count
      FROM detailData
      GROUP BY ${provinceField}
      ORDER BY count DESC
    `;
    const [rows] = await pool.query(sql);
    res.json({ code: 0, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取某省份下各城市展览数量
exports.getCityStats = async (req, res) => {
  try {
    const { province } = req.query;
    const locale = req.locale;

    if (!province) {
      return res.status(400).json({ code: 400, message: '缺少省份参数' });
    }

    const provinceField = locale === 'zh' ? 'province_cn' : 'province_en';
    const cityField = locale === 'zh' ? 'city_cn' : 'city_en';

    const sql = `
      SELECT ${cityField} AS city, COUNT(*) AS count
      FROM detailData
      WHERE ${provinceField} = ?
      GROUP BY ${cityField}
      ORDER BY count DESC
    `;
    const [rows] = await pool.query(sql, [province]);
    res.json({ code: 0, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};