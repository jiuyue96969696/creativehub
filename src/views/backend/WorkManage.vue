<template>
  <div class="work-manage-page">
    <!-- 顶部导航 -->
    <div class="manage-topbar">
      <div class="topbar-left">
        <el-button type="text" @click="$router.push('/')" class="back-home-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <span class="topbar-divider">|</span>
        <span class="topbar-title">作品管理</span>
      </div>
      <div class="topbar-right">
        <el-button type="primary" @click="$router.push('/upload')">
          <el-icon><Plus /></el-icon> 上传作品
        </el-button>
      </div>
    </div>

    <div class="page-header">
      <h1>作品管理</h1>
      <p>管理你发布的所有作品</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索作品标题..."
        prefix-icon="Search"
        clearable
        style="width: 240px"
        @input="handleSearch"
      />
      <el-select
        v-model="filterCategory"
        placeholder="全部分类"
        clearable
        @change="handleFilter"
      >
        <el-option
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        />
      </el-select>
      <el-select
        v-model="filterStatus"
        placeholder="全部状态"
        clearable
        @change="handleFilter"
      >
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
    </div>

    <!-- 作品表格 -->
    <el-table :data="paginatedWorks" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="160" align="center">
        <template #default="{ row }">
          <span class="id-cell">{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="封面" width="90" align="center">
        <template #default="{ row }">
          <img :src="row.coverImage" alt="cover" class="cover-image" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column
        prop="categoryName"
        label="分类"
        width="110"
        align="center"
      />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'published' ? 'success' : 'warning'"
            size="small"
          >
            {{ row.status === "published" ? "已发布" : "草稿" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="views" label="浏览" width="90" align="center" />
      <el-table-column prop="likes" label="点赞" width="90" align="center" />
      <el-table-column label="发布时间" width="130" align="center">
        <template #default="{ row }">
          {{ formatDate(row.publishTime || row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right" align="center">
        <template #default="{ row }">
          <span
            class="action-btn edit-btn"
            @click="$router.push(`/edit/${row.id}`)"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </span>
          <span
            v-if="row.status === 'draft'"
            class="action-btn publish-btn"
            @click="publishWork(row)"
          >
            <el-icon><Check /></el-icon>
            发布
          </span>
          <span class="action-btn delete-btn" @click="deleteWork(row)">
            <el-icon><Delete /></el-icon>
            删除
          </span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        :total="filteredWorks.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";

const workStore = useWorkStore();
const userStore = useUserStore();

const loading = ref(false);
const searchKeyword = ref("");
const filterCategory = ref("");
const filterStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const categories = computed(() => workStore.categories);

const myWorks = computed(() => {
  return workStore.worksByAuthor(userStore.currentUserId);
});

const filteredWorks = computed(() => {
  let works = [...myWorks.value];

  if (searchKeyword.value) {
    works = works.filter((w) =>
      w.title.toLowerCase().includes(searchKeyword.value.toLowerCase()),
    );
  }
  if (filterCategory.value) {
    works = works.filter((w) => w.categoryId === filterCategory.value);
  }
  if (filterStatus.value) {
    works = works.filter((w) => w.status === filterStatus.value);
  }

  works.sort((a, b) => b.updateTime - a.updateTime);

  return works;
});

const paginatedWorks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredWorks.value.slice(start, end);
});

const formatDate = (time) => {
  return dayjs(time).format("YYYY-MM-DD");
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleFilter = () => {
  currentPage.value = 1;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

const publishWork = (work) => {
  ElMessageBox.confirm(`确定要发布作品「${work.title}」吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      workStore.updateWork(work.id, { status: "published" });
      ElMessage.success("发布成功！");
    })
    .catch(() => {});
};

const deleteWork = (work) => {
  ElMessageBox.confirm(
    `确定要删除作品「${work.title}」吗？此操作不可恢复！`,
    "警告",
    {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      workStore.deleteWork(work.id);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

onMounted(() => {
  workStore.fetchWorks();
});
</script>

<style scoped>
.work-manage-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部导航栏 */
.manage-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
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

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-bar .el-input,
.filter-bar .el-select {
  border-radius: 8px;
}

.cover-image {
  width: 56px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ecf0f1;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* ID 列样式 - 专门为13位数字设计 */
.id-cell {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  font-family: "SF Mono", "Consolas", "Courier New", monospace;
  letter-spacing: 0.3px;
  border: 1px solid #dee2e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  min-width: 60px;
  white-space: nowrap;
  text-align: center;
}

/* 操作按钮样式 */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: transparent !important;
  border: none !important;
  user-select: none;
}

.action-btn .el-icon {
  font-size: 14px;
}

/* 编辑按钮 - 蓝色 */
.edit-btn {
  color: #409eff !important;
}

.edit-btn:hover {
  color: #66b1ff !important;
  background: rgba(64, 158, 255, 0.08) !important;
  text-decoration: underline;
}

/* 发布按钮 - 绿色 */
.publish-btn {
  color: #67c23a !important;
}

.publish-btn:hover {
  color: #85ce61 !important;
  background: rgba(103, 194, 58, 0.08) !important;
  text-decoration: underline;
}

/* 删除按钮 - 红色 */
.delete-btn {
  color: #f56c6c !important;
}

.delete-btn:hover {
  color: #f78989 !important;
  background: rgba(245, 108, 108, 0.08) !important;
  text-decoration: underline;
}

/* 表格内操作列样式 */
.el-table .cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 6px 8px;
}

.el-table .cell .action-btn {
  margin: 0;
}

/* 表头样式 */
.el-table :deep(.el-table__header th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

/* 表格行悬停效果 */
.el-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 表格边框样式 */
.el-table :deep(.el-table__inner-wrapper::before) {
  background-color: #ecf0f1;
}

/* 响应式 */
@media (max-width: 1024px) {
  .el-table {
    font-size: 13px;
  }

  .action-btn {
    font-size: 13px;
    padding: 3px 8px;
  }

  /* 小屏幕下ID列宽度调整 */
  .el-table .id-cell {
    font-size: 12px;
    padding: 2px 8px;
    min-width: 40px;
  }
}

@media (max-width: 768px) {
  .manage-topbar {
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

  .filter-bar {
    flex-direction: column;
  }

  .filter-bar .el-input,
  .filter-bar .el-select {
    width: 100% !important;
  }

  .el-table .cell {
    flex-wrap: wrap;
    gap: 2px;
    padding: 4px 6px;
  }

  .action-btn {
    font-size: 12px;
    padding: 2px 6px;
  }

  .id-cell {
    font-size: 11px;
    padding: 2px 6px;
    min-width: 30px;
  }
}
</style>
