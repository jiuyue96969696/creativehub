<template>
  <div class="work-detail-page" v-if="work">
    <div class="container">
      <div class="detail-layout">
        <!-- 左侧：作品展示 -->
        <div class="detail-main">
          <!-- 图片轮播 -->
          <div class="image-carousel">
            <el-carousel
              v-if="work.images && work.images.length > 0"
              height="480px"
              indicator-position="outside"
              arrow="always"
              ref="carouselRef"
            >
              <el-carousel-item
                v-for="(img, index) in work.images"
                :key="index"
              >
                <div
                  class="carousel-image-wrapper"
                  @click="openFullscreen(index)"
                >
                  <img :src="img" :alt="`${work.title} - ${index + 1}`" />
                  <div class="fullscreen-hint">
                    <el-icon><FullScreen /></el-icon>
                    <span>点击全屏查看</span>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
              <span>暂无图片</span>
            </div>

            <!-- 缩略图导航 -->
            <div
              class="thumbnail-nav"
              v-if="work.images && work.images.length > 1"
            >
              <div
                v-for="(img, index) in work.images"
                :key="index"
                class="thumbnail-item"
                :class="{ active: currentSlide === index }"
                @click="goToSlide(index)"
              >
                <img :src="img" :alt="`缩略图 ${index + 1}`" />
              </div>
            </div>
          </div>

          <!-- 作品信息 -->
          <div class="work-info">
            <h1 class="work-title">{{ work.title }}</h1>
            <div class="work-meta">
              <span class="meta-item">
                <el-icon><Folder /></el-icon>
                {{ work.categoryName }}
              </span>
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ work.views }} 次浏览
              </span>
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ formatTime(work.publishTime) }}
              </span>
            </div>

            <div class="work-tags">
              <span v-for="tag in work.tags" :key="tag" class="tag-pill">
                #{{ tag }}
              </span>
            </div>

            <div
              class="work-tools"
              v-if="work.toolsUsed && work.toolsUsed.length"
            >
              <span class="tools-label">使用工具：</span>
              <span
                v-for="tool in work.toolsUsed"
                :key="tool"
                class="tool-item"
              >
                {{ tool }}
              </span>
            </div>

            <div class="work-description">
              <p>{{ work.description }}</p>
            </div>

            <!-- 互动区 -->
            <div class="interaction-bar">
              <button
                :class="['interact-btn', { active: liked }]"
                @click="handleLike"
              >
                <el-icon><Star /></el-icon>
                <span>{{ work.likes || 0 }}</span>
              </button>
              <button
                :class="['interact-btn', { active: collected }]"
                @click="handleCollect"
              >
                <el-icon><Collection /></el-icon>
                <span>{{ work.collects || 0 }}</span>
              </button>
              <button class="interact-btn" @click="handleShare">
                <el-icon><Share /></el-icon>
                <span>分享</span>
              </button>
            </div>
          </div>

          <!-- 评论 -->
          <CommentList :work-id="work.id" />
        </div>

        <!-- 右侧：创作者信息 -->
        <div class="detail-sidebar">
          <div class="author-card">
            <div class="author-header">
              <AppImage
                :src="authorAvatar"
                :alt="authorName"
                :width="56"
                :height="56"
                fallback-text=""
                object-fit="cover"
                border-radius="50%"
              />
              <div class="author-info">
                <router-link :to="`/user/${work.authorId}`" class="author-name">
                  {{ authorName }}
                </router-link>
                <span class="author-bio">{{ authorBio || "设计师" }}</span>
              </div>
            </div>

            <div class="author-stats">
              <div class="stat-item">
                <span class="stat-number">{{ authorWorksCount }}</span>
                <span class="stat-label">作品</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ authorFollowersCount }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ authorLikesCount }}</span>
                <span class="stat-label">获赞</span>
              </div>
            </div>

            <button
              v-if="
                userStore.isLoggedIn &&
                userStore.currentUserId !== work.authorId
              "
              :class="['follow-btn', { following: isFollowing }]"
              @click="handleFollow"
            >
              {{ isFollowing ? "已关注" : "关注" }}
            </button>
          </div>

          <!-- 相关推荐 -->
          <div class="related-works" v-if="relatedWorks.length">
            <h4>更多作品</h4>
            <div class="related-list">
              <div
                v-for="item in relatedWorks"
                :key="item.id"
                class="related-item"
                @click="$router.push(`/work/${item.id}`)"
              >
                <img :src="item.coverImage" :alt="item.title" />
                <div class="related-info">
                  <span class="related-title">{{ item.title }}</span>
                  <span class="related-views">{{ item.views }} 浏览</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全屏查看弹窗 -->
    <div
      v-if="fullscreenVisible"
      class="fullscreen-overlay"
      @click="closeFullscreen"
    >
      <div class="fullscreen-content" @click.stop>
        <!-- 关闭按钮 -->
        <button class="fullscreen-close" @click="closeFullscreen">
          <el-icon><Close /></el-icon>
        </button>

        <!-- 图片计数器 -->
        <div
          class="fullscreen-counter"
          v-if="work.images && work.images.length > 1"
        >
          {{ fullscreenIndex + 1 }} / {{ work.images.length }}
        </div>

        <!-- 主图片 -->
        <div class="fullscreen-image-wrapper">
          <img
            :src="work.images[fullscreenIndex]"
            :alt="`${work.title} - ${fullscreenIndex + 1}`"
          />
        </div>

        <!-- 导航按钮 -->
        <button
          v-if="work.images && work.images.length > 1"
          class="fullscreen-nav fullscreen-prev"
          @click="prevImage"
        >
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <button
          v-if="work.images && work.images.length > 1"
          class="fullscreen-nav fullscreen-next"
          @click="nextImage"
        >
          <el-icon><ArrowRight /></el-icon>
        </button>

        <!-- 底部缩略图 -->
        <div
          class="fullscreen-thumbnails"
          v-if="work.images && work.images.length > 1"
        >
          <div
            v-for="(img, index) in work.images"
            :key="index"
            class="fullscreen-thumb"
            :class="{ active: fullscreenIndex === index }"
            @click="fullscreenIndex = index"
          >
            <img :src="img" :alt="`缩略图 ${index + 1}`" />
          </div>
        </div>

        <!-- 操作提示 -->
        <div class="fullscreen-hint-bottom">
          <span>← → 切换 | ESC 关闭</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <el-result
      icon="warning"
      title="作品不存在"
      sub-title="请返回首页浏览其他作品"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')"
          >返回首页</el-button
        >
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";
import { useInteractionStore } from "@/stores/interactionStore";
import CommentList from "@/components/CommentList.vue";
import AppImage from "@/components/AppImage.vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const route = useRoute();
const router = useRouter();
const workStore = useWorkStore();
const userStore = useUserStore();
const interactionStore = useInteractionStore();

