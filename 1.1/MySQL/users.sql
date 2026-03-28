USE zhanLandata;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    nickname VARCHAR(50) NOT NULL COMMENT '昵称',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号（唯一）',
    password VARCHAR(255) NOT NULL COMMENT '密码（明文，实际应哈希）',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    PRIMARY KEY (id),
    UNIQUE KEY idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 收藏表（用户与展览的多对多关系）
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
    exhibition_id INT UNSIGNED NOT NULL COMMENT '展览ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    PRIMARY KEY (user_id, exhibition_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exhibition_id) REFERENCES detailData(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

