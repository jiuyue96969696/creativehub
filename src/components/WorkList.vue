<template>
  <div class="work-list">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="works.length === 0" class="empty-state">
      <el-icon><Document /></el-icon>
      <p>{{ emptyText || "暂无作品" }}</p>
    </div>

    <div v-else class="work-grid" :class="layout">
      <WorkCard v-for="work in displayedWorks" :key="work.id" :work="work" />
    </div>

    <div v-if="showMore && works.length > pageSize" class="load-more">
      <el-button
        v-if="hasMore"
        @click="loadMore"
        :loading="loadingMore"
        class="load-more-btn"
      >
        加载更多
      </el-button>
      <span v-else class="no-more">— 已加载全部 —</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import WorkCard from "./WorkCard.vue";

const props = defineProps({
  works: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: "暂无作品",
  },
  layout: {
    type: String,
    default: "grid", // 'grid' | 'list'
  },
  showMore: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 12,
  },
  initialPage: {
    type: Number,
    default: 1,
  },
});

const currentPage = ref(props.initialPage);
const loadingMore = ref(false);

const displayedWorks = computed(() => {
  if (!props.showMore) return props.works;
  return props.works.slice(0, currentPage.value * props.pageSize);
});

const hasMore = computed(() => {
  return displayedWorks.value.length < props.works.length;
});

const loadMore = () => {
  loadingMore.value = true;
  setTimeout(() => {
    currentPage.value += 1;
    loadingMore.value = false;
  }, 500);
};

const reset = () => {
  currentPage.value = props.initialPage;
};

defineExpose({
  reset,
});
</script>

<style scoped>
.work-list {
  width: 100%;
}

.work-grid {
  display: grid;
  gap: 24px;
}

.work-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.work-grid.list {
  grid-template-columns: 1fr;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-gray);
}

.loading-state .el-icon,
.empty-state .el-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.loading-state .el-icon.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.load-more {
  text-align: center;
  padding: 24px 0;
}

.load-more-btn {
  min-width: 160px;
}

.no-more {
  color: var(--text-gray);
  font-size: 14px;
}

@media (max-width: 768px) {
  .work-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>
