import request from "./request";

// 获取所有作品
export const getWorks = (params) => {
  return request({
    url: "/works",
    method: "get",
    params,
  });
};

// 获取作品详情
export const getWorkById = (id) => {
  return request({
    url: `/work/${id}`,
    method: "get",
  });
};

// 创建作品
export const createWork = (data) => {
  return request({
    url: "/work",
    method: "post",
    data,
  });
};

// 更新作品
export const updateWork = (id, data) => {
  return request({
    url: `/work/${id}`,
    method: "put",
    data,
  });
};

// 删除作品
export const deleteWork = (id) => {
  return request({
    url: `/work/${id}`,
    method: "delete",
  });
};

// 获取分类下的作品
export const getWorksByCategory = (categoryId) => {
  return request({
    url: `/category/${categoryId}/works`,
    method: "get",
  });
};

// 获取标签下的作品
export const getWorksByTag = (tagName) => {
  return request({
    url: `/tag/${encodeURIComponent(tagName)}/works`,
    method: "get",
  });
};

// 搜索作品
export const searchWorks = (keyword) => {
  return request({
    url: "/search",
    method: "get",
    params: { q: keyword },
  });
};

// 获取热门作品
export const getHotWorks = (limit = 10) => {
  return request({
    url: "/works/hot",
    method: "get",
    params: { limit },
  });
};

// 获取推荐作品
export const getRecommendWorks = (workId, limit = 6) => {
  return request({
    url: "/works/recommend",
    method: "get",
    params: { workId, limit },
  });
};
