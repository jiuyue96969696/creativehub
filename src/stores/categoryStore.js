import { defineStore } from "pinia";

export const useCategoryStore = defineStore("category", {
  state: () => ({
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
    activeCategoryId: null,
  }),

  getters: {
    // 获取所有分类
    allCategories: (state) => state.categories,

    // 获取当前分类
    currentCategory: (state) => {
      if (!state.activeCategoryId) return null;
      return state.categories.find((c) => c.id === state.activeCategoryId);
    },

    // 根据ID获取分类
    getCategoryById: (state) => (id) => {
      return state.categories.find((c) => c.id === id);
    },

    // 获取分类名称
    getCategoryName: (state) => (id) => {
      const category = state.categories.find((c) => c.id === id);
      return category ? category.name : "未分类";
    },
  },

  actions: {
    // 设置当前分类
    setActiveCategory(categoryId) {
      this.activeCategoryId = categoryId;
    },

    // 更新分类作品数量
    updateCategoryCounts(works) {
      this.categories.forEach((cat) => {
        cat.count = works.filter(
          (w) => w.categoryId === cat.id && w.status === "published",
        ).length;
      });
    },

    // 获取分类下的作品（需要在 workStore 中调用）
    getCategoryWorks(categoryId, workStore) {
      return workStore.worksByCategory(categoryId);
    },

    // 重置分类状态
    reset() {
      this.activeCategoryId = null;
    },
  },

  persist: {
    key: "category-store",
    storage: localStorage,
    paths: ["activeCategoryId"],
  },
});
