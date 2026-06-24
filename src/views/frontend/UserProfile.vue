<template>
  <div class="user-profile" v-if="user">
    <!-- 导航栏 - 返回首页 -->
    <div class="profile-nav">
      <div class="container">
        <div class="nav-content">
          <el-button
            type="text"
            @click="$router.push('/')"
            class="back-home-btn"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
          <div class="nav-right">
            <el-button
              v-if="userStore.isLoggedIn && userStore.currentUserId === user.id"
              type="primary"
              size="small"
              @click="$router.push('/settings')"
            >
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
            <el-button
              v-if="userStore.isLoggedIn && userStore.currentUserId === user.id"
              size="small"
              @click="$router.push('/dashboard')"
            >
              <el-icon><DataBoard /></el-icon>
              创作者中心
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户信息头部 -->
    <div class="profile-header">
      <div class="container">
        <div class="profile-content">
          <div class="profile-avatar">
            <AppImage
              :src="user.avatar || defaultAvatar"
              :alt="user.username"
              :width="140"
              :height="140"
              fallback-text="头像加载失败"
              object-fit="cover"
              border-radius="50%"
            />
            <div
              v-if="userStore.isLoggedIn && userStore.currentUserId === user.id"
              class="avatar-edit-badge"
            >
              <el-icon><Camera /></el-icon>
            </div>
          </div>
          <div class="profile-info">
            <div class="profile-name-row">
              <h1>{{ user.username }}</h1>
              <el-tag
                v-if="user.isVerified"
                type="primary"
                size="small"
                effect="dark"
              >
                <el-icon><Check /></el-icon> 认证
              </el-tag>
              <button
                v-if="
                  userStore.isLoggedIn && userStore.currentUserId !== user.id
                "
                :class="['follow-btn', { following: isFollowing }]"
                @click="handleFollow"
              >
                {{ isFollowing ? "✓ 已关注" : "+ 关注" }}
              </button>
            </div>

            <p class="profile-bio">
              {{ user.bio || "这个人很懒，什么都没写~" }}
            </p>

            <div
              class="profile-skills"
              v-if="user.skills && user.skills.length"
            >
              <span v-for="skill in user.skills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>

            <div class="profile-stats">
              <div class="stat-item" @click="scrollToWorks">
                <span class="stat-number">{{ user.worksCount || 0 }}</span>
                <span class="stat-label">作品</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ user.followersCount || 0 }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ user.likesCount || 0 }}</span>
                <span class="stat-label">获赞</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ user.viewsCount || 0 }}</span>
                <span class="stat-label">浏览</span>
              </div>
            </div>

            <div class="profile-meta">
              <div class="profile-website" v-if="user.website">
                <el-icon><Link /></el-icon>
                <a
                  :href="user.website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ user.website }}
                </a>
              </div>
              <div class="profile-join">
                <el-icon><Clock /></el-icon>
                加入于 {{ formatDate(user.createTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作品集区域 -->
    <div class="container">
      <div class="profile-works" ref="worksSection">
        <div class="works-header">
          <div class="works-title">
            <h2>作品集</h2>
            <span class="works-count">{{ userWorks.length }} 个作品</span>
          </div>
          <div
            class="works-actions"
            v-if="userStore.isLoggedIn && userStore.currentUserId === user.id"
          >
            <el-button
              type="primary"
              size="small"
              @click="$router.push('/upload')"
            >
              <el-icon><Plus /></el-icon>
              上传新作品
            </el-button>
          </div>
        </div>

        <!-- 分类筛选 -->
        <div class="works-filter" v-if="userWorks.length > 0">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['filter-btn', { active: activeFilter === cat.id }]"
            @click="activeFilter = cat.id"
          >
            {{ cat.name }}
          </button>
          <button
            :class="['filter-btn', { active: activeFilter === 'all' }]"
            @click="activeFilter = 'all'"
          >
            全部
          </button>
        </div>

        <div v-if="filteredWorks.length === 0" class="empty-state">
          <el-icon><Document /></el-icon>
          <p>
            {{
              userStore.isLoggedIn && userStore.currentUserId === user.id
                ? "还没有发布作品，开始创作吧！"
                : "该用户还没有发布作品"
            }}
          </p>
          <el-button
            v-if="userStore.isLoggedIn && userStore.currentUserId === user.id"
            type="primary"
            @click="$router.push('/upload')"
          >
            <el-icon><Plus /></el-icon>
            上传作品
          </el-button>
        </div>
        <div v-else class="work-grid">
          <WorkCard v-for="work in filteredWorks" :key="work.id" :work="work" />
        </div>
      </div>
    </div>
  </div>

  <!-- 用户不存在 -->
  <div v-else class="not-found">
    <div class="container">
      <el-result
        icon="warning"
        title="用户不存在"
        sub-title="请返回首页浏览其他创作者"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/')"
            >返回首页</el-button
          >
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/userStore";
import { useWorkStore } from "@/stores/workStore";
import { useInteractionStore } from "@/stores/interactionStore";
import WorkCard from "@/components/WorkCard.vue";
import AppImage from "@/components/AppImage.vue";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const workStore = useWorkStore();
const interactionStore = useInteractionStore();

const user = ref(null);
const isFollowing = ref(false);
const activeFilter = ref("all");
const worksSection = ref(null);
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95a5a6&color=fff&size=150";

const categories = computed(() => workStore.categories);

const userWorks = computed(() => {
  if (!user.value) return [];
  const allWorks = workStore.worksByAuthor(user.value.id);

  if (userStore.isLoggedIn && userStore.currentUserId === user.value.id) {
    return allWorks.sort((a, b) => b.updateTime - a.updateTime);
  }

  return allWorks
    .filter((w) => w.status === "published")
    .sort((a, b) => b.publishTime - a.publishTime);
});

const filteredWorks = computed(() => {
  if (activeFilter.value === "all") {
    return userWorks.value;
  }
  return userWorks.value.filter((w) => w.categoryId === activeFilter.value);
});

const formatDate = (time) => {
  if (!time) return "最近";
  return dayjs(time).format("YYYY年MM月");
};

const scrollToWorks = () => {
  if (worksSection.value) {
    worksSection.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const handleFollow = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }

  if (userStore.currentUserId === user.value.id) {
    ElMessage.warning("不能关注自己");
    return;
  }

  const result = interactionStore.followUser(
    userStore.currentUserId,
    user.value.id,
  );
  isFollowing.value = result.action === "followed";

  if (result.action === "followed") {
    user.value.followersCount = (user.value.followersCount || 0) + 1;
    ElMessage.success("关注成功！");
  } else {
    user.value.followersCount = Math.max(
      (user.value.followersCount || 0) - 1,
      0,
    );
    ElMessage.success("已取消关注");
  }
};

const loadUserData = () => {
  const id = Number(route.params.id);
  const userData = userStore.userById(id);

  if (userData) {
    user.value = { ...userData };

    if (userStore.isLoggedIn && userStore.currentUserId !== id) {
      isFollowing.value = interactionStore.hasFollowed(
        userStore.currentUserId,
        id,
      );
    }
  } else {
    ElMessage.warning("用户不存在");
    router.push("/");
  }
};

onMounted(() => {
  workStore.fetchWorks();
  userStore.loadUsers();
  interactionStore.loadData();
  loadUserData();
});

watch(
  () => route.params.id,
  () => {
    loadUserData();
    activeFilter.value = "all";
  },
);
</script>

<style scoped>
.user-profile {
  padding-bottom: 60px;
  background: #f5f7fa;
}

.profile-nav {
  background: white;
  border-bottom: 1px solid #ecf0f1;
  padding: 12px 0;
  position: sticky;
  top: 68px;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-home-btn {
  font-size: 15px;
  color: #7f8c8d;
  padding: 0;
}

.back-home-btn:hover {
  color: #3498db;
}

.nav-right {
  display: flex;
  gap: 8px;
}

.profile-header {
  background: white;
  padding: 40px 0 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
}

.profile-content {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.profile-avatar {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar :deep(.app-image) {
  border: 4px solid #ecf0f1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 50% !important;
}

.avatar-edit-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 36px;
  height: 36px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 3px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-edit-badge:hover {
  transform: scale(1.1);
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.profile-name-row h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.follow-btn {
  padding: 6px 20px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.follow-btn.following {
  background: #ecf0f1;
  color: #7f8c8d;
}

.follow-btn.following:hover {
  background: #e8eaed;
  box-shadow: none;
}

.profile-bio {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 12px;
  line-height: 1.6;
}

.profile-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.skill-tag {
  padding: 4px 14px;
  background: #ecf0f1;
  border-radius: 16px;
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
}

.profile-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-number {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 13px;
  color: #7f8c8d;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  color: #7f8c8d;
}

.profile-website,
.profile-join {
  display: flex;
  align-items: center;
  gap: 4px;
}

.profile-website a {
  color: #3498db;
  text-decoration: none;
}

.profile-website a:hover {
  text-decoration: underline;
}

.profile-works {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.works-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.works-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.works-title h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.works-count {
  font-size: 14px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 2px 12px;
  border-radius: 12px;
}

.works-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ecf0f1;
}

.filter-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  color: #2c3e50;
  background: #ecf0f1;
}

.filter-btn.active {
  background: #3498db;
  color: white;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-state .el-icon {
  font-size: 56px;
  margin-bottom: 16px;
  color: #ecf0f1;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 16px;
}

.not-found {
  padding: 80px 0;
  background: #f5f7fa;
  min-height: 60vh;
  display: flex;
  align-items: center;
}

@media (max-width: 992px) {
  .profile-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-name-row {
    justify-content: center;
  }

  .profile-skills {
    justify-content: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .profile-meta {
    justify-content: center;
  }

  .profile-avatar :deep(.app-image) {
    width: 120px !important;
    height: 120px !important;
  }
}

@media (max-width: 768px) {
  .profile-nav {
    top: 60px;
  }

  .profile-header {
    padding: 24px 0;
  }

  .profile-content {
    gap: 20px;
  }

  .profile-name-row h1 {
    font-size: 22px;
  }

  .profile-stats {
    gap: 20px;
  }

  .stat-number {
    font-size: 18px;
  }

  .work-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .profile-works {
    padding: 16px;
  }

  .nav-content {
    flex-direction: column;
    gap: 8px;
  }

  .nav-right {
    width: 100%;
    justify-content: center;
  }

  .works-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .works-filter {
    justify-content: center;
  }
}
</style>
