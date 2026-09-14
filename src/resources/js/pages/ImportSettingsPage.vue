<script setup lang="ts">
import { computed, ref } from "vue";
import { BRAND_LIST, CATEGORY_LIST, findProduct, PRODUCT_MASTER } from "@/constants/masterData";
import { MAX_TARGET_PRODUCTS, useImportSettingsStore } from "@/stores/importSettings";
import { useToastStore } from "@/stores/toast";
import { formatDateTime } from "@/utils/format";

const store = useImportSettingsStore();
const toast = useToastStore();

const workingCodes = ref<string[]>([...store.selectedProductCodes]);
const dirty = computed(() => JSON.stringify(workingCodes.value) !== JSON.stringify(store.selectedProductCodes));

const selectedProducts = computed(() => workingCodes.value.map((code) => findProduct(code)).filter((p): p is NonNullable<typeof p> => Boolean(p)));

const search = ref("");
const brandFilter = ref("");
const categoryFilter = ref("");

const candidateProducts = computed(() =>
    PRODUCT_MASTER.filter((p) => !workingCodes.value.includes(p.productCode))
        .filter((p) => !brandFilter.value || p.brand === brandFilter.value)
        .filter((p) => !categoryFilter.value || p.category === categoryFilter.value)
        .filter((p) => {
            if (!search.value) return true;
            const q = search.value.toLowerCase();
            return p.productCode.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q);
        }),
);

function add(code: string) {
    if (workingCodes.value.length >= MAX_TARGET_PRODUCTS || workingCodes.value.includes(code)) return;
    workingCodes.value.push(code);
}

function remove(code: string) {
    workingCodes.value = workingCodes.value.filter((c) => c !== code);
}

function moveUp(index: number) {
    if (index <= 0) return;
    const arr = workingCodes.value;
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
}

function moveDown(index: number) {
    if (index >= workingCodes.value.length - 1) return;
    const arr = workingCodes.value;
    [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
}

function resetChanges() {
    workingCodes.value = [...store.selectedProductCodes];
}

function save() {
    if (workingCodes.value.length === 0) {
        toast.push("取込対象品番を1件以上選択してください。", "error");
        return;
    }
    store.$patch({ selectedProductCodes: [...workingCodes.value] });
    store.resyncFromApi();
    toast.push("取込設定を保存しました");
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-xl font-semibold text-slate-900">取込設定</h1>
                <p class="mt-1 text-sm text-slate-500">取込対象の品番を選択・削除し、並び順を設定します（1〜{{ MAX_TARGET_PRODUCTS }}件）。</p>
            </div>
            <p v-if="store.lastSyncedAt" class="text-xs text-slate-400">最終更新: {{ formatDateTime(store.lastSyncedAt) }}</p>
        </div>

        <section class="rounded-xl border border-slate-200 bg-white">
            <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 class="text-sm font-semibold text-slate-800">
                    設定済み品番
                    <span class="ml-1 font-normal text-slate-400">{{ workingCodes.length }} / {{ MAX_TARGET_PRODUCTS }}</span>
                </h2>
            </div>

            <div v-if="selectedProducts.length === 0" class="px-4 py-10 text-center text-sm text-slate-400"> 対象品番が設定されていません。下の一覧から追加してください。 </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                        <tr>
                            <th class="w-16 px-3 py-2">並び順</th>
                            <th class="px-3 py-2">品番</th>
                            <th class="px-3 py-2">品名</th>
                            <th class="px-3 py-2">ブランド</th>
                            <th class="px-3 py-2">カテゴリ</th>
                            <th class="px-3 py-2">SKU数</th>
                            <th class="w-20 px-3 py-2 text-right">削除</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="(product, index) in selectedProducts" :key="product.productCode">
                            <td class="px-3 py-2">
                                <div class="flex items-center gap-1">
                                    <span class="w-5 text-slate-400">{{ index + 1 }}</span>
                                    <button type="button" class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" :disabled="index === 0" @click="moveUp(index)">
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                                        :disabled="index === selectedProducts.length - 1"
                                        @click="moveDown(index)"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td class="px-3 py-2 font-medium text-slate-900">{{ product.productCode }}</td>
                            <td class="px-3 py-2 text-slate-700">{{ product.productName }}</td>
                            <td class="px-3 py-2">
                                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ product.brand }}</span>
                            </td>
                            <td class="px-3 py-2">
                                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ product.category }}</span>
                            </td>
                            <td class="px-3 py-2 text-slate-500">{{ product.skus.length }}</td>
                            <td class="px-3 py-2 text-right">
                                <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="対象から削除" @click="remove(product.productCode)">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                        />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <div class="flex flex-wrap items-center gap-3">
            <button
                type="button"
                :disabled="!dirty"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                @click="save"
            >
                この設定を保存
            </button>
            <button
                type="button"
                :disabled="!dirty"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                @click="resetChanges"
            >
                変更を取り消す
            </button>
            <span v-if="dirty" class="text-xs font-medium text-amber-600">未保存の変更があります</span>
        </div>

        <section class="rounded-xl border border-slate-200 bg-white">
            <div class="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 class="text-sm font-semibold text-slate-800">品番を追加</h2>
                <div class="flex flex-wrap gap-2">
                    <input
                        v-model="search"
                        type="text"
                        placeholder="品番・品名で検索"
                        class="w-48 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <select v-model="brandFilter" class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                        <option value="">すべてのブランド</option>
                        <option v-for="b in BRAND_LIST" :key="b" :value="b">{{ b }}</option>
                    </select>
                    <select v-model="categoryFilter" class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                        <option value="">すべてのカテゴリ</option>
                        <option v-for="c in CATEGORY_LIST" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
            </div>

            <div v-if="candidateProducts.length === 0" class="px-4 py-8 text-center text-sm text-slate-400"> 条件に一致する追加可能な品番がありません。 </div>
            <ul v-else class="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                <li v-for="product in candidateProducts" :key="product.productCode" class="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-slate-900">
                            {{ product.productCode }} <span class="font-normal text-slate-600">{{ product.productName }}</span>
                        </p>
                        <p class="text-xs text-slate-400">{{ product.brand }} ／ {{ product.category }} ／ SKU {{ product.skus.length }}件</p>
                    </div>
                    <button
                        type="button"
                        :disabled="workingCodes.length >= MAX_TARGET_PRODUCTS"
                        class="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                        @click="add(product.productCode)"
                    >
                        + 追加
                    </button>
                </li>
            </ul>
        </section>
    </div>
</template>
