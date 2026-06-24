<template>
  <div class="tag-cloud">
    <div class="tag-cloud-header">
      <div class="header-left">
        <h3>🏷️ 热门标签</h3>
        <span class="tag-count">{{ sortedTags.length }} 个标签</span>
      </div>
      <div class="header-right">
        <el-button
          size="small"
          :type="showAll ? 'primary' : 'default'"
          @click="toggleShowAll"
        >
          {{ showAll ? "收起" : "展开全部" }}
        </el-button>
      </div>
    </div>

    <div class="tag-list">
      <span
        v-for="tag in displayTags"
        :key="tag.name"
        class="tag-item"
        :style="getTagStyle(tag)"
        @click="$emit('tag-click', tag.name)"
        :title="`${tag.name} (${tag.count} 个作品)`"
      >
        #{{ tag.name }}
        <span class="tag-count-badge">{{ tag.count }}</span>
      </span>
    </div>

    <div v-if="sortedTags.length === 0" class="empty-tags">
      <el-icon><Document /></el-icon>
      <span>暂无标签</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  maxDisplay: {
    type: Number,
    default: 20,
  },
  minFontSize: {
    type: Number,
    default: 12,
  },
  maxFontSize: {
    type: Number,
    default: 28,
  },
});

const emit = defineEmits(["tag-click"]);

const showAll = ref(false);

// 按作品数量排序（热门优先）
const sortedTags = computed(() => {
  return [...props.tags].sort((a, b) => b.count - a.count);
});

// 显示的标签列表
const displayTags = computed(() => {
  if (showAll.value) {
    return sortedTags.value;
  }
  return sortedTags.value.slice(0, props.maxDisplay);
});

// 获取最大作品数量
const maxCount = computed(() => {
  if (sortedTags.value.length === 0) return 1;
  return sortedTags.value[0].count;
});

// 切换显示全部
const toggleShowAll = () => {
  showAll.value = !showAll.value;
};

// 获取标签样式（大小和透明度）
const getTagStyle = (tag) => {
  const ratio = tag.count / maxCount.value;
  const fontSize =
    props.minFontSize + ratio * (props.maxFontSize - props.minFontSize);
  const opacity = 0.5 + ratio * 0.5;
  const fontWeight = ratio > 0.7 ? 700 : ratio > 0.4 ? 600 : 400;

  return {
    fontSize: `${fontSize}px`,
    opacity: opacity,
    fontWeight: fontWeight,
    cursor: "pointer",
  };
};
</script>

<style scoped>
.tag-cloud {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.tag-cloud:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.tag-cloud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ecf0f1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-cloud-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.tag-count {
  font-size: 12px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 2px 10px;
  border-radius: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  min-height: 40px;
  padding: 4px 0;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  color: #2c3e50;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  line-height: 1.4;
}

.tag-item:hover {
  color: #3498db;
  transform: scale(1.08) translateY(-2px);
  background: rgba(52, 152, 219, 0.08);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.tag-item:active {
  transform: scale(0.95);
}

.tag-count-badge {
  font-size: 10px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 0 6px;
  border-radius: 10px;
  font-weight: 400;
  transition: all 0.3s ease;
}

.tag-item:hover .tag-count-badge {
  background: #3498db;
  color: white;
}

.empty-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.empty-tags .el-icon {
  font-size: 24px;
}

/* 热门标签特殊样式 - 热门标签添加小火焰图标 */
.tag-item[data-hot="true"]::before {
  content: "🔥";
  font-size: 12px;
  margin-right: 2px;
}

/* 响应式 */
@media (max-width: 768px) {
  .tag-cloud {
    padding: 16px;
  }

  .tag-cloud-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tag-list {
    gap: 6px 12px;
  }
}
</style>
