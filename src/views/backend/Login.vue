<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <span class="logo-icon">🎨</span>
          <h1>CreativeHub</h1>
          <p>登录你的创意账号</p>
        </div>

        <div class="login-form">
          <el-tabs v-model="activeTab" class="login-tabs">
            <el-tab-pane label="登录" name="login">
              <el-form
                :model="loginForm"
                :rules="loginRules"
                ref="loginFormRef"
              >
                <el-form-item prop="email">
                  <el-input
                    v-model="loginForm.email"
                    placeholder="邮箱地址"
                    size="large"
                    prefix-icon="Message"
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="密码"
                    size="large"
                    prefix-icon="Lock"
                    @keyup.enter="handleLogin"
                  />
                </el-form-item>
                <el-form-item>
                  <div class="login-options">
                    <el-checkbox v-model="loginForm.rememberMe">
                      记住我
                    </el-checkbox>
                    <el-link type="primary" :underline="false"
                      >忘记密码？</el-link
                    >
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    @click="handleLogin"
                    :loading="loading"
                    class="login-btn"
                  >
                    登录
                  </el-button>
                </el-form-item>
                <div class="form-footer">
                  <span>还没有账号？</span>
                  <el-link type="primary" @click="activeTab = 'register'"
                    >立即注册</el-link
                  >
                </div>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="注册" name="register">
              <el-form
                :model="registerForm"
                :rules="registerRules"
                ref="registerFormRef"
                :hide-required-asterisk="false"
              >
                <el-form-item prop="username" class="username-form-item">
                  <el-input
                    v-model="registerForm.username"
                    placeholder="用户名（3-20字符）"
                    size="large"
                    prefix-icon="User"
                    @input="checkUsername"
                    @blur="handleBlur"
                  />
                  <!-- 自定义状态提示 - 在表单错误提示下方显示 -->
                  <div class="username-status-wrapper">
                    <div
                      v-if="usernameStatus === 'available'"
                      class="username-status success"
                    >
                      <el-icon><CircleCheck /></el-icon>
                      <span>该用户名可用</span>
                    </div>
                    <!-- 只在未触发表单验证错误时显示错误状态，避免重复 -->
                    <div
                      v-else-if="usernameStatus === 'taken' && !showFormError"
                      class="username-status error"
                    >
                      <el-icon><CircleClose /></el-icon>
                      <span>该用户名已被占用，请换一个</span>
                    </div>
                    <div
                      v-else-if="usernameStatus === 'checking'"
                      class="username-status checking"
                    >
                      <el-icon class="is-loading"><Loading /></el-icon>
                      <span>检查中...</span>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item prop="email">
                  <el-input
                    v-model="registerForm.email"
                    placeholder="邮箱地址"
                    size="large"
                    prefix-icon="Message"
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="密码（至少6位）"
                    size="large"
                    prefix-icon="Lock"
                  />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    size="large"
                    prefix-icon="Lock"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    @click="handleRegister"
                    :loading="loading"
                    class="login-btn"
                  >
                    注册
                  </el-button>
                </el-form-item>
                <div class="form-footer">
                  <span>已有账号？</span>
                  <el-link type="primary" @click="activeTab = 'login'"
                    >去登录</el-link
                  >
                </div>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div class="login-bg">
        <div class="bg-content">
          <span class="bg-icon">✨</span>
          <h2>创意从这里开始</h2>
          <p>展示你的作品，发现无限灵感</p>
          <div class="bg-features">
            <div class="bg-feature">
              <span>🎨</span>
              <span>展示作品</span>
            </div>
            <div class="bg-feature">
              <span>💬</span>
              <span>交流互动</span>
            </div>
            <div class="bg-feature">
              <span>🏆</span>
              <span>发现灵感</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref("login");
const loading = ref(false);
const loginFormRef = ref(null);
const registerFormRef = ref(null);

// 用户名状态
const usernameStatus = ref(""); // '' | 'checking' | 'available' | 'taken'
const usernameCheckTimer = ref(null);
const showFormError = ref(false);

// 记住我存储的key
const REMEMBER_KEY = "creativehub_remember";

const loginForm = reactive({
  email: "",
  password: "",
  rememberMe: false,
});

const registerForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// 检查用户名（实时）
const checkUsername = () => {
  const username = registerForm.username;
  if (!username || username.length < 3) {
    usernameStatus.value = "";
    showFormError.value = false;
    // 触发表单验证
    if (registerFormRef.value) {
      registerFormRef.value.validateField("username");
    }
    return;
  }

  // 清除之前的定时器
  if (usernameCheckTimer.value) {
    clearTimeout(usernameCheckTimer.value);
  }

  // 检查格式
  if (
    !/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_]{2,19}$/.test(username)
  ) {
    usernameStatus.value = "";
    showFormError.value = false;
    if (registerFormRef.value) {
      registerFormRef.value.validateField("username");
    }
    return;
  }

  // 显示检查中状态
  usernameStatus.value = "checking";
  showFormError.value = false;

  // 延迟检查，避免频繁触发
  usernameCheckTimer.value = setTimeout(() => {
    const isTaken = userStore.users.some((u) => u.username === username);
    if (isTaken) {
      usernameStatus.value = "taken";
      showFormError.value = true;
    } else {
      usernameStatus.value = "available";
      showFormError.value = false;
    }
    // 触发表单验证
    if (registerFormRef.value) {
      registerFormRef.value.validateField("username");
    }
  }, 300);
};

