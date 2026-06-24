<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">🎨</span>
          <span class="logo-text">CreativeHub</span>
        </router-link>

        <nav class="nav-menu">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/topics" class="nav-link">话题广场</router-link>
          <router-link to="/ranking" class="nav-link">排行榜</router-link>
          <router-link to="/about" class="nav-link">关于</router-link>
          <router-link
            v-if="userStore.isLoggedIn"
            to="/dashboard"
            class="nav-link"
          >
            创作者中心
          </router-link>
        </nav>

        <div class="header-actions">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索作品、设计师..."
              @keyup.enter="handleSearch"
            />
            <el-icon @click="handleSearch"><Search /></el-icon>
          </div>

          <template v-if="userStore.isLoggedIn">
            <router-link to="/upload" class="btn-upload">
              <el-icon><Plus /></el-icon>
              <span>发布作品</span>
            </router-link>
            <el-dropdown @command="handleCommand">
              <div class="user-avatar">
                <AppImage
                  :src="userStore.currentUser?.avatar || defaultAvatar"
                  :alt="userStore.currentUser?.username || 'avatar'"
                  :width="36"
                  :height="36"
                  fallback-text=""
                  object-fit="cover"
                  border-radius="50%"
                />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon> 个人主页
                  </el-dropdown-item>
                  <el-dropdown-item command="follows">
                    <el-icon><UserFilled /></el-icon> 关注管理
                  </el-dropdown-item>
                  <el-dropdown-item command="collects">
                    <el-icon><Collection /></el-icon> 我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item divided command="dashboard">
                    <el-icon><DataBoard /></el-icon> 仪表盘
                  </el-dropdown-item>
                  <el-dropdown-item command="manage">
                    <el-icon><Document /></el-icon> 作品管理
                  </el-dropdown-item>
                  <el-dropdown-item command="drafts">
                    <el-icon><Edit /></el-icon> 草稿箱
                  </el-dropdown-item>
                  <el-dropdown-item divided command="settings">
                    <el-icon><Setting /></el-icon> 个人设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-login">登录</router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/userStore";
import AppImage from "./AppImage.vue";

const router = useRouter();
const userStore = useUserStore();
const searchQuery = ref("");
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: "/search", query: { q: searchQuery.value.trim() } });
  }
};

const handleCommand = (command) => {
  switch (command) {
    case "profile":
      router.push(`/user/${userStore.currentUser.id}`);
      break;
    case "follows":
      router.push("/follows");
      break;
    case "collects":
      router.push("/collects");
      break;
    case "dashboard":
      router.push("/dashboard");
      break;
    case "manage":
      router.push("/manage/works");
      break;
    case "drafts":
      router.push("/drafts");
      break;
    case "settings":
      router.push("/settings");
      break;
    case "logout":
      userStore.logout();
      ElMessage.success("已退出登录");
      router.push("/");
      break;
  }
};
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  height: 68px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  flex-shrink: 0;
  text-decoration: none;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  gap: 32px;
  margin: 0 40px;
}

.nav-link {
  font-size: 15px;
  color: #7f8c8d;
  transition: all 0.3s ease;
  position: relative;
  text-decoration: none;
}

.nav-link:hover {
  color: #2c3e50;
}

.nav-link.router-link-active {
  color: #3498db;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3498db;
  border-radius: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  background: #ecf0f1;
  border-radius: 24px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  background: white;
  box-shadow: 0 0 0 2px #3498db;
}

.search-box input {
  border: none;
  background: transparent;
  padding: 8px 12px;
  font-size: 14px;
  width: 180px;
  outline: none;
}

.search-box .el-icon {
  color: #7f8c8d;
  cursor: pointer;
  font-size: 18px;
}

.search-box .el-icon:hover {
  color: #3498db;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: #3498db;
  color: white;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-upload:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-upload .el-icon {
  font-size: 16px;
}

.btn-login {
  padding: 8px 20px;
  color: #3498db;
  border: 2px solid #3498db;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-login:hover {
  background: #3498db;
  color: white;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #ecf0f1;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: #3498db;
}

.user-avatar :deep(.app-image) {
  width: 100%;
  height: 100%;
}

.user-avatar :deep(.app-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-menu {
    gap: 20px;
    margin: 0 20px;
  }
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .search-box input {
    width: 100px;
  }

  .btn-upload span {
    display: none;
  }

  .header-actions {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .search-box input {
    width: 70px;
    font-size: 13px;
    padding: 6px 8px;
  }

  .search-box {
    padding: 0 10px;
  }

  .btn-upload {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
