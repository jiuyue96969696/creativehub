// 表单验证工具
export const validate = {
  // 用户名：3-20字符，字母数字下划线
  username(value) {
    const reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/;
    return reg.test(value);
  },

  // 邮箱格式
  email(value) {
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return reg.test(value);
  },

  // 密码：至少6位
  password(value) {
    return value.length >= 6;
  },

  // 作品标题：3-50字符
  workTitle(value) {
    return value.length >= 3 && value.length <= 50;
  },

  // 作品描述：10-500字符
  workDescription(value) {
    return value.length >= 10 && value.length <= 500;
  },

  // 评论内容：1-200字符
  comment(value) {
    return value.length >= 1 && value.length <= 200;
  },
};
