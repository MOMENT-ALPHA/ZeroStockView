<script setup lang="ts">
import { computed, ref } from "vue";
import MemoField from "@/components/ui/MemoField.vue";
import { useSurveysStore } from "@/stores/surveys";
import { useToastStore } from "@/stores/toast";
import { STOCK_FIELDS, type StockQuantities } from "@/types";
import { formatDateTime } from "@/utils/format";

const props = defineProps<{ id: string }>();

const surveysStore = useSurveysStore();
const toast = useToastStore();

const survey = computed(() => surveysStore.getSurvey(props.id));
const isLatest = computed(() => surveysStore.latestSurvey?.id === props.id);

const brandOptions = computed(() => Array.from(new Set(survey.value?.products.map((p) => p.brand) ?? [])));
const categoryOptions = computed(() => Array.from(new Set(survey.value?.products.map((p) => p.category) ?? [])));

const brandFilter = ref("");
const categoryFilter = ref("");
const productCodeQuery = ref("");
const skuQuery = ref("");
const asinQuery = ref("");

const ZERO_STOCK_BUTTONS = [
    { key: "amazonZero", label: "Amazon在庫ゼロ" },
    { key: "bossZero", label: "BOSS在庫ゼロ" },
    { key: "freeZero", label: "フリー在庫ゼロ" },
    { key: "ecZero", label: "ECストック在庫ゼロ" },
] as const;
const HAS_STOCK_BUTTONS = [
    { key: "freeHas", label: "フリー在庫あり" },
    { key: "ecHas", label: "ECストック在庫あり" },
] as const;

const activeConditions = ref<string[]>([]);

function toggleCondition(key: string) {
    const idx = activeConditions.value.indexOf(key);
    if (idx === -1) activeConditions.value.push(key);
    else activeConditions.value.splice(idx, 1);
}

function matchesConditions(stock: StockQuantities): boolean {
    return activeConditions.value.every((key) => {
        switch (key) {
            case "amazonZero":
                return stock.amazonOwn === 0 && stock.amazonFba === 0;
            case "bossZero":
                return stock.bossOwn === 0 && stock.bossRfc === 0;
            case "freeZero":
                return stock.freeStock === 0;
            case "ecZero":
                return stock.ecStock === 0;
            case "freeHas":
                return stock.freeStock > 0;
            case "ecHas":
                return stock.ecStock > 0;
            default:
                return true;
        }
    });
}

const hasActiveFilters = computed(() => Boolean(brandFilter.value || categoryFilter.value || productCodeQuery.value || skuQuery.value || asinQuery.value) || activeConditions.value.length > 0);

function clearFilters() {
    brandFilter.value = "";
    categoryFilter.value = "";
    productCodeQuery.value = "";
    skuQuery.value = "";
    asinQuery.value = "";
    activeConditions.value = [];
}

const filteredProducts = computed(() => {
    const s = survey.value;
    if (!s) return [];
    const productQ = productCodeQuery.value.trim().toLowerCase();
    const skuQ = skuQuery.value.trim().toLowerCase();
    const asinQ = asinQuery.value.trim().toLowerCase();

    return s.products
        .filter((p) => !brandFilter.value || p.brand === brandFilter.value)
        .filter((p) => !categoryFilter.value || p.category === categoryFilter.value)
        .filter((p) => !productQ || p.productCode.toLowerCase().includes(productQ))
        .map((p) => ({
            ...p,
            skus: p.skus.filter((sku) => {
                if (skuQ && !sku.skuCode.toLowerCase().includes(skuQ)) return false;
                if (asinQ && !sku.asin.toLowerCase().includes(asinQ)) return false;
                if (!matchesConditions(sku.stock)) return false;
                return true;
            }),
        }))
        .filter((p) => p.skus.length > 0);
});

const totalSkuCount = computed(() => survey.value?.products.reduce((sum, p) => sum + p.skus.length, 0) ?? 0);
const matchedSkuCount = computed(() => filteredProducts.value.reduce((sum, p) => sum + p.skus.length, 0));

function isZero(stock: StockQuantities): boolean {
    return Object.values(stock).every((v) => v === 0);
}

function exportExcel(scope: "all" | "filtered") {
    if (!survey.value) return;
    toast.push(scope === "all" ? "全件の在庫調査結果をExcel出力しました（デモ）" : `絞込結果（${matchedSkuCount.value}件）をExcel出力しました（デモ）`);
}
</script>

