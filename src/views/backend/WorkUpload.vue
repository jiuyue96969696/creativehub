<template>
  <div class="work-upload-page">
    <div class="page-header">
      <h1>上传作品</h1>
      <p>分享你的创意作品，让更多人看到</p>
    </div>

    <div class="upload-form">
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
                placeholder="详细描述你的作品，包括创作灵感、设计过程等"
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
          <div class="upload-area">
            <!-- 图片网格 -->
            <div
              class="image-grid"
              @dragstart="handleDragStart"
              @dragend="handleDragEnd"
              @dragover="handleDragOver"
              @drop="handleDrop"
            >
              <!-- 已上传的图片 -->
              <div
                v-for="(img, index) in imagePreviews"
                :key="index"
                class="image-item"
                :data-index="index"
                draggable="true"
                :class="{ 'drag-over': dragOverIndex === index }"
              >
                <div class="image-item-inner">
                  <img :src="img" :alt="`图片 ${index + 1}`" />
                  <div class="image-overlay">
                    <div class="image-actions">
                      <el-button
                        type="primary"
                        circle
                        size="small"
                        @click="openPreview(index)"
                        title="预览"
                      >
                        <el-icon><ZoomIn /></el-icon>
                      </el-button>
                      <el-button
                        type="danger"
                        circle
                        size="small"
                        @click="removeImage(index)"
                        title="删除"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div class="image-index">{{ index + 1 }}</div>
                  <div class="drag-handle" title="拖动排序">
                    <el-icon><Rank /></el-icon>
                  </div>
                </div>
              </div>

              <!-- 上传按钮 - 与图片保持相同尺寸 -->
              <div
                class="upload-btn-wrapper"
                :class="{ 'upload-full': imagePreviews.length >= 9 }"
              >
                <el-upload
                  ref="uploadRef"
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :limit="9"
                  :on-change="handleFileChange"
                  :on-exceed="handleExceed"
                  :before-upload="beforeUpload"
                  :show-file-list="false"
                  :disabled="imagePreviews.length >= 9"
                >
                  <div class="upload-content">
                    <el-icon><Plus /></el-icon>
                    <span>上传图片</span>
                    <span class="upload-hint">点击或拖拽</span>
                  </div>
                </el-upload>
              </div>
            </div>

            <!-- 底部注释 -->
            <div class="upload-footer">
              <div class="upload-info">
                <span class="form-tip">
                  <el-icon><InfoFilled /></el-icon>
                  支持 JPG、PNG、GIF 格式，单张不超过 5MB
                </span>
                <span
                  class="form-tip image-count"
                  v-if="imagePreviews.length > 0"
                >
                  已上传 {{ imagePreviews.length }} / 9 张
                  <span class="sort-hint">｜拖动图片可调整顺序</span>
                </span>
                <span class="form-tip image-count" v-else>
                  最多上传 9 张图片
                </span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button size="large" @click="saveDraft">保存草稿</el-button>
            <el-button
              type="primary"
              size="large"
              @click="publish"
              :loading="submitting"
            >
              立即发布
            </el-button>
            <el-button size="large" @click="resetForm">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 图片放大预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="80%"
      :close-on-click-modal="true"
      class="preview-dialog"
      @close="closePreview"
    >
      <div class="preview-container">
        <div class="preview-image-wrapper">
          <img
            :src="previewImage"
            :alt="'预览图片'"
            ref="previewImageRef"
            @wheel="handleWheel"
            :style="{
              transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
              cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
            }"
            @click="toggleZoom"
          />
        </div>

        <div class="preview-toolbar">
          <el-button-group>
            <el-button @click="zoomIn" title="放大">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button @click="zoomOut" title="缩小">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button @click="resetZoom" title="重置">
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button @click="rotateImage" title="旋转">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <el-button @click="downloadImage" title="下载">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-button-group>
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useWorkStore } from "@/stores/workStore";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const workStore = useWorkStore();
const userStore = useUserStore();

const formRef = ref(null);
const uploadRef = ref(null);
const fileList = ref([]);
const imageBase64List = ref([]);
const imagePreviews = ref([]);
const submitting = ref(false);
const previewImageRef = ref(null);

// 拖拽相关
const dragStartIndex = ref(null);
const dragOverIndex = ref(null);

// 预览相关
const previewVisible = ref(false);
const previewImage = ref("");
const currentPreviewIndex = ref(0);
const zoomLevel = ref(1);
const rotationAngle = ref(0);

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

