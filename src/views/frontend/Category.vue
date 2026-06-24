<template>
  <div class="category-page">
    <div class="container">
      <div class="page-header">
        <h1>{{ category?.name || "分类" }}</h1>
        <p class="page-desc">{{ category?.description || "" }}</p>
        <span class="work-count">{{ categoryWorks.length }} 个作品</span>
      </div>

      <div class="works-section">
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
        </div>

        <div v-if="categoryWorks.length === 0" class="empty-state">
          <el-icon><Document /></el-icon>
          <p>该分类下暂无作品</p>
        </div>
        <div v-else class="work-grid">
          <WorkCard v-for="work in displayWorks" :key="work.id" :work="work" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useWorkStore } from "@/stores/workStore";
import WorkCard from "@/components/WorkCard.vue";

const route = useRoute();
const workStore = useWorkStore();
const sortBy = ref("latest");

const sortOptions = [
  { value: "latest", label: "最新" },
  { value: "hot", label: "最热" },
];

const category = computed(() => {
  const id = Number(route.params.id);
  return workStore.categories.find((c) => c.id === id);
});

const categoryWorks = computed(() => {
  const id = Number(route.params.id);
  return workStore.worksByCategory(id);
});

const displayWorks = computed(() => {
  let works = [...categoryWorks.value];
  if (sortBy.value === "latest") {
    works.sort((a, b) => b.publishTime - a.publishTime);
  } else {
    works.sort((a, b) => b.views - a.views);
  }
  return works;
});

onMounted(() => {
  workStore.fetchWorks();
});
</script>

<style scoped>
.category-page {
  padding: 30px 0 40px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 4px;
}

.page-desc {
  color: var(--text-gray);
  font-size: 15px;
}

.work-count {
  display: inline-block;
  padding: 4px 14px;
  background: var(--bg-light);
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-gray);
  margin-top: 8px;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
  color: var(--text-gray);
  background: var(--bg-light);
  cursor: pointer;
  transition: var(--transition);
}

.sort-btn:hover {
  color: var(--primary);
}

.sort-btn.active {
  background: var(--secondary);
  color: white;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-gray);
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
</style>
