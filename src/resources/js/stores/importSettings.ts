import { defineStore } from "pinia";
import { PRODUCT_MASTER } from "@/constants/masterData";

const DEFAULT_SELECTED_CODES = PRODUCT_MASTER.slice(0, 10).map((p) => p.productCode);

export const MAX_TARGET_PRODUCTS = 50;

export const useImportSettingsStore = defineStore("importSettings", {
    state: () => ({
        selectedProductCodes: [...DEFAULT_SELECTED_CODES] as string[],
        lastSyncedAt: new Date().toISOString() as string | null,
    }),
    getters: {
        isConfigured: (state) => state.selectedProductCodes.length > 0,
        count: (state) => state.selectedProductCodes.length,
    },
    actions: {
        addProduct(productCode: string) {
            if (this.selectedProductCodes.includes(productCode)) return;
            if (this.selectedProductCodes.length >= MAX_TARGET_PRODUCTS) return;
            this.selectedProductCodes.push(productCode);
        },
        removeProduct(productCode: string) {
            this.selectedProductCodes = this.selectedProductCodes.filter((c) => c !== productCode);
        },
        moveUp(productCode: string) {
            const idx = this.selectedProductCodes.indexOf(productCode);
            if (idx <= 0) return;
            const arr = this.selectedProductCodes;
            [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        },
        moveDown(productCode: string) {
            const idx = this.selectedProductCodes.indexOf(productCode);
            if (idx === -1 || idx >= this.selectedProductCodes.length - 1) return;
            const arr = this.selectedProductCodes;
            [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        },
        resyncFromApi() {
            // ダミー: 商品識別子管理システムからの再取得をシミュレートする。
            this.lastSyncedAt = new Date().toISOString();
        },
    },
    persist: {
        key: "zsv-import-settings",
        storage: localStorage,
    },
});
