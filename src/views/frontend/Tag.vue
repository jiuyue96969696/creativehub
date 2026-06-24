<template>
  <div class="tag-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <el-button type="text" @click="$router.push('/')" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回首页
            </el-button>
            <h1>
              <span class="tag-icon">#</span>
              {{ tagName }}
            </h1>
          </div>
          <div class="header-right">
            <span class="work-count">
              <el-icon><Document /></el-icon>
              {{ tagWorks.length }} 个作品
            </span>
          </div>
        </div>
      </div>

      <!-- 相关标签推荐 -->
      <div class="related-tags" v-if="relatedTags.length > 0">
        <span class="related-label">相关标签：</span>
        <span
          v-for="tag in relatedTags"
          :key="tag.name"
          class="related-tag"
          @click="$router.push(`/tag/${tag.name}`)"
        >
          #{{ tag.name }} ({{ tag.count }})
        </span>
      </div>

      <!-- 作品列表 -->
      <div v-if="tagWorks.length === 0" class="empty-state">
        <el-icon><Document /></el-icon>
        <h3>该标签下暂无作品</h3>
        <p>试试其他标签吧</p>
        <el-button type="primary" @click="$router.push('/')">
          返回首页
        </el-button>
      </div>

      <div v-else class="works-section">
        <div class="section-toolbar">
          <div class="sort-options">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              :class="['sort-btn', { active: sortBy === opt.value }]"
              @click="sortBy = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <span class="result-count">共 {{ tagWorks.length }} 个作品</span>
        </div>

        <div class="work-grid">
          <WorkCard v-for="work in sortedWorks" :key="work.id" :work="work" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWorkStore } from "@/stores/workStore";
import WorkCard from "@/components/WorkCard.vue";

const route = useRoute();
const router = useRouter();
const workStore = useWorkStore();

const sortBy = ref("latest");

const sortOptions = [
  { value: "latest", label: "最新" },
  { value: "hot", label: "最热" },
  { value: "popular", label: "最受欢迎" },
];

const tagName = computed(() => route.params.name);

const tagWorks = computed(() => {
  return workStore.worksByTag(tagName.value);
});

// 排序后的作品
const sortedWorks = computed(() => {
  let works = [...tagWorks.value];

  switch (sortBy.value) {
    case "latest":
      works.sort((a, b) => b.publishTime - a.publishTime);
      break;
    case "hot":
      works.sort((a, b) => b.views - a.views);
      break;
    case "popular":
      works.sort((a, b) => b.likes - a.likes);
      break;
  }

  return works;
});

// 相关标签推荐（与当前标签相关的其他标签）
const relatedTags = computed(() => {
  const currentTag = tagName.value;
  const allTags = workStore.allTags;

  // 找出与当前标签同时出现在作品中的其他标签
  const related = new Map();

  workStore.publishedWorks.forEach((work) => {
    if (work.tags.includes(currentTag)) {
      work.tags.forEach((tag) => {
        if (tag !== currentTag) {
          if (!related.has(tag)) {
            related.set(tag, 0);
          }
          related.set(tag, related.get(tag) + 1);
        }
      });
    }
  });

  return Array.from(related.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
});

onMounted(() => {
  workStore.fetchWorks();
});
</script>

<style scoped>
.tag-page {
  padding: 30px 0 40px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px 0;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  font-size: 14px;
  color: #7f8c8d;
  padding: 0;
}

.back-btn:hover {
  color: #3498db;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.tag-icon {
  color: #3498db;
}

.work-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 6px 16px;
  border-radius: 20px;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.related-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.related-tag {
  padding: 4px 14px;
  background: #ecf0f1;
  border-radius: 16px;
  font-size: 13px;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-tag:hover {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.works-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #7f8c8d;
  background: #ecf0f1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  color: #2c3e50;
}

.sort-btn.active {
  background: #3498db;
  color: white;
}

.result-count {
  font-size: 14px;
  color: #7f8c8d;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-state .el-icon {
  font-size: 64px;
  color: #ecf0f1;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 0 16px;
  }

  .header-left h1 {
    font-size: 22px;
  }

  .section-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .work-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>
