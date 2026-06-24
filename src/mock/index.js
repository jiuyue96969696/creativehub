import Mock from "mockjs";

// 模拟延迟
Mock.setup({
  timeout: "200-600",
});

// 用户数据
const users = [
  {
    id: 1,
    username: "创意设计师",
    email: "designer@creativehub.com",
    password: "123456",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "UI/UX 设计师 | 热爱创意和美学",
    skills: ["UI设计", "插画", "Figma"],
    website: "https://designer.portfolio.com",
    worksCount: 12,
    likesCount: 456,
    viewsCount: 12345,
    followersCount: 89,
    followingCount: 45,
    createTime: Date.now() - 86400000 * 30,
    lastLogin: Date.now(),
  },
  {
    id: 2,
    username: "视觉艺术家",
    email: "artist@creativehub.com",
    password: "123456",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "视觉设计师 | 用设计讲故事",
    skills: ["平面设计", "品牌设计", "PS"],
    website: "https://artist.portfolio.com",
    worksCount: 8,
    likesCount: 234,
    viewsCount: 5678,
    followersCount: 56,
    followingCount: 23,
    createTime: Date.now() - 86400000 * 20,
    lastLogin: Date.now(),
  },
  {
    id: 3,
    username: "插画师小美",
    email: "xiaomei@creativehub.com",
    password: "123456",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "自由插画师 | 用画笔记录生活",
    skills: ["插画", "水彩", "Procreate"],
    website: "https://xiaomei.art.com",
    worksCount: 15,
    likesCount: 678,
    viewsCount: 23456,
    followersCount: 123,
    followingCount: 67,
    createTime: Date.now() - 86400000 * 45,
    lastLogin: Date.now(),
  },
];

// 分类数据
const categories = [
  { id: 1, name: "UI设计", icon: "Monitor", description: "用户界面设计作品" },
  { id: 2, name: "平面设计", icon: "Grid", description: "平面视觉设计作品" },
  { id: 3, name: "插画", icon: "Brush", description: "插画艺术作品" },
  { id: 4, name: "摄影", icon: "Camera", description: "摄影作品" },
  { id: 5, name: "3D设计", icon: "Box", description: "三维设计作品" },
  { id: 6, name: "视频剪辑", icon: "VideoCamera", description: "视频剪辑作品" },
];

// 生成随机作品
const generateWorks = () => {
  const works = [];
  const titles = [
    "智能家居App UI设计",
    "城市印象 - 系列海报设计",
    "童话森林 - 插画系列",
    "极简主义UI设计系统",
    "城市夜景摄影集",
    "3D角色设计 - 机械战士",
    "品牌设计 - 咖啡品牌视觉系统",
    "旅行Vlog - 日本之旅",
    "未来科技概念设计",
    "复古风格插画集",
    "移动端App界面设计",
    "创意海报设计作品",
    "产品摄影 - 静物系列",
    "3D建筑可视化",
    "动画短片 - 梦境",
    "数据可视化设计",
    "字体设计 - 创意字母",
    "包装设计 - 食品系列",
    "室内设计效果图",
    "游戏角色设计",
    "社交媒体视觉设计",
    "动态图形设计",
    "插画 - 动物系列",
    "UI设计 - 电商App",
  ];

  for (let i = 0; i < 30; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const tags = Mock.mock({
      "tags|1-3": [
        ["UI设计", "App设计", "深色模式", "设计系统", "极简"],
        ["平面设计", "海报设计", "城市", "品牌", "包装"],
        ["插画", "童话", "森林", "水彩", "数字绘画"],
        ["摄影", "城市", "夜景", "人像", "风景"],
        ["3D设计", "角色设计", "机械", "建筑", "可视化"],
        ["视频剪辑", "旅行", "Vlog", "动画", "动态图形"],
      ],
    }).tags.flat();

    const imageCount = Math.floor(Math.random() * 5) + 1;
    const images = [];
    for (let j = 0; j < imageCount; j++) {
      images.push(`https://picsum.photos/seed/${i}${j}/800/600`);
    }

    works.push({
      id: i + 1,
      title: titles[i % titles.length],
      description: Mock.mock("@paragraph(2)"),
      categoryId: category.id,
      categoryName: category.name,
      tags: tags.slice(0, 5),
      images: images,
      coverImage: images[0],
      toolsUsed: Mock.mock({
        "tools|1-3": [
          ["Figma", "Adobe XD"],
          ["Photoshop", "Illustrator"],
          ["Procreate", "Photoshop"],
          ["Lightroom", "Photoshop"],
          ["Blender", "Substance Painter"],
          ["Premiere Pro", "After Effects"],
        ],
      }).tools.flat(),
      authorId: author.id,
      authorName: author.username,
      authorAvatar: author.avatar,
      views: Mock.mock("@integer(100, 5000)"),
      likes: Mock.mock("@integer(10, 500)"),
      collects: Mock.mock("@integer(5, 200)"),
      comments: Mock.mock("@integer(0, 100)"),
      status: "published",
      createTime: Date.now() - Mock.mock("@integer(1, 30)") * 86400000,
      updateTime: Date.now() - Mock.mock("@integer(1, 30)") * 86400000,
      publishTime: Date.now() - Mock.mock("@integer(1, 30)") * 86400000,
    });
  }
  return works;
};

