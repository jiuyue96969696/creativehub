<template>
  <div class="follow-list-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <el-button type="text" @click="$router.push('/')" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回首页
            </el-button>
            <h1>👥 关注管理</h1>
          </div>
          <div class="header-right">
            <span class="follow-stats">
              <span class="stat-item">
                <span class="stat-number">{{ followingList.length }}</span>
                <span class="stat-label">关注</span>
              </span>
              <span class="stat-divider">|</span>
              <span class="stat-item">
                <span class="stat-number">{{ followersList.length }}</span>
                <span class="stat-label">粉丝</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 标签切换 -->
      <div class="follow-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'following' }]"
          @click="activeTab = 'following'"
        >
          <el-icon><User /></el-icon>
          我的关注
          <span class="tab-count">{{ followingList.length }}</span>
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'followers' }]"
          @click="activeTab = 'followers'"
        >
          <el-icon><UserFilled /></el-icon>
          我的粉丝
          <span class="tab-count">{{ followersList.length }}</span>
        </button>
      </div>

      <!-- 关注列表 -->
      <div v-if="activeTab === 'following'" class="follow-list">
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          加载中...
        </div>
        <div v-else-if="followingList.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <el-icon><User /></el-icon>
          </div>
          <h3>还没有关注任何人</h3>
          <p>去发现更多优秀的创作者吧</p>
          <el-button
            type="primary"
            @click="$router.push('/')"
            class="empty-btn"
          >
            <el-icon><Search /></el-icon>
            去发现
          </el-button>
        </div>
        <div v-else class="user-list">
          <div
            v-for="user in followingList"
            :key="user.id"
            class="user-item"
            @click="$router.push(`/user/${user.id}`)"
          >
            <div class="user-avatar-wrapper">
              <AppImage
                :src="user.avatar || defaultAvatar"
                :alt="user.username"
                :width="56"
                :height="56"
                fallback-text=""
                object-fit="cover"
                border-radius="50%"
              />
              <span v-if="user.isOnline" class="online-dot"></span>
            </div>
            <div class="user-info">
              <div class="user-name-row">
                <h4>{{ user.username }}</h4>
                <el-tag
                  v-if="user.isVerified"
                  type="primary"
                  size="small"
                  effect="dark"
                >
                  <el-icon><Check /></el-icon>
                </el-tag>
              </div>
              <p class="user-bio">
                {{ user.bio || "这个人很懒，什么都没写~" }}
              </p>
              <div class="user-stats">
                <span>📁 {{ user.worksCount || 0 }} 作品</span>
                <span>👥 {{ user.followersCount || 0 }} 粉丝</span>
                <span>❤️ {{ user.likesCount || 0 }} 获赞</span>
              </div>
            </div>
            <button class="unfollow-btn" @click.stop="handleUnfollow(user.id)">
              <el-icon><Check /></el-icon>
              已关注
            </button>
          </div>
        </div>
      </div>

      <!-- 粉丝列表 - 只查看，不能操作 -->
      <div v-if="activeTab === 'followers'" class="follow-list">
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          加载中...
        </div>
        <div v-else-if="followersList.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <el-icon><UserFilled /></el-icon>
          </div>
          <h3>还没有粉丝</h3>
          <p>发布更多优秀作品吸引关注吧</p>
          <el-button
            type="primary"
            @click="$router.push('/upload')"
            class="empty-btn"
          >
            <el-icon><Plus /></el-icon>
            发布作品
          </el-button>
        </div>
        <div v-else class="user-list">
          <div
            v-for="user in followersList"
            :key="user.id"
            class="user-item"
            @click="$router.push(`/user/${user.id}`)"
          >
            <div class="user-avatar-wrapper">
              <AppImage
                :src="user.avatar || defaultAvatar"
                :alt="user.username"
                :width="56"
                :height="56"
                fallback-text=""
                object-fit="cover"
                border-radius="50%"
              />
              <span v-if="user.isOnline" class="online-dot"></span>
            </div>
            <div class="user-info">
              <div class="user-name-row">
                <h4>{{ user.username }}</h4>
                <el-tag
                  v-if="user.isVerified"
                  type="primary"
                  size="small"
                  effect="dark"
                >
                  <el-icon><Check /></el-icon>
                </el-tag>
              </div>
              <p class="user-bio">
                {{ user.bio || "这个人很懒，什么都没写~" }}
              </p>
              <div class="user-stats">
                <span>📁 {{ user.worksCount || 0 }} 作品</span>
                <span>👥 {{ user.followersCount || 0 }} 粉丝</span>
                <span>❤️ {{ user.likesCount || 0 }} 获赞</span>
              </div>
            </div>
            <!-- 粉丝列表只显示，不提供任何操作按钮 -->
            <div class="follower-badge">
              <el-tag type="info" size="small" effect="plain">
                <el-icon><UserFilled /></el-icon>
                粉丝
              </el-tag>
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
import { useInteractionStore } from "@/stores/interactionStore";
import AppImage from "@/components/AppImage.vue";

