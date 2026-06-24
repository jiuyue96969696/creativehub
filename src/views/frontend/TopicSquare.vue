<template>
  <div class="topic-square">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <h1>💬 话题广场</h1>
            <span class="header-desc">分享创意，交流灵感</span>
          </div>
          <div class="header-right">
            <el-button
              type="primary"
              @click="showCreateDialog = true"
              size="large"
            >
              <el-icon><Edit /></el-icon>
              发布话题
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分类导航 -->
      <div class="category-nav">
        <div class="category-list">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['category-btn', { active: activeCategory === cat.id }]"
            @click="activeCategory = cat.id"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </button>
          <button
            :class="['category-btn', { active: activeCategory === 'all' }]"
            @click="activeCategory = 'all'"
          >
            <span class="cat-icon">📋</span>
            <span class="cat-name">全部</span>
          </button>
        </div>
      </div>

      <!-- 话题列表 -->
      <div class="topic-list">
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          加载中...
        </div>

        <div v-else-if="displayTopics.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>还没有话题</h3>
          <p>成为第一个发布话题的人吧！</p>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Edit /></el-icon>
            发布话题
          </el-button>
        </div>

        <div v-else class="topics">
          <div
            v-for="topic in displayTopics"
            :key="topic.id"
            class="topic-card"
            @click="$router.push(`/topic/${topic.id}`)"
          >
            <div class="topic-header">
              <div class="topic-author">
                <img :src="topic.authorAvatar" :alt="topic.authorName" />
                <div class="author-info">
                  <span class="author-name">{{ topic.authorName }}</span>
                  <span class="topic-time">{{
                    formatTime(topic.createTime)
                  }}</span>
                </div>
              </div>
              <div class="topic-category">
                <span class="category-tag">{{ topic.categoryName }}</span>
              </div>
            </div>

            <div class="topic-body">
              <h3 class="topic-title">{{ topic.title }}</h3>
              <p class="topic-content">{{ topic.content }}</p>
            </div>

            <div class="topic-footer">
              <div class="topic-stats">
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ topic.comments.length }}
                </span>
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ topic.likes }}
                </span>
              </div>
              <div class="topic-actions" @click.stop>
                <button
                  :class="['like-btn', { active: hasLiked(topic.id) }]"
                  @click="handleLike(topic.id)"
                >
                  <el-icon><Star /></el-icon>
                  <span>{{ topic.likes }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建话题对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="发布话题"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="newTopic"
        :rules="topicRules"
        ref="topicFormRef"
        label-width="80px"
      >
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="newTopic.categoryId"
            placeholder="选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="`${cat.icon} ${cat.name}`"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="newTopic.title"
            placeholder="请输入话题标题（3-50字符）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="newTopic.content"
            type="textarea"
            :rows="6"
            placeholder="请输入话题内容（10-500字符）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitTopic" :loading="submitting">
          发布话题
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useTopicStore } from "@/stores/topicStore";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const router = useRouter();
const topicStore = useTopicStore();
const userStore = useUserStore();

const loading = ref(false);
const activeCategory = ref("all");
const showCreateDialog = ref(false);
const submitting = ref(false);
const topicFormRef = ref(null);

const categories = computed(() => topicStore.categories);

const displayTopics = computed(() => {
  if (activeCategory.value === "all") {
    return topicStore.allTopics;
  }
  return topicStore.topicsByCategory(activeCategory.value);
});

const newTopic = ref({
  categoryId: null,
  title: "",
  content: "",
});

const topicRules = {
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  title: [
    { required: true, message: "请输入话题标题", trigger: "blur" },
    { min: 3, max: 50, message: "标题长度为 3-50 个字符", trigger: "blur" },
  ],
  content: [
    { required: true, message: "请输入话题内容", trigger: "blur" },
    { min: 10, max: 500, message: "内容长度为 10-500 个字符", trigger: "blur" },
  ],
};

const formatTime = (time) => {
  return dayjs(time).fromNow();
};

// 检查是否已点赞
const hasLiked = (topicId) => {
  if (!userStore.isLoggedIn) return false;
  return topicStore.hasLikedTopic(topicId, userStore.currentUserId);
};

// 点赞
const handleLike = (topicId) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }
  const result = topicStore.likeTopic(topicId, userStore.currentUserId);
  if (result.action === "liked") {
    ElMessage.success("点赞成功 👍");
  } else {
    ElMessage.info("已取消点赞");
  }
};

// 提交话题
const submitTopic = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }

  if (!topicFormRef.value) return;
  await topicFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;

      const category = categories.value.find(
        (c) => c.id === newTopic.value.categoryId,
      );
      const topicData = {
        title: newTopic.value.title,
        content: newTopic.value.content,
        categoryId: newTopic.value.categoryId,
        categoryName: category?.name || "",
      };

      topicStore.createTopic(topicData);

      submitting.value = false;
      showCreateDialog.value = false;
      ElMessage.success("话题发布成功！");

      // 重置表单
      newTopic.value = {
        categoryId: null,
        title: "",
        content: "",
      };
    }
  });
};

onMounted(() => {
  loading.value = true;
  topicStore.loadTopics();
  userStore.loadUsers();
  loading.value = false;
});
</script>

<style scoped>
.topic-square {
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

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.header-desc {
  color: #7f8c8d;
  font-size: 14px;
}

/* 分类导航 */
.category-nav {
  background: white;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow-x: auto;
}

.category-list {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  background: transparent;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-btn:hover {
  background: #ecf0f1;
}

.category-btn.active {
  background: #3498db;
  color: white;
}

.category-btn .cat-icon {
  font-size: 16px;
}

/* 话题列表 */
.topic-list {
  min-height: 300px;
}

.topics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topic-card {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.topic-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topic-author img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.topic-time {
  font-size: 12px;
  color: #7f8c8d;
}

.category-tag {
  padding: 2px 12px;
  background: #ebf5fb;
  color: #3498db;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.topic-body {
  margin-bottom: 12px;
}

.topic-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px;
}

.topic-content {
  font-size: 14px;
  color: #7f8c8d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  margin: 0;
}

.topic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ecf0f1;
}

.topic-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #7f8c8d;
}

.stat-item .el-icon {
  font-size: 16px;
}

.topic-actions {
  display: flex;
  gap: 8px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 14px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
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

.like-btn.active:hover {
  background: #2980b9;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.loading-state .el-icon {
  font-size: 40px;
  margin-bottom: 12px;
  color: #3498db;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
  display: block;
}

.empty-state h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 8px;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-button {
    width: 100%;
    justify-content: center;
  }

  .category-list {
    gap: 4px;
  }

  .category-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .topic-card {
    padding: 16px 18px;
  }

  .topic-title {
    font-size: 16px;
  }
}
</style>
