<template>
  <div class="ranking-page">
    <div class="container">
      <div class="page-header">
        <h1>🏆 热门排行榜</h1>
        <p class="page-desc">发现最受欢迎的作品和创作者</p>
      </div>

      <!-- ===== 最佳作品评选结果 ===== -->
      <div class="best-work-section" v-if="bestWork">
        <div class="best-work-header">
          <div class="best-work-title">
            <span class="crown-icon">👑</span>
            <h2>最佳作品评选结果</h2>
          </div>
          <div class="best-work-badge">
            <el-tag type="warning" size="large" effect="dark">
              <el-icon><Star /></el-icon>
              本月最佳
            </el-tag>
          </div>
        </div>

        <div
          class="best-work-card"
          @click="$router.push(`/work/${bestWork.id}`)"
        >
          <div class="best-work-image">
            <img :src="bestWork.coverImage" :alt="bestWork.title" />
            <div class="best-work-rank">
              <span class="rank-number">🏆</span>
              <span class="rank-label">第 1 名</span>
            </div>
          </div>
          <div class="best-work-info">
            <h3 class="best-work-title-text">{{ bestWork.title }}</h3>
            <p class="best-work-desc">{{ bestWork.description }}</p>
            <div class="best-work-meta">
              <div class="best-work-author">
                <AppImage
                  :src="
                    getAuthorAvatar(bestWork.authorId, bestWork.authorAvatar)
                  "
                  :alt="bestWork.authorName"
                  :width="32"
                  :height="32"
                  fallback-text=""
                  object-fit="cover"
                  border-radius="50%"
                />
                <span>{{ bestWork.authorName }}</span>
              </div>
              <div class="best-work-stats">
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ bestWork.likes }} 点赞
                </span>
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ bestWork.views }} 浏览
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 评选说明 -->
        <div class="best-work-footer">
          <el-alert type="info" :closable="false" show-icon>
            <template #title>
              <span class="alert-title">📋 评选说明</span>
            </template>
            <template #default>
              <div class="alert-content">
                <p>
                  本次最佳作品评选基于
                  <strong>作品点赞数</strong>
                  作为投票数进行评比，投票数最多的作品荣获 "本月最佳" 称号。
                </p>
                <p class="alert-detail">
                  💡
                  点赞数反映了作品的受欢迎程度和社区认可度，是衡量作品质量的重要指标。
                </p>
              </div>
            </template>
          </el-alert>
        </div>
      </div>

      <div v-else class="best-work-empty">
        <el-empty description="暂无作品数据" />
      </div>

      <!-- 排行榜标签切换 -->
      <div class="ranking-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="ranking-content">
        <!-- 作品排行 -->
        <div v-if="activeTab === 'works'" class="ranking-list">
          <!-- 前三名特殊标识 -->
          <div
            v-for="(work, index) in rankedWorks"
            :key="work.id"
            class="ranking-item"
            :class="{
              'rank-first': index === 0,
              'rank-second': index === 1,
              'rank-third': index === 2,
            }"
            @click="$router.push(`/work/${work.id}`)"
          >
            <div class="rank-number" :class="getRankClass(index + 1)">
              {{ index + 1 }}
            </div>
            <img :src="work.coverImage" :alt="work.title" class="rank-image" />
            <div class="rank-info">
              <h4>{{ work.title }}</h4>
              <div class="rank-meta">
                <span>作者：{{ work.authorName }}</span>
                <span>👁️ {{ formatNumber(work.views) }}</span>
                <span>❤️ {{ formatNumber(work.likes) }}</span>
                <span>📌 {{ formatNumber(work.collects || 0) }}</span>
              </div>
            </div>
            <div class="rank-score">
              <span class="score-number">{{ getWorkScore(work) }}</span>
              <span class="score-label">综合分</span>
            </div>
          </div>
        </div>

        <!-- 创作者排行 -->
        <div v-if="activeTab === 'creators'" class="ranking-list">
          <div
            v-for="(creator, index) in rankedCreators"
            :key="creator.id"
            class="ranking-item"
            @click="$router.push(`/user/${creator.id}`)"
          >
            <div class="rank-number" :class="getRankClass(index + 1)">
              {{ index + 1 }}
            </div>
            <div class="rank-avatar-wrapper">
              <AppImage
                :src="creator.avatar || defaultAvatar"
                :alt="creator.username"
                :width="56"
                :height="56"
                fallback-text=""
                object-fit="cover"
                border-radius="50%"
              />
            </div>
            <div class="rank-info">
              <h4>{{ creator.username }}</h4>
              <div class="rank-meta">
                <span>📁 {{ creator.worksCount || 0 }} 作品</span>
                <span>👥 {{ creator.followersCount || 0 }} 粉丝</span>
                <span>❤️ {{ creator.likesCount || 0 }} 获赞</span>
                <span>👁️ {{ creator.viewsCount || 0 }} 浏览</span>
              </div>
            </div>
            <div class="rank-score">
              <span class="score-number">{{ getCreatorScore(creator) }}</span>
              <span class="score-label">影响力</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";
