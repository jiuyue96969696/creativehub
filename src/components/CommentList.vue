<template>
  <div class="comment-list">
    <h3 class="comment-title">
      评论 <span class="count">({{ comments.length }})</span>
    </h3>

    <div v-if="userStore.isLoggedIn" class="comment-input">
      <AppImage
        :src="userStore.currentUser?.avatar || defaultAvatar"
        :alt="userStore.currentUser?.username || 'avatar'"
        :width="40"
        :height="40"
        fallback-text=""
        object-fit="cover"
        border-radius="50%"
      />
      <div class="input-wrapper">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="2"
          placeholder="写下你的评论..."
          maxlength="200"
          show-word-limit
        />
        <el-button
          type="primary"
          @click="submitComment"
          :disabled="!newComment.trim()"
        >
          发送
        </el-button>
      </div>
    </div>
    <div v-else class="comment-login-tip">
      <el-icon><Lock /></el-icon>
      登录后发表评论
    </div>

    <div v-if="comments.length === 0" class="comment-empty">
      <el-icon><ChatDotRound /></el-icon>
      <p>还没有评论，来说点什么吧~</p>
    </div>

    <div v-else class="comments">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <AppImage
          :src="getUserInfo(comment.userId).avatar || defaultAvatar"
          :alt="getUserInfo(comment.userId).name"
          :width="36"
          :height="36"
          fallback-text=""
          object-fit="cover"
          border-radius="50%"
        />
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-user">{{
              getUserInfo(comment.userId).name
            }}</span>
            <span class="comment-time">{{
              formatTime(comment.createTime)
            }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/userStore";
import { useInteractionStore } from "@/stores/interactionStore";
import AppImage from "./AppImage.vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const props = defineProps({
  workId: {
    type: Number,
    required: true,
  },
});

const userStore = useUserStore();
const interactionStore = useInteractionStore();
const newComment = ref("");
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";

const comments = computed(() => {
  return interactionStore.commentsByWork(props.workId) || [];
});

// 获取用户信息 - 优先从 userStore 获取最新信息
const getUserInfo = (userId) => {
  const user = userStore.userById(userId);
  if (user) {
    return {
      name: user.username,
      avatar: user.avatar,
    };
  }
  // 如果找不到用户，从评论数据中查找
  const comment = comments.value.find((c) => c.userId === userId);
  if (comment) {
    return {
      name: comment.userName || "未知用户",
      avatar: comment.userAvatar || defaultAvatar,
    };
  }
  return {
    name: "未知用户",
    avatar: defaultAvatar,
  };
};

const formatTime = (time) => {
  return dayjs(time).fromNow();
};

const submitComment = () => {
  if (!newComment.value.trim()) return;
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }

  interactionStore.addComment(
    props.workId,
    userStore.currentUser.id,
    newComment.value.trim(),
  );
  newComment.value = "";
  ElMessage.success("评论发表成功");
};

// 监听用户更新事件，刷新评论列表
const handleUserUpdate = () => {
  // 评论列表会自动更新
};

onMounted(() => {
  // 确保用户数据已加载
  userStore.loadUsers();

  window.addEventListener("user-profile-updated", handleUserUpdate);
  window.addEventListener("user-data-changed", handleUserUpdate);
});

onUnmounted(() => {
  window.removeEventListener("user-profile-updated", handleUserUpdate);
  window.removeEventListener("user-data-changed", handleUserUpdate);
});
</script>

<style scoped>
.comment-list {
  padding: 20px 0;
}

.comment-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.comment-title .count {
  color: #7f8c8d;
  font-weight: 400;
}

.comment-input {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.comment-input :deep(.app-image) {
  border-radius: 50% !important;
  flex-shrink: 0;
  width: 40px !important;
  height: 40px !important;
}

.input-wrapper {
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-wrapper :deep(.el-textarea__inner) {
  border-radius: 8px;
  resize: none;
}

.comment-login-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: #ecf0f1;
  border-radius: 8px;
  color: #7f8c8d;
  margin-bottom: 24px;
}

.comment-empty {
  text-align: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.comment-empty .el-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #ecf0f1;
}

.comment-item :deep(.app-image) {
  border-radius: 50% !important;
  flex-shrink: 0;
  width: 36px !important;
  height: 36px !important;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.comment-user {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
}

.comment-time {
  font-size: 12px;
  color: #7f8c8d;
}

.comment-text {
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.6;
}
</style>
