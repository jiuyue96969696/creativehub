<template>
  <div class="ranking-page">
    <div class="container">
      <div class="page-header">
        <h1>🏆 热门排行榜</h1>
        <p class="page-desc">发现最受欢迎的作品和创作者</p>
      </div>

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
          <div
            v-for="(work, index) in rankedWorks"
            :key="work.id"
            class="ranking-item"
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
                :src="creator.avatar"
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
import AppImage from "@/components/AppImage.vue";

const workStore = useWorkStore();
const userStore = useUserStore();

const activeTab = ref("works");
const loading = ref(false);
const refreshKey = ref(0);

const tabs = [
  { value: "works", label: "热门作品" },
  { value: "creators", label: "创作者排行" },
];

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
  // 获取所有用户并同步作品数量
  let users = userStore.getAllUsers();

  // 如果没有用户数据，初始化
  if (!users || users.length === 0) {
    userStore.initDefaultUsers();
    users = userStore.getAllUsers();
  }

  // 再次确保作品数量同步
  userStore.syncAllUsersWorksCount();
  users = userStore.users;

  // 过滤掉没有作品的用户（可选）
  // users = users.filter(u => u.worksCount > 0)

  // 排序
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

  // 加载作品数据
  workStore.fetchWorks();

  // 加载用户数据并同步作品数量
  userStore.loadUsers();
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

@media (max-width: 768px) {
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
