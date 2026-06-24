<template>
  <div class="topic-detail" v-if="topic">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-nav">
        <el-button type="text" @click="$router.push('/topics')">
          <el-icon><ArrowLeft /></el-icon>
          返回话题广场
        </el-button>
      </div>

      <!-- 话题详情 -->
      <div class="topic-card">
        <div class="topic-header">
          <div class="topic-author">
            <img :src="topic.authorAvatar" :alt="topic.authorName" />
            <div class="author-info">
              <span class="author-name">{{ topic.authorName }}</span>
              <span class="topic-time">{{ formatTime(topic.createTime) }}</span>
            </div>
          </div>
          <div class="topic-category">
            <span class="category-tag">{{ topic.categoryName }}</span>
          </div>
        </div>

        <div class="topic-body">
          <h1 class="topic-title">{{ topic.title }}</h1>
          <div class="topic-content">{{ topic.content }}</div>
        </div>

        <div class="topic-footer">
          <div class="topic-stats">
            <span class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              {{ topic.comments.length }} 评论
            </span>
            <span class="stat-item">
              <el-icon><Star /></el-icon>
              {{ topic.likes }} 点赞
            </span>
          </div>
          <div class="topic-actions">
            <button
              :class="['like-btn', { active: hasLiked }]"
              @click="handleLike"
            >
              <el-icon><Star /></el-icon>
              <span>{{ topic.likes }}</span>
            </button>
            <button v-if="canDelete" class="delete-btn" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section">
        <div class="comments-header">
          <h3>💬 全部评论 ({{ topic.comments.length }})</h3>
        </div>

        <!-- 评论输入 -->
        <div class="comment-input-wrapper">
          <div class="comment-input">
            <img
              :src="userStore.currentUser?.avatar || defaultAvatar"
              alt="avatar"
              class="comment-avatar"
              v-if="userStore.isLoggedIn"
            />
            <div class="input-wrapper">
              <el-input
                v-model="newComment"
                type="textarea"
                :rows="2"
                placeholder="写下你的评论..."
                maxlength="200"
                show-word-limit
                :disabled="!userStore.isLoggedIn"
              />
              <div class="input-actions">
                <el-button
                  type="primary"
                  @click="submitComment"
                  :disabled="!newComment.trim() || !userStore.isLoggedIn"
                >
                  发送评论
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="!userStore.isLoggedIn" class="login-tip">
            <el-icon><Lock /></el-icon>
            登录后发表评论
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="topic.comments.length === 0" class="empty-comments">
          <el-icon><ChatDotRound /></el-icon>
          <p>还没有评论，来说点什么吧~</p>
        </div>

        <div v-else class="comments-list">
          <div
            v-for="comment in sortedComments"
            :key="comment.id"
            class="comment-item"
          >
            <img
              :src="comment.userAvatar"
              :alt="comment.userName"
              class="comment-avatar"
            />
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-user">{{ comment.userName }}</span>
                <span class="comment-time">{{
                  formatTime(comment.createTime)
                }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions" v-if="canDeleteComment(comment)">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="deleteComment(comment.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <div class="container">
      <el-result
        icon="warning"
        title="话题不存在"
        sub-title="该话题可能已被删除"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/topics')">
            返回话题广场
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useTopicStore } from "@/stores/topicStore";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const route = useRoute();
const router = useRouter();
const topicStore = useTopicStore();
const userStore = useUserStore();

const topic = ref(null);
const newComment = ref("");
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95a5a6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";

// 判断是否已点赞
const hasLiked = computed(() => {
  if (!topic.value || !userStore.isLoggedIn) return false;
  return topicStore.hasLikedTopic(topic.value.id, userStore.currentUserId);
});

// 判断是否可以删除
const canDelete = computed(() => {
  if (!topic.value || !userStore.isLoggedIn) return false;
  return topic.value.authorId === userStore.currentUserId;
});

// 排序评论（最新在前）
const sortedComments = computed(() => {
  if (!topic.value) return [];
  return [...topic.value.comments].sort((a, b) => b.createTime - a.createTime);
});

const formatTime = (time) => {
  return dayjs(time).fromNow();
};

// 点赞
const handleLike = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }
  const result = topicStore.likeTopic(topic.value.id, userStore.currentUserId);
  if (result.action === "liked") {
    ElMessage.success("点赞成功 👍");
  } else {
    ElMessage.info("已取消点赞");
  }
};