const validateImages = (rule, value, callback) => {
  if (imageBase64List.value.length === 0) {
    callback(new Error("请至少上传一张图片"));
  } else {
    callback();
  }
};

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
  images: [{ validator: validateImages, trigger: "change" }],
};

// ===== 拖拽排序功能 =====
const handleDragStart = (e) => {
  const index = e.target.closest(".image-item")?.dataset.index;
  if (index !== undefined) {
    dragStartIndex.value = parseInt(index);
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  }
};

const handleDragEnd = (e) => {
  e.target.style.opacity = "1";
  dragStartIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const target = e.target.closest(".image-item");
  if (target) {
    const index = parseInt(target.dataset.index);
    if (index !== dragStartIndex.value) {
      dragOverIndex.value = index;
    }
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  const target = e.target.closest(".image-item");
  if (!target) return;

  const dropIndex = parseInt(target.dataset.index);
  if (dropIndex === dragStartIndex.value || dragStartIndex.value === null) {
    dragOverIndex.value = null;
    return;
  }

  const items = [...imagePreviews.value];
  const [removed] = items.splice(dragStartIndex.value, 1);
  items.splice(dropIndex, 0, removed);

  imagePreviews.value = items;
  imageBase64List.value = [...items];
  updateFormImages();

  dragStartIndex.value = null;
  dragOverIndex.value = null;

  ElMessage.success("图片顺序已更新");
};

// ===== 图片管理功能 =====
const handleFileChange = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    imageBase64List.value.push(base64);
    imagePreviews.value.push(base64);
    updateFormImages();
    if (formRef.value) {
      formRef.value.validateField("images");
    }
    fileList.value = [];
  };
  reader.readAsDataURL(file.raw);
};

const handleExceed = () => {
  ElMessage.warning("最多上传 9 张图片");
};

const beforeUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error("只能上传图片文件");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过 5MB");
    return false;
  }
  return true;
};

const updateFormImages = () => {
  form.images = [...imageBase64List.value];
};

const removeImage = (index) => {
  ElMessageBox.confirm("确定要删除这张图片吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      imageBase64List.value.splice(index, 1);
      imagePreviews.value.splice(index, 1);
      updateFormImages();
      if (formRef.value) {
        formRef.value.validateField("images");
      }
      if (imagePreviews.value.length === 0 && previewVisible.value) {
        closePreview();
      }
    })
    .catch(() => {});
};

// ===== 预览功能 =====
const openPreview = (index) => {
  if (index < 0 || index >= imagePreviews.value.length) return;
  currentPreviewIndex.value = index;
  previewImage.value = imagePreviews.value[index];
  previewVisible.value = true;
  zoomLevel.value = 1;
  rotationAngle.value = 0;
};

const closePreview = () => {
  previewVisible.value = false;
  zoomLevel.value = 1;
  rotationAngle.value = 0;
};

const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25;
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.25) {
    zoomLevel.value -= 0.25;
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
  rotationAngle.value = 0;
};

const rotateImage = () => {
  rotationAngle.value = (rotationAngle.value + 90) % 360;
};

const toggleZoom = () => {
  if (zoomLevel.value > 1) {
    zoomLevel.value = 1;
  } else {
    zoomLevel.value = 2;
  }
};

