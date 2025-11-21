// characters.js

// 热门动漫/游戏Cosplay角色：

// Tanjiro Kamado（炭治郎，《鬼灭之刃》）——辨识度高、装备和服饰显著，系列热度持续上升

// Yor Forger/Anya Forger（《间谍×家家酒》）——Yor冷酷与母性反差萌，Anya粉色短发和俏皮性格很受欢迎

// Denji/Makima（《电锯人》）——Denji的电锯武器形象突出，Makima女王气场强大

// Deku/Izuku Midoriya（绿谷出久，《我的英雄学院》）——成长系正能量角色

// Monkey D. Luffy（路飞，《海贼王》）——经典人气长盛不衰

// Eren Yeager（艾伦，《进击的巨人》）——角色转变丰富，热度持续

// Wednesday Addams（《星期三》）——哥特风格、黑裙白领辨识度高

// Ahsoka Tano（《星球大战·阿索卡》）——星战体系新增女性角色热门

// Sailor Moon／Usagi Tsukino（月野兔，水手月亮）——日本女性2025年最想Cos的角色之一

// Kiki（《魔女宅急便》）、Lum（《福星小子》）等经典角色重拾热度

// Frieren（《葬送的芙莉莲》）、Shinobu Kocho/Nezuko Kamado（胡蝶忍/祢豆子，《鬼灭之刃》）

// K-Pop偶像/艺人（适合舞蹈/穿搭短视频）：

// aespa（2025年度最火女团之一，科技与未来感造型）

// IU（个人风格鲜明，女solo代表）

// IVE、新Jeans（NJZ）（新生代女团，服饰造型时尚）

// Rosé & Jennie（BLACKPINK）（solo活动&舞台造型持续热门）

// DAY6（男团，乐队风）

// BIGBANG、G-DRAGON（经典潮流代表）

// 补充备注：

// 男团BTS、WOODZ等依然有很高热度

// K-Pop男偶像如Jungkook、Cha Eunwoo（车银优，颜值偶像）、Taehyung（V）等均适合仿妆仿造型

