<template>
  <div id="app">
    <Header v-if="!isBackendRoute" />
    <router-view />
    <Footer v-if="!isBackendRoute" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useWorkStore } from "@/stores/workStore";
import { useInteractionStore } from "@/stores/interactionStore";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const route = useRoute();
const userStore = useUserStore();
const workStore = useWorkStore();
const interactionStore = useInteractionStore();

const isBackendRoute = computed(
  () =>
    route.path.startsWith("/dashboard") ||
    route.path.startsWith("/manage") ||
    route.path.startsWith("/upload") ||
    route.path.startsWith("/edit") ||
    route.path.startsWith("/drafts") ||
    route.path.startsWith("/settings") ||
    route.path === "/login",
);

// 监听用户资料更新事件
const handleUserProfileUpdate = async (event) => {
  const { userId, user } = event.detail;
  console.log(`🔄 用户 ${user?.username || userId} 的资料已更新，正在同步...`);

  try {
    // 1. 重新加载用户数据
    userStore.loadUsers();
    console.log("✅ 用户数据已重新加载");

    // 2. 重新加载作品数据以更新作者信息
    workStore.fetchWorks();
    console.log("✅ 作品数据已重新加载");

    // 3. 重新加载互动数据
    interactionStore.loadData();
    console.log("✅ 互动数据已重新加载");

    // 4. 强制更新视图
    await nextTick();
    console.log("✅ 视图已更新");

    // 5. 如果当前页面是首页或用户主页，强制刷新组件
    const currentPath = route.path;
    if (currentPath === "/" || currentPath.startsWith("/user/")) {
      console.log("🔄 当前在首页或用户主页，强制刷新");
      // 触发 Vue 的强制更新
      // 通过重新设置路由参数来刷新组件
      const currentRoute = route;
      // 如果当前路由有参数，通过更新参数触发刷新
      if (currentRoute.params.id) {
        // 对于用户主页，重新加载用户数据
        const userId = Number(currentRoute.params.id);
        const userData = userStore.userById(userId);
        if (userData) {
          // 触发用户主页的数据更新
          window.dispatchEvent(
            new CustomEvent("user-data-refresh", {
              detail: { userId: userId },
            }),
          );
        }
      }
    }

    console.log("✅ 所有数据同步完成");
  } catch (error) {
    console.error("❌ 数据同步失败:", error);
  }
};

// 监听用户数据刷新事件（用于用户主页）
const handleUserDataRefresh = (event) => {
  const { userId } = event.detail;
  console.log(`🔄 刷新用户 ${userId} 的数据`);
  // 重新加载用户数据
  userStore.loadUsers();
  // 重新加载作品数据
  workStore.fetchWorks();
};

// 初始化应用数据
const initAppData = () => {
  console.log("🚀 CreativeHub 应用启动中...");

  // 加载用户数据
  userStore.loadUsers();
  console.log(`👥 已加载 ${userStore.users.length} 位创作者`);

  // 加载作品数据
  workStore.fetchWorks();
  console.log(`🎨 已加载 ${workStore.publishedWorks.length} 个作品`);

  // 加载互动数据
  interactionStore.loadData();
  console.log("💬 互动数据已加载");

  // 如果有当前用户，显示欢迎信息
  if (userStore.isLoggedIn && userStore.currentUser) {
    console.log(`👋 欢迎回来，${userStore.currentUser.username}！`);
  }
};

onMounted(() => {
  // 初始化应用数据
  initAppData();

  // 监听用户更新事件
  window.addEventListener("user-profile-updated", handleUserProfileUpdate);
  window.addEventListener("user-data-refresh", handleUserDataRefresh);

  console.log("✅ CreativeHub 应用已就绪");
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener("user-profile-updated", handleUserProfileUpdate);
  window.removeEventListener("user-data-refresh", handleUserDataRefresh);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #2c3e50;
  --primary-light: #34495e;
  --secondary: #3498db;
  --accent: #e74c3c;
  --bg-light: #ecf0f1;
  --text-dark: #2c3e50;
  --text-gray: #7f8c8d;
  --white: #ffffff;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.12);
  --radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

#app {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

a {
  text-decoration: none;
  color: inherit;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #ecf0f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #3498db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2980b9;
}

/* 全局按钮样式 */
.btn-primary {
  display: inline-block;
  padding: 10px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-outline {
  display: inline-block;
  padding: 10px 24px;
  background: transparent;
  color: #3498db;
  border: 2px solid #3498db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}

/* 卡片悬停效果 */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Element Plus 自定义覆盖 */
.el-button--primary {
  background-color: #3498db !important;
  border-color: #3498db !important;
}

.el-button--primary:hover {
  background-color: #2980b9 !important;
  border-color: #2980b9 !important;
}

.el-tag--primary {
  background-color: #3498db !important;
  border-color: #3498db !important;
  color: white !important;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* 响应式工具类 */
@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .hide-on-desktop {
    display: none !important;
  }
}
</style>
