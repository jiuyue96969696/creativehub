import { defineStore } from "pinia";
import { useUserStore } from "./userStore";

export const useTopicStore = defineStore("topic", {
  state: () => ({
    topics: [],
    currentTopic: null,
    categories: [
      { id: 1, name: "设计灵感", icon: "💡", description: "分享你的设计灵感" },
      {
        id: 2,
        name: "技术交流",
        icon: "💻",
        description: "技术问题和经验分享",
      },
      { id: 3, name: "作品互评", icon: "🎨", description: "互相点评作品" },
      { id: 4, name: "行业资讯", icon: "📰", description: "设计行业最新动态" },
      { id: 5, name: "求职招聘", icon: "💼", description: "设计工作机会" },
      {
        id: 6,
        name: "闲聊灌水",
        icon: "💬",
        description: "轻松话题，自由交流",
      },
    ],
  }),

  getters: {
    // 获取所有话题（按时间排序）
    allTopics: (state) => {
      return [...state.topics].sort((a, b) => b.createTime - a.createTime);
    },

    // 按分类获取话题
    topicsByCategory: (state) => (categoryId) => {
      return state.topics
        .filter((t) => t.categoryId === categoryId)
        .sort((a, b) => b.createTime - a.createTime);
    },

    // 获取热门话题（按点赞数排序）
    hotTopics: (state) => {
      return [...state.topics].sort((a, b) => b.likes - a.likes).slice(0, 10);
    },

    // 获取话题详情
    getTopicById: (state) => (id) => {
      return state.topics.find((t) => t.id === id);
    },

    // 获取话题评论
    getTopicComments: (state) => (topicId) => {
      const topic = state.topics.find((t) => t.id === topicId);
      return topic ? topic.comments : [];
    },

    // 获取用户发布的话题
    getUserTopics: (state) => (userId) => {
      return state.topics
        .filter((t) => t.authorId === userId)
        .sort((a, b) => b.createTime - a.createTime);
    },
  },

  actions: {
    // 初始化示例数据
    initSampleTopics() {
      if (this.topics.length === 0) {
        const userStore = useUserStore();
        const users = userStore.users;

        this.topics = [
          {
            id: 1,
            title: "✨ 分享我最近的UI设计作品，欢迎大家点评！",
            content:
              "最近完成了一个电商App的UI设计，使用了毛玻璃效果和微交互动画。整体风格偏向年轻化，色彩以紫色和白色为主。大家觉得怎么样？有什么改进建议吗？",
            categoryId: 1,
            categoryName: "设计灵感",
            authorId: 1,
            authorName: "创意设计师",
            authorAvatar: users.find((u) => u.id === 1)?.avatar || "",
            likes: 23,
            comments: [
              {
                id: 101,
                userId: 2,
                userName: "视觉艺术家",
                userAvatar: users.find((u) => u.id === 2)?.avatar || "",
                content: "色彩搭配很棒！建议增加一些渐变层次感",
                createTime: Date.now() - 86400000 * 2,
              },
              {
                id: 102,
                userId: 3,
                userName: "插画师小美",
                userAvatar: users.find((u) => u.id === 3)?.avatar || "",
                content: "毛玻璃效果处理得很细腻！学习了 👍",
                createTime: Date.now() - 86400000 * 1.5,
              },
            ],
            createTime: Date.now() - 86400000 * 3,
            updateTime: Date.now() - 86400000 * 3,
          },
          {
            id: 2,
            title: "💻 Figma 插件开发经验分享",
            content:
              "最近开发了一个Figma插件，用于自动生成设计规范文档。分享一下开发过程中的一些心得和遇到的问题。主要技术栈：TypeScript + React + Figma API。欢迎大家交流讨论！",
            categoryId: 2,
            categoryName: "技术交流",
            authorId: 2,
            authorName: "视觉艺术家",
            authorAvatar: users.find((u) => u.id === 2)?.avatar || "",
            likes: 15,
            comments: [
              {
                id: 201,
                userId: 1,
                userName: "创意设计师",
                userAvatar: users.find((u) => u.id === 1)?.avatar || "",
                content: "这个插件太实用了！能分享一下源码吗？",
                createTime: Date.now() - 86400000 * 1,
              },
            ],
            createTime: Date.now() - 86400000 * 2,
            updateTime: Date.now() - 86400000 * 2,
          },
          {
            id: 3,
            title: "🎨 作品互评：最近画的一组插画",
            description:
              '最近画了一组以"城市"为主题的插画作品，想听听大家的意见和建议。',
            categoryId: 3,
            categoryName: "作品互评",
            authorId: 3,
            authorName: "插画师小美",
            authorAvatar: users.find((u) => u.id === 3)?.avatar || "",
            likes: 8,
            comments: [],
            createTime: Date.now() - 86400000 * 1,
            updateTime: Date.now() - 86400000 * 1,
          },
        ];
        this.saveTopics();
      }
    },

    // 创建话题
    createTopic(topicData) {
      this.initSampleTopics();
      const userStore = useUserStore();
      const user = userStore.currentUser;

      const newTopic = {
        id: Date.now(),
        ...topicData,
        authorId: user.id,
        authorName: user.username,
        authorAvatar: user.avatar,
        likes: 0,
        comments: [],
        createTime: Date.now(),
        updateTime: Date.now(),
      };

      this.topics.push(newTopic);
      this.saveTopics();
      return newTopic;
    },

    // 点赞话题
    likeTopic(topicId, userId) {
      const topic = this.topics.find((t) => t.id === topicId);
      if (!topic) return { action: "not_found" };

      // 检查是否已点赞（使用临时记录）
      const likeKey = `topic_like_${userId}_${topicId}`;
      const hasLiked = localStorage.getItem(likeKey) === "true";

      if (hasLiked) {
        topic.likes = Math.max(topic.likes - 1, 0);
        localStorage.removeItem(likeKey);
        this.saveTopics();
        return { action: "unliked" };
      } else {
        topic.likes += 1;
        localStorage.setItem(likeKey, "true");
        this.saveTopics();
        return { action: "liked" };
      }
    },

    // 检查是否已点赞
    hasLikedTopic(topicId, userId) {
      const likeKey = `topic_like_${userId}_${topicId}`;
      return localStorage.getItem(likeKey) === "true";
    },

    // 添加评论
    addComment(topicId, userId, content) {
      const topic = this.topics.find((t) => t.id === topicId);
      if (!topic) return null;

      const userStore = useUserStore();
      const user = userStore.users.find((u) => u.id === userId);
      if (!user) return null;

      const comment = {
        id: Date.now(),
        userId: user.id,
        userName: user.username,
        userAvatar: user.avatar,
        content,
        createTime: Date.now(),
      };

      topic.comments.push(comment);
      topic.updateTime = Date.now();
      this.saveTopics();
      return comment;
    },

    // 删除评论
    deleteComment(topicId, commentId, userId) {
      const topic = this.topics.find((t) => t.id === topicId);
      if (!topic) return false;

      const commentIndex = topic.comments.findIndex((c) => c.id === commentId);
      if (commentIndex === -1) return false;

      // 只有评论作者或话题作者可以删除
      if (
        topic.comments[commentIndex].userId !== userId &&
        topic.authorId !== userId
      ) {
        return false;
      }

      topic.comments.splice(commentIndex, 1);
      this.saveTopics();
      return true;
    },

    // 删除话题
    deleteTopic(topicId, userId) {
      const index = this.topics.findIndex((t) => t.id === topicId);
      if (index === -1) return false;

      // 只有话题作者可以删除
      if (this.topics[index].authorId !== userId) {
        return false;
      }

      this.topics.splice(index, 1);
      this.saveTopics();
      return true;
    },

    // 保存数据
    saveTopics() {
      localStorage.setItem("topics", JSON.stringify(this.topics));
    },

    // 加载数据
    loadTopics() {
      const data = localStorage.getItem("topics");
      if (data) {
        this.topics = JSON.parse(data);
      } else {
        this.initSampleTopics();
      }
    },
  },

  persist: {
    key: "topic-store",
    storage: localStorage,
    paths: ["topics"],
  },
});
