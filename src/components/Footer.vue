<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="logo-icon">🎨</span>
          <span class="logo-text">CreativeHub</span>
          <p class="footer-desc">创意作品展示与社区交流平台</p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>平台</h4>
            <router-link to="/">首页</router-link>
            <router-link to="/ranking">排行榜</router-link>
            <router-link to="/about">关于我们</router-link>
          </div>
          <div class="link-group">
            <h4>发现</h4>
            <router-link to="/category/1">UI设计</router-link>
            <router-link to="/category/2">平面设计</router-link>
            <router-link to="/category/3">插画</router-link>
            <router-link to="/category/4">摄影</router-link>
          </div>
          <div class="link-group">
            <h4>我的</h4>
            <!-- 个人主页 - 需要登录才能访问 -->
            <router-link
              v-if="userStore.isLoggedIn"
              :to="`/user/${userStore.currentUserId}`"
            >
              个人主页
            </router-link>
            <span v-else class="disabled-link" title="请先登录">个人主页</span>

            <!-- 关注管理 - 需要登录才能访问 -->
            <router-link v-if="userStore.isLoggedIn" to="/follows">
              关注管理
            </router-link>
            <span v-else class="disabled-link" title="请先登录">关注管理</span>

            <!-- 我的收藏 - 需要登录才能访问 -->
            <router-link v-if="userStore.isLoggedIn" to="/collects">
              我的收藏
            </router-link>
            <span v-else class="disabled-link" title="请先登录">我的收藏</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 CreativeHub. All rights reserved.</p>
        <div class="social-icons">
          <a href="#"
            ><el-icon><Share /></el-icon
          ></a>
          <a href="#"
            ><el-icon><Share /></el-icon
          ></a>
          <a href="#"
            ><el-icon><Share /></el-icon
          ></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
</script>

<style scoped>
.footer {
  background: var(--primary, #2c3e50);
  color: rgba(255, 255, 255, 0.8);
  padding: 48px 0 24px;
  margin-top: 60px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand .logo-icon {
  font-size: 32px;
}

.footer-brand .logo-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-left: 8px;
}

.footer-desc {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.7;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.link-group h4 {
  color: white;
  font-size: 16px;
  margin-bottom: 12px;
}

.link-group a {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
}

.link-group a:hover {
  color: white;
}

/* 未登录时禁用链接样式 */
.disabled-link {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 8px;
  cursor: not-allowed;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  font-size: 14px;
  opacity: 0.7;
}

.social-icons {
  display: flex;
  gap: 16px;
}

.social-icons a {
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  transition: all 0.3s ease;
}

.social-icons a:hover {
  color: white;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
</style>
