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
            <el-upload
              v-model:file-list="fileList"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="9"
              :on-change="handleFileChange"
              :on-remove="handleRemove"
              :on-exceed="handleExceed"
              :before-upload="beforeUpload"
              :on-preview="handlePreview"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="form-tip">
              点击图片可放大预览 | 支持 JPG、PNG、GIF 格式，单张不超过
              5MB，最多上传 9 张
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

        <!-- 底部操作栏 -->
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
const fileList = ref([]);
const imageBase64List = ref([]);
const imagePreviews = ref([]);
const submitting = ref(false);
const previewImageRef = ref(null);

// 预览相关
const previewVisible = ref(false);
const previewImage = ref("");
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

const handleFileChange = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    imageBase64List.value.push(base64);
    imagePreviews.value.push(base64);
    form.images = [...imageBase64List.value];
    if (formRef.value) {
      formRef.value.validateField("images");
    }
  };
  reader.readAsDataURL(file.raw);
};

// 处理图片移除
const handleRemove = (file) => {
  const removedIndex = fileList.value.findIndex((f) => f.uid === file.uid);

  if (removedIndex !== -1) {
    imageBase64List.value.splice(removedIndex, 1);
    imagePreviews.value.splice(removedIndex, 1);
    form.images = [...imageBase64List.value];

    // 如果预览弹窗打开且没有图片了，关闭预览
    if (imagePreviews.value.length === 0 && previewVisible.value) {
      closePreview();
    }

    if (formRef.value) {
      formRef.value.validateField("images");
    }
  }
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

// 预览图片 - 点击上传组件的图片触发
const handlePreview = (file) => {
  // 找到点击的图片在列表中的索引
  const index = fileList.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1 && imagePreviews.value[index]) {
    openPreview(imagePreviews.value[index]);
  }
};

// 打开预览
const openPreview = (image) => {
  previewImage.value = image;
  previewVisible.value = true;
  zoomLevel.value = 1;
  rotationAngle.value = 0;
};

// 关闭预览
const closePreview = () => {
  previewVisible.value = false;
  zoomLevel.value = 1;
  rotationAngle.value = 0;
};

// 放大
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25;
  }
};

// 缩小
const zoomOut = () => {
  if (zoomLevel.value > 0.25) {
    zoomLevel.value -= 0.25;
  }
};

// 重置缩放
const resetZoom = () => {
  zoomLevel.value = 1;
  rotationAngle.value = 0;
};

// 旋转
const rotateImage = () => {
  rotationAngle.value = (rotationAngle.value + 90) % 360;
};

// 切换缩放（点击图片）
const toggleZoom = () => {
  if (zoomLevel.value > 1) {
    zoomLevel.value = 1;
  } else {
    zoomLevel.value = 2;
  }
};

// 滚轮缩放
const handleWheel = (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// 下载图片
const downloadImage = () => {
  if (previewImage.value) {
    const link = document.createElement("a");
    link.href = previewImage.value;
    link.download = "作品图片.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success("开始下载图片");
  }
};

// 构建作品数据
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

// 保存草稿
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

  // 立即保存到 localStorage（确保数据已写入）
  workStore.saveWorks();

  console.log("✅ 草稿已保存:", newWork);
  ElMessage.success("已保存到草稿箱");

  // 触发数据刷新事件
  if (typeof window !== "undefined") {
    const eventDetail = {
      source: "workUpload",
      workId: newWork.id,
      work: newWork,
    };

    // 立即触发
    window.dispatchEvent(
      new CustomEvent("user-data-refresh", { detail: eventDetail }),
    );

    // 延迟触发
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("user-data-refresh", { detail: eventDetail }),
      );
    }, 100);

    // 再次延迟触发
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("user-data-refresh", { detail: eventDetail }),
      );
    }, 300);
  }

  // 延迟跳转
  setTimeout(() => {
    router.push("/drafts");
  }, 150);
};

// 发布
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

// 重置表单
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

// 键盘事件
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
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
}

/* 上传区域 */
.upload-area {
  margin-bottom: 8px;
}

.upload-area :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.upload-area :deep(.el-upload--picture-card:hover) {
  border-color: #3498db;
}

.upload-area :deep(.el-upload-list__item) {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.upload-area :deep(.el-upload-list__item:hover) {
  border-color: #3498db;
}

.upload-area :deep(.el-upload-list__item .el-icon--close) {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  padding: 4px;
}

.upload-area :deep(.el-upload-list__item .el-icon--close:hover) {
  background: #e74c3c;
}

.upload-area :deep(.el-upload-list__item .el-upload-list__item-actions) {
  background: rgba(0, 0, 0, 0.5);
}

.upload-area :deep(.el-upload-list__item .el-upload-list__item-actions span) {
  color: white;
}

.upload-area
  :deep(
    .el-upload-list__item
      .el-upload-list__item-actions
      .el-upload-list__item-actions-preview
  ) {
  color: white;
}

.upload-area
  :deep(
    .el-upload-list__item
      .el-upload-list__item-actions
      .el-upload-list__item-actions-preview:hover
  ) {
  color: #3498db;
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

.preview-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
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
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  -webkit-user-drag: none;
  will-change: transform;
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
  transition: all 0.3s ease;
}

.preview-toolbar .el-button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.preview-toolbar .el-button:active {
  transform: scale(0.95);
}

.preview-toolbar .el-button .el-icon {
  font-size: 18px;
}

.zoom-level {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  min-width: 44px;
  text-align: center;
  font-weight: 500;
  padding: 0 8px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .preview-dialog :deep(.el-dialog) {
    width: 95% !important;
  }
}

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

  .upload-area :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
  }

  .upload-area :deep(.el-upload-list__item) {
    width: 100px;
    height: 100px;
  }

  .preview-dialog :deep(.el-dialog) {
    width: 98% !important;
  }

  .preview-dialog :deep(.el-dialog__body) {
    height: 60vh;
  }

  .preview-image-wrapper {
    padding: 10px;
  }

  .preview-image-wrapper img {
    max-width: 95%;
    max-height: 80%;
  }

  .preview-toolbar {
    bottom: 16px;
    padding: 6px 12px;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 90%;
  }

  .preview-toolbar .el-button {
    padding: 6px 8px;
  }

  .preview-toolbar .el-button .el-icon {
    font-size: 16px;
  }

  .zoom-level {
    font-size: 12px;
    min-width: 36px;
  }
}

@media (max-width: 480px) {
  .preview-dialog :deep(.el-dialog__body) {
    height: 50vh;
  }

  .preview-toolbar {
    gap: 2px;
    padding: 4px 8px;
  }

  .preview-toolbar .el-button {
    padding: 4px 6px;
  }

  .preview-toolbar .el-button .el-icon {
    font-size: 14px;
  }
}
</style>