// 失去焦点时验证
const handleBlur = () => {
  if (registerForm.username && registerForm.username.length >= 3) {
    checkUsername();
  }
};

// 监听用户名输入变化 - 重置状态
watch(
  () => registerForm.username,
  (newVal) => {
    if (!newVal || newVal.length < 3) {
      usernameStatus.value = "";
      showFormError.value = false;
    }
  },
);

const validatePassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 自定义验证：用户名唯一性
const validateUsernameUnique = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入用户名"));
    return;
  }

  if (value.length < 3 || value.length > 20) {
    callback(new Error("用户名长度为3-20字符"));
    return;
  }

  if (!/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_]{2,19}$/.test(value)) {
    callback(
      new Error("用户名只能包含字母、数字、中文和下划线，且不能以数字开头"),
    );
    return;
  }

  // 检查用户名是否已存在
  const isTaken = userStore.users.some((u) => u.username === value);
  if (isTaken) {
    callback(new Error("该用户名已被占用，请换一个"));
  } else {
    callback();
  }
};

// 登录验证规则
const loginRules = {
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

// 注册验证规则
const registerRules = {
  username: [{ validator: validateUsernameUnique, trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    { validator: validatePassword, trigger: "blur" },
  ],
};

// 保存记住我信息
const saveRememberMe = (email, password) => {
  if (loginForm.rememberMe) {
    const data = {
      email: email,
      password: password,
      timestamp: Date.now(),
    };
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
};

// 加载记住我信息
const loadRememberMe = () => {
  try {
    const data = localStorage.getItem(REMEMBER_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const days = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
      if (days < 30) {
        loginForm.email = parsed.email;
        loginForm.password = parsed.password;
        loginForm.rememberMe = true;
        return true;
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    }
  } catch (e) {
    console.error("加载记住我信息失败:", e);
  }
  return false;
};

// 检查是否有记住的用户
const checkRememberedUser = () => {
  const remembered = loadRememberMe();
  if (remembered) {
    ElMessage.info("已自动填充记住的账号");
  }
};

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      const result = userStore.login(loginForm.email, loginForm.password);
      loading.value = false;

      if (result.success) {
        saveRememberMe(loginForm.email, loginForm.password);
        ElMessage.success("登录成功！");
        router.push("/dashboard");
      } else {
        ElMessage.error(result.message);
      }
    }
  });
};

// 注册
const handleRegister = async () => {
  if (!registerFormRef.value) return;

  // 额外检查用户名是否已被占用
  const isTaken = userStore.users.some(
    (u) => u.username === registerForm.username,
  );
  if (isTaken) {
    ElMessage.error("该用户名已被占用，请换一个");
    return;
  }

  await registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      const result = userStore.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });
      loading.value = false;

      if (result.success) {
        ElMessage.success("注册成功！请登录");
        activeTab.value = "login";
        loginForm.email = registerForm.email;
        loginForm.password = "";
        loginForm.rememberMe = false;
        registerForm.username = "";
        registerForm.email = "";
        registerForm.password = "";
        registerForm.confirmPassword = "";
        usernameStatus.value = "";
        showFormError.value = false;
      } else {
        ElMessage.error(result.message);
      }
    }
  });
};

onMounted(() => {
  checkRememberedUser();
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  padding: 20px;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 900px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-box {
  padding: 48px 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header .logo-icon {
  font-size: 48px;
  display: block;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 8px 0 4px;
  color: #2c3e50;
}

.login-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.login-form {
  max-width: 360px;
  margin: 0 auto;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.login-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 600;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.login-options :deep(.el-checkbox) {
  color: #7f8c8d;
}

.login-options :deep(.el-checkbox__label) {
  font-size: 14px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #7f8c8d;
}

.form-footer .el-link {
  font-weight: 600;
}

/* 用户名表单项 - 移除底部边距避免重复提示 */
.username-form-item :deep(.el-form-item__error) {
  display: block;
  margin-bottom: 0;
}

/* 用户名状态提示包装器 */
.username-status-wrapper {
  min-height: 22px;
  margin-top: 2px;
}

/* 用户名状态提示 - 仅一行 */
.username-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 2px 0;
}

.username-status.success {
  color: #67c23a;
}

.username-status.error {
  color: #f56c6c;
}

.username-status.checking {
  color: #909399;
}

.username-status .el-icon {
  font-size: 16px;
}

.username-status .el-icon.is-loading {
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 右侧背景 */
.login-bg {
  background: linear-gradient(135deg, #2c3e50, #1a252f);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.bg-content {
  text-align: center;
}

.bg-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 16px;
}

.bg-content h2 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 700;
}

.bg-content p {
  opacity: 0.7;
  font-size: 16px;
  margin-bottom: 32px;
}

.bg-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.bg-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.bg-feature:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.bg-feature span:first-child {
  font-size: 20px;
}

.bg-feature span:last-child {
  font-size: 14px;
  opacity: 0.9;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .login-bg {
    display: none;
  }

  .login-box {
    padding: 32px 24px;
  }

  .login-form {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .login-box {
    padding: 24px 16px;
  }

  .login-header .logo-icon {
    font-size: 36px;
  }

  .login-header h1 {
    font-size: 20px;
  }
}
</style>
