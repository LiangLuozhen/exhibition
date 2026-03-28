const pool = require('../config/db');

// 获取展览列表（支持筛选、分页、随机排序）
exports.getExhibitions = async (req, res) => {
  try {
    const {
      status,
      province,
      city,
      random = 'false',
      limit = 10,
      page = 1,
    } = req.query;

    const locale = req.locale; // 'zh' or 'en'

    // 动态构建 SELECT 字段（根据语言）
    let selectFields = `
      id,
      ${locale === 'zh' ? 'name_cn' : 'name_en'} AS name,
      picture_url AS pictureUrl,
      ${locale === 'zh' ? 'province_cn' : 'province_en'} AS province,
      ${locale === 'zh' ? 'city_cn' : 'city_en'} AS city,
      start_date AS startDate,
      end_date AS endDate,
      status
    `;

    // 构建 WHERE 条件
    const whereConditions = [];
    const params = [];

    if (status !== undefined) {
      whereConditions.push('status = ?');
      params.push(parseInt(status));
    }

    if (province) {
      const provinceField = locale === 'zh' ? 'province_cn' : 'province_en';
      whereConditions.push(`${provinceField} = ?`);
      params.push(province);
    }

    if (city) {
      const cityField = locale === 'zh' ? 'city_cn' : 'city_en';
      whereConditions.push(`${cityField} = ?`);
      params.push(city);
    }

    const whereClause = whereConditions.length
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // 排序：随机排序或按开始时间升序
    let orderClause = '';
    if (random === 'true') {
      orderClause = 'ORDER BY RAND()';
    } else {
      orderClause = 'ORDER BY start_date DESC';
    }

    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pagination = `LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    // 查询总数（用于前端分页）
    const countSql = `
      SELECT COUNT(*) AS total
      FROM detailData
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    // 查询数据
    const dataSql = `
      SELECT ${selectFields}
      FROM detailData
      ${whereClause}
      ${orderClause}
      ${pagination}
    `;
    const [rows] = await pool.query(dataSql, params);

    // 添加状态文本
    const statusTextMap = {
      zh: ['未开始', '进行中', '已结束'],
      en: ['Not Started', 'Ongoing', 'Ended']
    };
    const statusTextList = statusTextMap[locale];

    const list = rows.map(row => ({
      ...row,
      statusText: statusTextList[row.status]
    }));

    res.json({
      code: 0,
      data: {
        total,
        list,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// 获取单个展览详情（修改后）
exports.getExhibitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const locale = req.locale;

    const selectFields = `
      id,
      ${locale === 'zh' ? 'name_cn' : 'name_en'} AS name,
      start_date AS startDate,
      end_date AS endDate,
      ${locale === 'zh' ? 'province_cn' : 'province_en'} AS province,
      ${locale === 'zh' ? 'city_cn' : 'city_en'} AS city,
      ${locale === 'zh' ? 'location_cn' : 'location_en'} AS location,
      ${locale === 'zh' ? 'introduction_cn' : 'introduction_en'} AS introduction,
      picture_url AS pictureUrl,
      status
    `;

    const sql = `SELECT ${selectFields} FROM detailData WHERE id = ?`;
    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '展览不存在' });
    }

    const exhibition = rows[0];
    const statusTextMap = {
      zh: ['未开始', '进行中', '已结束'],
      en: ['Not Started', 'Ongoing', 'Ended']
    };
    exhibition.statusText = statusTextMap[locale][exhibition.status];

    // 获取评分统计
    const [statsRows] = await pool.query(
      'SELECT COUNT(*) AS total_comments, AVG(rating) AS avg_rating FROM ratings WHERE exhibition_id = ?',
      [id]
    );
    const stats = statsRows[0];
    exhibition.totalComments = stats.total_comments || 0;
    exhibition.avgRating = stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : null;

    res.json({ code: 0, data: exhibition });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};