<template>
    <div v-if="!survey" class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p class="text-sm font-medium text-slate-600">指定された調査結果が見つかりません。削除された可能性があります。</p>
        <RouterLink :to="{ name: 'survey-history' }" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"> 調査履歴に戻る </RouterLink>
    </div>

    <div v-else class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
            <RouterLink :to="{ name: 'survey-history' }" class="inline-flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                調査履歴に戻る
            </RouterLink>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-2">
                    <h1 class="text-xl font-semibold text-slate-900">在庫調査結果</h1>
                    <span v-if="isLatest" class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">最新</span>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="exportExcel('filtered')">
                        絞込結果をExcel出力
                    </button>
                    <button type="button" class="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700" @click="exportExcel('all')"> 全件をExcel出力 </button>
                </div>
            </div>
            <p class="text-sm text-slate-500">調査日時: {{ formatDateTime(survey.executedAt) }}</p>
        </div>

        <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select v-model="brandFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="">すべてのブランド</option>
                    <option v-for="b in brandOptions" :key="b" :value="b">{{ b }}</option>
                </select>
                <select v-model="categoryFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="">すべてのカテゴリ</option>
                    <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
                </select>
                <input v-model="productCodeQuery" type="text" placeholder="品番で絞込" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input v-model="skuQuery" type="text" placeholder="SKUで絞込" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input v-model="asinQuery" type="text" placeholder="ASINで絞込" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-medium text-slate-400">在庫ゼロ:</span>
                <button
                    v-for="btn in ZERO_STOCK_BUTTONS"
                    :key="btn.key"
                    type="button"
                    class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                    :class="activeConditions.includes(btn.key) ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'"
                    @click="toggleCondition(btn.key)"
                >
                    {{ btn.label }}
                </button>
                <span class="ml-3 text-xs font-medium text-slate-400">在庫あり:</span>
                <button
                    v-for="btn in HAS_STOCK_BUTTONS"
                    :key="btn.key"
                    type="button"
                    class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                    :class="activeConditions.includes(btn.key) ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'"
                    @click="toggleCondition(btn.key)"
                >
                    {{ btn.label }}
                </button>
                <button v-if="hasActiveFilters" type="button" class="ml-auto text-xs font-medium text-blue-600 hover:underline" @click="clearFilters"> 条件をクリア </button>
            </div>

            <p class="text-xs text-slate-400"
                >該当SKU: <span class="font-semibold text-slate-700">{{ matchedSkuCount }}</span> / 全{{ totalSkuCount }}件</p
            >
        </section>

        <div v-if="filteredProducts.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-400">
            条件に一致するSKUがありません（0件）。
        </div>

        <section v-for="product in filteredProducts" :key="product.productCode" class="rounded-xl border border-slate-200 bg-white">
            <div class="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p class="text-sm font-semibold text-slate-900">
                        {{ product.productCode }} <span class="font-normal text-slate-600">{{ product.productName }}</span>
                    </p>
                    <div class="mt-1 flex gap-1.5">
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ product.brand }}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ product.category }}</span>
                    </div>
                </div>
                <div class="w-full lg:w-80">
                    <label class="mb-1 block text-xs font-medium text-slate-400">品番メモ</label>
                    <MemoField :model-value="product.memo" placeholder="品番メモを入力" @save="(v) => surveysStore.updateProductMemo(survey!.id, product.productCode, v)" />
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full min-w-225 text-left text-sm">
                    <thead class="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                        <tr>
                            <th rowspan="2" class="px-3 py-2 align-bottom">SKU</th>
                            <th rowspan="2" class="px-3 py-2 align-bottom">カラー / サイズ</th>
                            <th rowspan="2" class="px-3 py-2 align-bottom">ASIN</th>
                            <th colspan="2" class="border-l border-slate-200 px-3 py-1 text-center">Amazon</th>
                            <th colspan="2" class="border-l border-slate-200 px-3 py-1 text-center">BOSS</th>
                            <th rowspan="2" class="border-l border-slate-200 px-3 py-2 text-right align-bottom">フリー在庫</th>
                            <th rowspan="2" class="px-3 py-2 text-right align-bottom">ECストック</th>
                            <th rowspan="2" class="w-64 px-3 py-2 align-bottom">SKUメモ</th>
                        </tr>
                        <tr>
                            <th class="border-l border-slate-200 px-3 py-1 text-right font-normal normal-case">自社</th>
                            <th class="px-3 py-1 text-right font-normal normal-case">FBA</th>
                            <th class="border-l border-slate-200 px-3 py-1 text-right font-normal normal-case">自社</th>
                            <th class="px-3 py-1 text-right font-normal normal-case">RFC</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="sku in product.skus" :key="sku.skuCode" :class="isZero(sku.stock) ? 'bg-slate-50/60' : ''">
                            <td class="px-3 py-2.5 font-medium text-slate-900">{{ sku.skuCode }}</td>
                            <td class="px-3 py-2.5 text-slate-600">{{ sku.colorName }} / {{ sku.size }}</td>
                            <td class="px-3 py-2.5 text-slate-500">{{ sku.asin }}</td>
                            <td
                                v-for="field in STOCK_FIELDS"
                                :key="field.key"
                                class="px-3 py-2.5 text-right tabular-nums"
                                :class="[
                                    field.key === 'amazonOwn' || field.key === 'bossOwn' || field.key === 'freeStock' ? 'border-l border-slate-100' : '',
                                    sku.stock[field.key] === 0 ? 'text-slate-300' : 'font-semibold text-slate-900',
                                ]"
                            >
                                {{ sku.stock[field.key] }}
                            </td>
                            <td class="px-3 py-2.5">
                                <MemoField :model-value="sku.memo" placeholder="SKUメモ" @save="(v) => surveysStore.updateSkuMemo(survey!.id, sku.skuCode, v)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>