import { useInteractionStore } from "@/stores/interactionStore";
import AppImage from "@/components/AppImage.vue";

const workStore = useWorkStore();
const userStore = useUserStore();
const interactionStore = useInteractionStore();

const activeTab = ref("works");
const loading = ref(false);
const refreshKey = ref(0);
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";

const tabs = [
  { value: "works", label: "热门作品" },
  { value: "creators", label: "创作者排行" },
];

// ===== 最佳作品评选结果 =====
// 获取点赞数最多的作品
const bestWork = computed(() => {
  const works = workStore.publishedWorks;
  if (works.length === 0) return null;

  // 按点赞数降序排列，取第一个
  return [...works].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
});

// 获取作者头像
const getAuthorAvatar = (authorId, fallbackAvatar) => {
  const user = userStore.userById(authorId);
  if (user && user.avatar) {
    return user.avatar;
  }
  return fallbackAvatar || defaultAvatar;
};

// ===== 作品排行 =====
const rankedWorks = computed(() => {
  const works = workStore.publishedWorks;
  return [...works]
    .sort((a, b) => {
      const scoreA = a.views * 0.3 + a.likes * 0.5 + (a.collects || 0) * 0.2;
      const scoreB = b.views * 0.3 + b.likes * 0.5 + (b.collects || 0) * 0.2;
      return scoreB - scoreA;
    })
    .slice(0, 20);
});

const rankedCreators = computed(() => {
  let users = userStore.getAllUsers();

  if (!users || users.length === 0) {
    userStore.initDefaultUsers();
    users = userStore.getAllUsers();
  }

  userStore.syncAllUsersWorksCount();
  users = userStore.users;

  return [...users]
    .sort((a, b) => {
      const scoreA =
        (a.followersCount || 0) * 0.4 +
        (a.likesCount || 0) * 0.3 +
        (a.worksCount || 0) * 0.2 +
        (a.viewsCount || 0) * 0.1;
      const scoreB =
        (b.followersCount || 0) * 0.4 +
        (b.likesCount || 0) * 0.3 +
        (b.worksCount || 0) * 0.2 +
        (b.viewsCount || 0) * 0.1;
      return scoreB - scoreA;
    })
    .slice(0, 20);
});

const getWorkScore = (work) => {
  return Math.round(
    work.views * 0.3 + work.likes * 0.5 + (work.collects || 0) * 0.2,
  );
};

const getCreatorScore = (creator) => {
  return Math.round(
    (creator.followersCount || 0) * 0.4 +
      (creator.likesCount || 0) * 0.3 +
      (creator.worksCount || 0) * 0.2 +
      (creator.viewsCount || 0) * 0.1,
  );
};

const getRankClass = (rank) => {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "";
};

const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 10000) return (num / 10000).toFixed(1) + "w";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num;
};

// 加载数据
const loadData = () => {
  loading.value = true;

  workStore.fetchWorks();
  userStore.loadUsers();
  interactionStore.loadData();

  if (userStore.users.length === 0) {
    userStore.initDefaultUsers();
  }

  userStore.syncAllUsersWorksCount();

  loading.value = false;
};

// 刷新数据
const refreshData = () => {
  refreshKey.value++;
  loadData();
};

// 监听用户更新事件
const handleUserUpdate = () => {
  console.log("🔄 用户信息已更新，刷新排行榜...");
  refreshData();
};

// 监听数据刷新事件
const handleDataRefresh = () => {
  refreshData();
};

onMounted(() => {
  loadData();

  window.addEventListener("user-profile-updated", handleUserUpdate);
  window.addEventListener("user-data-changed", handleUserUpdate);
  window.addEventListener("user-data-refresh", handleDataRefresh);
});

onUnmounted(() => {
  window.removeEventListener("user-profile-updated", handleUserUpdate);
  window.removeEventListener("user-data-changed", handleUserUpdate);
  window.removeEventListener("user-data-refresh", handleDataRefresh);
});
</script>

