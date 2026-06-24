// 日期格式化工具
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;

  // 相对时间
  if (diff < 60000) {
    return "刚刚";
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + "分钟前";
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + "小时前";
  } else if (diff < 604800000) {
    return Math.floor(diff / 86400000) + "天前";
  } else if (diff < 2592000000) {
    return Math.floor(diff / 604800000) + "周前";
  }

  // 绝对时间
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 格式化数字
export function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num;
}
