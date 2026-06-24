<template>
  <div class="home-page">
    <!-- 欢迎页面 -->
    <div class="welcome-section" ref="welcomeSection">
      <div class="welcome-container">
        <div class="welcome-left">
          <div class="welcome-content">
            <div class="welcome-badge">
              <span class="badge-dot"></span>
              创意社区
            </div>
            <h1 class="welcome-title">
              <span class="highlight">CreativeHub</span>
              <br />
              拥抱你的所有灵感
            </h1>
            <p class="welcome-desc">
              在这里，每一个创意都值得被看见。<br />
              发现、分享、交流，让灵感自由生长。
            </p>
            <div class="welcome-stats">
              <div class="stat-item">
                <span class="stat-number">{{ totalUsers }}</span>
                <span class="stat-label">创作者</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">{{ totalWorks }}</span>
                <span class="stat-label">作品</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">{{ totalLikes }}</span>
                <span class="stat-label">获赞</span>
              </div>
            </div>
          </div>
        </div>

        <div class="welcome-right">
          <div class="scroll-hint" @click="scrollToContent">
            <span class="scroll-text">下拉查看最新最热门的作品</span>
            <span class="scroll-arrow">
              <el-icon><ArrowDown /></el-icon>
            </span>
            <span class="scroll-line"></span>
          </div>
        </div>
      </div>

      <!-- 装饰元素 - 增强视觉效果 -->
      <div class="welcome-decoration">
        <!-- 大圆环 -->
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
        <div class="decoration-circle circle-4"></div>

        <!-- 方形 -->
        <div class="decoration-square square-1"></div>
        <div class="decoration-square square-2"></div>
        <div class="decoration-square square-3"></div>

        <!-- 线条 -->
        <div class="decoration-line line-1"></div>
        <div class="decoration-line line-2"></div>
        <div class="decoration-line line-3"></div>

        <!-- 圆点 -->
        <div class="decoration-dot dot-1"></div>
        <div class="decoration-dot dot-2"></div>
        <div class="decoration-dot dot-3"></div>
        <div class="decoration-dot dot-4"></div>
        <div class="decoration-dot dot-5"></div>

        <!-- 发光光晕 -->
        <div class="glow glow-1"></div>
        <div class="glow glow-2"></div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content" ref="mainContent">
      <div class="container">
        <!-- 分类入口 -->
        <div class="category-section">
          <div class="section-header">
            <h2>探索分类</h2>
            <span class="section-desc">发现你感兴趣的设计领域</span>
          </div>
          <div class="category-grid">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="category-item"
              @click="$router.push(`/category/${cat.id}`)"
            >
              <div class="category-icon">
                <el-icon :size="32"><component :is="cat.icon" /></el-icon>
              </div>
              <span class="category-name">{{ cat.name }}</span>
              <span class="category-count">{{ cat.count }} 个作品</span>
            </div>
          </div>
        </div>

        <!-- 标签云 -->
        <div class="tag-cloud-section">
          <TagCloud
            :tags="allTags"
            :max-display="15"
            @tag-click="handleTagClick"
          />
        </div>

        <!-- 作品列表 -->
        <div class="works-section">
          <div class="section-header">
            <h2>最新作品</h2>
            <div class="sort-options">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                :class="['sort-btn', { active: sortBy === opt.value }]"
                @click="sortBy = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            加载中...
          </div>
          <div v-else-if="displayWorks.length === 0" class="empty-state">
            <el-icon><Document /></el-icon>
            <p>暂无作品</p>
          </div>
          <div v-else class="work-grid">
            <WorkCard
              v-for="work in displayWorks"
              :key="work.id"
              :work="work"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";
import { useInteractionStore } from "@/stores/interactionStore";
import WorkCard from "@/components/WorkCard.vue";
import TagCloud from "@/components/TagCloud.vue";

const router = useRouter();
const workStore = useWorkStore();
const userStore = useUserStore();
const interactionStore = useInteractionStore();
const sortBy = ref("latest");
const loading = ref(true);
const refreshKey = ref(0);

const welcomeSection = ref(null);
const mainContent = ref(null);

const sortOptions = [
  { value: "latest", label: "最新" },
  { value: "hot", label: "最热" },
  { value: "recommend", label: "推荐" },
];

const categories = computed(() => workStore.categories);
const allTags = computed(() => workStore.allTags);

const displayWorks = computed(() => {
  let works = [...workStore.publishedWorks];

  switch (sortBy.value) {
    case "latest":
      works.sort((a, b) => b.publishTime - a.publishTime);
      break;
    case "hot":
      works.sort((a, b) => b.views - a.views);
      break;
    case "recommend":
      works.sort((a, b) => b.likes / (b.views || 1) - a.likes / (a.views || 1));
      break;
  }

  return works;
});

