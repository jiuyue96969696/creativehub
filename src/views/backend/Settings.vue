<template>
  <div class="settings-page">
    <!-- 顶部导航 -->
    <div class="settings-topbar">
      <div class="topbar-left">
        <el-button type="text" @click="$router.push('/')" class="back-home-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <span class="topbar-divider">|</span>
        <span class="topbar-title">个人设置</span>
      </div>
      <div class="topbar-right">
        <el-button
          type="info"
          size="small"
          @click="$router.push(`/user/${userStore.currentUserId}`)"
        >
          <el-icon><User /></el-icon>
          查看个人主页
        </el-button>
      </div>
    </div>

    <div class="page-header">
      <h1>个人设置</h1>
      <p>管理你的个人信息，修改后将在所有页面同步更新</p>
    </div>

    <div class="settings-form">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="头像">
          <div class="avatar-upload">
            <AppImage
              :src="form.avatar || defaultAvatar"
              alt="avatar"
              :width="80"
              :height="80"
              fallback-text="加载失败"
              object-fit="cover"
              border-radius="50%"
            />
            <div class="avatar-actions">
              <el-button size="small" @click="triggerUpload"
                >更换头像</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="resetAvatar"
                :disabled="isDefaultAvatar"
              >
                恢复默认
              </el-button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
            </div>
            <div class="avatar-tip">
              <span v-if="isDefaultAvatar">当前使用默认头像</span>
              <span v-else style="color: #3498db">✅ 已自定义头像</span>
              <span style="margin-left: 8px; color: #7f8c8d"
                >| 支持 JPG、PNG 格式</span
              >
            </div>
          </div>
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名（3-20字符）"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="邮箱地址" disabled />
          <div class="form-tip">邮箱不可修改</div>
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="4"
            placeholder="介绍一下你自己，最多200字"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="技能">
          <el-select
            v-model="form.skills"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入技能，按回车添加"
            style="width: 100%"
          >
            <el-option
              v-for="skill in commonSkills"
              :key="skill"
              :label="skill"
              :value="skill"
            />
          </el-select>
          <div class="form-tip">展示你的专业技能，最多添加10个</div>
        </el-form-item>

        <el-form-item label="个人网站">
          <el-input
            v-model="form.website"
            placeholder="https://your-portfolio.com"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button
              type="primary"
              @click="saveSettings"
              :loading="saving"
              size="large"
            >
              <el-icon><Check /></el-icon>
              保存设置
            </el-button>
            <el-button @click="resetForm" size="large">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
          <div class="form-tip" style="margin-top: 12px; text-align: center">
            💡 修改保存后，主页和所有作品中的作者信息将自动更新
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/stores/userStore";
import AppImage from "@/components/AppImage.vue";

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const fileInput = ref(null);
const saving = ref(false);

const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle";
const commonSkills = [
  "UI设计",
  "平面设计",
  "插画",
  "摄影",
  "3D设计",
  "视频剪辑",
  "前端开发",
  "品牌设计",
  "交互设计",
  "动效设计",
  "用户体验",
  "产品设计",
  "视觉设计",
  "创意设计",
  "艺术指导",
];

const form = reactive({
  avatar: "",
  username: "",
  email: "",
  bio: "",
  skills: [],
  website: "",
});