const work = ref(null);
const liked = ref(false);
const collected = ref(false);
const isFollowing = ref(false);
const carouselRef = ref(null);
const currentSlide = ref(0);

// 全屏相关
const fullscreenVisible = ref(false);
const fullscreenIndex = ref(0);

// 从 userStore 实时获取作者信息
const authorInfo = computed(() => {
  if (!work.value)
    return {
      name: "",
      avatar: "",
      bio: "",
      worksCount: 0,
      followersCount: 0,
      likesCount: 0,
    };
  const user = userStore.userById(work.value.authorId);
  if (user) {
    return {
      name: user.username,
      avatar: user.avatar,
      bio: user.bio || "设计师",
      worksCount: user.worksCount || 0,
      followersCount: user.followersCount || 0,
      likesCount: user.likesCount || 0,
    };
  }
  return {
    name: work.value.authorName || "未知作者",
    avatar:
      work.value.authorAvatar ||
      "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200",
    bio: "设计师",
    worksCount: 0,
    followersCount: 0,
    likesCount: 0,
  };
});

const authorName = computed(() => authorInfo.value.name);
const authorAvatar = computed(() => authorInfo.value.avatar);
const authorBio = computed(() => authorInfo.value.bio);
const authorWorksCount = computed(() => authorInfo.value.worksCount);
const authorFollowersCount = computed(() => authorInfo.value.followersCount);
const authorLikesCount = computed(() => authorInfo.value.likesCount);

const relatedWorks = computed(() => {
  if (!work.value) return [];
  return workStore.publishedWorks
    .filter(
      (w) =>
        w.id !== work.value.id &&
        (w.categoryId === work.value.categoryId ||
          w.authorId === work.value.authorId),
    )
    .slice(0, 4);
});

const formatTime = (time) => {
  return dayjs(time).format("YYYY年MM月DD日");
};

// 轮播图切换
const goToSlide = (index) => {
  currentSlide.value = index;
  if (carouselRef.value) {
    carouselRef.value.setActiveItem(index);
  }
};

// 全屏查看
const openFullscreen = (index) => {
  fullscreenIndex.value = index;
  fullscreenVisible.value = true;
  document.body.style.overflow = "hidden";
};

const closeFullscreen = () => {
  fullscreenVisible.value = false;
  document.body.style.overflow = "";
};

const prevImage = () => {
  if (work.value && work.value.images) {
    fullscreenIndex.value =
      (fullscreenIndex.value - 1 + work.value.images.length) %
      work.value.images.length;
  }
};

const nextImage = () => {
  if (work.value && work.value.images) {
    fullscreenIndex.value =
      (fullscreenIndex.value + 1) % work.value.images.length;
  }
};

