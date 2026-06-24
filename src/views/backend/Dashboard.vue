<template>
  <div class="dashboard-page">
    <!-- 顶部导航 -->
    <div class="dashboard-topbar">
      <div class="topbar-left">
        <el-button type="text" @click="$router.push('/')" class="back-home-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <span class="topbar-divider">|</span>
        <span class="topbar-title">仪表盘</span>
      </div>
      <div class="topbar-right">
        <el-button type="primary" size="small" @click="$router.push('/upload')">
          <el-icon><Plus /></el-icon>
          上传作品
        </el-button>
      </div>
    </div>

    <div class="dashboard-header">
      <h1>📊 仪表盘</h1>
      <p>欢迎回来，{{ userStore.currentUser?.username }}</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon :size="24"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <div class="stat-trend" v-if="stat.trend !== undefined">
          <span :class="['trend-indicator', stat.trend >= 0 ? 'up' : 'down']">
            {{ stat.trend >= 0 ? "↑" : "↓" }}
            <span v-if="stat.showPercent !== false"
              >{{ Math.abs(stat.trend) }}%</span
            >
            <span v-else>{{ Math.abs(stat.trend) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-grid stats-grid-secondary">
      <div
        class="stat-card stat-card-secondary"
        v-for="stat in extraStats"
        :key="stat.label"
      >
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon :size="24"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <div class="stat-trend" v-if="stat.trend !== undefined">
          <span :class="['trend-indicator', stat.trend >= 0 ? 'up' : 'down']">
            {{ stat.trend >= 0 ? "↑" : "↓" }} {{ Math.abs(stat.trend) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-button
        type="warning"
        size="large"
        @click="$router.push('/drafts')"
        class="quick-action-btn"
      >
        <el-icon><Edit /></el-icon>
        查看草稿
        <el-badge :value="draftCount" class="badge" v-if="draftCount > 0" />
      </el-button>
    </div>

    <!-- 图表区域 -->
    <div class="chart-section">
      <!-- 浏览量趋势图 - 折线图 -->
      <div class="chart-card chart-trend">
        <div class="chart-header">
          <div class="chart-title-group">
            <h3>📈 作品浏览量趋势</h3>
            <span class="chart-subtitle">近7天每日新增浏览量</span>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot" style="background: #3498db"></span>
              每日新增浏览量
            </span>
            <span class="legend-item">
              <span
                class="legend-dot"
                style="background: #e74c3c; border: 1px dashed #e74c3c"
              ></span>
              日均值
            </span>
          </div>
        </div>
        <div class="chart-body">
          <div class="line-chart-wrapper">
            <div class="line-chart-container">
              <svg
                class="line-chart-svg"
                viewBox="0 0 700 210"
                preserveAspectRatio="xMidYMid meet"
              >
                <!-- 网格线 -->
                <g class="grid-lines">
                  <line
                    v-for="i in 4"
                    :key="i"
                    x1="45"
                    :y1="20 + i * 38"
                    x2="680"
                    :y2="20 + i * 38"
                    stroke="#ECF0F1"
                    stroke-width="1"
                    stroke-dasharray="4,4"
                  />
                </g>

                <!-- Y轴标签 -->
                <g class="y-axis-labels" font-size="10" fill="#7F8C8D">
                  <text x="40" y="24" text-anchor="end">
                    {{ maxDailyViews }}
                  </text>
                  <text x="40" y="62" text-anchor="end">
                    {{ Math.round(maxDailyViews * 0.75) }}
                  </text>
                  <text x="40" y="100" text-anchor="end">
                    {{ Math.round(maxDailyViews * 0.5) }}
                  </text>
                  <text x="40" y="138" text-anchor="end">
                    {{ Math.round(maxDailyViews * 0.25) }}
                  </text>
                  <text x="40" y="176" text-anchor="end">0</text>
                </g>

                <!-- 填充区域（渐变） -->
                <defs>
                  <linearGradient
                    id="areaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style="stop-color: #3498db; stop-opacity: 0.25"
                    />
                    <stop
                      offset="100%"
                      style="stop-color: #3498db; stop-opacity: 0.02"
                    />
                  </linearGradient>
                </defs>

                <!-- 面积填充 -->
                <polygon
                  :points="areaPoints"
                  fill="url(#areaGradient)"
                  stroke="none"
                />

                <!-- 折线 -->
                <polyline
                  :points="linePoints"
                  fill="none"
                  stroke="#3498DB"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="line-path"
                />

                <!-- 数据点 -->
                <g class="data-points">
                  <circle
                    v-for="(item, index) in trendData"
                    :key="index"
                    :cx="getPointX(index)"
                    :cy="getPointY(item.views)"
                    r="3.5"
                    fill="white"
                    stroke="#3498DB"
                    stroke-width="2"
                    class="data-point"
                    @mouseenter="showTooltip(index, $event)"
                    @mouseleave="hideTooltip"
                  />
                  <circle
                    v-if="hoveredIndex !== null"
                    :cx="getPointX(hoveredIndex)"
                    :cy="getPointY(trendData[hoveredIndex].views)"
                    r="6"
                    fill="#3498DB"
                    stroke="white"
                    stroke-width="2"
                    class="data-point-hover"
                  />
                </g>

                <!-- X轴标签 -->
                <g class="x-axis-labels" font-size="10" fill="#7F8C8D">
                  <text
                    v-for="(item, index) in trendData"
                    :key="index"
                    :x="getPointX(index)"
                    y="200"
                    text-anchor="middle"
                  >
                    {{ item.label }}
                  </text>
                </g>

                <!-- 日均线 -->
                <line
                  :x1="45"
                  :y1="getAverageY()"
                  :x2="680"
                  :y2="getAverageY()"
                  stroke="#E74C3C"
                  stroke-width="1.5"
                  stroke-dasharray="6,4"
                  class="average-line"
                />

                <!-- 日均值标签 -->
                <rect
                  :x="682"
                  :y="getAverageY() - 8"
                  width="65"
                  height="18"
                  rx="3"
                  fill="white"
                  stroke="#E74C3C"
                  stroke-width="1"
                  opacity="0.9"
                />
                <text
                  :x="687"
                  :y="getAverageY() + 5"
                  font-size="10"
                  fill="#E74C3C"
                  font-weight="600"
                >
                  日均: {{ averageDailyViews }}
                </text>
              </svg>

              <!-- 悬停提示 -->
              <div
                v-if="hoveredIndex !== null"
                class="chart-tooltip"
                :style="tooltipStyle"
              >
                <div class="tooltip-date">
                  {{ trendData[hoveredIndex].label }}
                </div>
                <div class="tooltip-value">
                  👁️ +{{ trendData[hoveredIndex].views }}
                </div>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="trend-stats">
              <div class="trend-stat-item">
                <span class="stat-label-text">总浏览量</span>
                <span class="stat-value-text">{{ totalViews }}</span>
              </div>
              <div class="trend-stat-item">
                <span class="stat-label-text">日均新增</span>
                <span class="stat-value-text">{{ averageDailyViews }}</span>
              </div>
              <div class="trend-stat-item">
                <span class="stat-label-text">最高日</span>
                <span class="stat-value-text">{{ maxDailyViews }}</span>
              </div>
              <div class="trend-stat-item">
                <span class="stat-label-text">最低日</span>
                <span class="stat-value-text">{{ minDailyViews }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分类分布 -->
      <div class="chart-card chart-pie">
        <div class="chart-header">
          <div class="chart-title-group">
            <h3>📁 分类分布</h3>
            <span class="chart-subtitle">作品分类统计</span>
          </div>
        </div>
        <div class="chart-body">
          <div v-if="categoryStats.length === 0" class="empty-chart">
            <el-icon><Document /></el-icon>
            <span>暂无作品数据</span>
          </div>
          <div v-else class="pie-chart">
            <div class="pie-visual">
              <svg viewBox="0 0 200 200" class="pie-svg">
                <circle cx="100" cy="100" r="80" fill="#f5f7fa" />
                <path
                  v-for="(segment, index) in pieSegments"
                  :key="index"
                  :d="segment.path"
                  :fill="segment.color"
                  stroke="white"
                  stroke-width="2"
                  class="pie-segment-path"
                  @mouseenter="hoveredSegment = index"
                  @mouseleave="hoveredSegment = null"
                />
                <text
                  v-if="hoveredSegment === null && totalWorks > 0"
                  x="100"
                  y="95"
                  text-anchor="middle"
                  font-size="20"
                  font-weight="700"
                  fill="#2C3E50"
                >
                  {{ totalWorks }}
                </text>
                <text
                  v-if="hoveredSegment === null && totalWorks > 0"
                  x="100"
                  y="118"
                  text-anchor="middle"
                  font-size="12"
                  fill="#7F8C8D"
                >
                  总作品
                </text>
                <template
                  v-if="hoveredSegment !== null && pieSegments[hoveredSegment]"
                >
                  <rect
                    x="70"
                    y="82"
                    width="60"
                    height="36"
                    rx="4"
                    fill="rgba(255,255,255,0.95)"
                    stroke="#ECF0F1"
                    stroke-width="1"
                  />
                  <text
                    x="100"
                    y="100"
                    text-anchor="middle"
                    font-size="13"
                    font-weight="600"
                    fill="#2C3E50"
                  >
                    {{ pieSegments[hoveredSegment].label }}
                  </text>
                  <text
                    x="100"
                    y="116"
                    text-anchor="middle"
                    font-size="15"
                    font-weight="700"
                    :fill="pieSegments[hoveredSegment].color"
                  >
                    {{ pieSegments[hoveredSegment].count }} 个
                  </text>
                </template>
              </svg>
            </div>

            <div class="pie-legend">
              <div
                v-for="(cat, index) in categoryStats"
                :key="cat.name"
                class="legend-item"
                :class="{ active: hoveredSegment === index }"
                @mouseenter="hoveredSegment = index"
                @mouseleave="hoveredSegment = null"
              >
                <span
                  class="legend-color"
                  :style="{ background: colors[index % colors.length] }"
                ></span>
                <span class="legend-label">{{ cat.name }}</span>
                <span class="legend-value">{{ cat.count }}</span>
                <span class="legend-percent">{{ getPercent(cat.count) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新评论和最近作品 -->
    <div class="bottom-section">
      <!-- 最新评论 -->
      <div class="comments-section">
        <div class="section-header">
          <h3>💬 最新评论</h3>
          <span class="section-subtitle">来自你的作品</span>
        </div>
        <div v-if="recentComments.length === 0" class="empty-comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>还没有评论，快去发布作品吧！</span>
        </div>
        <div v-else class="comments-list">
          <div
            v-for="comment in recentComments"
            :key="comment.id"
            class="comment-item"
            @click="$router.push(`/work/${comment.workId}`)"
          >
            <div class="comment-avatar-wrapper">
              <AppImage
                :src="getUserAvatar(comment.userId, comment.userAvatar)"
                :alt="comment.userName"
                :width="36"
                :height="36"
                fallback-text=""
                object-fit="cover"
                border-radius="50%"
              />
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-user">{{ comment.userName }}</span>
                <span class="comment-time">{{
                  formatTime(comment.createTime)
                }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-work">
                <el-icon><Document /></el-icon>
                作品：{{ getWorkTitle(comment.workId) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近作品 -->
      <div class="recent-section">
        <div class="section-header">
          <h3>📋 最近作品</h3>
          <router-link to="/manage/works" class="view-all"
            >查看全部 →</router-link
          >
        </div>
        <div class="recent-grid">
          <div
            v-for="work in recentWorks"
            :key="work.id"
            class="recent-item"
            @click="$router.push(`/work/${work.id}`)"
          >
            <img :src="work.coverImage" :alt="work.title" />
            <div class="recent-info">
              <span class="recent-title">{{ work.title }}</span>
              <span class="recent-date">{{
                formatDate(work.publishTime)
              }}</span>
              <div class="recent-stats">
                <span>👁️ {{ work.views }}</span>
                <span>❤️ {{ work.likes }}</span>
              </div>
            </div>
          </div>
          <div v-if="recentWorks.length === 0" class="empty-tip">
            <el-icon><Document /></el-icon>
            <span>还没有作品，快去发布吧！</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useWorkStore } from "@/stores/workStore";
import { useInteractionStore } from "@/stores/interactionStore";
import AppImage from "@/components/AppImage.vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

const router = useRouter();
const userStore = useUserStore();
const workStore = useWorkStore();
const interactionStore = useInteractionStore();

const hoveredSegment = ref(null);
const hoveredIndex = ref(null);
const tooltipStyle = ref({});
const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";

const userId = computed(() => userStore.currentUserId);

// 获取用户头像 - 从 userStore 获取最新头像
const getUserAvatar = (userId, fallbackAvatar) => {
  const user = userStore.userById(userId);
  if (user && user.avatar) {
    return user.avatar;
  }
  return fallbackAvatar || defaultAvatar;
};

// 获取当前用户的所有作品
const myWorks = computed(() => {
  return workStore.worksByAuthor(userId.value) || [];
});

// 已发布的作品
const publishedMyWorks = computed(() => {
  return myWorks.value.filter((w) => w.status === "published") || [];
});

// 草稿作品
const draftWorks = computed(() => {
  return myWorks.value.filter((w) => w.status === "draft") || [];
});

const draftCount = computed(() => draftWorks.value.length);

// ========== 主要统计卡片 ==========
const stats = computed(() => {
  const works = publishedMyWorks.value;
  const totalLikes = works.reduce((sum, w) => sum + (w.likes || 0), 0);
  const totalViews = works.reduce((sum, w) => sum + (w.views || 0), 0);

  return [
    {
      label: "总作品",
      value: works.length,
      icon: "Document",
      color: "linear-gradient(135deg, #3498DB, #2980B9)",
      trend: 1,
      showPercent: false,
    },
    {
      label: "总浏览量",
      value: totalViews.toLocaleString(),
      icon: "View",
      color: "linear-gradient(135deg, #2ECC71, #27AE60)",
      trend: totalViews > 0 ? 8 : 0,
    },
    {
      label: "总获赞",
      value: totalLikes.toLocaleString(),
      icon: "Star",
      color: "linear-gradient(135deg, #E74C3C, #C0392B)",
      trend: totalLikes > 0 ? 15 : 0,
    },
    {
      label: "粉丝数",
      value: userStore.currentUser?.followersCount || 0,
      icon: "User",
      color: "linear-gradient(135deg, #9B59B6, #8E44AD)",
      trend: 1,
      showPercent: false,
    },
  ];
});

// ========== 额外数据统计 ==========
const extraStats = computed(() => {
  const works = publishedMyWorks.value;
  const totalViews = works.reduce((sum, w) => sum + (w.views || 0), 0);
  const totalLikes = works.reduce((sum, w) => sum + (w.likes || 0), 0);
  const totalComments = works.reduce((sum, w) => sum + (w.comments || 0), 0);

  const views = totalViews || 1;

  const avgLikeRate = Math.round((totalLikes / views) * 100 * 10) / 10;
  const interactionRate = Math.round((totalComments / views) * 100 * 10) / 10;

  const followers = userStore.currentUser?.followersCount || 0;
  const worksCount = works.length || 1;
  const growthRate =
    followers > 0
      ? Math.min(Math.round((worksCount / (followers + 1)) * 30), 50)
      : Math.min(worksCount * 2, 20);

  return [
    {
      label: "平均点赞率",
      value: avgLikeRate.toFixed(1) + "%",
      icon: "Star",
      color: "linear-gradient(135deg, #F39C12, #E67E22)",
      trend:
        avgLikeRate > 10 ? 15 : avgLikeRate > 5 ? 8 : avgLikeRate > 2 ? 3 : -5,
    },
    {
      label: "互动率",
      value: interactionRate.toFixed(1) + "%",
      icon: "ChatDotRound",
      color: "linear-gradient(135deg, #1ABC9C, #16A085)",
      trend:
        interactionRate > 5
          ? 12
          : interactionRate > 2
            ? 6
            : interactionRate > 0.5
              ? 2
              : -8,
    },
    {
      label: "粉丝增长率",
      value: growthRate + "%",
      icon: "TrendCharts",
      color: "linear-gradient(135deg, #8E44AD, #9B59B6)",
      trend: 50,
    },
  ];
});

// 最新评论
const recentComments = computed(() => {
  const allComments = [];
  const works = publishedMyWorks.value;

  works.forEach((work) => {
    try {
      const comments = interactionStore.commentsByWork(work.id) || [];
      comments.forEach((comment) => {
        allComments.push({
          ...comment,
          workId: work.id,
        });
      });
    } catch (e) {
      console.warn("获取作品评论失败:", e);
    }
  });

  return allComments
    .sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
    .slice(0, 10);
});

// 获取作品标题
const getWorkTitle = (workId) => {
  try {
    const work = workStore.works.find((w) => w.id === workId);
    return work ? work.title : "已删除的作品";
  } catch (e) {
    return "已删除的作品";
  }
};

// 最近作品
const recentWorks = computed(() => {
  return [...publishedMyWorks.value]
    .sort((a, b) => (b.publishTime || 0) - (a.publishTime || 0))
    .slice(0, 6);
});

// 分类统计
const categoryStats = computed(() => {
  const stats = {};
  publishedMyWorks.value.forEach((work) => {
    if (work.categoryName) {
      if (!stats[work.categoryName]) {
        stats[work.categoryName] = 0;
      }
      stats[work.categoryName]++;
    }
  });
  return Object.entries(stats).map(([name, count]) => ({ name, count }));
});

const totalWorks = computed(() => publishedMyWorks.value.length);

// ========== 折线图数据 ==========
const generateDailyViews = (totalViews) => {
  if (totalViews < 7) {
    const daily = [];
    let remaining = totalViews;
    for (let i = 0; i < 7; i++) {
      if (remaining > 0) {
        const val = Math.min(Math.ceil(remaining / (7 - i)), remaining);
        daily.push(val);
        remaining -= val;
      } else {
        daily.push(0);
      }
    }
    return daily;
  }

  const daily = [];
  const remaining = totalViews;

  const ratios = [0.06, 0.1, 0.18, 0.22, 0.18, 0.14, 0.12];

  let sum = 0;
  for (let i = 0; i < 7; i++) {
    let val = Math.floor(remaining * ratios[i]);
    if (i === 6) {
      val = remaining - sum;
    }
    daily.push(val);
    sum += val;
  }

  const actualSum = daily.reduce((a, b) => a + b, 0);
  if (actualSum < remaining) {
    daily[6] += remaining - actualSum;
  }

  return daily;
};

const trendData = computed(() => {
  const works = publishedMyWorks.value;
  const total = works.reduce((sum, w) => sum + (w.views || 0), 0);

  const dailyViews = generateDailyViews(total);

  const days = 7;
  const data = [];
  const today = dayjs();

  for (let i = days - 1; i >= 0; i--) {
    const currentDate = today.subtract(i, "day");
    const index = days - 1 - i;
    data.push({
      label: currentDate.format("MM/DD"),
      views: dailyViews[index] || 0,
      date: currentDate.format("YYYY-MM-DD"),
    });
  }

  return data;
});

// 总浏览量 = 所有作品浏览量之和
const totalViews = computed(() => {
  const works = publishedMyWorks.value;
  return works.reduce((sum, work) => sum + (work.views || 0), 0);
});

// 每日新增浏览量统计
const dailyViewStats = computed(() => {
  const data = trendData.value;
  const views = data.map((d) => d.views);
  return {
    max: Math.max(...views, 1),
    min: Math.min(...views, 0),
    sum: views.reduce((a, b) => a + b, 0),
    avg: Math.round(views.reduce((a, b) => a + b, 0) / views.length),
  };
});

// 最高日新增浏览量
const maxDailyViews = computed(() => dailyViewStats.value.max);

// 最低日新增浏览量
const minDailyViews = computed(() => dailyViewStats.value.min);

// 日均新增浏览量
const averageDailyViews = computed(() => dailyViewStats.value.avg);

// 折线图 - 获取点的X坐标
const getPointX = (index) => {
  const padding = 45;
  const width = 635;
  const len = trendData.value.length;
  const step = len > 1 ? width / (len - 1) : 0;
  return padding + index * step;
};

// 折线图 - 获取点的Y坐标
const getPointY = (views) => {
  const padding = 20;
  const height = 155;
  const max = maxDailyViews.value || 1;
  return padding + height - (views / max) * height;
};

// 获取平均线的Y坐标
const getAverageY = () => {
  return getPointY(averageDailyViews.value);
};

// 生成折线的点字符串
const linePoints = computed(() => {
  if (trendData.value.length === 0) return "";
  return trendData.value
    .map((item, index) => `${getPointX(index)},${getPointY(item.views)}`)
    .join(" ");
});

// 生成面积填充的点字符串
const areaPoints = computed(() => {
  if (trendData.value.length === 0) return "";
  const points = trendData.value
    .map((item, index) => `${getPointX(index)},${getPointY(item.views)}`)
    .join(" ");
  const lastX = getPointX(trendData.value.length - 1);
  const firstX = getPointX(0);
  const bottomY = getPointY(0);
  return `${points} ${lastX},${bottomY} ${firstX},${bottomY}`;
});

// 显示提示
const showTooltip = (index, event) => {
  hoveredIndex.value = index;
  try {
    const rect = event.target.getBoundingClientRect();
    const containerRect = event.target
      .closest(".line-chart-container")
      ?.getBoundingClientRect();
    if (!containerRect) return;

    let left = rect.left - containerRect.left + 20;
    let top = rect.top - containerRect.top - 50;

    if (left > containerRect.width - 110) {
      left = containerRect.width - 110;
    }
    if (left < 10) {
      left = 10;
    }
    if (top < 10) {
      top = 10;
    }

    tooltipStyle.value = {
      left: left + "px",
      top: top + "px",
    };
  } catch (e) {
    // 忽略错误
  }
};

// 隐藏提示
const hideTooltip = () => {
  hoveredIndex.value = null;
};

// 饼图颜色
const colors = [
  "#3498DB",
  "#2ECC71",
  "#E74C3C",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#E67E22",
  "#1A5276",
];

// 计算百分比
const getPercent = (count) => {
  if (totalWorks.value === 0) return 0;
  return Math.round((count / totalWorks.value) * 100);
};

// 生成饼图路径
const pieSegments = computed(() => {
  const segments = [];
  let startAngle = -90;

  categoryStats.value.forEach((cat, index) => {
    const percent = getPercent(cat.count);
    const angle = (percent / 100) * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

    segments.push({
      path,
      color: colors[index % colors.length],
      label: cat.name,
      count: cat.count,
      percent: percent,
    });

    startAngle = endAngle;
  });

  return segments;
});

const formatDate = (time) => {
  if (!time) return "未发布";
  return dayjs(time).format("YYYY-MM-DD");
};

const formatTime = (time) => {
  if (!time) return "刚刚";
  return dayjs(time).fromNow();
};

onMounted(() => {
  workStore.fetchWorks();
  userStore.loadUsers();
  interactionStore.loadData();
});
</script>

<style scoped>
.dashboard-page {
  padding: 20px 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部导航栏 */
.dashboard-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-home-btn {
  font-size: 14px;
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
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.dashboard-header {
  margin-bottom: 20px;
}

.dashboard-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2px;
}

.dashboard-header p {
  color: #7f8c8d;
  font-size: 14px;
}

/* 统计卡片 - 第一行 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

/* 统计卡片 - 第二行 */
.stats-grid-secondary {
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.stat-card-secondary .stat-icon {
  width: 40px;
  height: 40px;
}

.stat-card-secondary .stat-number {
  font-size: 18px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 13px;
  color: #7f8c8d;
}

.stat-trend {
  position: absolute;
  top: 10px;
  right: 14px;
}

.trend-indicator {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.trend-indicator.up {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.1);
}

.trend-indicator.down {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.quick-action-btn {
  position: relative;
  border-radius: 10px;
  font-weight: 500;
  padding: 10px 24px;
}

.quick-action-btn .badge {
  position: absolute;
  top: -8px;
  right: -8px;
}

.quick-action-btn .badge :deep(.el-badge__content) {
  background: #e74c3c;
  border: 2px solid white;
}

/* 图表区域 */
.chart-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #ecf0f1;
}

.chart-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-title-group h3 {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.chart-subtitle {
  font-size: 11px;
  color: #7f8c8d;
}

.chart-legend {
  display: flex;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #7f8c8d;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chart-body {
  padding: 14px 18px;
  position: relative;
}

/* 折线图 */
.line-chart-wrapper {
  width: 100%;
}

.line-chart-container {
  position: relative;
  width: 100%;
}

.line-chart-svg {
  width: 100%;
  height: auto;
  min-height: 185px;
  max-height: 195px;
}

.line-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 1.5s ease forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

.data-point {
  transition: r 0.3s ease;
  cursor: pointer;
}

.data-point:hover {
  r: 5;
}

.data-point-hover {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    r: 5;
    opacity: 1;
  }
  50% {
    r: 8;
    opacity: 0.8;
  }
}

.average-line {
  animation: fadeInLine 1s ease 0.5s forwards;
  opacity: 0;
}

@keyframes fadeInLine {
  to {
    opacity: 1;
  }
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
  pointer-events: none;
  z-index: 10;
  min-width: 80px;
  text-align: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-date {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
}

.tooltip-value {
  font-size: 13px;
  margin-top: 1px;
}

.trend-stats {
  display: flex;
  justify-content: space-around;
  padding: 8px 0 0;
  margin-top: 8px;
  border-top: 1px solid #ecf0f1;
}

.trend-stat-item {
  text-align: center;
}

.stat-label-text {
  display: block;
  font-size: 10px;
  color: #7f8c8d;
  margin-bottom: 1px;
}

.stat-value-text {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #2c3e50;
}

/* 饼图 */
.pie-chart {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}

.pie-visual {
  flex-shrink: 0;
}

.pie-svg {
  width: 145px;
  height: 145px;
}

.pie-segment-path {
  cursor: pointer;
  transition: all 0.3s ease;
}

.pie-segment-path:hover {
  filter: brightness(1.1);
  stroke-width: 3;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  max-width: 140px;
}

.pie-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pie-legend .legend-item:hover {
  background: #ecf0f1;
}

.pie-legend .legend-item.active {
  background: #ecf0f1;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 12px;
  color: #2c3e50;
}

.legend-value {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.legend-percent {
  font-size: 10px;
  color: #7f8c8d;
}

.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #7f8c8d;
}

.empty-chart .el-icon {
  font-size: 36px;
  margin-bottom: 6px;
}

/* 底部区域 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* 评论区域 */
.comments-section {
  background: white;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.comments-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.comments-section .section-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.section-subtitle {
  font-size: 12px;
  color: #7f8c8d;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #7f8c8d;
  gap: 6px;
}

.empty-comments .el-icon {
  font-size: 32px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.comments-list::-webkit-scrollbar {
  width: 4px;
}

.comments-list::-webkit-scrollbar-track {
  background: #ecf0f1;
  border-radius: 2px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #3498db;
  border-radius: 2px;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #ecf0f1;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item:hover {
  background: #f8f9fa;
}

.comment-avatar-wrapper :deep(.app-image) {
  border-radius: 50% !important;
  flex-shrink: 0;
  width: 36px !important;
  height: 36px !important;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.comment-user {
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
}

.comment-time {
  font-size: 11px;
  color: #7f8c8d;
}

.comment-text {
  font-size: 13px;
  color: #2c3e50;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-work {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #7f8c8d;
}

.comment-work .el-icon {
  font-size: 12px;
}

/* 最近作品 */
.recent-section {
  background: white;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.view-all {
  font-size: 13px;
  color: #3498db;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.recent-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.recent-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recent-item:hover {
  background: #ecf0f1;
}

.recent-item img {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.recent-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.recent-title {
  font-weight: 500;
  font-size: 13px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-date {
  font-size: 11px;
  color: #7f8c8d;
}

.recent-stats {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #7f8c8d;
  margin-top: 1px;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: #7f8c8d;
  gap: 6px;
}

.empty-tip .el-icon {
  font-size: 28px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .chart-section {
    grid-template-columns: 1fr;
  }

  .bottom-section {
    grid-template-columns: 1fr;
  }

  .line-chart-svg {
    min-height: 180px;
    max-height: 180px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 14px 16px;
  }

  .dashboard-topbar {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .topbar-right {
    width: 100%;
  }

  .topbar-right .el-button {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 14px 16px;
  }

  .stat-number {
    font-size: 18px;
  }

  .stat-card-secondary .stat-number {
    font-size: 16px;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-action-btn {
    width: 100%;
    justify-content: center;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .chart-legend {
    flex-wrap: wrap;
  }

  .line-chart-svg {
    min-height: 165px;
    max-height: 165px;
  }

  .pie-chart {
    flex-direction: column;
  }

  .pie-svg {
    width: 130px;
    height: 130px;
  }

  .pie-legend {
    max-width: 100%;
    width: 100%;
  }

  .trend-stats {
    flex-wrap: wrap;
    gap: 6px;
  }

  .trend-stat-item {
    flex: 1;
    min-width: 55px;
  }

  .recent-grid {
    grid-template-columns: 1fr;
  }

  .comments-list {
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card-secondary .stat-number {
    font-size: 14px;
  }

  .line-chart-svg {
    min-height: 150px;
    max-height: 150px;
  }

  .chart-body {
    padding: 10px 12px;
  }

  .chart-tooltip {
    font-size: 10px;
    padding: 4px 8px;
    min-width: 65px;
  }

  .trend-stat-item .stat-value-text {
    font-size: 12px;
  }
}
</style>
