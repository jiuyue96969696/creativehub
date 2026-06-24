<template>
  <div class="work-card" @click="$router.push(`/work/${work.id}`)">
    <div class="card-image">
      <AppImage
        :src="work.coverImage"
        :alt="work.title"
        :height="200"
        fallback-text="图片加载失败"
        object-fit="cover"
      />
      <div class="card-overlay">
        <div class="overlay-stats">
          <span
            ><el-icon><View /></el-icon> {{ formatNumber(work.views) }}</span
          >
          <span
            ><el-icon><Star /></el-icon> {{ formatNumber(work.likes) }}</span
          >
        </div>
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ work.title }}</h3>
      <div class="card-meta">
        <div class="author-info" @click.stop="goToUserProfile">
          <AppImage
            :src="displayAvatar"
            :alt="displayName"
            :width="24"
            :height="24"
            fallback-text=""
            object-fit="cover"
            border-radius="50%"
          />
          <span>{{ displayName }}</span>
        </div>
        <div class="card-actions">
          <span class="collect-indicator" v-if="isCollected" title="已收藏">
            ❤️
          </span>
          <div class="card-tags">
            <span v-for="tag in work.tags.slice(0, 2)" :key="tag" class="tag">{{
              tag
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useInteractionStore } from "@/stores/interactionStore";
import AppImage from "./AppImage.vue";

const props = defineProps({
  work: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const userStore = useUserStore();
const interactionStore = useInteractionStore();

// 使用 ref 存储显示数据
const displayName = ref("");
const displayAvatar = ref("");
const isCurrentUser = ref(false);
const isCollected = ref(false);

// 获取最新的用户信息
const fetchUserInfo = () => {
  userStore.loadUsers();
  const user = userStore.userById(props.work.authorId);

  if (user) {
    displayName.value = user.username;
    displayAvatar.value = user.avatar;
    isCurrentUser.value =
      userStore.isLoggedIn && userStore.currentUserId === props.work.authorId;
  } else {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const foundUser = users.find((u) => u.id === props.work.authorId);
      if (foundUser) {
        displayName.value = foundUser.username;
        displayAvatar.value = foundUser.avatar;
      }
    } catch (e) {
      displayName.value = props.work.authorName || "未知作者";
      displayAvatar.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(props.work.authorName || "User")}&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle`;
    }
  }

  // 检查收藏状态
  checkCollectStatus();
};

// 检查收藏状态
const checkCollectStatus = () => {
  if (userStore.isLoggedIn) {
    isCollected.value = interactionStore.hasCollected(
      userStore.currentUserId,
      props.work.id,
    );
  } else {
    isCollected.value = false;
  }
};

const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 10000) return (num / 10000).toFixed(1) + "w";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num;
};

const goToUserProfile = (e) => {
  e.stopPropagation();
  router.push(`/user/${props.work.authorId}`);
};

// 处理用户更新事件
const handleUserUpdate = (event) => {
  const { userId } = event.detail || {};
  if (userId === props.work.authorId || !userId) {
    fetchUserInfo();
  }
};

// 处理收藏更新事件
const handleCollectUpdate = (event) => {
  const { userId, workId } = event.detail || {};
  if (userId === userStore.currentUserId && workId === props.work.id) {
    checkCollectStatus();
  }
};

onMounted(() => {
  fetchUserInfo();
  window.addEventListener("user-profile-updated", handleUserUpdate);
  window.addEventListener("user-data-changed", handleUserUpdate);
  window.addEventListener("collect-updated", handleCollectUpdate);
});

onUnmounted(() => {
  window.removeEventListener("user-profile-updated", handleUserUpdate);
  window.removeEventListener("user-data-changed", handleUserUpdate);
  window.removeEventListener("collect-updated", handleCollectUpdate);
});

watch(
  () => props.work.id,
  () => {
    fetchUserInfo();
  },
);
</script>

<style scoped>
.work-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.work-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: #f5f7fa;
}

.card-image :deep(.app-image) {
  width: 100%;
  height: 100%;
}

.card-image :deep(.app-image img) {
  transition: transform 0.5s ease;
}

.work-card:hover .card-image :deep(.app-image img) {
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

.work-card:hover .card-overlay {
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
  padding: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  color: #2c3e50;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #7f8c8d;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  cursor: pointer;
  padding: 2px 8px 2px 2px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.author-info:hover {
  background: #ecf0f1;
}

.author-info :deep(.app-image) {
  border-radius: 50% !important;
  overflow: hidden;
  width: 24px !important;
  height: 24px !important;
  flex-shrink: 0;
}

.author-info span {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collect-indicator {
  font-size: 14px;
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tag {
  padding: 2px 10px;
  background: #ecf0f1;
  border-radius: 12px;
  font-size: 11px;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .card-image :deep(.app-image) {
    height: 160px !important;
  }

  .author-info span {
    max-width: 60px;
  }
}
</style>