// 键盘事件
const handleKeydown = (e) => {
  if (!fullscreenVisible.value) return;

  switch (e.key) {
    case "Escape":
      closeFullscreen();
      break;
    case "ArrowLeft":
      e.preventDefault();
      prevImage();
      break;
    case "ArrowRight":
      e.preventDefault();
      nextImage();
      break;
  }
};

// 点赞
const handleLike = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }
  const result = interactionStore.likeWork(
    userStore.currentUserId,
    work.value.id,
  );
  liked.value = result.action === "liked";
  work.value.likes = workStore.getWorkById(work.value.id)?.likes || 0;
  ElMessage.success(result.action === "liked" ? "点赞成功 👍" : "已取消点赞");
};

// 收藏
const handleCollect = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }
  const result = interactionStore.collectWork(
    userStore.currentUserId,
    work.value.id,
  );
  collected.value = result.action === "collected";
  work.value.collects = workStore.getWorkById(work.value.id)?.collects || 0;
  ElMessage.success(
    result.action === "collected" ? "收藏成功 ❤️" : "已取消收藏",
  );
};

// 分享
const handleShare = () => {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        ElMessage.success("链接已复制到剪贴板 📋");
      })
      .catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        ElMessage.success("链接已复制到剪贴板 📋");
      });
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    ElMessage.success("链接已复制到剪贴板 📋");
  }
};

// 关注
const handleFollow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    return;
  }
  const result = interactionStore.followUser(
    userStore.currentUserId,
    work.value.authorId,
  );
  isFollowing.value = result.action === "followed";
  ElMessage.success(result.action === "followed" ? "关注成功" : "已取消关注");
};

// 检查收藏状态
const checkCollectStatus = () => {
  if (userStore.isLoggedIn && work.value) {
    collected.value = interactionStore.hasCollected(
      userStore.currentUserId,
      work.value.id,
    );
  }
};

// 加载作品数据
const loadWorkData = () => {
  const id = Number(route.params.id);
  const workData = workStore.getWorkById(id);

  if (workData) {
    work.value = workData;

    if (userStore.isLoggedIn) {
      liked.value = interactionStore.hasLiked(userStore.currentUserId, id);
      collected.value = interactionStore.hasCollected(
        userStore.currentUserId,
        id,
      );
      isFollowing.value = interactionStore.hasFollowed(
        userStore.currentUserId,
        workData.authorId,
      );
    }
  } else {
    router.push("/");
  }
};

// 监听收藏更新事件
const handleCollectUpdate = (event) => {
  const { userId, workId, action } = event.detail || {};
  if (userId === userStore.currentUserId && workId === work.value?.id) {
    collected.value = action === "collected";
    work.value.collects = workStore.getWorkById(work.value.id)?.collects || 0;
  }
};

// 监听用户信息更新事件
const handleUserUpdate = () => {
  if (userStore.isLoggedIn && work.value) {
    collected.value = interactionStore.hasCollected(
      userStore.currentUserId,
      work.value.id,
    );
  }
};

// 监听路由变化
watch(
  () => route.params.id,
  () => {
    loadWorkData();
  },
);

onMounted(() => {
  userStore.loadUsers();
  workStore.fetchWorks();
  interactionStore.loadData();
  loadWorkData();

  window.addEventListener("user-profile-updated", handleUserUpdate);
  window.addEventListener("user-data-changed", handleUserUpdate);
  window.addEventListener("collect-updated", handleCollectUpdate);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("user-profile-updated", handleUserUpdate);
  window.removeEventListener("user-data-changed", handleUserUpdate);
  window.removeEventListener("collect-updated", handleCollectUpdate);
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.work-detail-page {
  padding: 30px 0;
  background: #f5f7fa;
  min-height: 100vh;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
}

.detail-main {
  min-width: 0;
}

/* 图片轮播 */
.image-carousel {
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a2e;
  position: relative;
}

.image-carousel :deep(.el-carousel__container) {
  height: 480px;
}

.carousel-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.carousel-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #1a1a2e;
  transition: transform 0.3s ease;
}

.carousel-image-wrapper:hover img {
  transform: scale(1.02);
}

.fullscreen-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  color: white;
  font-size: 13px;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.carousel-image-wrapper:hover .fullscreen-hint {
  opacity: 1;
}

.fullscreen-hint .el-icon {
  font-size: 18px;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 480px;
  color: #7f8c8d;
  background: #1a1a2e;
}

.no-image .el-icon {
  font-size: 64px;
}

/* 缩略图导航 */
.thumbnail-nav {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.8);
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail-item {
  width: 60px;
  height: 45px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.thumbnail-item:hover {
  opacity: 1;
}

.thumbnail-item.active {
  border-color: #3498db;
  opacity: 1;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 作品信息 */
.work-info {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-top: 24px;
}

.work-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2c3e50;
}

.work-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  color: #7f8c8d;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.work-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-pill {
  padding: 4px 12px;
  background: #ecf0f1;
  border-radius: 16px;
  font-size: 13px;
  color: #7f8c8d;
}

.work-tools {
  margin-bottom: 16px;
  font-size: 14px;
}

.tools-label {
  color: #7f8c8d;
}

.tool-item {
  display: inline-block;
  padding: 2px 10px;
  background: #3498db;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin: 2px 4px 2px 0;
}

.work-description {
  padding: 16px 0;
  border-top: 1px solid #ecf0f1;
  border-bottom: 1px solid #ecf0f1;
  margin-bottom: 16px;
  font-size: 15px;
  line-height: 1.8;
  color: #2c3e50;
}

.interaction-bar {
  display: flex;
  gap: 12px;
}

.interact-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  background: #ecf0f1;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.interact-btn:hover {
  background: #d5dbe0;
  transform: translateY(-2px);
}

