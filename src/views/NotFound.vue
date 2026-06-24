<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <div class="not-found-icon">🔍</div>
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在或已被移除</p>
        <div class="not-found-actions">
          <el-button type="primary" size="large" @click="$router.push('/')">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="$router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
        </div>
        <div class="not-found-suggestions">
          <p>您可能感兴趣：</p>
          <div class="suggestion-links">
            <router-link to="/ranking">🏆 热门排行榜</router-link>
            <router-link to="/about">📖 关于我们</router-link>
            <router-link v-if="!userStore.isLoggedIn" to="/login"
              >🔑 登录</router-link
            >
            <router-link v-else to="/dashboard">📊 仪表盘</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.not-found-content {
  text-align: center;
  background: white;
  padding: 60px 50px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.not-found-icon {
  font-size: 80px;
  margin-bottom: 16px;
  display: block;
}

.not-found-content h1 {
  font-size: 80px;
  font-weight: 800;
  color: var(--primary, #2c3e50);
  margin: 0;
  line-height: 1;
}

.not-found-content h2 {
  font-size: 28px;
  color: var(--text-dark, #2c3e50);
  margin: 12px 0 8px;
}

.not-found-content p {
  color: var(--text-gray, #7f8c8d);
  font-size: 16px;
  margin-bottom: 32px;
}

.not-found-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.not-found-actions .el-button {
  min-width: 140px;
}

.not-found-suggestions {
  border-top: 1px solid var(--bg-light, #ecf0f1);
  padding-top: 24px;
}

.not-found-suggestions p {
  font-size: 14px;
  color: var(--text-gray, #7f8c8d);
  margin-bottom: 12px;
}

.suggestion-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.suggestion-links a {
  padding: 6px 16px;
  background: var(--bg-light, #ecf0f1);
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-dark, #2c3e50);
  transition: all 0.3s ease;
  text-decoration: none;
}

.suggestion-links a:hover {
  background: var(--secondary, #3498db);
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 24px;
  }

  .not-found-content h1 {
    font-size: 60px;
  }

  .not-found-actions {
    flex-direction: column;
  }

  .not-found-actions .el-button {
    width: 100%;
  }
}
</style>
