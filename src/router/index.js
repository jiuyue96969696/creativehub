import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/userStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 前台路由
    {
      path: "/",
      name: "home",
      component: () => import("@/views/frontend/Home.vue"),
    },
    {
      path: "/work/:id",
      name: "workDetail",
      component: () => import("@/views/frontend/WorkDetail.vue"),
    },
    {
      path: "/category/:id",
      name: "category",
      component: () => import("@/views/frontend/Category.vue"),
    },
    {
      path: "/tag/:name",
      name: "tag",
      component: () => import("@/views/frontend/Tag.vue"),
    },
    {
      path: "/search",
      name: "search",
      component: () => import("@/views/frontend/Search.vue"),
    },
    {
      path: "/user/:id",
      name: "userProfile",
      component: () => import("@/views/frontend/UserProfile.vue"),
    },
    {
      path: "/ranking",
      name: "ranking",
      component: () => import("@/views/frontend/Ranking.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/frontend/About.vue"),
    },
    // 话题广场路由
    {
      path: "/topics",
      name: "topicSquare",
      component: () => import("@/views/frontend/TopicSquare.vue"),
    },
    {
      path: "/topic/:id",
      name: "topicDetail",
      component: () => import("@/views/frontend/TopicDetail.vue"),
    },
    // 收藏页面
    {
      path: "/collects",
      name: "myCollects",
      component: () => import("@/views/frontend/MyCollects.vue"),
      meta: { requiresAuth: true },
    },
    // 关注列表页面
    {
      path: "/follows",
      name: "followList",
      component: () => import("@/views/frontend/FollowList.vue"),
      meta: { requiresAuth: true },
    },
    // 后台路由
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/backend/Login.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/backend/Dashboard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/manage/works",
      name: "workManage",
      component: () => import("@/views/backend/WorkManage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/upload",
      name: "workUpload",
      component: () => import("@/views/backend/WorkUpload.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/edit/:id",
      name: "workEdit",
      component: () => import("@/views/backend/WorkEdit.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/drafts",
      name: "drafts",
      component: () => import("@/views/backend/Draft.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/backend/Settings.vue"),
      meta: { requiresAuth: true },
    },
    // 404 路由
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // 需要登录才能访问的页面
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      next("/login");
      return;
    }
  }

  // 如果已登录，访问登录页则跳转到仪表盘
  if (to.path === "/login" && userStore.isLoggedIn) {
    next("/dashboard");
    return;
  }

  next();
});

export default router;
