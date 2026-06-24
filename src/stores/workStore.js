import { defineStore } from "pinia";

// 导入 userStore 用于获取用户头像
import { useUserStore } from "./userStore";

// 获取作者头像 - 从 userStore 获取，确保一致性
const getAuthorAvatar = (authorId, authorName) => {
  try {
    const userStore = useUserStore();
    const user = userStore.userById(authorId);
    if (user && user.avatar) {
      return user.avatar;
    }
  } catch (e) {
    console.warn("获取用户头像失败，使用备用方案:", e);
  }

  const colors = [
    "3498DB",
    "2ECC71",
    "E74C3C",
    "F39C12",
    "9B59B6",
    "1ABC9C",
    "E67E22",
    "1A5276",
  ];
  const color = colors[authorId % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName || "User")}&background=${color}&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle`;
};

export const useWorkStore = defineStore("work", {
  state: () => ({
    works: [],
    currentWork: null,
    categories: [
      {
        id: 1,
        name: "UI设计",
        icon: "Monitor",
        description: "用户界面设计作品",
        count: 0,
      },
      {
        id: 2,
        name: "平面设计",
        icon: "Grid",
        description: "平面视觉设计作品",
        count: 0,
      },
      {
        id: 3,
        name: "插画",
        icon: "Brush",
        description: "插画艺术作品",
        count: 0,
      },
      {
        id: 4,
        name: "摄影",
        icon: "Camera",
        description: "摄影作品",
        count: 0,
      },
      {
        id: 5,
        name: "3D设计",
        icon: "Box",
        description: "三维设计作品",
        count: 0,
      },
      {
        id: 6,
        name: "视频剪辑",
        icon: "VideoCamera",
        description: "视频剪辑作品",
        count: 0,
      },
    ],
    tags: [],
  }),

  getters: {
    // 已发布的作品
    publishedWorks: (state) =>
      state.works.filter((w) => w.status === "published"),

    // 草稿作品
    draftWorks: (state) => state.works.filter((w) => w.status === "draft"),

    // 按分类筛选
    worksByCategory: (state) => (categoryId) => {
      return state.works.filter(
        (w) => w.categoryId === categoryId && w.status === "published",
      );
    },

    // 按作者筛选
    worksByAuthor: (state) => (authorId) => {
      return state.works.filter((w) => w.authorId === authorId);
    },

    // 按标签筛选
    worksByTag: (state) => (tagName) => {
      return state.works.filter(
        (w) => w.tags.includes(tagName) && w.status === "published",
      );
    },

    // 热门作品
    hotWorks: (state) => {
      return [...state.works]
        .filter((w) => w.status === "published")
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    },

    // 最新作品
    latestWorks: (state) => {
      return [...state.works]
        .filter((w) => w.status === "published")
        .sort((a, b) => b.publishTime - a.publishTime);
    },

    // 获取所有标签及其作品数量 - 按数量降序排列（热门优先）
    allTags: (state) => {
      const tagMap = {};
      state.works
        .filter((w) => w.status === "published")
        .forEach((work) => {
          work.tags.forEach((tag) => {
            if (!tagMap[tag]) tagMap[tag] = 0;
            tagMap[tag]++;
          });
        });
      return Object.entries(tagMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },

    // 获取作品总数
    totalWorks: (state) =>
      state.works.filter((w) => w.status === "published").length,

    // 获取总获赞数
    totalLikes: (state) => {
      return state.works
        .filter((w) => w.status === "published")
        .reduce((sum, w) => sum + (w.likes || 0), 0);
    },

    // 获取总浏览量
    totalViews: (state) => {
      return state.works
        .filter((w) => w.status === "published")
        .reduce((sum, w) => sum + (w.views || 0), 0);
    },

    // 获取分类统计
    categoryStats: (state) => {
      const stats = {};
      state.works
        .filter((w) => w.status === "published")
        .forEach((work) => {
          if (!stats[work.categoryName]) {
            stats[work.categoryName] = 0;
          }
          stats[work.categoryName]++;
        });
      return Object.entries(stats).map(([name, count]) => ({ name, count }));
    },
  },

  actions: {
    // 初始化示例数据
    initSampleWorks() {
      if (this.works.length === 0) {
        const sampleWorks = [
          {
            id: 1,
            title: "智能家居App UI设计",
            description:
              "这是一款智能家居控制应用的UI设计作品，包含完整的设计系统和交互原型。设计风格采用毛玻璃效果，色彩以深色为主，突出科技感和未来感。",
            categoryId: 1,
            categoryName: "UI设计",
            tags: ["UI设计", "App设计", "深色模式"],
            images: [
              "https://picsum.photos/seed/app1/800/600",
              "https://picsum.photos/seed/app2/800/600",
              "https://picsum.photos/seed/app3/800/600",
            ],
            coverImage: "https://picsum.photos/seed/app1/400/300",
            toolsUsed: ["Figma", "Adobe XD"],
            authorId: 1,
            authorName: "创意设计师",
            views: 2345,
            likes: 234,
            collects: 89,
            comments: 45,
            status: "published",
            createTime: Date.now() - 86400000 * 5,
            updateTime: Date.now() - 86400000 * 5,
            publishTime: Date.now() - 86400000 * 5,
          },
          {
            id: 2,
            title: "城市印象 - 系列海报设计",
            description:
              "以城市为主题创作的系列海报设计，每张海报代表一个城市的独特气质。运用了大胆的色彩和几何图形，探索城市与人文的关系。",
            categoryId: 2,
            categoryName: "平面设计",
            tags: ["平面设计", "海报设计", "城市"],
            images: [
              "https://picsum.photos/seed/poster1/800/600",
              "https://picsum.photos/seed/poster2/800/600",
            ],
            coverImage: "https://picsum.photos/seed/poster1/400/300",
            toolsUsed: ["Photoshop", "Illustrator"],
            authorId: 2,
            authorName: "视觉艺术家",
            views: 1567,
            likes: 189,
            collects: 67,
            comments: 23,
            status: "published",
            createTime: Date.now() - 86400000 * 8,
            updateTime: Date.now() - 86400000 * 8,
            publishTime: Date.now() - 86400000 * 8,
          },
          {
            id: 3,
            title: "童话森林 - 插画系列",
            description:
              "一组充满童话色彩的森林主题插画，描绘了森林中的各种精灵和神奇生物。使用水彩和数字绘画相结合的方式创作。",
            categoryId: 3,
            categoryName: "插画",
            tags: ["插画", "童话", "森林"],
            images: [
              "https://picsum.photos/seed/forest1/800/600",
              "https://picsum.photos/seed/forest2/800/600",
              "https://picsum.photos/seed/forest3/800/600",
              "https://picsum.photos/seed/forest4/800/600",
            ],
            coverImage: "https://picsum.photos/seed/forest1/400/300",
            toolsUsed: ["Procreate", "Photoshop"],
            authorId: 3,
            authorName: "插画师小美",
            views: 3456,
            likes: 456,
            collects: 123,
            comments: 67,
            status: "published",
            createTime: Date.now() - 86400000 * 3,
            updateTime: Date.now() - 86400000 * 3,
            publishTime: Date.now() - 86400000 * 3,
          },
          {
            id: 4,
            title: "极简主义UI设计系统",
            description:
              "一套完整的极简主义UI设计系统，包含颜色、字体、间距、组件等规范。适用于各类产品的界面设计，注重可用性和视觉美感。",
            categoryId: 1,
            categoryName: "UI设计",
            tags: ["UI设计", "设计系统", "极简"],
            images: [
              "https://picsum.photos/seed/ui1/800/600",
              "https://picsum.photos/seed/ui2/800/600",
            ],
            coverImage: "https://picsum.photos/seed/ui1/400/300",
            toolsUsed: ["Figma", "Sketch"],
            authorId: 1,
            authorName: "创意设计师",
            views: 2890,
            likes: 345,
            collects: 156,
            comments: 78,
            status: "published",
            createTime: Date.now() - 86400000 * 10,
            updateTime: Date.now() - 86400000 * 10,
            publishTime: Date.now() - 86400000 * 10,
          },
          {
            id: 5,
            title: "城市夜景摄影集",
            description:
              "用镜头记录城市夜晚的魅力，捕捉霓虹灯下的城市脉动。这组摄影作品展现了不同城市夜晚的独特氛围。",
            categoryId: 4,
            categoryName: "摄影",
            tags: ["摄影", "城市", "夜景"],
            images: [
              "https://picsum.photos/seed/night1/800/600",
              "https://picsum.photos/seed/night2/800/600",
              "https://picsum.photos/seed/night3/800/600",
            ],
            coverImage: "https://picsum.photos/seed/night1/400/300",
            toolsUsed: ["Lightroom", "Photoshop"],
            authorId: 2,
            authorName: "视觉艺术家",
            views: 1890,
            likes: 234,
            collects: 45,
            comments: 34,
            status: "published",
            createTime: Date.now() - 86400000 * 12,
            updateTime: Date.now() - 86400000 * 12,
            publishTime: Date.now() - 86400000 * 12,
          },
          {
            id: 6,
            title: "3D角色设计 - 机械战士",
            description:
              "一个未来风格的3D机械战士角色设计，包含完整的建模、贴图和渲染过程。展示了在Blender中完成的高精度角色创作。",
            categoryId: 5,
            categoryName: "3D设计",
            tags: ["3D设计", "角色设计", "机械"],
            images: [
              "https://picsum.photos/seed/robot1/800/600",
              "https://picsum.photos/seed/robot2/800/600",
              "https://picsum.photos/seed/robot3/800/600",
            ],
            coverImage: "https://picsum.photos/seed/robot1/400/300",
            toolsUsed: ["Blender", "Substance Painter"],
            authorId: 3,
            authorName: "插画师小美",
            views: 2345,
            likes: 278,
            collects: 89,
            comments: 56,
            status: "published",
            createTime: Date.now() - 86400000 * 6,
            updateTime: Date.now() - 86400000 * 6,
            publishTime: Date.now() - 86400000 * 6,
          },
          {
            id: 7,
            title: "品牌设计 - 咖啡品牌视觉系统",
            description:
              "一个完整的咖啡品牌视觉识别系统设计，包含标志设计、包装设计、店面视觉等。打造温暖、手作、有温度的品牌形象。",
            categoryId: 2,
            categoryName: "平面设计",
            tags: ["品牌设计", "包装设计", "咖啡"],
            images: [
              "https://picsum.photos/seed/brand1/800/600",
              "https://picsum.photos/seed/brand2/800/600",
            ],
            coverImage: "https://picsum.photos/seed/brand1/400/300",
            toolsUsed: ["Illustrator", "Photoshop"],
            authorId: 4,
            authorName: "设计达人",
            views: 1678,
            likes: 189,
            collects: 56,
            comments: 28,
            status: "published",
            createTime: Date.now() - 86400000 * 15,
            updateTime: Date.now() - 86400000 * 15,
            publishTime: Date.now() - 86400000 * 15,
          },
          {
            id: 8,
            title: "旅行Vlog - 日本之旅",
            description:
              "一段记录日本旅行经历的Vlog视频，用镜头捕捉了东京、京都、大阪的独特风景和文化体验。通过剪辑和音乐营造出治愈的旅行氛围。",
            categoryId: 6,
            categoryName: "视频剪辑",
            tags: ["视频剪辑", "旅行", "Vlog"],
            images: [
              "https://picsum.photos/seed/japan1/800/600",
              "https://picsum.photos/seed/japan2/800/600",
            ],
            coverImage: "https://picsum.photos/seed/japan1/400/300",
            toolsUsed: ["Premiere Pro", "After Effects"],
            authorId: 5,
            authorName: "创意无限",
            views: 3456,
            likes: 456,
            collects: 134,
            comments: 89,
            status: "published",
            createTime: Date.now() - 86400000 * 7,
            updateTime: Date.now() - 86400000 * 7,
            publishTime: Date.now() - 86400000 * 7,
          },
          {
            id: 9,
            title: "数字插画 - 未来城市",
            description:
              "用数字绘画技术创作的未来城市插画，展现了科技与自然的完美融合。作品运用了丰富的色彩和光影效果，营造出梦幻般的城市景象。",
            categoryId: 3,
            categoryName: "插画",
            tags: ["数字插画", "未来城市", "科幻"],
            images: [
              "https://picsum.photos/seed/future1/800/600",
              "https://picsum.photos/seed/future2/800/600",
            ],
            coverImage: "https://picsum.photos/seed/future1/400/300",
            toolsUsed: ["Procreate", "Photoshop"],
            authorId: 6,
            authorName: "艺术人生",
            views: 1234,
            likes: 156,
            collects: 45,
            comments: 23,
            status: "published",
            createTime: Date.now() - 86400000 * 4,
            updateTime: Date.now() - 86400000 * 4,
            publishTime: Date.now() - 86400000 * 4,
          },
          {
            id: 10,
            title: "品牌VI设计 - 绿色生活",
            description:
              "为环保品牌打造的完整视觉识别系统，包含标志、色彩、字体、应用规范等。设计理念强调自然、可持续和简约美学。",
            categoryId: 2,
            categoryName: "平面设计",
            tags: ["品牌设计", "VI系统", "环保"],
            images: [
              "https://picsum.photos/seed/green1/800/600",
              "https://picsum.photos/seed/green2/800/600",
              "https://picsum.photos/seed/green3/800/600",
            ],
            coverImage: "https://picsum.photos/seed/green1/400/300",
            toolsUsed: ["Illustrator", "Photoshop"],
            authorId: 8,
            authorName: "品牌设计师",
            views: 2345,
            likes: 289,
            collects: 78,
            comments: 45,
            status: "published",
            createTime: Date.now() - 86400000 * 9,
            updateTime: Date.now() - 86400000 * 9,
            publishTime: Date.now() - 86400000 * 9,
          },
          {
            id: 11,
            title: "3D建模 - 科幻载具",
            description:
              "使用Blender创建的未来风格科幻载具3D模型，包含完整的建模、材质、灯光和渲染流程。展现了精细的机械细节和科技感。",
            categoryId: 5,
            categoryName: "3D设计",
            tags: ["3D建模", "科幻", "Blender"],
            images: [
              "https://picsum.photos/seed/vehicle1/800/600",
              "https://picsum.photos/seed/vehicle2/800/600",
            ],
            coverImage: "https://picsum.photos/seed/vehicle1/400/300",
            toolsUsed: ["Blender", "Substance Painter"],
            authorId: 7,
            authorName: "数字艺术家",
            views: 1789,
            likes: 234,
            collects: 67,
            comments: 34,
            status: "published",
            createTime: Date.now() - 86400000 * 11,
            updateTime: Date.now() - 86400000 * 11,
            publishTime: Date.now() - 86400000 * 11,
          },
          {
            id: 12,
            title: "UI设计 - 健康管理App",
            description:
              "一款健康管理应用的UI设计，包含完整的用户界面、交互原型和设计规范。设计风格清新简约，注重用户体验和健康数据可视化。",
            categoryId: 1,
            categoryName: "UI设计",
            tags: ["UI设计", "健康App", "用户体验"],
            images: [
              "https://picsum.photos/seed/health1/800/600",
              "https://picsum.photos/seed/health2/800/600",
              "https://picsum.photos/seed/health3/800/600",
            ],
            coverImage: "https://picsum.photos/seed/health1/400/300",
            toolsUsed: ["Figma", "Adobe XD"],
            authorId: 4,
            authorName: "设计达人",
            views: 2987,
            likes: 345,
            collects: 123,
            comments: 56,
            status: "published",
            createTime: Date.now() - 86400000 * 13,
            updateTime: Date.now() - 86400000 * 13,
            publishTime: Date.now() - 86400000 * 13,
          },
        ];
        this.works = sampleWorks;
        this.saveWorks();
        this.updateAllTags();
        this.updateCategoryCounts();
      }
    },

    // 更新分类作品数量
    updateCategoryCounts() {
      this.categories.forEach((cat) => {
        cat.count = this.works.filter(
          (w) => w.categoryId === cat.id && w.status === "published",
        ).length;
      });
    },

    // 获取所有作品 - 同步更新作者头像
    fetchWorks() {
      this.loadWorks();
      this.updateAllTags();
      this.updateCategoryCounts();
      this.syncAuthorAvatars();
      return this.works;
    },

    // 同步所有作品的作者头像
    syncAuthorAvatars() {
      try {
        const userStore = useUserStore();
        if (userStore.users.length === 0) {
          userStore.loadUsers();
        }
      } catch (e) {
        console.warn("同步作者头像失败:", e);
      }
    },

    // 通知用户数据更新
    notifyUserDataUpdate() {
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("user-data-refresh", {
              detail: { source: "workStore" },
            }),
          );
        }, 100);
      }
    },

    // 获取作品详情
    getWorkById(id) {
      this.loadWorks();
      const work = this.works.find((w) => w.id === id);
      if (work && work.status === "published") {
        work.views += 1;
        this.saveWorks();
        this.updateAuthorStats(work.authorId);
      }
      this.currentWork = work;
      return work;
    },

    // 创建作品
    createWork(workData) {
      this.loadWorks();
      const newWork = {
        id: Date.now(),
        ...workData,
        coverImage: workData.images?.[0] || "",
        views: 0,
        likes: 0,
        collects: 0,
        comments: 0,
        createTime: Date.now(),
        updateTime: Date.now(),
        publishTime: workData.status === "published" ? Date.now() : null,
      };
      this.works.push(newWork);
      this.saveWorks();
      this.updateAllTags();
      this.updateCategoryCounts();
      this.updateAuthorWorksCount(newWork.authorId);
      this.notifyUserDataUpdate();
      return newWork;
    },

    // 更新作品
    updateWork(id, updates) {
      this.loadWorks();
      const index = this.works.findIndex((w) => w.id === id);
      if (index !== -1) {
        const oldWork = this.works[index];
        const wasDraft = oldWork.status === "draft";
        const willPublish = updates.status === "published";

        this.works[index] = {
          ...oldWork,
          ...updates,
          coverImage: updates.images?.[0] || oldWork.coverImage,
          updateTime: Date.now(),
          publishTime:
            wasDraft && willPublish ? Date.now() : oldWork.publishTime,
        };
        this.saveWorks();
        this.updateAllTags();
        this.updateCategoryCounts();
        this.updateAuthorWorksCount(this.works[index].authorId);
        this.notifyUserDataUpdate();
        return this.works[index];
      }
      return null;
    },

    // 删除作品
    deleteWork(id) {
      this.loadWorks();
      const index = this.works.findIndex((w) => w.id === id);
      if (index !== -1) {
        const work = this.works[index];
        this.works.splice(index, 1);
        this.saveWorks();
        this.updateAllTags();
        this.updateCategoryCounts();
        this.updateAuthorWorksCount(work.authorId);
        this.notifyUserDataUpdate();
        return true;
      }
      return false;
    },

    // 更新作品互动数据
    updateWorkInteraction(workId, field, change) {
      this.loadWorks();
      const work = this.works.find((w) => w.id === workId);
      if (work) {
        work[field] = (work[field] || 0) + change;
        this.saveWorks();
        if (field === "likes") {
          this.updateAuthorStats(work.authorId);
        }
        return work[field];
      }
      return 0;
    },

    // 更新作者作品数
    updateAuthorWorksCount(authorId) {
      const count = this.works.filter(
        (w) => w.authorId === authorId && w.status === "published",
      ).length;

      import("@/stores/userStore")
        .then(({ useUserStore }) => {
          const userStore = useUserStore();
          userStore.updateUserStats(authorId, { worksCount: count });
        })
        .catch(() => {
          try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const userIndex = users.findIndex((u) => u.id === authorId);
            if (userIndex !== -1) {
              users[userIndex].worksCount = count;
              localStorage.setItem("users", JSON.stringify(users));
            }
          } catch (e) {
            console.error("更新作者作品数失败:", e);
          }
        });
    },

    // 更新作者统计数据
    updateAuthorStats(authorId) {
      const userWorks = this.works.filter(
        (w) => w.authorId === authorId && w.status === "published",
      );
      const totalLikes = userWorks.reduce((sum, w) => sum + (w.likes || 0), 0);
      const totalViews = userWorks.reduce((sum, w) => sum + (w.views || 0), 0);

      import("@/stores/userStore")
        .then(({ useUserStore }) => {
          const userStore = useUserStore();
          userStore.updateUserStats(authorId, {
            likesCount: totalLikes,
            viewsCount: totalViews,
          });
        })
        .catch(() => {
          try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const userIndex = users.findIndex((u) => u.id === authorId);
            if (userIndex !== -1) {
              users[userIndex].likesCount = totalLikes;
              users[userIndex].viewsCount = totalViews;
              localStorage.setItem("users", JSON.stringify(users));
            }
          } catch (e) {
            console.error("更新作者统计数据失败:", e);
          }
        });
    },

    // 更新所有标签
    updateAllTags() {
      const tagSet = new Set();
      this.works.forEach((w) => {
        w.tags.forEach((t) => tagSet.add(t));
      });
      this.tags = Array.from(tagSet);
    },

    // 保存数据
    saveWorks() {
      try {
        localStorage.setItem("works", JSON.stringify(this.works));
        console.log("✅ 作品数据已保存到 localStorage");
      } catch (e) {
        console.error("保存作品数据失败:", e);
      }
    },

    // 加载数据
    loadWorks() {
      try {
        const data = localStorage.getItem("works");
        if (data) {
          this.works = JSON.parse(data);
          this.works.forEach((work) => {
            if (!work.collects) work.collects = 0;
            if (!work.comments) work.comments = 0;
            if (!work.toolsUsed) work.toolsUsed = [];
            if (!work.views) work.views = 0;
            if (!work.likes) work.likes = 0;
          });
          console.log(`✅ 已从 localStorage 加载 ${this.works.length} 个作品`);
        } else {
          console.log("📝 localStorage 无作品数据，初始化示例数据");
          this.initSampleWorks();
        }
        this.updateCategoryCounts();
      } catch (e) {
        console.error("加载作品数据失败:", e);
        this.initSampleWorks();
      }
    },

    // 重置作品数据
    resetWorks() {
      this.works = [];
      localStorage.removeItem("works");
      localStorage.removeItem("work-store");
      this.initSampleWorks();
    },
  },

  persist: {
    key: "work-store",
    storage: localStorage,
    paths: ["works"],
  },
});
