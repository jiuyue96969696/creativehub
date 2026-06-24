import request from "./request";

// 点赞作品
export const likeWork = (userId, workId) => {
  return request({
    url: "/interaction/like",
    method: "post",
    data: { userId, workId },
  });
};

// 取消点赞
export const unlikeWork = (userId, workId) => {
  return request({
    url: "/interaction/unlike",
    method: "post",
    data: { userId, workId },
  });
};

// 收藏作品
export const collectWork = (userId, workId) => {
  return request({
    url: "/interaction/collect",
    method: "post",
    data: { userId, workId },
  });
};

// 取消收藏
export const uncollectWork = (userId, workId) => {
  return request({
    url: "/interaction/uncollect",
    method: "post",
    data: { userId, workId },
  });
};

// 发表评论
export const addComment = (workId, userId, content) => {
  return request({
    url: "/interaction/comment",
    method: "post",
    data: { workId, userId, content },
  });
};

// 获取作品评论
export const getComments = (workId, page = 1, size = 20) => {
  return request({
    url: `/interaction/comments/${workId}`,
    method: "get",
    params: { page, size },
  });
};

// 删除评论
export const deleteComment = (commentId) => {
  return request({
    url: `/interaction/comment/${commentId}`,
    method: "delete",
  });
};

// 获取互动统计
export const getInteractionStats = (workId) => {
  return request({
    url: `/interaction/stats/${workId}`,
    method: "get",
  });
};

// 检查是否已点赞
export const checkLiked = (userId, workId) => {
  return request({
    url: "/interaction/check/like",
    method: "get",
    params: { userId, workId },
  });
};

// 检查是否已收藏
export const checkCollected = (userId, workId) => {
  return request({
    url: "/interaction/check/collect",
    method: "get",
    params: { userId, workId },
  });
};

// 检查是否已关注
export const checkFollowed = (followerId, followingId) => {
  return request({
    url: "/interaction/check/follow",
    method: "get",
    params: { followerId, followingId },
  });
};
