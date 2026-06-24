<template>
  <div class="search-page">
    <div class="container">
      <!-- 搜索头部 -->
      <div class="search-header">
        <h1>搜索结果</h1>
        <p v-if="keyword">
          找到 <strong>{{ totalResults }}</strong> 个结果
        </p>
        <p v-else class="search-hint">💡 输入关键词搜索作品或创作者</p>
      </div>

      <!-- 热门标签推荐（无搜索结果时显示） -->
      <div class="hot-tags" v-if="!keyword && allTags.length > 0">
        <div class="hot-tags-header">
          <h3>🔥 热门标签</h3>
          <span class="hot-tags-desc">点击标签浏览相关作品</span>
        </div>
        <div class="tags-list">
          <span
            v-for="tag in allTags.slice(0, 15)"
            :key="tag.name"
            class="hot-tag"
            :style="{
              fontSize: `${12 + (tag.count / maxTagCount) * 10}px`,
              opacity: 0.6 + (tag.count / maxTagCount) * 0.4,
            }"
            @click="$router.push(`/tag/${encodeURIComponent(tag.name)}`)"
            :title="`${tag.name} (${tag.count} 个作品)`"
          >
            #{{ tag.name }}
            <span class="count">{{ tag.count }}</span>
          </span>
        </div>
      </div>

      <!-- 搜索标签页 -->
      <div v-if="keyword" class="search-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }} <span class="tab-count">({{ tab.count }})</span>
        </button>
      </div>

      <!-- 作品结果 -->
      <div v-if="activeTab === 'works'" class="search-results">
        <div v-if="searchWorks.length === 0" class="empty-state">
          <el-icon><Search /></el-icon>
          <p>没有找到相关作品</p>
          <span class="empty-hint">试试其他关键词或浏览热门标签</span>
        </div>
        <div v-else class="work-grid">
          <WorkCard v-for="work in searchWorks" :key="work.id" :work="work" />
        </div>
      </div>

      <!-- 用户结果 -->
      <div v-if="activeTab === 'users'" class="search-results">
        <div v-if="searchUsers.length === 0" class="empty-state">
          <el-icon><User /></el-icon>
          <p>没有找到相关用户</p>
          <span class="empty-hint">试试其他关键词</span>
        </div>
        <div v-else class="user-grid">
          <div
            v-for="user in searchUsers"
            :key="user.id"
            class="user-card"
            @click="$router.push(`/user/${user.id}`)"
          >
            <div class="user-avatar-wrapper">
              <AppImage
                :src="user.avatar"
                :alt="user.username"
                :width="56"
                :height="56"
                fallback-text=""
                object-fit="cover"
                border-radius="50%"
              />
            </div>
            <div class="user-info">
              <h4>{{ user.username }}</h4>
              <p>{{ user.bio || "设计师" }}</p>
              <div class="user-stats">
                <span>📁 {{ user.worksCount || 0 }} 作品</span>
                <span>👥 {{ user.followersCount || 0 }} 粉丝</span>
                <span>❤️ {{ user.likesCount || 0 }} 获赞</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";
import WorkCard from "@/components/WorkCard.vue";
import AppImage from "@/components/AppImage.vue";

const route = useRoute();
const router = useRouter();
const workStore = useWorkStore();
const userStore = useUserStore();

const activeTab = ref("works");
const keyword = ref("");
const loading = ref(false);

// 所有标签
const allTags = computed(() => workStore.allTags);

// 最大标签数量（用于计算字体大小）
const maxTagCount = computed(() => {
  if (allTags.value.length === 0) return 1;
  return allTags.value[0].count;
});

// 搜索标签页
const tabs = computed(() => {
  return [
    { value: "works", label: "作品", count: searchWorks.value.length },
    { value: "users", label: "创作者", count: searchUsers.value.length },
  ];
});