const router = useRouter();
const userStore = useUserStore();
const interactionStore = useInteractionStore();

const activeTab = ref("following");
const loading = ref(false);
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";

// 获取当前用户ID
const currentUserId = computed(() => userStore.currentUserId);

// 获取关注列表（我关注的用户）
const followingList = computed(() => {
  if (!userStore.isLoggedIn) return [];

  const followRelations = interactionStore.follows.filter(
    (f) => f.followerId === currentUserId.value,
  );

  const userIds = followRelations.map((f) => f.followingId);
  return userStore.users.filter((u) => userIds.includes(u.id));
});

// 获取粉丝列表（关注我的用户）- 只读，不能操作
const followersList = computed(() => {
  if (!userStore.isLoggedIn) return [];

  const followRelations = interactionStore.follows.filter(
    (f) => f.followingId === currentUserId.value,
  );

  const userIds = followRelations.map((f) => f.followerId);
  return userStore.users.filter((u) => userIds.includes(u.id));
});

// 取消关注（仅在"我的关注"中使用）
const handleUnfollow = (userId) => {
  ElMessageBox.confirm("确定要取消关注该用户吗？", "提示", {
    confirmButtonText: "确定取消",
    cancelButtonText: "保留",
    type: "warning",
  })
    .then(() => {
      const result = interactionStore.followUser(currentUserId.value, userId);
      if (result.action === "unfollowed") {
        ElMessage.success("已取消关注");
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
  userStore.loadUsers();
  interactionStore.loadData();
  loading.value = false;
});
</script>

<style scoped>
.follow-list-page {
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

.header-right .follow-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

.stat-divider {
  color: #ecf0f1;
}

/* 标签切换 */
.follow-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  background: transparent;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: #ecf0f1;
}

.tab-btn.active {
  background: #3498db;
  color: white;
}

.tab-btn .tab-count {
  display: inline-block;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 用户列表 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
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

.user-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar-wrapper :deep(.app-image) {
  border-radius: 50% !important;
  border: 2px solid #ecf0f1;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #2ecc71;
  border-radius: 50%;
  border: 2px solid white;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.user-name-row h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.user-name-row .el-tag {
  height: 18px;
  padding: 0 4px;
  font-size: 10px;
}

.user-bio {
  font-size: 13px;
  color: #7f8c8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 4px;
}

.user-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #7f8c8d;
}

.user-stats span {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 取消关注按钮（仅用于"我的关注"） */
.unfollow-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  background: #ecf0f1;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.unfollow-btn:hover {
  background: #e74c3c;
  color: white;
}

/* 粉丝徽章（仅用于"我的粉丝" - 只读） */
.follower-badge {
  flex-shrink: 0;
}

.follower-badge .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
}

.follower-badge .el-tag .el-icon {
  font-size: 14px;
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

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px;
  }

  .header-left h1 {
    font-size: 18px;
  }

  .follow-tabs {
    flex-direction: column;
    gap: 8px;
  }

  .tab-btn {
    justify-content: center;
  }

  .user-item {
    flex-wrap: wrap;
    padding: 14px 16px;
  }

  .user-avatar-wrapper :deep(.app-image) {
    width: 44px !important;
    height: 44px !important;
  }

  .user-stats {
    gap: 8px;
    font-size: 11px;
  }

  .unfollow-btn,
  .follower-badge .el-tag {
    font-size: 12px;
    padding: 4px 12px;
  }
}

@media (max-width: 480px) {
  .user-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-info {
    width: 100%;
  }

  .user-name-row {
    justify-content: center;
  }

  .user-stats {
    justify-content: center;
  }
}
</style>
