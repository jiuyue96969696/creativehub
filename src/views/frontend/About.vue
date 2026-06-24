<template>
  <div class="about-page">
    <div class="container">
      <div class="about-content">
        <div class="about-hero">
          <h1>🎨 关于 CreativeHub</h1>
          <p>创意作品展示与社区交流平台</p>
        </div>

        <div class="about-grid">
          <div class="about-card">
            <h3>🎯 使命</h3>
            <p>
              为数媒专业学生和创意工作者提供一个展示作品、交流灵感、建立个人品牌的平台。
            </p>
          </div>
          <div class="about-card">
            <h3>💡 愿景</h3>
            <p>
              成为中国最大的创意作品社区，让每个创意人都能找到属于自己的舞台。
            </p>
          </div>
          <div class="about-card">
            <h3>🌟 特色</h3>
            <ul>
              <li>瀑布流作品展示</li>
              <li>分类与标签筛选</li>
              <li>作品点赞收藏评论</li>
              <li>创作者关注系统</li>
              <li>热门排行榜</li>
            </ul>
          </div>
          <div class="about-card">
            <h3>📊 数据</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="number">{{ totalWorks }}</span>
                <span>作品</span>
              </div>
              <div class="stat-item">
                <span class="number">{{ totalUsers }}</span>
                <span>创作者</span>
              </div>
              <div class="stat-item">
                <span class="number">{{ totalLikes }}</span>
                <span>获赞</span>
              </div>
            </div>
          </div>
        </div>

        <div class="tech-stack">
          <h3>🛠️ 技术栈</h3>
          <div class="tech-tags">
            <span class="tech-tag">Vue 3</span>
            <span class="tech-tag">Pinia</span>
            <span class="tech-tag">Vue Router</span>
            <span class="tech-tag">Element Plus</span>
            <span class="tech-tag">Axios</span>
            <span class="tech-tag">Vite</span>
            <span class="tech-tag">LocalStorage</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";

const workStore = useWorkStore();
const userStore = useUserStore();

// 计算总作品数
const totalWorks = computed(() => {
  return workStore.publishedWorks.length;
});

// 计算总用户数
const totalUsers = computed(() => {
  // 确保用户数据已加载
  const users = userStore.users.length > 0 ? userStore.users : [];
  return users.length;
});

// 计算总获赞数
const totalLikes = computed(() => {
  const works = workStore.publishedWorks;
  return works.reduce((sum, w) => sum + (w.likes || 0), 0);
});

// 加载数据
const loadData = () => {
  // 加载作品数据
  workStore.fetchWorks();

  // 加载用户数据
  userStore.loadUsers();

  // 如果用户数据为空，初始化默认用户
  if (userStore.users.length === 0) {
    userStore.initDefaultUsers();
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.about-page {
  padding: 40px 0 60px;
  background: #f5f7fa;
  min-height: 100vh;
}

.about-hero {
  text-align: center;
  margin-bottom: 48px;
}

.about-hero h1 {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.about-hero p {
  font-size: 18px;
  color: #7f8c8d;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.about-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.about-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.about-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
}

.about-card p {
  color: #7f8c8d;
  line-height: 1.7;
}

.about-card ul {
  list-style: none;
  padding: 0;
}

.about-card ul li {
  padding: 6px 0;
  color: #7f8c8d;
  border-bottom: 1px solid #ecf0f1;
  padding-left: 20px;
  position: relative;
}

.about-card ul li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #3498db;
  font-weight: bold;
}

.about-card ul li:last-child {
  border-bottom: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  text-align: center;
}

.stat-item .number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #3498db;
}

.stat-item span:last-child {
  font-size: 14px;
  color: #7f8c8d;
}

.tech-stack {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tech-stack h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2c3e50;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-tag {
  padding: 8px 20px;
  background: #ecf0f1;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.tech-tag:hover {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .about-hero h1 {
    font-size: 28px;
  }

  .about-hero p {
    font-size: 16px;
  }
}
</style>
