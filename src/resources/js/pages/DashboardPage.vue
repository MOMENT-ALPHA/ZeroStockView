<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseEmpty from "@/components/ui/BaseEmpty.vue";
import { useSurveysStore } from "@/stores/surveys";
import { formatDateTime } from "@/utils/format";

const router = useRouter();
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

const previewProducts = computed(() => latest.value?.products ?? []);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div>
            <h1 class="text-xl font-semibold text-slate-900">ダッシュボード</h1>
            <p class="mt-1 text-sm text-slate-500">最新の在庫調査結果を表示します。</p>
        </div>

        <BaseEmpty v-if="!latest" title="まだ調査が実施されていません" description="データ取込画面から在庫調査を実行してください。">
            <BaseButton variant="primary" @click="router.push({ name: 'data-import' })">データ取込へ進む</BaseButton>
        </BaseEmpty>

        <template v-else>
            <BaseCard>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="text-sm text-slate-600">
                        調査日時: <span class="font-semibold text-slate-900">{{ formatDateTime(latest.executedAt) }}</span>
                    </div>
                    <BaseButton variant="primary" @click="router.push({ name: 'survey-result', params: { id: latest.id } })">調査結果を見る</BaseButton>
                </div>
            </BaseCard>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <BaseCard>
                    <p class="text-xs text-slate-400">対象品番</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.productCount }}</p>
                </BaseCard>
                <BaseCard>
                    <p class="text-xs text-slate-400">対象SKU</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.skuCount }}</p>
                </BaseCard>
                <BaseCard>
                    <p class="text-xs text-slate-400">全区分ゼロSKU</p>
                    <p class="mt-1 text-2xl font-semibold text-rose-600">{{ stats!.zeroSkuCount }}</p>
                </BaseCard>
                <BaseCard>
                    <p class="text-xs text-slate-400">フリー在庫 合計</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.freeStockTotal }}</p>
                </BaseCard>
                <BaseCard>
                    <p class="text-xs text-slate-400">ECストック 合計</p>
                    <p class="mt-1 text-2xl font-semibold text-slate-900">{{ stats!.ecStockTotal }}</p>
                </BaseCard>
            </div>

            <BaseCard title="品番プレビュー" :padded="false">
                <template #actions>
                    <RouterLink :to="{ name: 'survey-result', params: { id: latest.id } }" class="text-sm text-primary-600 hover:underline">詳細を見る</RouterLink>
                </template>
                <ul class="divide-y divide-slate-100">
                    <li v-for="product in previewProducts" :key="product.productCode" class="flex items-center justify-between gap-3 px-5 py-3">
                        <div class="min-w-0">
                            <p class="truncate text-sm font-medium text-slate-900">
                                {{ product.productCode }}
                            </p>
                            <p class="text-xs text-slate-400">{{ product.brand }} ／ {{ product.category }} ／ SKU {{ product.skus.length }}件</p>
                        </div>
                        <span class="shrink-0 text-xs text-slate-400">
                            ゼロ在庫SKU {{ product.skus.filter((s) => Object.values(s.stock).every((v) => v === 0)).length }} / {{ product.skus.length }}
                        </span>
                    </li>
                </ul>
            </BaseCard>
        </template>
    </div>
</template>
