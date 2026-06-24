import { defineStore } from "pinia";

// 为每个用户生成固定唯一的初始头像
const getDefaultAvatar = (username, userId) => {
  const avatarMap = {
    1: { color: "2980B9", name: "创意设计师" },
    2: { color: "27AE60", name: "视觉艺术家" },
    3: { color: "E74C3C", name: "插画师小美" },
    4: { color: "8E44AD", name: "设计达人" },
    5: { color: "F39C12", name: "创意无限" },
    6: { color: "1ABC9C", name: "艺术人生" },
    7: { color: "2C3E50", name: "数字艺术家" },
    8: { color: "16A085", name: "品牌设计师" },
  };

  const config = avatarMap[userId];
  if (config) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(config.name)}&background=${config.color}&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle`;
};

export const useUserStore = defineStore("user", {
  state: () => ({
    currentUser: null,
    users: [],
    isLoggedIn: false,
  }),

  getters: {
    currentUserId: (state) => state.currentUser?.id || null,
    userById: (state) => (id) => state.users.find((u) => u.id === id),
    allUsers: (state) => state.users,
    totalUsers: (state) => state.users.length,
  },

  actions: {
    // 初始化默认用户
    initDefaultUsers() {
      if (this.users.length === 0) {
        this.users = [
          {
            id: 1,
            username: "创意设计师",
            email: "designer@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("创意设计师", 1),
            bio: "UI/UX 设计师 | 热爱创意和美学",
            skills: ["UI设计", "插画", "Figma"],
            website: "https://designer.portfolio.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: true,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 30,
            lastLogin: Date.now(),
          },
          {
            id: 2,
            username: "视觉艺术家",
            email: "artist@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("视觉艺术家", 2),
            bio: "视觉设计师 | 用设计讲故事",
            skills: ["平面设计", "品牌设计", "PS"],
            website: "https://artist.portfolio.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: false,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 20,
            lastLogin: Date.now(),
          },
          {
            id: 3,
            username: "插画师小美",
            email: "xiaomei@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("插画师小美", 3),
            bio: "自由插画师 | 用画笔记录生活",
            skills: ["插画", "水彩", "Procreate"],
            website: "https://xiaomei.art.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: true,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 45,
            lastLogin: Date.now(),
          },
          {
            id: 4,
            username: "设计达人",
            email: "designmaster@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("设计达人", 4),
            bio: "全栈设计师 | 设计即生活",
            skills: ["UI/UX", "品牌设计", "动效"],
            website: "https://designmaster.portfolio.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: false,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 25,
            lastLogin: Date.now(),
          },
          {
            id: 5,
            username: "创意无限",
            email: "creative@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("创意无限", 5),
            bio: "创意总监 | 让创意点亮生活",
            skills: ["创意设计", "艺术指导", "策展"],
            website: "https://creative.portfolio.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: true,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 50,
            lastLogin: Date.now(),
          },
          {
            id: 6,
            username: "艺术人生",
            email: "artlife@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("艺术人生", 6),
            bio: "艺术家 | 用艺术表达人生",
            skills: ["绘画", "雕塑", "装置艺术"],
            website: "https://artlife.art.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: false,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 15,
            lastLogin: Date.now(),
          },
          {
            id: 7,
            username: "数字艺术家",
            email: "digitalart@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("数字艺术家", 7),
            bio: "数字艺术创作者 | 探索虚拟与现实",
            skills: ["3D建模", "数字绘画", "NFT"],
            website: "https://digitalart.art.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: false,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 18,
            lastLogin: Date.now(),
          },
          {
            id: 8,
            username: "品牌设计师",
            email: "branddesign@creativehub.com",
            password: "123456",
            avatar: getDefaultAvatar("品牌设计师", 8),
            bio: "品牌设计师 | 用设计塑造品牌灵魂",
            skills: ["品牌设计", "包装设计", "VI系统"],
            website: "https://branddesign.portfolio.com",
            worksCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            isVerified: true,
            isDefaultAvatar: true,
            createTime: Date.now() - 86400000 * 35,
            lastLogin: Date.now(),
          },
        ];
        this.saveUsers();
      }
      return this.users;
    },

    // 同步所有用户的作品数量
    syncAllUsersWorksCount() {
      try {
        const worksData = localStorage.getItem("works");
        if (!worksData) return;

        const works = JSON.parse(worksData);
        const publishedWorks = works.filter((w) => w.status === "published");

        const worksCountMap = {};
        publishedWorks.forEach((work) => {
          if (!worksCountMap[work.authorId]) {
            worksCountMap[work.authorId] = 0;
          }
          worksCountMap[work.authorId]++;
        });

        let updated = false;
        this.users.forEach((user) => {
          const count = worksCountMap[user.id] || 0;
          if (user.worksCount !== count) {
            user.worksCount = count;
            updated = true;
          }
        });

        if (updated) {
          this.saveUsers();
          console.log("✅ 已同步所有用户的作品数量");
        }

        return this.users;
      } catch (e) {
        console.error("同步用户作品数量失败:", e);
        return this.users;
      }
    },

    // 同步单个用户的作品数量
    syncUserWorksCount(userId) {
      try {
        const worksData = localStorage.getItem("works");
        if (!worksData) return;

        const works = JSON.parse(worksData);
        const publishedWorks = works.filter(
          (w) => w.status === "published" && w.authorId === userId,
        );
        const count = publishedWorks.length;

        const user = this.users.find((u) => u.id === userId);
        if (user && user.worksCount !== count) {
          user.worksCount = count;
          this.saveUsers();
          console.log(`✅ 已同步用户 ${user.username} 的作品数量: ${count}`);
        }
      } catch (e) {
        console.error("同步用户作品数量失败:", e);
      }
    },

    // 登录
    login(email, password) {
      this.initDefaultUsers();
      const user = this.users.find(
        (u) => u.email === email && u.password === password,
      );
      if (user) {
        this.currentUser = { ...user };
        this.isLoggedIn = true;
        user.lastLogin = Date.now();
        this.saveUsers();
        return { success: true, user };
      }
      return { success: false, message: "邮箱或密码错误" };
    },

    // 注册
    register(userData) {
      this.initDefaultUsers();
      if (this.users.some((u) => u.username === userData.username)) {
        return { success: false, message: "用户名已存在" };
      }
      if (this.users.some((u) => u.email === userData.email)) {
        return { success: false, message: "邮箱已被注册" };
      }

      const newUserId = Date.now();
      const newUser = {
        id: newUserId,
        ...userData,
        avatar: getDefaultAvatar(userData.username, newUserId),
        bio: "这个人很懒，什么都没写~",
        skills: [],
        website: "",
        worksCount: 0,
        likesCount: 0,
        viewsCount: 0,
        followersCount: 0,
        followingCount: 0,
        isVerified: false,
        isDefaultAvatar: true,
        createTime: Date.now(),
        lastLogin: Date.now(),
      };

      this.users.push(newUser);
      this.saveUsers();
      return { success: true, user: newUser };
    },

    // 登出
    logout() {
      this.currentUser = null;
      this.isLoggedIn = false;
    },

    // 更新用户信息 - 同步评论用户名和头像
    updateProfile(updates) {
      if (!this.currentUser) return;
      const index = this.users.findIndex((u) => u.id === this.currentUser.id);
      if (index !== -1) {
        // 如果更新了用户名，更新头像（保持颜色不变）
        if (
          updates.username &&
          updates.username !== this.currentUser.username
        ) {
          if (this.users[index].isDefaultAvatar) {
            const colorMatch =
              this.users[index].avatar.match(/background=([^&]+)/);
            const color = colorMatch ? colorMatch[1] : "3498DB";
            updates.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.username)}&background=${color}&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle`;
          }
        }

        // 如果用户上传了新头像，标记为非默认头像
        if (updates.avatar && updates.avatar.startsWith("data:image")) {
          updates.isDefaultAvatar = false;
        }

        // 如果用户恢复默认头像
        if (
          updates.avatar &&
          updates.avatar ===
            getDefaultAvatar(this.users[index].username, this.users[index].id)
        ) {
          updates.isDefaultAvatar = true;
        }

        // 更新用户数据
        this.users[index] = { ...this.users[index], ...updates };
        this.currentUser = { ...this.users[index] };
        this.saveUsers();

        // 同步更新作品中的作者信息
        this.syncWorksAuthorInfo(
          this.currentUser.id,
          this.currentUser.username,
        );

        // 同步更新评论中的用户信息（用户名和头像）
        import("@/stores/interactionStore")
          .then(({ useInteractionStore }) => {
            const interactionStore = useInteractionStore();
            interactionStore.syncCommentUserInfo(this.currentUser.id);
          })
          .catch(() => {
            console.warn("同步评论用户信息失败");
          });

        // 触发更新事件
        this.emitUpdateEvent();

        console.log(`✅ 用户 ${this.currentUser.username} 的信息已更新`);
      }
    },

    // 触发更新事件
    emitUpdateEvent() {
      if (typeof window !== "undefined") {
        const eventDetail = {
          userId: this.currentUser.id,
          user: { ...this.currentUser },
        };

        const events = [
          { name: "user-profile-updated", detail: eventDetail },
          { name: "user-data-changed", detail: eventDetail },
        ];

        events.forEach(({ name, detail }) => {
          window.dispatchEvent(new CustomEvent(name, { detail }));
        });

        setTimeout(() => {
          events.forEach(({ name, detail }) => {
            window.dispatchEvent(new CustomEvent(name, { detail }));
          });
        }, 200);
      }
    },

    // 同步更新作品中的作者信息
    syncWorksAuthorInfo(userId, username) {
      try {
        const worksData = localStorage.getItem("works");
        if (worksData) {
          const works = JSON.parse(worksData);
          let updated = false;
          let count = 0;

          works.forEach((work) => {
            if (work.authorId === userId) {
              work.authorName = username;
              updated = true;
              count++;
            }
          });

          if (updated) {
            localStorage.setItem("works", JSON.stringify(works));
            console.log(`✅ 已同步更新用户 ${username} 的 ${count} 个作品`);
          }
        }
      } catch (e) {
        console.error("同步作品作者信息失败:", e);
      }
    },

    // 更新用户统计数据
    updateUserStats(userId, stats) {
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        Object.assign(user, stats);
        if (this.currentUser?.id === userId) {
          this.currentUser = { ...user };
        }
        this.saveUsers();
      }
    },

    // 保存用户数据
    saveUsers() {
      try {
        localStorage.setItem("users", JSON.stringify(this.users));
      } catch (e) {
        console.error("保存用户数据失败:", e);
      }
    },

    // 加载用户数据
    loadUsers() {
      try {
        const data = localStorage.getItem("users");
        if (data) {
          this.users = JSON.parse(data);
          // 确保每个用户都有必要的字段
          this.users.forEach((user) => {
            if (!user.isVerified) user.isVerified = false;
            if (!user.skills) user.skills = [];
            if (!user.followersCount) user.followersCount = 0;
            if (!user.followingCount) user.followingCount = 0;
            if (!user.worksCount) user.worksCount = 0;
            if (!user.likesCount) user.likesCount = 0;
            if (!user.viewsCount) user.viewsCount = 0;
            if (user.isDefaultAvatar === undefined) user.isDefaultAvatar = true;

            if (user.isDefaultAvatar) {
              const defaultAvatar = getDefaultAvatar(user.username, user.id);
              if (user.avatar !== defaultAvatar) {
                user.avatar = defaultAvatar;
              }
            }
          });
        } else {
          this.initDefaultUsers();
        }
      } catch (e) {
        console.error("加载用户数据失败:", e);
        this.initDefaultUsers();
      }
      return this.users;
    },

    // 获取所有用户
    getAllUsers() {
      this.loadUsers();
      this.syncAllUsersWorksCount();
      return this.users;
    },

    // 获取用户总数
    getUserCount() {
      this.loadUsers();
      return this.users.length;
    },

    // 重置用户数据
    resetUsers() {
      this.users = [];
      this.currentUser = null;
      this.isLoggedIn = false;
      localStorage.removeItem("users");
      localStorage.removeItem("user-store");
      this.initDefaultUsers();
    },

    // 修复所有用户头像
    fixAllAvatars() {
      this.users.forEach((user) => {
        if (user.isDefaultAvatar) {
          user.avatar = getDefaultAvatar(user.username, user.id);
        }
      });
      this.saveUsers();
      return this.users;
    },
  },

  persist: {
    key: "user-store",
    storage: localStorage,
    paths: ["currentUser", "isLoggedIn"],
  },
});