const works = generateWorks();

// 评论数据
const comments = [
  {
    id: 1,
    workId: 1,
    userId: 2,
    userName: "视觉艺术家",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    content: "太棒了！这个设计非常有创意，细节处理也很到位👍",
    createTime: Date.now() - 86400000 * 2,
  },
  {
    id: 2,
    workId: 1,
    userId: 3,
    userName: "插画师小美",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    content: "很喜欢这个配色方案，感觉很有质感！",
    createTime: Date.now() - 86400000 * 1.5,
  },
  {
    id: 3,
    workId: 3,
    userId: 1,
    userName: "创意设计师",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    content: "这张插画太美了！色彩运用很梦幻，特别喜欢那只小鹿🦌",
    createTime: Date.now() - 86400000 * 1,
  },
  {
    id: 4,
    workId: 6,
    userId: 1,
    userName: "创意设计师",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    content: "3D角色设计得很酷！机械细节很丰富",
    createTime: Date.now() - 86400000 * 0.5,
  },
  {
    id: 5,
    workId: 2,
    userId: 3,
    userName: "插画师小美",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    content: "海报的色彩搭配很大胆，很有视觉冲击力！",
    createTime: Date.now() - 86400000 * 3,
  },
  {
    id: 6,
    workId: 4,
    userId: 2,
    userName: "视觉艺术家",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    content: "设计系统非常完善，实用性和美观性兼备",
    createTime: Date.now() - 86400000 * 4,
  },
];

// 关注数据
const follows = [
  { followerId: 1, followingId: 2, createTime: Date.now() - 86400000 * 10 },
  { followerId: 1, followingId: 3, createTime: Date.now() - 86400000 * 8 },
  { followerId: 2, followingId: 3, createTime: Date.now() - 86400000 * 6 },
  { followerId: 3, followingId: 1, createTime: Date.now() - 86400000 * 5 },
];

// Mock API
const baseURL = "/api";

// 用户相关
Mock.mock(`${baseURL}/user/login`, "post", (options) => {
  const body = JSON.parse(options.body);
  const user = users.find(
    (u) => u.email === body.email && u.password === body.password,
  );
  if (user) {
    return {
      code: 200,
      message: "登录成功",
      data: { ...user, password: undefined },
    };
  }
  return {
    code: 401,
    message: "邮箱或密码错误",
    data: null,
  };
});

Mock.mock(`${baseURL}/user/register`, "post", (options) => {
  const body = JSON.parse(options.body);
  if (users.some((u) => u.email === body.email)) {
    return {
      code: 400,
      message: "邮箱已被注册",
      data: null,
    };
  }
  if (users.some((u) => u.username === body.username)) {
    return {
      code: 400,
      message: "用户名已存在",
      data: null,
    };
  }
  const newUser = {
    id: Date.now(),
    ...body,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    bio: "这个人很懒，什么都没写~",
    skills: [],
    website: "",
    worksCount: 0,
    likesCount: 0,
    viewsCount: 0,
    followersCount: 0,
    followingCount: 0,
    createTime: Date.now(),
    lastLogin: Date.now(),
  };
  users.push(newUser);
  return {
    code: 200,
    message: "注册成功",
    data: { ...newUser, password: undefined },
  };
});

Mock.mock(`${baseURL}/user/:id`, "get", (options) => {
  const id = parseInt(options.url.match(/\/user\/(\d+)/)[1]);
  const user = users.find((u) => u.id === id);
  if (user) {
    return {
      code: 200,
      message: "获取成功",
      data: { ...user, password: undefined },
    };
  }
  return {
    code: 404,
    message: "用户不存在",
    data: null,
  };
});

// 作品相关
Mock.mock(`${baseURL}/works`, "get", () => {
  return {
    code: 200,
    message: "获取成功",
    data: works.map((w) => ({ ...w })),
  };
});

Mock.mock(`${baseURL}/work/:id`, "get", (options) => {
  const id = parseInt(options.url.match(/\/work\/(\d+)/)[1]);
  const work = works.find((w) => w.id === id);
  if (work) {
    work.views += 1;
    return {
      code: 200,
      message: "获取成功",
      data: { ...work },
    };
  }
  return {
    code: 404,
    message: "作品不存在",
    data: null,
  };
});

Mock.mock(`${baseURL}/work`, "post", (options) => {
  const body = JSON.parse(options.body);
  const newWork = {
    id: Date.now(),
    ...body,
    coverImage: body.images?.[0] || "",
    views: 0,
    likes: 0,
    collects: 0,
    comments: 0,
    createTime: Date.now(),
    updateTime: Date.now(),
    publishTime: body.status === "published" ? Date.now() : null,
  };
  works.unshift(newWork);
  return {
    code: 200,
    message: "创建成功",
    data: newWork,
  };
});

