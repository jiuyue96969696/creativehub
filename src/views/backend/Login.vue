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
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="registerForm.username"
                    placeholder="用户名（3-20字符）"
                    size="large"
                    prefix-icon="User"
                  />
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
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref("login");
const loading = ref(false);
const loginFormRef = ref(null);
const registerFormRef = ref(null);

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

const validatePassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const loginRules = {
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const registerRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度为3-20字符", trigger: "blur" },
  ],
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
      // 检查是否过期（30天）
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

// 检查是否有记住的用户，如果有则自动填充
const checkRememberedUser = () => {
  const remembered = loadRememberMe();
  if (remembered) {
    ElMessage.info("已自动填充记住的账号");
  }
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      const result = userStore.login(loginForm.email, loginForm.password);
      loading.value = false;

      if (result.success) {
        // 保存记住我信息
        saveRememberMe(loginForm.email, loginForm.password);

        ElMessage.success("登录成功！");
        router.push("/dashboard");
      } else {
        ElMessage.error(result.message);
      }
    }
  });
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;
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
      } else {
        ElMessage.error(result.message);
      }
    }
  });
};

// 监听记住我复选框变化
const handleRememberChange = (value) => {
  if (!value) {
    localStorage.removeItem(REMEMBER_KEY);
  }
};

onMounted(() => {
  // 检查是否有记住的用户
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
