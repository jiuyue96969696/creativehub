<template>
  <div class="category-nav">
    <div class="category-nav-header">
      <h3>分类导航</h3>
      <span class="nav-desc">浏览不同设计领域</span>
    </div>
    <div class="category-list">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
        :class="{ active: activeCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        <div class="category-icon">
          <el-icon :size="20"><component :is="cat.icon" /></el-icon>
        </div>
        <div class="category-info">
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ getWorkCount(cat.id) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useWorkStore } from "@/stores/workStore";

const props = defineProps({
  activeCategory: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["select"]);

const workStore = useWorkStore();
const categories = computed(() => workStore.categories);

const getWorkCount = (categoryId) => {
  return workStore.worksByCategory(categoryId).length;
};

const selectCategory = (id) => {
  emit("select", id);
};
</script>

<style scoped>
.category-nav {
  background: white;
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.category-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--bg-light);
}

.category-nav-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.nav-desc {
  font-size: 12px;
  color: var(--text-gray);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
}

.category-item:hover {
  background: var(--bg-light);
}

.category-item.active {
  background: var(--secondary);
  color: white;
}

.category-item.active .category-count {
  color: rgba(255, 255, 255, 0.8);
}

.category-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  border-radius: 8px;
  color: var(--secondary);
  flex-shrink: 0;
}

.category-item.active .category-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.category-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
}

.category-count {
  font-size: 12px;
  color: var(--text-gray);
}
</style>
