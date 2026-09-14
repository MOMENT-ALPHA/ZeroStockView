<script setup lang="ts">
import { computed, ref } from "vue";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseEmpty from "@/components/ui/BaseEmpty.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import { BRAND_LIST, CATEGORY_LIST, findProduct, PRODUCT_MASTER } from "@/constants/masterData";
import { MAX_TARGET_PRODUCTS, useImportSettingsStore } from "@/stores/importSettings";
import { useUiStore } from "@/stores/ui";
import type { SelectOption } from "@/types";
import { formatDateTime } from "@/utils/format";

const store = useImportSettingsStore();
const toast = useUiStore();

const workingCodes = ref<string[]>([...store.selectedProductCodes]);
const dirty = computed(() => JSON.stringify(workingCodes.value) !== JSON.stringify(store.selectedProductCodes));

const selectedProducts = computed(() => workingCodes.value.map((code) => findProduct(code)).filter((p): p is NonNullable<typeof p> => Boolean(p)));

const search = ref("");
const brandFilter = ref<string | null>(null);
const categoryFilter = ref<string | null>(null);
const brandOptions = computed<SelectOption[]>(() => BRAND_LIST.map((b) => ({ value: b, label: b })));
const categoryOptions = computed<SelectOption[]>(() => CATEGORY_LIST.map((c) => ({ value: c, label: c })));

const candidateProducts = computed(() =>
    PRODUCT_MASTER.filter((p) => !workingCodes.value.includes(p.productCode))
        .filter((p) => !brandFilter.value || p.brand === brandFilter.value)
        .filter((p) => !categoryFilter.value || p.category === categoryFilter.value)
        .filter((p) => {
            if (!search.value) return true;
            const q = search.value.toLowerCase();
            return p.productCode.toLowerCase().includes(q);
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

        <BaseCard title="設定済み品番" :padded="false">
            <template #actions>
                <span class="text-xs font-medium text-slate-500">{{ workingCodes.length }} / {{ MAX_TARGET_PRODUCTS }}</span>
            </template>

            <BaseEmpty v-if="selectedProducts.length === 0" title="対象品番が設定されていません" description="下の一覧から追加してください。" />

            <div v-else class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                        <tr>
                            <th class="w-20 px-3 py-2">並び順</th>
                            <th class="px-3 py-2">品番</th>
                            <th class="px-3 py-2">ブランド</th>
                            <th class="px-3 py-2">カテゴリ</th>
                            <th class="px-3 py-2">SKU数</th>
                            <th class="w-16 px-3 py-2 text-right">削除</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="(product, index) in selectedProducts" :key="product.productCode">
                            <td class="px-3 py-2">
                                <div class="flex items-center gap-1">
                                    <span class="w-5 text-slate-400">{{ index + 1 }}</span>
                                    <BaseButton variant="ghost" size="sm" icon="arrow_upward" aria-label="上へ" :disabled="index === 0" @click="moveUp(index)" />
                                    <BaseButton variant="ghost" size="sm" icon="arrow_downward" aria-label="下へ" :disabled="index === selectedProducts.length - 1" @click="moveDown(index)" />
                                </div>
                            </td>
                            <td class="px-3 py-2 font-medium text-slate-900">{{ product.productCode }}</td>
                            <td class="px-3 py-2"
                                ><BaseBadge>{{ product.brand }}</BaseBadge></td
                            >
                            <td class="px-3 py-2"
                                ><BaseBadge>{{ product.category }}</BaseBadge></td
                            >
                            <td class="px-3 py-2 text-slate-500">{{ product.skus.length }}</td>
                            <td class="px-3 py-2 text-right">
                                <BaseButton variant="danger-ghost" size="sm" icon="delete" aria-label="対象から削除" @click="remove(product.productCode)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </BaseCard>

        <div class="flex flex-wrap items-center gap-3">
            <BaseButton variant="primary" :disabled="!dirty" @click="save">この設定を保存</BaseButton>
            <BaseButton variant="secondary" :disabled="!dirty" @click="resetChanges">変更を取り消す</BaseButton>
            <span v-if="dirty" class="text-xs font-medium text-amber-600">未保存の変更があります</span>
        </div>

        <BaseCard title="品番を追加" :padded="false">
            <template #actions>
                <div class="flex flex-wrap items-center gap-2">
                    <div class="w-48"><BaseInput v-model="search" size="sm" placeholder="品番で検索" /></div>
                    <div class="w-40"><BaseSelect v-model="brandFilter" size="sm" :options="brandOptions" placeholder="すべてのブランド" /></div>
                    <div class="w-40"><BaseSelect v-model="categoryFilter" size="sm" :options="categoryOptions" placeholder="すべてのカテゴリ" /></div>
                </div>
            </template>

            <BaseEmpty v-if="candidateProducts.length === 0" icon="search_off" title="条件に一致する追加可能な品番がありません" />
            <ul v-else class="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                <li v-for="product in candidateProducts" :key="product.productCode" class="flex items-center justify-between gap-3 px-5 py-2.5">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-slate-900">
                            {{ product.productCode }}
                        </p>
                        <p class="text-xs text-slate-400">{{ product.brand }} ／ {{ product.category }} ／ SKU {{ product.skus.length }}件</p>
                    </div>
                    <BaseButton variant="secondary" size="sm" icon="add" :disabled="workingCodes.length >= MAX_TARGET_PRODUCTS" @click="add(product.productCode)">追加</BaseButton>
                </li>
            </ul>
        </BaseCard>
    </div>
</template>