// 搜索结果 - 作品
const searchWorks = computed(() => {
  if (!keyword.value) return [];
  const q = keyword.value.toLowerCase().trim();

  return workStore.publishedWorks.filter(
    (work) =>
      work.title.toLowerCase().includes(q) ||
      work.description.toLowerCase().includes(q) ||
      work.tags.some((t) => t.toLowerCase().includes(q)) ||
      work.authorName.toLowerCase().includes(q),
  );
});

// 搜索结果 - 用户
const searchUsers = computed(() => {
  if (!keyword.value) return [];
  const q = keyword.value.toLowerCase().trim();

  return userStore.users.filter(
    (user) =>
      user.username.toLowerCase().includes(q) ||
      (user.bio && user.bio.toLowerCase().includes(q)) ||
      user.skills.some((s) => s.toLowerCase().includes(q)),
  );
});

// 总结果数
const totalResults = computed(() => {
  return searchWorks.value.length + searchUsers.value.length;
});

// 执行搜索
const performSearch = () => {
  const q = route.query.q || "";
  keyword.value = q;
  activeTab.value = "works";

  // 确保数据已加载
  workStore.fetchWorks();
  userStore.loadUsers();
  userStore.syncAllUsersWorksCount();
};

// 监听路由参数变化
watch(
  () => route.query.q,
  () => {
    performSearch();
  },
  { immediate: true },
);

// 处理标签点击（从热门标签跳转）
const handleTagClick = (tagName) => {
  router.push(`/tag/${encodeURIComponent(tagName)}`);
};

onMounted(() => {
  performSearch();
});
</script>

<style scoped>
.search-page {
  padding: 30px 0 40px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 搜索头部 */
.search-header {
  margin-bottom: 24px;
}

.search-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.search-header p {
  color: #7f8c8d;
  font-size: 15px;
}

.search-header p strong {
  color: #3498db;
}

.search-hint {
  font-size: 16px !important;
  color: #95a5a6 !important;
  margin-top: 8px;
}

/* 热门标签 */
.hot-tags {
  background: white;
  padding: 24px 28px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.hot-tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ecf0f1;
}

.hot-tags-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.hot-tags-desc {
  font-size: 13px;
  color: #7f8c8d;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  padding: 4px 0;
}

.hot-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 6px;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  text-decoration: none;
}

.hot-tag:hover {
  color: #3498db;
  transform: scale(1.08) translateY(-2px);
  background: rgba(52, 152, 219, 0.08);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.hot-tag:active {
  transform: scale(0.95);
}

.hot-tag .count {
  font-size: 11px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 0 6px;
  border-radius: 10px;
  font-weight: 400;
  transition: all 0.3s ease;
}

.hot-tag:hover .count {
  background: #3498db;
  color: white;
}

/* 搜索标签页 */
.search-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 4px 0;
}

.tab-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  background: white;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-btn:hover {
  background: #ecf0f1;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: #3498db;
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.tab-btn .tab-count {
  font-weight: 400;
  opacity: 0.7;
  font-size: 13px;
}

.tab-btn.active .tab-count {
  opacity: 0.9;
}

/* 搜索结果 */
.search-results {
  min-height: 200px;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

/* 用户网格 */
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.user-avatar-wrapper {
  flex-shrink: 0;
}

.user-avatar-wrapper :deep(.app-image) {
  border-radius: 50% !important;
  border: 2px solid #ecf0f1;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.user-info p {
  font-size: 13px;
  color: #7f8c8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

.user-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #7f8c8d;
}

.user-stats span {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-state .el-icon {
  font-size: 56px;
  color: #ecf0f1;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 14px;
  color: #7f8c8d;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-header h1 {
    font-size: 22px;
  }

  .hot-tags {
    padding: 16px 18px;
  }

  .hot-tags-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .search-tabs {
    gap: 8px;
    flex-wrap: wrap;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 14px;
  }

  .work-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .user-grid {
    grid-template-columns: 1fr;
  }

  .tags-list {
    gap: 6px 10px;
  }
}
</style>
