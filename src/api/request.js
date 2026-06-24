import axios from "axios";
import { ElMessage } from "element-plus";

// 创建 axios 实例
const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 如果是 Mock 数据，添加标识
    if (import.meta.env.DEV) {
      config.headers["X-Mock"] = "true";
    }

    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 如果响应有 code 字段，检查状态
    if (data.code !== undefined && data.code !== 200) {
      ElMessage.error(data.message || "请求失败");
      return Promise.reject(new Error(data.message || "请求失败"));
    }

    return data;
  },
  (error) => {
    // 处理网络错误
    if (!error.response) {
      ElMessage.error("网络连接失败，请检查网络");
      return Promise.reject(error);
    }

    // 处理 HTTP 错误
    const { status, data } = error.response;
    switch (status) {
      case 401:
        ElMessage.error("未授权，请重新登录");
        // 清除 token 并跳转到登录页
        localStorage.removeItem("token");
        window.location.href = "/login";
        break;
      case 403:
        ElMessage.error("没有权限访问");
        break;
      case 404:
        ElMessage.error("请求的资源不存在");
        break;
      case 500:
        ElMessage.error("服务器错误，请稍后重试");
        break;
      default:
        ElMessage.error(data?.message || `请求失败 (${status})`);
    }

    return Promise.reject(error);
  },
);

export default request;
