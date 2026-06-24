import { defineStore } from "pinia";
import { useWorkStore } from "./workStore";
import { useUserStore } from "./userStore";

export const useInteractionStore = defineStore("interaction", {
  state: () => ({
    likes: [],
    collects: [],
    comments: [],
    follows: [],
  }),

  getters: {
    hasLiked: (state) => (userId, workId) => {
      return state.likes.some(
        (l) => l.userId === userId && l.workId === workId,
      );
    },

    hasCollected: (state) => (userId, workId) => {
      return state.collects.some(
        (c) => c.userId === userId && c.workId === workId,
      );
    },

    hasFollowed: (state) => (followerId, followingId) => {
      return state.follows.some(
        (f) => f.followerId === followerId && f.followingId === followingId,
      );
    },

    commentsByWork: (state) => (workId) => {
      return state.comments
        .filter((c) => c.workId === workId)
        .sort((a, b) => b.createTime - a.createTime);
    },

    collectedWorkIds: (state) => (userId) => {
      return state.collects
        .filter((c) => c.userId === userId)
        .map((c) => c.workId);
    },

    collectedWorks: (state) => (userId) => {
      const workStore = useWorkStore();
      const workIds = state.collects
        .filter((c) => c.userId === userId)
        .map((c) => c.workId);
      return workStore.works.filter((w) => workIds.includes(w.id));
    },

    collectCount: (state) => (userId) => {
      return state.collects.filter((c) => c.userId === userId).length;
    },
  },

  actions: {
    // 初始化示例数据
    initSampleData() {
      try {
        const userStore = useUserStore();
        if (userStore.users.length === 0) {
          userStore.loadUsers();
        }
        const users = userStore.users;

        if (this.comments.length === 0) {
          this.comments = [
            {
              id: 1,
              workId: 1,
              userId: 2,
              userName: users.find((u) => u.id === 2)?.username || "视觉艺术家",
              userAvatar:
                users.find((u) => u.id === 2)?.avatar ||
                "https://ui-avatars.com/api/?name=视觉艺术家&background=27AE60&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle",
              content: "太棒了！这个设计非常有创意，细节处理也很到位👍",
              createTime: Date.now() - 86400000 * 2,
            },
            {
              id: 2,
              workId: 1,
              userId: 3,
              userName: users.find((u) => u.id === 3)?.username || "插画师小美",
              userAvatar:
                users.find((u) => u.id === 3)?.avatar ||
                "https://ui-avatars.com/api/?name=插画师小美&background=E74C3C&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle",
              content: "很喜欢这个配色方案，感觉很有质感！",
              createTime: Date.now() - 86400000 * 1.5,
            },
            {
              id: 3,
              workId: 3,
              userId: 1,
              userName: users.find((u) => u.id === 1)?.username || "创意设计师",
              userAvatar:
                users.find((u) => u.id === 1)?.avatar ||
                "https://ui-avatars.com/api/?name=创意设计师&background=2980B9&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle",
              content: "这张插画太美了！色彩运用很梦幻，特别喜欢那只小鹿🦌",
              createTime: Date.now() - 86400000 * 1,
            },
            {
              id: 4,
              workId: 6,
              userId: 1,
              userName: users.find((u) => u.id === 1)?.username || "创意设计师",
              userAvatar:
                users.find((u) => u.id === 1)?.avatar ||
                "https://ui-avatars.com/api/?name=创意设计师&background=2980B9&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle",
              content: "3D角色设计得很酷！机械细节很丰富",
              createTime: Date.now() - 86400000 * 0.5,
            },
          ];
          this.saveData();
        }

        // 初始化关注数据
        if (this.follows.length === 0) {
          this.follows = [
            // === 创意设计师 (id:1) 的关注 ===
            // 创意设计师关注视觉艺术家
            {
              followerId: 1,
              followingId: 2,
              createTime: Date.now() - 86400000 * 10,
            },
            // 创意设计师关注插画师小美
            {
              followerId: 1,
              followingId: 3,
              createTime: Date.now() - 86400000 * 8,
            },

            // === 视觉艺术家 (id:2) 的关注 ===
            // 视觉艺术家关注插画师小美
            {
              followerId: 2,
              followingId: 3,
              createTime: Date.now() - 86400000 * 6,
            },
            // 视觉艺术家关注创意设计师
            {
              followerId: 2,
              followingId: 1,
              createTime: Date.now() - 86400000 * 3,
            },

            // === 插画师小美 (id:3) 的关注 ===
            // 插画师小美关注创意设计师
            {
              followerId: 3,
              followingId: 1,
              createTime: Date.now() - 86400000 * 5,
            },

            // === 九月9 (id:9) 的关注 ===
            // 视觉艺术家关注九月9（使九月9的粉丝数变为2）
            {
              followerId: 2,
              followingId: 9,
              createTime: Date.now() - 86400000 * 2,
            },
            // 插画师小美关注九月9（使九月9的粉丝数变为2）
            {
              followerId: 3,
              followingId: 9,
              createTime: Date.now() - 86400000 * 1,
            },
          ];
          this.saveData();
          this.updateFollowCounts();
        }

        if (this.collects.length === 0) {
          this.collects = [
            { userId: 1, workId: 3, createTime: Date.now() - 86400000 * 5 },
            { userId: 1, workId: 6, createTime: Date.now() - 86400000 * 3 },
            { userId: 2, workId: 1, createTime: Date.now() - 86400000 * 4 },
            { userId: 3, workId: 1, createTime: Date.now() - 86400000 * 2 },
          ];
          this.saveData();
          this.updateWorkCollectCounts();
        }
      } catch (e) {
        console.warn("初始化示例数据失败:", e);
      }
    },

    // 更新作品收藏数
    updateWorkCollectCounts() {
      const workStore = useWorkStore();
      const collectCounts = {};
      this.collects.forEach((c) => {
        if (!collectCounts[c.workId]) {
          collectCounts[c.workId] = 0;
        }
        collectCounts[c.workId]++;
      });

      workStore.works.forEach((work) => {
        work.collects = collectCounts[work.id] || 0;
      });
      workStore.saveWorks();
    },

    // 获取用户收藏的作品
    getUserCollects(userId) {
      const workStore = useWorkStore();
      const workIds = this.collects
        .filter((c) => c.userId === userId)
        .map((c) => c.workId);
      return workStore.works.filter((w) => workIds.includes(w.id));
    },

    // 收藏
    collectWork(userId, workId) {
      const existing = this.collects.find(
        (c) => c.userId === userId && c.workId === workId,
      );
      if (existing) {
        this.collects = this.collects.filter((c) => c !== existing);
        const workStore = useWorkStore();
        workStore.updateWorkInteraction(workId, "collects", -1);
        this.saveData();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("collect-updated", {
              detail: { userId, workId, action: "uncollected" },
            }),
          );
        }
        return { action: "uncollected" };
      } else {
        this.collects.push({ userId, workId, createTime: Date.now() });
        const workStore = useWorkStore();
        workStore.updateWorkInteraction(workId, "collects", 1);
        this.saveData();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("collect-updated", {
              detail: { userId, workId, action: "collected" },
            }),
          );
        }
        return { action: "collected" };
      }
    },

    // 点赞
    likeWork(userId, workId) {
      const existing = this.likes.find(
        (l) => l.userId === userId && l.workId === workId,
      );
      if (existing) {
        this.likes = this.likes.filter((l) => l !== existing);
        const workStore = useWorkStore();
        workStore.updateWorkInteraction(workId, "likes", -1);
        this.saveData();
        return { action: "unliked" };
      } else {
        this.likes.push({ userId, workId, createTime: Date.now() });
        const workStore = useWorkStore();
        workStore.updateWorkInteraction(workId, "likes", 1);
        this.saveData();
        return { action: "liked" };
      }
    },

    // 评论
    addComment(workId, userId, content) {
      const userStore = useUserStore();
      userStore.loadUsers();
      const user = userStore.users.find((u) => u.id === userId);
      if (!user) return null;

      const comment = {
        id: Date.now(),
        workId,
        userId,
        userName: user.username,
        userAvatar: user.avatar,
        content,
        createTime: Date.now(),
      };

      this.comments.push(comment);
      const workStore = useWorkStore();
      workStore.updateWorkInteraction(workId, "comments", 1);
      this.saveData();
      return comment;
    },

    // 关注
    followUser(followerId, followingId) {
      if (followerId === followingId) return { action: "self" };

      const existing = this.follows.find(
        (f) => f.followerId === followerId && f.followingId === followingId,
      );
      if (existing) {
        this.follows = this.follows.filter((f) => f !== existing);
        this.saveData();
        this.updateFollowCounts();
        return { action: "unfollowed" };
      } else {
        this.follows.push({ followerId, followingId, createTime: Date.now() });
        this.saveData();
        this.updateFollowCounts();
        return { action: "followed" };
      }
    },

    // 更新关注数
    updateFollowCounts() {
      const userStore = useUserStore();
      const allUsers = userStore.users;

      allUsers.forEach((user) => {
        const followers = this.follows.filter(
          (f) => f.followingId === user.id,
        ).length;
        const following = this.follows.filter(
          (f) => f.followerId === user.id,
        ).length;
        userStore.updateUserStats(user.id, {
          followersCount: followers,
          followingCount: following,
        });
      });
    },

    // 获取作品评论数
    getCommentCount(workId) {
      return this.comments.filter((c) => c.workId === workId).length;
    },

    // 同步评论用户信息
    syncCommentUserInfo(userId) {
      const userStore = useUserStore();
      const user = userStore.users.find((u) => u.id === userId);
      if (!user) return;

      let updated = false;
      this.comments.forEach((comment) => {
        if (comment.userId === userId) {
          if (comment.userName !== user.username) {
            comment.userName = user.username;
            updated = true;
          }
          if (comment.userAvatar !== user.avatar) {
            comment.userAvatar = user.avatar;
            updated = true;
          }
        }
      });

      if (updated) {
        this.saveData();
        console.log(`✅ 已同步更新用户 ${user.username} 的评论信息`);
      }
    },

    // 同步所有评论
    syncAllCommentUserInfo() {
      const userStore = useUserStore();
      userStore.loadUsers();

      let updated = false;
      this.comments.forEach((comment) => {
        const user = userStore.users.find((u) => u.id === comment.userId);
        if (user) {
          if (
            comment.userName !== user.username ||
            comment.userAvatar !== user.avatar
          ) {
            comment.userName = user.username;
            comment.userAvatar = user.avatar;
            updated = true;
          }
        }
      });

      if (updated) {
        this.saveData();
        console.log("✅ 已同步更新所有评论的用户信息");
      }
    },

    // 保存数据
    saveData() {
      try {
        localStorage.setItem(
          "interactions",
          JSON.stringify({
            likes: this.likes,
            collects: this.collects,
            comments: this.comments,
            follows: this.follows,
          }),
        );
      } catch (e) {
        console.error("保存互动数据失败:", e);
      }
    },

    // 加载数据
    loadData() {
      try {
        const data = localStorage.getItem("interactions");
        if (data) {
          const parsed = JSON.parse(data);
          this.likes = parsed.likes || [];
          this.collects = parsed.collects || [];
          this.comments = parsed.comments || [];
          this.follows = parsed.follows || [];
        } else {
          this.initSampleData();
        }
      } catch (e) {
        console.error("加载互动数据失败:", e);
        this.initSampleData();
      }
    },
  },

  persist: {
    key: "interaction-store",
    storage: localStorage,
    paths: ["likes", "collects", "comments", "follows"],
  },
});
