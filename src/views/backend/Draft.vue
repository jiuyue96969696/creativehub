<template>
  <div class="draft-page">
    <!-- 顶部导航 -->
    <div class="draft-topbar">
      <div class="topbar-left">
        <el-button type="text" @click="$router.push('/')" class="back-home-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <span class="topbar-divider">|</span>
        <span class="topbar-title">草稿箱</span>
      </div>
      <div class="topbar-right">
        <el-button type="primary" @click="$router.push('/upload')">
          <el-icon><Plus /></el-icon>
          新建作品
        </el-button>
      </div>
    </div>

    <div class="page-header">
      <div class="header-content">
        <div>
          <h1>📝 草稿箱</h1>
          <p>未完成的作品，随时回来继续创作</p>
        </div>
        <div class="header-stats">
          <span class="stat-badge">
            <el-icon><Document /></el-icon>
            {{ draftWorks.length }} 篇草稿
          </span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      加载中...
    </div>

    <div v-else-if="draftWorks.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <el-icon><Edit /></el-icon>
      </div>
      <h3>还没有草稿</h3>
      <p>开始创作你的第一个作品吧</p>
      <el-button
        type="primary"
        @click="$router.push('/upload')"
        class="empty-btn"
      >
        <el-icon><Plus /></el-icon>
        创建作品
      </el-button>
    </div>

    <div v-else class="draft-grid">
      <div v-for="work in draftWorks" :key="work.id" class="draft-card">
        <div class="draft-image">
          <img
            :src="
              work.coverImage ||
              'https://via.placeholder.com/300x200/F5F7FA/7F8C8D?text=No+Image'
            "
            :alt="work.title"
          />
          <div class="draft-status">
            <el-tag type="warning" size="small" effect="light">
              <el-icon><EditPen /></el-icon>
              草稿
            </el-tag>
          </div>
          <div class="draft-time-badge">
            <el-icon><Clock /></el-icon>
            {{ formatDate(work.updateTime) }}
          </div>
        </div>
        <div class="draft-body">
          <h3>{{ work.title || "未命名作品" }}</h3>
          <p class="draft-desc">{{ work.description || "暂无描述" }}</p>
          <div class="draft-meta">
            <div class="draft-tags">
              <span v-for="tag in work.tags.slice(0, 3)" :key="tag" class="tag">
                #{{ tag }}
              </span>
              <span v-if="work.tags.length > 3" class="tag-more">
                +{{ work.tags.length - 3 }}
              </span>
            </div>
          </div>
          <div class="draft-actions">
            <el-button type="primary" size="small" @click="editWork(work)">
              <el-icon><Edit /></el-icon>
              继续编辑
            </el-button>
            <el-button type="success" size="small" @click="publishWork(work)">
              <el-icon><Check /></el-icon>
              发布
            </el-button>
            <el-button type="danger" size="small" @click="deleteWork(work)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const workStore = useWorkStore();
const userStore = useUserStore();

const loading = ref(false);
const refreshKey = ref(0);

// 从 localStorage 直接读取草稿数据
const getDraftsFromStorage = () => {
  try {
    const userId = userStore.currentUserId;
    if (!userId) return [];

    const data = localStorage.getItem("works");
    if (!data) return [];

    const allWorks = JSON.parse(data);
    return allWorks
      .filter((w) => w.authorId === userId && w.status === "draft")
      .sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0));
  } catch (e) {
    console.error("读取草稿数据失败:", e);
    return [];
  }
};

// 获取当前用户的所有草稿 - 直接从 localStorage 读取
const draftWorks = computed(() => {
  return getDraftsFromStorage();
});

const formatDate = (time) => {
  if (!time) return "刚刚";
  return dayjs(time).format("YYYY-MM-DD HH:mm");
};

// 编辑作品
const editWork = (work) => {
  router.push(`/edit/${work.id}`);
};

