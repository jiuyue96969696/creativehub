<template>
  <div class="work-edit-page">
    <div class="page-header">
      <h1>编辑作品</h1>
      <p>修改你的作品信息</p>
    </div>

    <div class="edit-form" v-if="work">
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        label-position="top"
      >
        <el-row :gutter="24">
          <el-col :span="16">
            <el-form-item label="作品标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="给你的作品起一个吸引人的标题"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="作品描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="5"
                placeholder="详细描述你的作品"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="分类" prop="categoryId">
              <el-select
                v-model="form.categoryId"
                placeholder="选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="标签" prop="tags">
              <el-select
                v-model="form.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入标签，按回车添加"
                style="width: 100%"
                :max-collapse-tags="3"
              >
                <el-option
                  v-for="tag in availableTags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-select>
              <div class="form-tip">最多添加5个标签</div>
            </el-form-item>

            <el-form-item label="使用工具">
              <el-select
                v-model="form.toolsUsed"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入工具名称"
                style="width: 100%"
              >
                <el-option
                  v-for="tool in commonTools"
                  :key="tool"
                  :label="tool"
                  :value="tool"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="作品图片" prop="images">
          <div class="image-preview-list">
            <div
              v-for="(img, index) in form.images"
              :key="index"
              class="image-preview-item"
            >
              <img :src="img" :alt="`图片${index + 1}`" />
              <div class="image-actions">
                <el-button
                  type="danger"
                  circle
                  size="small"
                  @click="removeImage(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div
              v-if="form.images.length < 9"
              class="image-preview-item upload-placeholder"
              @click="triggerUpload"
            >
              <el-icon><Plus /></el-icon>
              <span>添加图片</span>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleFileUpload"
          />
          <div class="form-tip">
            支持 JPG、PNG、GIF 格式，单张不超过 5MB，最多上传 9 张
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button size="large" @click="saveChanges" :loading="saving">
              保存修改
            </el-button>
            <el-button size="large" @click="cancelEdit">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div v-else class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";

const route = useRoute();
const router = useRouter();
const workStore = useWorkStore();
const userStore = useUserStore();

const formRef = ref(null);
const fileInput = ref(null);
const saving = ref(false);
const work = ref(null);

const categories = computed(() => workStore.categories);
const availableTags = computed(() => workStore.tags);

const commonTools = [
  "Photoshop",
  "Illustrator",
  "Figma",
  "Sketch",
  "Procreate",
  "Blender",
  "Premiere Pro",
  "After Effects",
  "Lightroom",
  "InDesign",
  "Cinema 4D",
  "Unity",
];

const form = reactive({
  title: "",
  description: "",
  categoryId: null,
  tags: [],
  toolsUsed: [],
  images: [],
});

const rules = {
  title: [
    { required: true, message: "请输入作品标题", trigger: "blur" },
    { min: 3, max: 50, message: "标题长度为 3-50 个字符", trigger: "blur" },
  ],
  description: [
    { required: true, message: "请输入作品描述", trigger: "blur" },
    { min: 10, max: 500, message: "描述长度为 10-500 个字符", trigger: "blur" },
  ],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  tags: [
    {
      validator: (rule, value, callback) => {
        if (value.length > 5) {
          callback(new Error("最多添加5个标签"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
};

const removeImage = (index) => {
  form.images.splice(index, 1);
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = (e) => {
  const files = e.target.files;
  if (!files.length) return;

  const remaining = 9 - form.images.length;
  const toUpload = Math.min(files.length, remaining);

  for (let i = 0; i < toUpload; i++) {
    const file = files[i];
    if (!file.type.startsWith("image/")) {
      ElMessage.warning(`${file.name} 不是图片文件`);
      continue;
    }
    if (file.size / 1024 / 1024 > 5) {
      ElMessage.warning(`${file.name} 超过 5MB`);
      continue;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      form.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  e.target.value = "";
};

const saveChanges = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true;
      const updates = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        categoryName:
          categories.value.find((c) => c.id === form.categoryId)?.name || "",
        tags: form.tags,
        toolsUsed: form.toolsUsed,
        images: form.images,
        coverImage: form.images[0] || "",
      };
      workStore.updateWork(work.value.id, updates);
      saving.value = false;
      ElMessage.success("修改已保存");
      router.push("/manage/works");
    }
  });
};

const cancelEdit = () => {
  ElMessageBox.confirm("确定要取消编辑吗？修改将不会被保存。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      router.push("/manage/works");
    })
    .catch(() => {});
};

onMounted(() => {
  const id = Number(route.params.id);
  const workData = workStore.works.find((w) => w.id === id);
  if (workData && workData.authorId === userStore.currentUserId) {
    work.value = workData;
    form.title = workData.title;
    form.description = workData.description;
    form.categoryId = workData.categoryId;
    form.tags = [...workData.tags];
    form.toolsUsed = [...(workData.toolsUsed || [])];
    form.images = [...workData.images];
  } else {
    ElMessage.error("作品不存在或无权编辑");
    router.push("/manage/works");
  }
});
</script>

<style scoped>
.work-edit-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 4px;
}

.page-header p {
  color: var(--text-gray);
}

.edit-form {
  background: white;
  padding: 32px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.form-tip {
  font-size: 12px;
  color: var(--text-gray);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--bg-light);
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-preview-item {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--bg-light);
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: var(--transition);
}

.image-preview-item:hover .image-actions {
  opacity: 1;
}

.image-preview-item.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--bg-light);
  cursor: pointer;
  transition: var(--transition);
}

.image-preview-item.upload-placeholder:hover {
  border-color: var(--secondary);
  background: var(--bg-light);
}

.image-preview-item.upload-placeholder .el-icon {
  font-size: 32px;
  color: var(--text-gray);
}

.image-preview-item.upload-placeholder span {
  font-size: 12px;
  color: var(--text-gray);
  margin-top: 4px;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-gray);
}

.loading-state .el-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
</style>