const handleWheel = (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

const downloadImage = () => {
  if (previewImage.value) {
    const link = document.createElement("a");
    link.href = previewImage.value;
    link.download = `作品图片_${currentPreviewIndex.value + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success("开始下载图片");
  }
};

// ===== 提交功能 =====
const buildWorkData = (status) => {
  const user = userStore.currentUser;
  return {
    title: form.title,
    description: form.description,
    categoryId: form.categoryId,
    categoryName:
      categories.value.find((c) => c.id === form.categoryId)?.name || "",
    tags: form.tags,
    toolsUsed: form.toolsUsed,
    images: form.images,
    authorId: user.id,
    authorName: user.username,
    authorAvatar: user.avatar,
    status: status,
  };
};

const saveDraft = async () => {
  if (!form.title.trim()) {
    ElMessage.warning("请填写作品标题");
    return;
  }
  if (imageBase64List.value.length === 0) {
    ElMessage.warning("请至少上传一张图片");
    return;
  }

  const workData = buildWorkData("draft");
  const newWork = workStore.createWork(workData);
  workStore.saveWorks();

  ElMessage.success("已保存到草稿箱");

  if (typeof window !== "undefined") {
    const eventDetail = {
      source: "workUpload",
      workId: newWork.id,
      work: newWork,
    };
    window.dispatchEvent(
      new CustomEvent("user-data-refresh", { detail: eventDetail }),
    );
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("user-data-refresh", { detail: eventDetail }),
      );
    }, 100);
  }

  setTimeout(() => {
    router.push("/drafts");
  }, 150);
};

const publish = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      const workData = buildWorkData("published");
      workStore.createWork(workData);
      submitting.value = false;
      ElMessage.success("作品发布成功！");
      router.push("/manage/works");
    }
  });
};

const resetForm = () => {
  ElMessageBox.confirm("确定要取消上传吗？已填写的内容将丢失。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      router.push("/manage/works");
    })
    .catch(() => {});
};

const handleKeydown = (e) => {
  if (!previewVisible.value) return;
  switch (e.key) {
    case "Escape":
      closePreview();
      break;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.work-upload-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.upload-form {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-tip {
  font-size: 12px;
  color: #7f8c8d;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
}

/* ===== 图片上传区域 ===== */
.upload-area {
  margin-bottom: 4px;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.image-item {
  position: relative;
  width: 130px;
  height: 130px;
  cursor: grab;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.image-item:active {
  cursor: grabbing;
}

.image-item.drag-over {
  transform: scale(1.05);
}

.image-item.drag-over .image-item-inner {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.image-item-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #ecf0f1;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.image-item-inner:hover {
  border-color: #3498db;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.image-item-inner:hover .image-overlay {
  opacity: 1;
}

.image-item-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.image-index {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 0 8px;
  border-radius: 10px;
  line-height: 20px;
  min-width: 20px;
  text-align: center;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.drag-handle {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.drag-handle .el-icon {
  font-size: 14px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.image-actions {
  display: flex;
  gap: 8px;
}

.image-actions .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
}

/* 上传按钮 - 与图片保持相同尺寸 */
.upload-btn-wrapper {
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.upload-btn-wrapper :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.upload-btn-wrapper :deep(.el-upload--picture-card) {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 2px dashed #d9d9d9;
  transition: all 0.3s ease;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.upload-btn-wrapper :deep(.el-upload--picture-card:hover) {
  border-color: #3498db;
  background: #f0f7ff;
}

.upload-btn-wrapper.upload-full {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #8c8c8c;
}

.upload-content .el-icon {
  font-size: 28px;
}

.upload-content span {
  font-size: 13px;
}

.upload-content .upload-hint {
  font-size: 11px;
  color: #b0b0b0;
}

/* 底部信息 */
.upload-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  margin-top: 4px;
}

.upload-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.image-count {
  color: #3498db;
  font-weight: 500;
}

.sort-hint {
  color: #95a5a6;
  font-weight: 400;
}

/* 预览弹窗 */
.preview-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  max-width: 90vw;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  height: 75vh;
}

.preview-dialog :deep(.el-dialog__header) {
  padding: 16px 24px;
  border-bottom: 1px solid #ecf0f1;
  margin: 0;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0d0d1a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.preview-image-wrapper img {
  max-width: 90%;
  max-height: 85%;
  object-fit: contain;
  transition: transform 0.3s ease;
  user-select: none;
  -webkit-user-drag: none;
}

.preview-toolbar {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 28px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.preview-toolbar .el-button {
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
}

.preview-toolbar .el-button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.zoom-level {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  min-width: 44px;
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .upload-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }

  .image-item {
    width: 100px;
    height: 100px;
  }

  .upload-btn-wrapper {
    width: 100px;
    height: 100px;
  }

  .preview-dialog :deep(.el-dialog) {
    width: 98% !important;
  }

  .preview-dialog :deep(.el-dialog__body) {
    height: 60vh;
  }

  .preview-toolbar {
    bottom: 16px;
    padding: 6px 12px;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 90%;
  }

  .upload-info {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .image-item {
    width: 80px;
    height: 80px;
  }

  .upload-btn-wrapper {
    width: 80px;
    height: 80px;
  }

  .upload-content .el-icon {
    font-size: 22px;
  }

  .upload-content span {
    font-size: 11px;
  }

  .upload-content .upload-hint {
    display: none;
  }
}
</style>
