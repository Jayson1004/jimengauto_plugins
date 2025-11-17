// characters.js

// This file contains a database of pre-defined characters for replacement.
// The structure is an object where keys are categories and values are arrays of character objects.
const characterDatabase = {
  "火影系列": [
    {
      name: "Sasuke",
      description: "Sasuke (穿着蓝白条纹病号服，戴着木叶护额，黑发，类似宇波佐助cosplayer的年轻男性)"
    },
    {
      name: "Naruto",
      description: "Naruto (穿着橙色夹克，金色头发，头戴木叶护额，脸颊有胡须状的纹路)"
    },
    {
      name: "Sakura",
      description: "Sakura (粉色头发，穿着红色旗袍式上衣，头戴木叶护额的年轻女性)"
    }
  ],
  "K-Pop系列": [
    {
      name: "Jennie",
      description: "Jennie (时尚的舞台服装，长发，具有猫眼妆的韩国女偶像)"
    },
    {
      name: "Jungkook",
      description: "Jungkook (穿着现代休闲装，有耳钉，帅气的韩国男偶像)"
    }
  ],
  "默认角色": [
    {
      name: "John",
      description: "John (穿着休闲T恤和牛仔裤的普通男性)"
    },
    {
      name: "Mary",
      description: "Mary (穿着连衣裙，长发的普通女性)"
    }
  ]
};

// Make it available globally
window.characterDatabase = characterDatabase;
