<template>
  <div class="app-image" :style="containerStyle">
    <img
      :src="currentSrc"
      :alt="alt"
      @error="handleError"
      :style="imageStyle"
      v-show="!hasError"
      loading="lazy"
      referrerpolicy="no-referrer"
    />
    <div v-if="hasError" class="image-fallback" :style="fallbackStyle">
      <el-icon><Picture /></el-icon>
      <span v-if="fallbackText">{{ fallbackText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "图片",
  },
  width: {
    type: [String, Number],
    default: "100%",
  },
  height: {
    type: [String, Number],
    default: "100%",
  },
  fallbackText: {
    type: String,
    default: "加载失败",
  },
  objectFit: {
    type: String,
    default: "cover",
  },
  borderRadius: {
    type: String,
    default: "0",
  },
});

const hasError = ref(false);
const currentSrc = ref(props.src);
const retryCount = ref(0);
const maxRetries = 3;

// 备用头像列表 - 使用最稳定的服务
const fallbackAvatars = [
  // 使用 SVG 数据 URL 生成简单的头像
  (name) => {
    const colors = [
      "3498DB",
      "2ECC71",
      "E74C3C",
      "F39C12",
      "9B59B6",
      "1ABC9C",
      "E67E22",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=${color}&color=fff&size=200&font-size=0.5&bold=true&rounded=true`;
  },
  // 使用 DiceBear
  (name) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "user")}&size=200`;
  },
  // 使用 Pravatar
  () => {
    const seeds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
    const seed = seeds[Math.floor(Math.random() * seeds.length)];
    return `https://i.pravatar.cc/200?img=${seed}`;
  },
];

const containerStyle = computed(() => ({
  width: typeof props.width === "number" ? props.width + "px" : props.width,
  height: typeof props.height === "number" ? props.height + "px" : props.height,
  overflow: "hidden",
  position: "relative",
  background: "#f5f7fa",
  borderRadius: props.borderRadius,
  flexShrink: 0,
}));

const imageStyle = computed(() => ({
  width: "100%",
  height: "100%",
  objectFit: props.objectFit,
  display: "block",
}));

const fallbackStyle = computed(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#f0f2f5",
  color: "#b0b8c4",
  fontSize: "14px",
}));

const handleError = () => {
  retryCount.value++;

  if (retryCount.value <= maxRetries) {
    // 尝试使用备用头像
    const name = props.alt || "User";
    const fallbackIndex = retryCount.value - 1;
    const fallbackService =
      fallbackAvatars[fallbackIndex % fallbackAvatars.length];
    currentSrc.value = fallbackService(name);

    // 延迟重试
    setTimeout(() => {
      hasError.value = false;
    }, 100);
  } else {
    hasError.value = true;
    console.warn(`图片加载失败: ${props.src}`);
  }
};

// 监听 src 变化
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc) {
      currentSrc.value = newSrc;
      hasError.value = false;
      retryCount.value = 0;
    }
  },
);

onMounted(() => {
  if (!props.src || props.src === "") {
    hasError.value = true;
  }
});
</script>

<style scoped>
.app-image {
  position: relative;
}

.image-fallback .el-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.image-fallback span {
  font-size: 12px;
  color: #909399;
}
</style>
