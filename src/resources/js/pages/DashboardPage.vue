<script setup lang="ts">
import { computed } from "vue";
import { useSurveysStore } from "@/stores/surveys";
import { formatDateTime } from "@/utils/format";

const surveys = useSurveysStore();
const latest = computed(() => surveys.latestSurvey);

const stats = computed(() => {
    const survey = latest.value;
    if (!survey) return null;
    const skus = survey.products.flatMap((p) => p.skus);
    const zeroSkuCount = skus.filter((s) => Object.values(s.stock).every((v) => v === 0)).length;
    const freeStockTotal = skus.reduce((sum, s) => sum + s.stock.freeStock, 0);
    const ecStockTotal = skus.reduce((sum, s) => sum + s.stock.ecStock, 0);
    return {
        productCount: survey.products.length,
        skuCount: skus.length,
        zeroSkuCount,
        freeStockTotal,
        ecStockTotal,
    };
});

const previewProducts = computed(() => latest.value?.products.slice(0, 5) ?? []);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div>
            <h1 class="text-xl font-semibold text-slate-900">ダッシュボード</h1>
            <p class="mt-1 text-sm text-slate-500">最新の在庫調査結果を表示します。</p>
        </div>

        <div v-if="!latest" class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p class="text-sm font-medium text-slate-600">まだ調査が実施されていません。</p>
            <RouterLink :to="{ name: 'data-import' }" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"> データ取込へ進む </RouterLink>
        </div>

        <template v-else>
            <div class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="text-sm text-slate-600">
                    調査日時: <span class="font-semibold text-slate-900">{{ formatDateTime(latest.executedAt) }}</span>
                </div>
                <RouterLink
                    :to="{ name: 'survey-result', params: { id: latest.id } }"
                    class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    調査結果を見る
                </RouterLink>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                    <p class="text-xs text-slate-400">対象品番</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.productCount }}</p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                    <p class="text-xs text-slate-400">対象SKU</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.skuCount }}</p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                    <p class="text-xs text-slate-400">全区分ゼロSKU</p>
                    <p class="mt-1 text-2xl font-semibold text-red-600">{{ stats!.zeroSkuCount }}</p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                    <p class="text-xs text-slate-400">フリー在庫 合計</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.freeStockTotal }}</p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                    <p class="text-xs text-slate-400">ECストック 合計</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.ecStockTotal }}</p>
                </div>
            </div>

            <section class="rounded-xl border border-slate-200 bg-white">
                <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <h2 class="text-sm font-semibold text-slate-800">品番プレビュー（先頭5件）</h2>
                    <RouterLink :to="{ name: 'survey-result', params: { id: latest.id } }" class="text-sm text-blue-600 hover:underline"> すべて見る </RouterLink>
                </div>
                <ul class="divide-y divide-slate-100">
                    <li v-for="product in previewProducts" :key="product.productCode" class="flex items-center justify-between gap-3 px-4 py-3">
                        <div class="min-w-0">
                            <p class="truncate text-sm font-medium text-slate-900">
                                {{ product.productCode }} <span class="font-normal text-slate-600">{{ product.productName }}</span>
                            </p>
                            <p class="text-xs text-slate-400">{{ product.brand }} ／ {{ product.category }} ／ SKU {{ product.skus.length }}件</p>
                        </div>
                        <span class="shrink-0 text-xs text-slate-400">
                            ゼロ在庫SKU {{ product.skus.filter((s) => Object.values(s.stock).every((v) => v === 0)).length }} / {{ product.skus.length }}
                        </span>
                    </li>
                </ul>
            </section>
        </template>
    </div>
</template>
