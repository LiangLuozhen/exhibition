-- 创建数据库（指定字符集为 utf8mb4，支持 emoji 和所有 Unicode 字符）
CREATE DATABASE IF NOT EXISTS zhanLanData
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE zhanLanData;

-- 创建展览信息表
CREATE TABLE IF NOT EXISTS detailData (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    -- 基本信息
    name_cn VARCHAR(255) NOT NULL COMMENT '展览中文名',
    name_en VARCHAR(255) NOT NULL COMMENT '展览英文名',
    start_date DATE NOT NULL COMMENT '展览开始日期',
    end_date DATE NOT NULL COMMENT '展览结束日期',
    -- 省份
    province_cn VARCHAR(50) NOT NULL COMMENT '省份中文名',
    province_en VARCHAR(50) NOT NULL COMMENT '省份英文名',
    -- 城市
    city_cn VARCHAR(50) NOT NULL COMMENT '城市中文名',
    city_en VARCHAR(50) NOT NULL COMMENT '城市英文名',
    -- 展馆
    location_cn VARCHAR(255) NOT NULL COMMENT '展馆中文名',
    location_en VARCHAR(255) NOT NULL COMMENT '展馆英文名',
    -- 介绍（可能较长，用 TEXT）
    introduction_cn TEXT NOT NULL COMMENT '展览中文介绍',
    introduction_en TEXT NOT NULL COMMENT '展览英文介绍',
    -- 图片 URL
    picture_url VARCHAR(512) NOT NULL COMMENT '展览图片URL',
    -- 状态字段（由事件每日更新）
    status TINYINT NOT NULL DEFAULT 0 COMMENT '展览状态：0-未开始，1-进行中，2-已结束',
    -- 时间戳（可选）
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    -- 为提高查询效率，添加常用查询字段索引
    INDEX idx_status (status),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_province_cn (province_cn),
    INDEX idx_city_cn (city_cn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='展览信息表';

-- 查看当前事件调度器状态
SHOW VARIABLES LIKE 'event_scheduler';

-- 若为 OFF，可动态开启（重启 MySQL 后失效，建议在配置文件 my.cnf 中设置 event_scheduler=ON）
-- SET GLOBAL event_scheduler = ON;

-- 创建事件，每天 00:00:00 执行
CREATE EVENT IF NOT EXISTS update_exhibition_status
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY   -- 从明天凌晨开始
DO
    UPDATE detailData
    SET status = CASE
        WHEN CURDATE() < start_date THEN 0                -- 未开始
        WHEN CURDATE() BETWEEN start_date AND end_date THEN 1  -- 进行中
        ELSE 2                                                  -- 已结束
    END;

INSERT INTO detailData (
    name_cn, name_en,
    start_date, end_date,
    province_cn, province_en,
    city_cn, city_en,
    location_cn, location_en,
    introduction_cn, introduction_en,
    picture_url
) VALUES (
    '面容与印迹：维姆·文德斯 × 罗伯特·博西西奥影像绘画双人展',
    'Faces and Marks: A Duo Exhibition of Film and Painting by Wim Wenders and Robert Borsig',
    '2025-12-11', '2026-03-15',
    '浙江', 'Zhejiang',
    '杭州', 'Hangzhou',
    '浙江美术馆', 'Zhejiang Art Museum',
    '一场关于影像与绘画的静谧对话，即将在杭州展开。两位来自德国与意大利的艺术家，用镜头与画笔，捕捉时间中那些细微而永恒的时刻。',
    'A quiet dialogue about images and painting is about to unfold in Hangzhou. Two artists from Germany and Italy use their lenses and brushes to capture the subtle yet eternal moments in time.',
    'https://www.zjam.org.cn/SiteAdmin/Holding/Logo/20251125163410.jpg'
);