// 发布作品 - 发布后刷新页面
const publishWork = (work) => {
  ElMessageBox.confirm(`确定要发布作品「${work.title}」吗？`, "提示", {
    confirmButtonText: "确定发布",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(async () => {
      try {
        // 更新作品状态为已发布
        workStore.updateWork(work.id, { status: "published" });

        ElMessage.success("🎉 发布成功！正在刷新页面...");

        // 延迟刷新页面，让用户看到成功提示
        setTimeout(() => {
          // 刷新当前页面
          window.location.reload();
        }, 800);
      } catch (error) {
        console.error("发布失败:", error);
        ElMessage.error("发布失败，请重试");
      }
    })
    .catch(() => {});
};

// 删除作品
const deleteWork = (work) => {
  ElMessageBox.confirm(`确定要删除草稿「${work.title}」吗？`, "警告", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      workStore.deleteWork(work.id);
      ElMessage.success("已删除");
      // 刷新数据
      forceRefresh();
    })
    .catch(() => {});
};

// 强制刷新数据
const forceRefresh = () => {
  workStore.loadWorks();
  refreshKey.value++;
  loading.value = false;
};

// 加载数据
const loadData = () => {
  loading.value = true;
  try {
    workStore.loadWorks();
    refreshKey.value++;
  } catch (error) {
    console.error("加载草稿数据失败:", error);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
};

// 监听路由进入
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/drafts") {
      console.log("🔄 进入草稿箱页面，刷新数据...");
      loadData();
    }
  },
  { immediate: true },
);

// 监听数据刷新事件
const handleDataRefresh = (event) => {
  console.log("🔄 收到数据刷新事件，刷新草稿箱...", event?.detail);
  loadData();
};

// 监听用户更新事件
const handleUserUpdate = () => {
  loadData();
};

onMounted(() => {
  userStore.loadUsers();
  loadData();

  window.addEventListener("user-data-refresh", handleDataRefresh);
  window.addEventListener("user-profile-updated", handleUserUpdate);
  window.addEventListener("user-data-changed", handleUserUpdate);
});

onUnmounted(() => {
  window.removeEventListener("user-data-refresh", handleDataRefresh);
  window.removeEventListener("user-profile-updated", handleUserUpdate);
  window.removeEventListener("user-data-changed", handleUserUpdate);
});
</script>

<style scoped>
.draft-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部导航栏 */
.draft-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-home-btn {
  font-size: 15px;
  color: #7f8c8d;
  padding: 0;
}

.back-home-btn:hover {
  color: #3498db;
}

.topbar-divider {
  color: #ecf0f1;
}

.topbar-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.topbar-right .el-button {
  border-radius: 8px;
  font-weight: 500;
}

.topbar-right .el-button .el-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-header p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 4px 0 0;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: #ecf0f1;
  border-radius: 20px;
  font-size: 14px;
  color: #2c3e50;
}

.stat-badge .el-icon {
  font-size: 16px;
  color: #3498db;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.loading-state .el-icon {
  font-size: 40px;
  color: #3498db;
  margin-bottom: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #ecf0f1;
  border-radius: 50%;
  margin-bottom: 16px;
}

.empty-icon-wrapper .el-icon {
  font-size: 36px;
  color: #95a5a6;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 15px;
  margin-bottom: 24px;
}

.empty-btn {
  padding: 10px 32px;
  border-radius: 8px;
  font-weight: 500;
}

.empty-btn .el-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* 草稿网格 */
.draft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.draft-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.draft-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.draft-image {
  position: relative;
  aspect-ratio: 16/9;
  background: #ecf0f1;
  overflow: hidden;
}

.draft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.draft-status {
  position: absolute;
  top: 12px;
  left: 12px;
}

.draft-status .el-tag {
  font-weight: 500;
  padding: 4px 12px;
}

.draft-status .el-tag .el-icon {
  font-size: 12px;
  margin-right: 4px;
}

.draft-time-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  font-size: 12px;
  color: white;
}

.draft-time-badge .el-icon {
  font-size: 14px;
}

.draft-body {
  padding: 16px 20px 20px;
}

.draft-body h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draft-desc {
  font-size: 14px;
  color: #7f8c8d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 12px;
  line-height: 1.5;
  min-height: 42px;
}

.draft-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.draft-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.draft-tags .tag {
  font-size: 12px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 2px 10px;
  border-radius: 12px;
}

.draft-tags .tag-more {
  font-size: 12px;
  color: #7f8c8d;
  padding: 2px 6px;
}

.draft-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.draft-actions .el-button {
  flex: 1;
  min-width: 60px;
  border-radius: 6px;
  font-weight: 500;
}

.draft-actions .el-button .el-icon {
  font-size: 14px;
  margin-right: 2px;
}

/* 响应式 */
@media (max-width: 768px) {
  .draft-topbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .topbar-right {
    width: 100%;
  }

  .topbar-right .el-button {
    width: 100%;
    justify-content: center;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .draft-grid {
    grid-template-columns: 1fr;
  }

  .draft-actions .el-button {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .draft-actions {
    flex-direction: column;
  }

  .draft-actions .el-button {
    width: 100%;
  }
}
</style>
