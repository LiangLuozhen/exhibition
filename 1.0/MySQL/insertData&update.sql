USE zhanLanData;

INSERT INTO detailData (
    name_cn, name_en,
    start_date, end_date,
    province_cn, province_en,
    city_cn, city_en,
    location_cn, location_en,
    introduction_cn, introduction_en,
    picture_url
) VALUES (
    '山花迷人眼——彭康隆水墨画展',
    'Enchanting Eyes of Mountain Flowers - Peng Kanglong Ink Painting Exhibition',
    '2025-11-14', '2026-04-08',
    '广东', 'Guangdong',
    '广州', 'Guangzhou',
    '广东美术馆新馆（白鹅潭）', 'New Guangdong Museum of Art (White Goose Pond)',
    '当代重要的水墨艺术家彭康隆，将在广东美术馆白鹅潭馆区，呈现其迄今为止最大规模的机构个展“山花迷人眼”，全面梳理其独创融合山水与花卉两种题材的当代演绎。展览由广东美术馆主办，墨斋协办，广东美术馆馆长王绍强任总策划，中国美术馆研究员邓锋担纲策展。展出近90幅珍品，时代跨度25年，其中多件超长手卷、巨幅画作与特制屏风等精彩亮相！“迷”是此次展览的题眼。彭康隆以缠绕、积叠、漂浮、满密的笔墨线质，别具一格地将山水与花卉交织构成，逼人眼目，撩人情绪。山水与花卉的空间节奏起伏，引人入胜。其笔墨呼应其个性，率性直接，充满动势，随机生发。其设色、墨韵与粗麻纸质的相互碰撞，营造出超载的逼人感与吸入感。',
    'Peng Kanglong, an important contemporary ink artist, will present his largest institutional solo exhibition "Charming Eyes of Mountain Flowers" in the White Goose Pond area of Guangdong Museum of Art, comprehensively sorting out his original contemporary interpretation that combines the themes of landscape and flowers. The exhibition is hosted by Guangdong Museum of Art, co organized by Ink Studio, with Wang Shaoqiang, the director of Guangdong Museum of Art, as the overall planner, and Deng Feng, a researcher at the National Art Museum of China, as the curator. Exhibiting nearly 90 treasures spanning 25 years, including several super long hand scrolls, giant paintings, and specially made screens, among others! \'Maze\' is the theme of this exhibition. Peng Kanglong interweaves mountains, waters, and flowers in a unique way with intertwined, stacked, floating, and dense brush and ink lines, which is eye-catching and emotional. The spatial rhythm of mountains, waters, and flowers is undulating and captivating. Its brushwork echoes its personality, with a direct and spontaneous style, full of momentum, and randomly generated hair. The collision of colors, ink tones, and coarse linen paper creates a sense of overwhelming pressure and inhalation.',
    'https://www.gdmoa.org/Exhibition/Current/202511/W020251114530794955307.jpg'
);

UPDATE detailData
SET status = CASE
    WHEN CURDATE() < start_date THEN 0
    WHEN CURDATE() BETWEEN start_date AND end_date THEN 1
    ELSE 2
END
WHERE id = LAST_INSERT_ID();  -- 或者直接更新所有记录