<style scoped>
.ranking-page {
  padding: 30px 0 40px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* ===== 页面头部 ===== */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
}

.page-desc {
  color: #7f8c8d;
  font-size: 16px;
}

/* ===== 最佳作品评选结果 ===== */
.best-work-section {
  margin-bottom: 32px;
  background: white;
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid #ffd700;
  position: relative;
  overflow: hidden;
}

.best-work-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ffd700, #ff6b6b, #ffd700);
  background-size: 200% 100%;
  animation: gradientMove 3s ease infinite;
}

@keyframes gradientMove {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.best-work-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.best-work-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crown-icon {
  font-size: 28px;
}

.best-work-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.best-work-badge .el-tag {
  font-size: 14px;
  padding: 6px 16px;
}

.best-work-card {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #ecf0f1;
}

.best-work-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: #ffd700;
}

.best-work-image {
  position: relative;
  flex-shrink: 0;
  width: 180px;
  height: 135px;
  border-radius: 8px;
  overflow: hidden;
  background: #ecf0f1;
}

.best-work-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.best-work-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.best-work-rank .rank-number {
  font-size: 16px;
}

.best-work-rank .rank-label {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.best-work-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.best-work-title-text {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px;
}

.best-work-desc {
  font-size: 14px;
  color: #7f8c8d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 10px;
  line-height: 1.5;
}

.best-work-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.best-work-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.best-work-author :deep(.app-image) {
  border-radius: 50% !important;
  flex-shrink: 0;
  width: 32px !important;
  height: 32px !important;
}

.best-work-author span {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.best-work-stats {
  display: flex;
  gap: 16px;
}

.best-work-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #7f8c8d;
}

.best-work-stats .stat-item .el-icon {
  font-size: 16px;
}

/* 评选说明 */
.best-work-footer {
  margin-top: 16px;
}

.best-work-footer :deep(.el-alert) {
  border-radius: 8px;
  background: #f0f7ff;
  border: 1px solid #d4e6f1;
}

.best-work-footer .alert-title {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
}

.alert-content p {
  margin: 2px 0;
  font-size: 13px;
  color: #5d6d7e;
}

.alert-detail {
  color: #7f8c8d !important;
  font-size: 12px !important;
}

.best-work-empty {
  margin-bottom: 32px;
}

/* ===== 排行榜标签 ===== */
.ranking-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.tab-btn {
  padding: 10px 32px;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  background: #ecf0f1;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: #d5dbe0;
}

.tab-btn.active {
  background: #3498db;
  color: white;
}

/* ===== 排行榜列表 ===== */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 前三名特殊样式 */
.rank-first {
  border-left: 4px solid #ffd700;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.05), white);
}

.rank-second {
  border-left: 4px solid #c0c0c0;
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.05), white);
}

.rank-third {
  border-left: 4px solid #cd7f32;
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.05), white);
}

.rank-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 16px;
  background: #ecf0f1;
  color: #7f8c8d;
  flex-shrink: 0;
}

.rank-number.gold {
  background: #ffd700;
  color: #8b7500;
}

.rank-number.silver {
  background: #c0c0c0;
  color: #6b6b6b;
}

.rank-number.bronze {
  background: #cd7f32;
  color: white;
}

.rank-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.rank-avatar-wrapper {
  flex-shrink: 0;
}

.rank-avatar-wrapper :deep(.app-image) {
  border-radius: 50% !important;
  border: 2px solid #ecf0f1;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #2c3e50;
}

.rank-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #7f8c8d;
}

.rank-score {
  text-align: center;
  flex-shrink: 0;
}

.score-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #3498db;
}

.score-label {
  font-size: 12px;
  color: #7f8c8d;
}

/* ===== 响应式 ===== */
@media (max-width: 992px) {
  .best-work-card {
    flex-direction: column;
  }

  .best-work-image {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .best-work-section {
    padding: 16px 18px;
  }

  .best-work-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .best-work-title h2 {
    font-size: 17px;
  }

  .best-work-image {
    height: 150px;
  }

  .best-work-title-text {
    font-size: 16px;
  }

  .best-work-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .ranking-item {
    flex-wrap: wrap;
  }

  .rank-image {
    width: 60px;
    height: 45px;
  }

  .rank-avatar-wrapper :deep(.app-image) {
    width: 40px !important;
    height: 40px !important;
  }

  .rank-meta {
    gap: 8px;
    font-size: 12px;
  }

  .tab-btn {
    padding: 8px 20px;
    font-size: 14px;
  }

  .score-number {
    font-size: 16px;
  }
}
</style>
