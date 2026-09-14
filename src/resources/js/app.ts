import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useSurveysStore } from "@/stores/surveys";
import "@css/app.css";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);

// UI確認用のダミー調査履歴を初回のみ生成する（取込設定の初期値に基づく）。
useSurveysStore(pinia).ensureSeeded();

// 認証ガードを含む初回ナビゲーションが完了してから描画を開始する。
// 未ログイン時に、リダイレクト前の画面（Navbar）が一瞬表示されるのを防ぐ。
router.isReady().then(() => {
    app.mount("#app");
});