const totalUsers = computed(() => userStore.users.length);
const totalWorks = computed(() => workStore.publishedWorks.length);
const totalLikes = computed(() => {
  return workStore.publishedWorks.reduce((sum, w) => sum + w.likes, 0);
});

const handleTagClick = (tagName) => {
  router.push(`/tag/${encodeURIComponent(tagName)}`);
};

const scrollToContent = () => {
  if (mainContent.value) {
    mainContent.value.scrollIntoView({ behavior: "smooth" });
  }
};

const handleScroll = () => {
  if (!welcomeSection.value) return;
  const scrollY = window.scrollY;
  const welcomeHeight = welcomeSection.value.offsetHeight;

  const opacity = Math.max(0, 1 - scrollY / (welcomeHeight * 0.5));
  welcomeSection.value.style.opacity = opacity;

  const scrollHint = welcomeSection.value.querySelector(".scroll-hint");
  if (scrollHint) {
    if (scrollY > 100) {
      scrollHint.style.opacity = Math.max(0, 1 - (scrollY - 100) / 100);
    } else {
      scrollHint.style.opacity = 1;
    }
  }
};

const loadData = () => {
  loading.value = true;

  try {
    userStore.loadUsers();
    userStore.syncAllUsersWorksCount();
    workStore.fetchWorks();
    interactionStore.loadData();

    loading.value = false;
  } catch (error) {
    console.error("加载数据失败:", error);
    loading.value = false;
  }
};

const refreshPage = () => {
  refreshKey.value++;
  loadData();
};

const handleUserUpdate = () => {
  console.log("🔄 用户信息已更新，刷新首页...");
  refreshPage();
};

const handleDataRefresh = () => {
  refreshPage();
};

onMounted(() => {
  nextTick(() => {
    loadData();
    window.addEventListener("scroll", handleScroll);
  });

  window.addEventListener("user-profile-updated", handleUserUpdate);
  window.addEventListener("user-data-changed", handleUserUpdate);
  window.addEventListener("user-data-refresh", handleDataRefresh);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("user-profile-updated", handleUserUpdate);
  window.removeEventListener("user-data-changed", handleUserUpdate);
  window.removeEventListener("user-data-refresh", handleDataRefresh);
});
</script>

<style scoped>
.home-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* ========== 欢迎页面 ========== */
.welcome-section {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    #0a0e17 0%,
    #141b2b 40%,
    #1a2332 70%,
    #0d1520 100%
  );
  overflow: hidden;
  transition: opacity 0.3s ease;
  z-index: 10;
}

/* 发光光晕 */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.glow-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  background: rgba(52, 152, 219, 0.12);
  animation: glowPulse 6s ease-in-out infinite;
}

.glow-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  background: rgba(46, 204, 113, 0.08);
  animation: glowPulse 8s ease-in-out infinite 2s;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.welcome-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 40px;
  z-index: 2;
}

/* 左侧内容 */
.welcome-left {
  flex: 1;
  max-width: 600px;
}

.welcome-content {
  animation: fadeInUp 1s ease;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(52, 152, 219, 0.12);
  border: 1px solid rgba(52, 152, 219, 0.2);
  border-radius: 20px;
  font-size: 13px;
  color: #6ab0e6;
  margin-bottom: 20px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #3498db;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.welcome-title {
  font-size: 52px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 16px;
  text-shadow: 0 2px 30px rgba(52, 152, 219, 0.1);
}

.welcome-title .highlight {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-desc {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.8;
  margin-bottom: 32px;
}

.welcome-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.06);
}

/* 右侧滚动提示 */
.welcome-right {
  flex-shrink: 0;
  padding-left: 40px;
}

.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: floatY 2s ease-in-out infinite;
}

.scroll-hint:hover {
  transform: translateY(-4px);
}

.scroll-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
  writing-mode: vertical-rl;
}

.scroll-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.3);
  font-size: 18px;
  transition: all 0.3s ease;
}

.scroll-hint:hover .scroll-arrow {
  border-color: rgba(52, 152, 219, 0.4);
  color: #3498db;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.15),
    transparent
  );
}

/* ========== 装饰元素 - 增强版 ========== */
.welcome-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 圆形 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.circle-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -150px;
  border-width: 2px;
  border-color: rgba(52, 152, 219, 0.12);
  animation: rotate 60s linear infinite;
}

.circle-2 {
  width: 350px;
  height: 350px;
  bottom: -100px;
  left: -100px;
  border-color: rgba(46, 204, 113, 0.08);
  border-width: 1.5px;
  animation: rotate 40s linear infinite reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 20%;
  left: 55%;
  border-color: rgba(52, 152, 219, 0.07);
  border-width: 1px;
  animation: rotate 30s linear infinite;
}

.circle-4 {
  width: 120px;
  height: 120px;
  bottom: 15%;
  right: 30%;
  border-color: rgba(46, 204, 113, 0.06);
  border-width: 1px;
  animation: rotate 20s linear infinite reverse;
}

