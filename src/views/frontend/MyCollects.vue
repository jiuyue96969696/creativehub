<template>
  <div class="my-collects-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <el-button type="text" @click="$router.push('/')" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回首页
            </el-button>
            <h1>❤️ 我的收藏</h1>
          </div>
          <div class="header-right">
            <span class="collect-count">
              <el-icon><Collection /></el-icon>
              共 {{ collectWorks.length }} 个收藏
            </span>
          </div>
        </div>
      </div>

      <!-- 收藏列表 -->
      <div v-if="collectWorks.length === 0" class="empty-state">
        <div class="empty-icon-wrapper">
          <el-icon><Collection /></el-icon>
        </div>
        <h3>还没有收藏</h3>
        <p>浏览作品，点击 ❤️ 收藏你喜欢的创意</p>
        <el-button type="primary" @click="$router.push('/')" class="empty-btn">
          <el-icon><Search /></el-icon>
          去发现好作品
        </el-button>
      </div>

      <div v-else class="collect-grid">
        <div v-for="work in collectWorks" :key="work.id" class="collect-card">
          <div class="card-image" @click="$router.push(`/work/${work.id}`)">
            <img :src="work.coverImage" :alt="work.title" />
            <div class="card-overlay">
              <div class="overlay-stats">
                <span
                  ><el-icon><View /></el-icon> {{ work.views }}</span
                >
                <span
                  ><el-icon><Star /></el-icon> {{ work.likes }}</span
                >
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-header">
              <h3 class="card-title" @click="$router.push(`/work/${work.id}`)">
                {{ work.title }}
              </h3>
              <el-button
                type="danger"
                size="small"
                plain
                @click="removeCollect(work.id)"
                class="remove-btn"
              >
                <el-icon><Close /></el-icon>
                取消收藏
              </el-button>
            </div>
            <div class="card-meta">
              <div
                class="author-info"
                @click="$router.push(`/user/${work.authorId}`)"
              >
                <AppImage
                  :src="getAuthorAvatar(work.authorId, work.authorAvatar)"
                  :alt="work.authorName"
                  :width="24"
                  :height="24"
                  fallback-text=""
                  object-fit="cover"
                  border-radius="50%"
                />
                <span>{{ work.authorName }}</span>
              </div>
              <div class="card-tags">
                <span
                  v-for="tag in work.tags.slice(0, 2)"
                  :key="tag"
                  class="tag"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            <div class="card-footer">
              <span class="collect-time">
                <el-icon><Clock /></el-icon>
                {{ getCollectTime(work.id) }}
              </span>
              <span class="category-badge">{{ work.categoryName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/stores/userStore";
import { useWorkStore } from "@/stores/workStore";
import { useInteractionStore } from "@/stores/interactionStore";
import AppImage from "@/components/AppImage.vue";
import dayjs from "dayjs";

const router = useRouter();
const userStore = useUserStore();
const workStore = useWorkStore();
const interactionStore = useInteractionStore();

const loading = ref(false);
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";

// 获取作者头像 - 优先从 userStore 获取最新头像
const getAuthorAvatar = (authorId, fallbackAvatar) => {
  const user = userStore.userById(authorId);
  if (user && user.avatar) {
    return user.avatar;
  }
  return fallbackAvatar || defaultAvatar;
};

// 获取当前用户收藏的作品
const collectWorks = computed(() => {
  if (!userStore.isLoggedIn) return [];
  return interactionStore
    .getUserCollects(userStore.currentUserId)
    .filter((w) => w.status === "published")
    .sort((a, b) => {
      const collectA = interactionStore.collects.find(
        (c) => c.workId === a.id && c.userId === userStore.currentUserId,
      );
      const collectB = interactionStore.collects.find(
        (c) => c.workId === b.id && c.userId === userStore.currentUserId,
      );
      return (collectB?.createTime || 0) - (collectA?.createTime || 0);
    });
});

// 获取收藏时间
const getCollectTime = (workId) => {
  const collect = interactionStore.collects.find(
    (c) => c.workId === workId && c.userId === userStore.currentUserId,
  );
  if (collect) {
    return dayjs(collect.createTime).format("YYYY-MM-DD HH:mm");
  }
  return "";
};

// 取消收藏
const removeCollect = (workId) => {
  ElMessageBox.confirm("确定要取消收藏这个作品吗？", "提示", {
    confirmButtonText: "确定取消",
    cancelButtonText: "保留",
    type: "warning",
  })
    .then(() => {
      const result = interactionStore.collectWork(
        userStore.currentUserId,
        workId,
      );
      if (result.action === "uncollected") {
        ElMessage.success("已取消收藏");
      }
    })
    .catch(() => {});
};

// 检查登录状态
const checkLogin = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return false;
  }
  return true;
};

onMounted(() => {
  if (!checkLogin()) return;

  loading.value = true;
  // 确保所有数据已加载
  workStore.fetchWorks();
  interactionStore.loadData();
  userStore.loadUsers();
  loading.value = false;
});
</script>

<style scoped>
.my-collects-page {
  padding: 30px 0 40px;
  background: #f5f7fa;
  min-height: 100vh;
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  font-size: 14px;
  color: #7f8c8d;
  padding: 0;
}

.back-btn:hover {
  color: #3498db;
}

.header-left h1 {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.header-right .collect-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: #ecf0f1;
  border-radius: 20px;
  font-size: 14px;
  color: #2c3e50;
}

.header-right .collect-count .el-icon {
  color: #e74c3c;
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
  background: #fdedec;
  border-radius: 50%;
  margin-bottom: 16px;
}

.empty-icon-wrapper .el-icon {
  font-size: 36px;
  color: #e74c3c;
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

/* 收藏网格 */
.collect-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.collect-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.collect-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-image {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
  cursor: pointer;
  background: #ecf0f1;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.collect-card:hover .card-image img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  opacity: 0;
  transition: all 0.3s ease;
}

.collect-card:hover .card-overlay {
  opacity: 1;
}

.overlay-stats {
  display: flex;
  gap: 16px;
  color: white;
  font-size: 13px;
}

.overlay-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-body {
  padding: 16px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-title:hover {
  color: #3498db;
}

.remove-btn {
  flex-shrink: 0;
  border-radius: 16px;
  font-size: 12px;
  padding: 4px 12px;
}

.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.author-info :deep(.app-image) {
  border-radius: 50% !important;
  overflow: hidden;
  width: 24px !important;
  height: 24px !important;
  flex-shrink: 0;
}

.author-info span {
  font-size: 13px;
  color: #7f8c8d;
}

.author-info:hover span {
  color: #3498db;
}

.card-tags {
  display: flex;
  gap: 6px;
}

.card-tags .tag {
  font-size: 11px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 2px 10px;
  border-radius: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #ecf0f1;
  font-size: 12px;
  color: #7f8c8d;
}

.collect-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-badge {
  padding: 2px 12px;
  background: #ebf5fb;
  color: #3498db;
  border-radius: 12px;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px;
  }

  .header-left {
    flex-wrap: wrap;
  }

  .header-left h1 {
    font-size: 18px;
  }

  .collect-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .remove-btn {
    align-self: flex-end;
  }
}
</style>