Mock.mock(`${baseURL}/work/:id`, "put", (options) => {
  const id = parseInt(options.url.match(/\/work\/(\d+)/)[1]);
  const body = JSON.parse(options.body);
  const index = works.findIndex((w) => w.id === id);
  if (index !== -1) {
    works[index] = {
      ...works[index],
      ...body,
      coverImage: body.images?.[0] || works[index].coverImage,
      updateTime: Date.now(),
    };
    return {
      code: 200,
      message: "更新成功",
      data: works[index],
    };
  }
  return {
    code: 404,
    message: "作品不存在",
    data: null,
  };
});

Mock.mock(`${baseURL}/work/:id`, "delete", (options) => {
  const id = parseInt(options.url.match(/\/work\/(\d+)/)[1]);
  const index = works.findIndex((w) => w.id === id);
  if (index !== -1) {
    works.splice(index, 1);
    return {
      code: 200,
      message: "删除成功",
      data: null,
    };
  }
  return {
    code: 404,
    message: "作品不存在",
    data: null,
  };
});

// 分类相关
Mock.mock(`${baseURL}/categories`, "get", () => {
  return {
    code: 200,
    message: "获取成功",
    data: categories,
  };
});

Mock.mock(`${baseURL}/category/:id/works`, "get", (options) => {
  const id = parseInt(options.url.match(/\/category\/(\d+)\/works/)[1]);
  const categoryWorks = works.filter(
    (w) => w.categoryId === id && w.status === "published",
  );
  return {
    code: 200,
    message: "获取成功",
    data: categoryWorks,
  };
});

// 标签相关
Mock.mock(`${baseURL}/tags`, "get", () => {
  const tagSet = new Set();
  works.forEach((w) => {
    w.tags.forEach((t) => tagSet.add(t));
  });
  const tags = Array.from(tagSet).map((name) => ({
    name,
    count: works.filter(
      (w) => w.tags.includes(name) && w.status === "published",
    ).length,
  }));
  return {
    code: 200,
    message: "获取成功",
    data: tags.sort((a, b) => b.count - a.count),
  };
});

Mock.mock(`${baseURL}/tag/:name/works`, "get", (options) => {
  const name = decodeURIComponent(options.url.match(/\/tag\/(.+)\/works/)[1]);
  const tagWorks = works.filter(
    (w) => w.tags.includes(name) && w.status === "published",
  );
  return {
    code: 200,
    message: "获取成功",
    data: tagWorks,
  };
});

// 搜索
Mock.mock(`${baseURL}/search`, "get", (options) => {
  const keyword = new URLSearchParams(options.url.split("?")[1]).get("q");
  if (!keyword) {
    return {
      code: 200,
      message: "获取成功",
      data: { works: [], users: [] },
    };
  }
  const q = keyword.toLowerCase();
  const searchWorks = works.filter(
    (w) =>
      w.status === "published" &&
      (w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q)) ||
        w.authorName.toLowerCase().includes(q)),
  );
  const searchUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      (u.bio && u.bio.toLowerCase().includes(q)) ||
      u.skills.some((s) => s.toLowerCase().includes(q)),
  );
  return {
    code: 200,
    message: "获取成功",
    data: {
      works: searchWorks,
      users: searchUsers,
    },
  };
});

// 互动相关
Mock.mock(`${baseURL}/interaction/like`, "post", (options) => {
  const body = JSON.parse(options.body);
  const work = works.find((w) => w.id === body.workId);
  if (work) {
    work.likes += 1;
    return {
      code: 200,
      message: "点赞成功",
      data: { likes: work.likes },
    };
  }
  return {
    code: 404,
    message: "作品不存在",
    data: null,
  };
});

Mock.mock(`${baseURL}/interaction/unlike`, "post", (options) => {
  const body = JSON.parse(options.body);
  const work = works.find((w) => w.id === body.workId);
  if (work && work.likes > 0) {
    work.likes -= 1;
    return {
      code: 200,
      message: "取消点赞成功",
      data: { likes: work.likes },
    };
  }
  return {
    code: 404,
    message: "操作失败",
    data: null,
  };
});

Mock.mock(`${baseURL}/interaction/comment`, "post", (options) => {
  const body = JSON.parse(options.body);
  const work = works.find((w) => w.id === body.workId);
  const user = users.find((u) => u.id === body.userId);
  if (work && user) {
    const comment = {
      id: Date.now(),
      workId: body.workId,
      userId: body.userId,
      userName: user.username,
      userAvatar: user.avatar,
      content: body.content,
      createTime: Date.now(),
    };
    comments.unshift(comment);
    work.comments += 1;
    return {
      code: 200,
      message: "评论成功",
      data: comment,
    };
  }
  return {
    code: 404,
    message: "评论失败",
    data: null,
  };
});

// 导出模拟数据
export { users, works, categories, comments, follows };