/* 方形 */
.decoration-square {
  position: absolute;
  border: 1.5px solid rgba(255, 255, 255, 0.05);
}

.square-1 {
  width: 120px;
  height: 120px;
  top: 15%;
  right: 20%;
  transform: rotate(45deg);
  border-color: rgba(52, 152, 219, 0.08);
  animation: rotate 25s linear infinite;
}

.square-2 {
  width: 80px;
  height: 80px;
  bottom: 30%;
  left: 8%;
  transform: rotate(30deg);
  border-color: rgba(46, 204, 113, 0.06);
  animation: rotate 30s linear infinite reverse;
}

.square-3 {
  width: 50px;
  height: 50px;
  top: 50%;
  right: 8%;
  transform: rotate(60deg);
  border-color: rgba(52, 152, 219, 0.05);
  animation: rotate 20s linear infinite;
}

/* 线条 */
.decoration-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.03);
}

.line-1 {
  width: 200px;
  height: 1px;
  top: 25%;
  left: 10%;
  transform: rotate(30deg);
  background: linear-gradient(
    to right,
    transparent,
    rgba(52, 152, 219, 0.08),
    transparent
  );
}

.line-2 {
  width: 150px;
  height: 1px;
  bottom: 35%;
  right: 15%;
  transform: rotate(-20deg);
  background: linear-gradient(
    to right,
    transparent,
    rgba(46, 204, 113, 0.06),
    transparent
  );
}

.line-3 {
  width: 100px;
  height: 1px;
  top: 60%;
  left: 25%;
  transform: rotate(45deg);
  background: linear-gradient(
    to right,
    transparent,
    rgba(52, 152, 219, 0.05),
    transparent
  );
}

/* 圆点 */
.decoration-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}

.dot-1 {
  width: 10px;
  height: 10px;
  top: 18%;
  left: 15%;
  background: rgba(52, 152, 219, 0.15);
  animation: pulse 3s ease-in-out infinite;
}

.dot-2 {
  width: 14px;
  height: 14px;
  bottom: 22%;
  right: 22%;
  background: rgba(46, 204, 113, 0.1);
  animation: pulse 4s ease-in-out infinite 1s;
}

.dot-3 {
  width: 6px;
  height: 6px;
  top: 45%;
  right: 12%;
  background: rgba(52, 152, 219, 0.2);
  animation: pulse 2.5s ease-in-out infinite 0.5s;
}

.dot-4 {
  width: 8px;
  height: 8px;
  bottom: 45%;
  left: 20%;
  background: rgba(46, 204, 113, 0.12);
  animation: pulse 3.5s ease-in-out infinite 1.5s;
}

.dot-5 {
  width: 4px;
  height: 4px;
  top: 30%;
  left: 45%;
  background: rgba(52, 152, 219, 0.25);
  animation: pulse 2s ease-in-out infinite 0.8s;
}

/* ========== 动画 ========== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ========== 主要内容 ========== */
.main-content {
  position: relative;
  z-index: 5;
  background: #f5f7fa;
  padding: 30px 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.section-desc {
  color: #7f8c8d;
  font-size: 14px;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #7f8c8d;
  background: #ecf0f1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  color: #2c3e50;
}

.sort-btn.active {
  background: #3498db;
  color: white;
}

/* 分类 */
.category-section {
  margin-bottom: 24px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.category-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf0f1;
  border-radius: 50%;
  color: #3498db;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.category-item:hover .category-icon {
  background: #3498db;
  color: white;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.category-count {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 2px;
}

/* 标签云 */
.tag-cloud-section {
  margin-bottom: 32px;
}

/* 作品列表 */
.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #7f8c8d;
}

.loading-state .el-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* ========== 响应式 ========== */
@media (max-width: 992px) {
  .welcome-title {
    font-size: 40px;
  }

  .welcome-container {
    padding: 0 30px;
  }
}

@media (max-width: 768px) {
  .welcome-container {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 0 20px;
    gap: 30px;
  }

  .welcome-left {
    max-width: 100%;
  }

  .welcome-title {
    font-size: 32px;
  }

  .welcome-desc {
    font-size: 16px;
  }

  .welcome-stats {
    justify-content: center;
  }

  .welcome-right {
    padding-left: 0;
  }

  .scroll-text {
    writing-mode: horizontal-tb;
    font-size: 13px;
  }

  .scroll-hint {
    flex-direction: row;
  }

  .scroll-line {
    display: none;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .work-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .circle-1 {
    width: 300px;
    height: 300px;
    top: -80px;
    right: -80px;
  }

  .circle-2 {
    width: 200px;
    height: 200px;
    bottom: -50px;
    left: -50px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 26px;
  }

  .welcome-stats {
    gap: 16px;
    flex-wrap: wrap;
  }

  .stat-number {
    font-size: 22px;
  }

  .welcome-badge {
    font-size: 12px;
    padding: 4px 12px;
  }
}
</style>
