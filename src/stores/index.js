import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 创建 Pinia 实例
const pinia = createPinia();

// 使用持久化插件
pinia.use(piniaPluginPersistedstate);

// 导出 stores
export { useUserStore } from "./userStore";
export { useWorkStore } from "./workStore";
export { useInteractionStore } from "./interactionStore";
export { useCategoryStore } from "./categoryStore";

// 默认导出 pinia 实例
export default pinia;