const isDefaultAvatar = computed(() => {
  // 检查是否使用默认头像
  const currentUser = userStore.currentUser;
  if (currentUser) {
    return currentUser.isDefaultAvatar !== false;
  }
  return true;
});

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度为 3-20 字符", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (
          value &&
          !/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_]{2,19}$/.test(value)
        ) {
          callback(
            new Error(
              "用户名只能包含字母、数字、中文和下划线，且不能以数字开头",
            ),
          );
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  bio: [{ max: 200, message: "简介不能超过 200 字符", trigger: "blur" }],
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const resetAvatar = () => {
  // 恢复默认头像
  const currentUser = userStore.currentUser;
  if (currentUser) {
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=95A5A6&color=fff&size=200&font-size=0.5&bold=true&rounded=true&background-type=circle`;
    form.avatar = defaultAvatarUrl;
    ElMessage.success("已恢复默认头像，请点击保存生效");
  }
};

const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    ElMessage.warning("请选择图片文件");
    return;
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.warning("图片大小不能超过 2MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    form.avatar = e.target.result;
    ElMessage.success("头像已更新，请点击保存生效");
  };
  reader.readAsDataURL(file);
  e.target.value = "";
};

const saveSettings = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    saving.value = true;

    // 检查是否有变化
    const currentUser = userStore.currentUser;
    const hasChanges =
      form.username !== currentUser.username ||
      form.bio !== (currentUser.bio || "") ||
      form.skills.join(",") !== (currentUser.skills || []).join(",") ||
      form.website !== (currentUser.website || "") ||
      form.avatar !== currentUser.avatar;

    if (!hasChanges) {
      ElMessage.info("没有检测到任何更改");
      saving.value = false;
      return;
    }

    // 准备更新数据
    const updateData = {
      username: form.username,
      bio: form.bio,
      skills: form.skills,
      website: form.website,
    };

    // 处理头像
    if (form.avatar.startsWith("data:image")) {
      // 用户上传了新图片
      updateData.avatar = form.avatar;
      updateData.isDefaultAvatar = false;
    } else if (form.avatar === defaultAvatar) {
      // 恢复默认头像
      updateData.avatar = defaultAvatar;
      updateData.isDefaultAvatar = true;
    } else {
      // 检查是否是默认头像（包含 ui-avatars.com）
      if (form.avatar.includes("ui-avatars.com")) {
        updateData.isDefaultAvatar = true;
      }
    }

    // 更新用户信息
    userStore.updateProfile(updateData);

    ElMessage.success({
      message: "✅ 设置已保存！正在同步更新所有页面...",
      duration: 2000,
    });

    // 延迟关闭加载状态并刷新
    setTimeout(() => {
      saving.value = false;

      // 强制刷新页面数据
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("user-data-refresh", {
            detail: { userId: userStore.currentUser.id },
          }),
        );
      }

      ElMessage.success("✅ 所有页面已同步更新！");
    }, 1000);
  } catch (error) {
    saving.value = false;
    if (error !== "cancel") {
      console.error("保存设置失败:", error);
      ElMessage.error("保存失败，请重试");
    }
  }
};

const resetForm = () => {
  ElMessageBox.confirm("确定要重置所有设置吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const user = userStore.currentUser;
      if (user) {
        form.avatar = user.avatar || defaultAvatar;
        form.username = user.username || "";
        form.email = user.email || "";
        form.bio = user.bio || "";
        form.skills = [...(user.skills || [])];
        form.website = user.website || "";
        ElMessage.success("已重置");
      }
    })
    .catch(() => {});
};

// 初始化表单数据
const initForm = () => {
  const user = userStore.currentUser;
  if (user) {
    form.avatar = user.avatar || defaultAvatar;
    form.username = user.username || "";
    form.email = user.email || "";
    form.bio = user.bio || "";
    form.skills = [...(user.skills || [])];
    form.website = user.website || "";
  }
};

// 监听用户更新事件
const handleUserUpdate = () => {
  const user = userStore.currentUser;
  if (user) {
    form.avatar = user.avatar || defaultAvatar;
    form.username = user.username || "";
    form.bio = user.bio || "";
    form.skills = [...(user.skills || [])];
    form.website = user.website || "";
  }
};

onMounted(() => {
  userStore.loadUsers();
  initForm();
  window.addEventListener("user-profile-updated", handleUserUpdate);
  window.addEventListener("user-data-changed", handleUserUpdate);
});

onUnmounted(() => {
  window.removeEventListener("user-profile-updated", handleUserUpdate);
  window.removeEventListener("user-data-changed", handleUserUpdate);
});
</script>

<style scoped>
.settings-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.settings-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-home-btn {
  font-size: 15px;
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
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 4px;
  color: #2c3e50;
}

.page-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.settings-form {
  max-width: 700px;
  background: white;
  padding: 32px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.avatar-upload :deep(.app-image) {
  border-radius: 50% !important;
  border: 3px solid #ecf0f1;
  flex-shrink: 0;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-tip {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 8px;
  width: 100%;
}

.form-tip {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.form-actions .el-button {
  min-width: 120px;
}

@media (max-width: 768px) {
  .settings-topbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .topbar-right {
    width: 100%;
  }

  .topbar-right .el-button {
    width: 100%;
  }

  .settings-form {
    padding: 20px;
  }

  .avatar-upload {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .avatar-actions {
    align-items: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>
