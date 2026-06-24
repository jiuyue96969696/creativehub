import request from "./request";

// 用户登录
export const login = (email, password) => {
  return request({
    url: "/user/login",
    method: "post",
    data: { email, password },
  });
};

// 用户注册
export const register = (userData) => {
  return request({
    url: "/user/register",
    method: "post",
    data: userData,
  });
};

// 获取用户信息
export const getUserById = (id) => {
  return request({
    url: `/user/${id}`,
    method: "get",
  });
};

// 更新用户信息
export const updateUser = (id, data) => {
  return request({
    url: `/user/${id}`,
    method: "put",
    data,
  });
};

// 获取用户的作品
export const getUserWorks = (userId) => {
  return request({
    url: `/user/${userId}/works`,
    method: "get",
  });
};

// 获取用户关注列表
export const getUserFollowing = (userId) => {
  return request({
    url: `/user/${userId}/following`,
    method: "get",
  });
};

// 获取用户粉丝列表
export const getUserFollowers = (userId) => {
  return request({
    url: `/user/${userId}/followers`,
    method: "get",
  });
};

// 获取用户收藏
export const getUserCollects = (userId) => {
  return request({
    url: `/user/${userId}/collects`,
    method: "get",
  });
};

// 关注用户
export const followUser = (followerId, followingId) => {
  return request({
    url: "/user/follow",
    method: "post",
    data: { followerId, followingId },
  });
};

// 取消关注
export const unfollowUser = (followerId, followingId) => {
  return request({
    url: "/user/unfollow",
    method: "post",
    data: { followerId, followingId },
  });
};