// 提交评论
const submitComment = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }

  if (!newComment.value.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }

  const result = topicStore.addComment(
    topic.value.id,
    userStore.currentUserId,
    newComment.value.trim(),
  );

  if (result) {
    ElMessage.success("评论发表成功");
    newComment.value = "";
    // 更新本地 topic 数据
    topic.value = topicStore.getTopicById(topic.value.id);
  }
};

// 删除评论
const deleteComment = (commentId) => {
  ElMessageBox.confirm("确定要删除这条评论吗？", "提示", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const result = topicStore.deleteComment(
        topic.value.id,
        commentId,
        userStore.currentUserId,
      );
      if (result) {
        ElMessage.success("评论已删除");
        topic.value = topicStore.getTopicById(topic.value.id);
      } else {
        ElMessage.error("删除失败，请重试");
      }
    })
    .catch(() => {});
};

// 判断是否可以删除评论
const canDeleteComment = (comment) => {
  if (!userStore.isLoggedIn) return false;
  return (
    comment.userId === userStore.currentUserId ||
    topic.value?.authorId === userStore.currentUserId
  );
};

// 删除话题
const handleDelete = () => {
  ElMessageBox.confirm("确定要删除这个话题吗？所有评论也将被删除。", "警告", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const result = topicStore.deleteTopic(
        topic.value.id,
        userStore.currentUserId,
      );
      if (result) {
        ElMessage.success("话题已删除");
        router.push("/topics");
      } else {
        ElMessage.error("删除失败，请重试");
      }
    })
    .catch(() => {});
};

onMounted(() => {
  const id = Number(route.params.id);
  topicStore.loadTopics();
  userStore.loadUsers();

  const topicData = topicStore.getTopicById(id);
  if (topicData) {
    topic.value = topicData;
  } else {
    // 话题不存在
    topic.value = null;
  }
});
</script>

<style scoped>
.topic-detail {
  padding: 30px 0 40px;
  background: #f5f7fa;
  min-height: 100vh;
}

.back-nav {
  margin-bottom: 20px;
}

.back-nav .el-button {
  font-size: 15px;
  color: #7f8c8d;
  padding: 0;
}

.back-nav .el-button:hover {
  color: #3498db;
}

.topic-card {
  background: white;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.topic-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topic-author img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.topic-time {
  font-size: 13px;
  color: #7f8c8d;
}

.category-tag {
  padding: 4px 14px;
  background: #ebf5fb;
  color: #3498db;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
}

.topic-body {
  margin-bottom: 16px;
}

.topic-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
}

.topic-content {
  font-size: 16px;
  color: #2c3e50;
  line-height: 1.8;
  white-space: pre-wrap;
}

.topic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
}

.topic-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #7f8c8d;
}

.topic-actions {
  display: flex;
  gap: 12px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  background: #ecf0f1;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.like-btn:hover {
  background: #d5dbe0;
}

.like-btn.active {
  background: #3498db;
  color: white;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  background: #fdedec;
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #e74c3c;
  color: white;
}

/* 评论区域 */
.comments-section {
  background: white;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.comments-header {
  margin-bottom: 20px;
}

.comments-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.comment-input-wrapper {
  margin-bottom: 24px;
}

.comment-input {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

.login-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #ecf0f1;
  border-radius: 8px;
  color: #7f8c8d;
  font-size: 14px;
}

.comments-list {
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

.comment-item:last-child {
  border-bottom: none;
}

.comment-item .comment-avatar {
  width: 36px;
  height: 36px;
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
  margin: 0 0 4px;
}

.comment-actions {
  margin-top: 4px;
}

.empty-comments {
  text-align: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.empty-comments .el-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.not-found {
  padding: 60px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .topic-card {
    padding: 16px 18px;
  }

  .comments-section {
    padding: 16px 18px;
  }

  .topic-title {
    font-size: 20px;
  }

  .topic-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .comment-input {
    flex-direction: column;
  }

  .comment-avatar {
    align-self: flex-start;
  }
}
</style>
