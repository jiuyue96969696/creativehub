<template>
  <div class="user-card" @click="$router.push(`/user/${user.id}`)">
    <div class="user-avatar-wrapper">
      <img :src="user.avatar" :alt="user.username" class="user-avatar" />
      <span v-if="user.isOnline" class="online-dot"></span>
    </div>
    <div class="user-info">
      <div class="user-name-row">
        <h4 class="user-name">{{ user.username }}</h4>
        <el-tag
          v-if="user.isVerified"
          type="primary"
          size="small"
          effect="dark"
        >
          <el-icon><Check /></el-icon>
        </el-tag>
      </div>
      <p class="user-bio">{{ user.bio || "这个人很懒，什么都没写~" }}</p>
      <div class="user-stats">
        <span class="stat">
          <span class="stat-number">{{ user.worksCount || 0 }}</span>
          <span class="stat-label">作品</span>
        </span>
        <span class="stat">
          <span class="stat-number">{{ user.followersCount || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </span>
        <span class="stat">
          <span class="stat-number">{{ user.likesCount || 0 }}</span>
          <span class="stat-label">获赞</span>
        </span>
      </div>
    </div>
    <button
      v-if="
        showFollow &&
        userStore.isLoggedIn &&
        userStore.currentUserId !== user.id
      "
      :class="['follow-btn', { following: isFollowing }]"
      @click.stop="handleFollow"
    >
      {{ isFollowing ? "已关注" : "关注" }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/userStore";
import { useInteractionStore } from "@/stores/interactionStore";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  showFollow: {
    type: Boolean,
    default: true,
  },
});

const userStore = useUserStore();
const interactionStore = useInteractionStore();

const isFollowing = ref(false);

const handleFollow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }
  const result = interactionStore.followUser(
    userStore.currentUserId,
    props.user.id,
  );
  isFollowing.value = result.action === "followed";
  ElMessage.success(result.action === "followed" ? "关注成功" : "已取消关注");
};

onMounted(() => {
  if (userStore.isLoggedIn && userStore.currentUserId !== props.user.id) {
    isFollowing.value = interactionStore.hasFollowed(
      userStore.currentUserId,
      props.user.id,
    );
  }
});
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--bg-light);
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

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-dark);
}

.user-name-row .el-tag {
  height: 18px;
  padding: 0 4px;
  font-size: 10px;
}

.user-bio {
  font-size: 13px;
  color: var(--text-gray);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.user-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-gray);
}

.stat-number {
  font-weight: 600;
  color: var(--text-dark);
}

.follow-btn {
  padding: 4px 16px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  background: var(--secondary);
  color: white;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.follow-btn:hover {
  background: #2980b9;
}

.follow-btn.following {
  background: var(--bg-light);
  color: var(--text-gray);
}

.follow-btn.following:hover {
  background: #e8eaed;
}
</style>