.interact-btn.active {
  background: #3498db;
  color: white;
}

.interact-btn.active:hover {
  background: #2980b9;
}

/* 侧边栏 */
.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.author-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.author-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.author-header :deep(.app-image) {
  border-radius: 50% !important;
  flex-shrink: 0;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  font-size: 16px;
  display: block;
  color: #2c3e50;
  text-decoration: none;
}

.author-name:hover {
  color: #3498db;
}

.author-bio {
  font-size: 13px;
  color: #7f8c8d;
}

.author-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #ecf0f1;
  border-bottom: 1px solid #ecf0f1;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
}

.follow-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  background: #2980b9;
}

.follow-btn.following {
  background: #ecf0f1;
  color: #7f8c8d;
}

.related-works {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.related-works h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #2c3e50;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.related-item:hover {
  background: #ecf0f1;
}

.related-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.related-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.related-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-views {
  font-size: 12px;
  color: #7f8c8d;
}

.not-found {
  padding: 60px 0;
  background: #f5f7fa;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 全屏查看 ========== */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 关闭按钮 */
.fullscreen-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* 图片计数器 */
.fullscreen-counter {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  z-index: 10;
}

/* 主图片 */
.fullscreen-image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.fullscreen-image-wrapper img {
  max-width: 90%;
  max-height: 85%;
  object-fit: contain;
  border-radius: 4px;
  user-select: none;
  -webkit-user-drag: none;
}

/* 导航按钮 */
.fullscreen-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.fullscreen-prev {
  left: 20px;
}

.fullscreen-next {
  right: 20px;
}

/* 底部缩略图 */
.fullscreen-thumbnails {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  z-index: 10;
  max-width: 80%;
  overflow-x: auto;
}

.fullscreen-thumb {
  width: 50px;
  height: 38px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  opacity: 0.5;
  flex-shrink: 0;
}

.fullscreen-thumb:hover {
  opacity: 0.8;
}

.fullscreen-thumb.active {
  border-color: #3498db;
  opacity: 1;
}

.fullscreen-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 操作提示 */
.fullscreen-hint-bottom {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  z-index: 5;
  text-align: center;
  letter-spacing: 1px;
}

/* ========== 全屏响应式 ========== */
@media (max-width: 992px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .detail-sidebar {
    grid-template-columns: 1fr;
  }

  .image-carousel :deep(.el-carousel__container) {
    height: 300px;
  }

  .work-info {
    padding: 16px 20px;
  }

  .work-title {
    font-size: 22px;
  }

  .interaction-bar {
    flex-wrap: wrap;
  }

  .interact-btn {
    flex: 1;
    justify-content: center;
    min-width: 80px;
  }

  /* 全屏响应式 */
  .fullscreen-image-wrapper {
    padding: 40px 20px;
  }

  .fullscreen-image-wrapper img {
    max-width: 95%;
    max-height: 80%;
  }

  .fullscreen-nav {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .fullscreen-prev {
    left: 10px;
  }

  .fullscreen-next {
    right: 10px;
  }

  .fullscreen-thumbnails {
    bottom: 20px;
    max-width: 90%;
  }

  .fullscreen-thumb {
    width: 40px;
    height: 30px;
  }

  .fullscreen-close {
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .fullscreen-counter {
    top: 12px;
    font-size: 12px;
    padding: 4px 12px;
  }

  .fullscreen-hint-bottom {
    bottom: 75px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .fullscreen-image-wrapper {
    padding: 20px 10px;
  }

  .fullscreen-image-wrapper img {
    max-width: 98%;
    max-height: 75%;
  }

  .fullscreen-nav {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .fullscreen-thumb {
    width: 32px;
    height: 24px;
  }
}
</style>