const characterDatabase = {
  "火影系列": [
    {
      name: "Sasuke",
      description: "穿着蓝白条纹病号服，戴着木叶护额，黑发，类似宇波佐助cosplayer的年轻男性"
    },
    {
      name: "Naruto",
      description: "穿着橙色夹克，金色头发，头戴木叶护额，脸颊有胡须状的纹路"
    },
    {
      name: "Sakura",
      description: "粉色头发，穿着红色旗袍式上衣，头戴木叶护额的年轻女性"
    }
  ],
  "K-Pop Demon Hunters系列（Huntrix）": [
    {
      "name": "Rumi",
      "description": "领袖气质，黑长直发，深邃双眸，舞台造型华丽，常穿带金属饰件的韩风战斗装，气场强大，兼有温柔与坚韧"
    },
    {
      "name": "Mira",
      "description": "短发，偏酷帅风格，精致妆容，擅长高难度舞蹈和武术，黑色系劲装，冷静又有艺术感"
    },
    {
      "name": "Zoey",
      "description": "棕色波浪卷发，五官深邃，常露标志性微笑，穿都市休闲混搭风，饰有刀鞘等配件，敏捷而自信"
    }
  ],
  "K-Pop系列": [
    {
      "name": "Jennie",
      "description": "时尚舞台装，黑长发，猫眼妆，酷飒风格的韩国女偶像"
    },
    {
      "name": "Jungkook",
      "description": "现代休闲街头风，黑发，耳钉，运动鞋，帅气自信的韩国男偶像"
    },
    {
      "name": "Karina",
      "description": "银蓝长发，未来感妆容，舞台造型有亮片和高跟靴，冷艳高挑"
    },
    {
      "name": "Hanni",
      "description": "短发活泼，少女感，简约韩系服饰，亲和力强"
    }
  ],
  "Roblox热门虚拟形象": [
    {
      "name": "Noob",
      "description": "Roblox经典形象，黄色方块头像，穿蓝色上衣和绿色裤子，简单无表情，外观极易辨认"
    },
    {
      "name": "Bacon Hair",
      "description": "男孩造型，褐色条形“培根”头发，浅色皮肤，蓝绿休闲服饰，表情呆萌"
    },
    {
      "name": "Roblox Girl",
      "description": "淡黄色皮肤，棕色长发，粉色上衣+灰色裤子，精致脸型，女性形象"
    },
    {
      "name": "Headless Horseman",
      "description": "头部消失，穿黑色大衣与斗篷，双手白色骨架造型，神秘中带点哥特风"
    },
    {
      "name": "Core Blocks",
      "description": "极简黑色立方体形象，所有身材由方块构成，外观极具未来感"
    }
  ],
  "龙珠系列": [
    {
      "name": "孙悟空",
      "description": "黑色刺猬头发，橙蓝武道服，精瘦肌肉型，天真笑容，超级赛亚人形象"
    },
    {
      "name": "贝吉塔",
      "description": "黑色高耸发型，英气眉眼，穿蓝白战甲，眼神锐利、不苟言笑，身形精干"
    },
    {
      "name": "布尔玛",
      "description": "短发或长发造型多变，五官秀美，穿时尚休闲装，科技女强人气质，偶尔佩戴头巾或发带"
    },
    {
      "name": "弗利萨",
      "description": "光滑白色皮肤，紫色头顶和肩部，有尾巴，身材瘦小，表情阴狠"
    },
    {
      "name": "克林",
      "description": "矮小秃头，皮肤较深，没有鼻子，穿僧人橙色武道服，性格胆小但忠诚"
    },
    {
      "name": "比克",
      "description": "绿色皮肤，高大瘦长，头顶两根触角，穿白色斗篷和蓝紫服饰，面容严肃"
    },
    {
      "name": "特南克斯",
      "description": "灰蓝色中长发，紫色外套，深蓝裤子，佩带长剑，年轻干练，冷静有决断力"
    }
  ],
  "Genshin Impact（原神）系列": [
    {
      "name": "Lumine",
      "description": "金色长发，眼睛明亮穿着白色/金色轻甲风格冒险服饰，飘逸蓝色围裙，整体形象优雅中带点神秘"
    },
    {
      "name": "Zhongli",
      "description": "乌黑长发束发，金色竖瞳，穿着黑金夹克长袍，气质冷静内敛，身姿笔直，有中国风元素"
    },
    {
      "name": "Raiden Shogun",
      "description": "紫色长发，紫瞳，和风战甲，手持长刀，严肃庄重的氛围，头戴发簪/发饰"
    },
    {
      "name": "Albedo",
      "description": "浅金色短发，蓝绿色眼睛，穿白色炼金术士长袍，气质清冷，常持画笔或剑"
    },
    {
      "name": "Hu Tao",
      "description": "深褐色长发系双丸子，红色眼睛，穿有火焰图案的深色旗袍外套，戴黑色帽子"
    },
    {
      "name": "Klee",
      "description": "白金色短发，红瞳，穿红白精灵帽，背小型炸弹包，外形可爱"
    }
  ],
  "Squid Game系列（鱿鱼游戏）": [
    {
      "name": "No-eul",
      "description": "女生，短棕色发，轮廓英气，眼神坚毅，穿游戏标志性运动服，为了孩子参加游戏，风格偏现实"
    },
    {
      "name": "Hyun-ju",
      "description": "女生，黑发，温和面容，穿红白运动服，眼中有忧虑却不失善良，与其他参赛者关系亲近"
    },
    {
      "name": "Dae-ho",
      "description": "男生，深褐色短发，身形壮硕，运动服造型，刚硬外表实际内心敏感、富有活力"
    }
  ],

  "Chainsaw Man系列（电锯人）": [
    {
      "name": "Denji",
      "description": "金色短乱发，穿旧衬衫与黑色窄裤，傻气又坚韧，一变身头上有红色电锯锋刃"
    },
    {
      "name": "Makima",
      "description": "红色长发盘髻，浅绿色眼眸，黑色职业装，气场超强，永远微笑但令人畏惧"
    }
  ],
  "Demon Slayer系列（鬼灭之刃）": [
    {
      "name": "Tanjiro Kamado",
      "description": "黑发搭红色发梢，穿绿黑格羽织，佩戴日轮刀，额头有疤，温柔眼神"
    },
    {
      "name": "Nezuko Kamado",
      "description": "长黑发带粉色发尖，嘴含竹筒，穿粉色和服，双瞳红色，气质可爱又英勇"
    },
    {
      "name": "Shinobu Kocho",
      "description": "紫发短卷，蝶形发饰，穿紫色和风队服外披白色蝴蝶花纹羽织，微笑中透危险"
    },
    {
      "name": "Zenitsu Agatsuma",
      "description": "金黄色短发，眼神惊恐，穿黄黑渐变羽织，性格胆小但爆发力强"
    },
    {
      "name": "Inosuke Hashibira",
      "description": "黑发扎成蓬松短发，头戴野猪面具，上身赤裸，下身毛皮裤，肌肉发达，好斗"
    }
  ],
  "葬送的芙莉莲": [
    {
      "name": "芙莉莲",
      "description": "银色双马尾长发，绿色双眼，精灵尖耳，白皙肤色，身穿浅蓝斗篷与长裙，表情常淡定温婉"
    },
    {
      "name": "欣梅尔",
      "description": "金色短发，蓝眼睛，骑士银甲配蓝披风，年轻英俊气质开朗，面容坚毅"
    },
    {
      "name": "海塔",
      "description": "深棕色披肩短发，脸型圆润，带眼镜，经常身穿大地色袍服，温柔优雅，气质坚强"
    }
  ],
  "漫威系列": [
    {
      "name": "蜘蛛侠",
      "description": "短棕发青年，红蓝蜘蛛战衣，灵活矫健，大眼镜面罩"
    },
    {
      "name": "奇异博士",
      "description": "深色短发，花白鬓角，穿红色斗篷长袍，奇异法阵和手势"
    },
    {
      "name": "猩红女巫",
      "description": "暗红波浪长发，红色头冠，深色紧身服，气质高贵带神秘感"
    },
    {
      "name": "洛基",
      "description": "黑色长发，绿色黑金服饰，金色鹿角头盔，邪魅自信"
    },
    {
      "name": "银色冲浪手芭尔",
      "description": "身高高挑，全身银光闪烁光滑如金属，红色眼睛，踏银色冲浪板"
    }
  ],
  "DC系列": [
    {
      "name": "超人",
      "description": "黑色短发，蓝色紧身衣配红色披风和底裤，胸前大红S标志，身形高大，五官阳刚"
    },
    {
      "name": "蝙蝠侠",
      "description": "黑色披风与战衣，头戴蝙蝠造型头盔，身材结实健硕，气场冷峻"
    },
    {
      "name": "神奇女侠",
      "description": "黑色长卷发，红蓝金战甲，手持金色真言之索，女战神风范十足"
    },
    {
      "name": "哈莉·奎茵",
      "description": "金粉双色双马尾，淡妆浓唇，红黑配色小丑服，活泼又疯狂"
    },
    {
      "name": "鷹女孩",
      "description": "褐色短发，头戴金属鹰翼头盔，金属翅膀，身着浅绿色超英装，持巨大战锤"
    }
  ],
  "星球大战系列": [
    {
      "name": "芮",
      "description": "棕色束发，运动型短白袍，棕色腰带蓝色光剑，英气十足"
    },
    {
      "name": "曼达洛人",
      "description": "全身银灰金属装甲，经典曼达洛头盔，不露脸，背披斗篷"
    },
    {
      "name": "李政宰Jedi大师",
      "description": "亚洲面孔，深色长袍，腰佩光剑，气场沉稳，手持激光剑"
    }
  ]
};

// Make it available globally
window.characterDatabase = characterDatabase;
