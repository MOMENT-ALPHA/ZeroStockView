<script setup lang="ts">
import { computed, ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
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
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
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

function startDragging(event: DragEvent, index: number) {
    draggedIndex.value = index;
    dragOverIndex.value = index;

    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", workingCodes.value[index] ?? "");
    }
}

function dragOver(index: number) {
    if (draggedIndex.value === null) return;
    dragOverIndex.value = index;
}

function dropAt(index: number) {
    const fromIndex = draggedIndex.value;
    if (fromIndex === null || fromIndex === index) {
        stopDragging();
        return;
    }

    const [movedCode] = workingCodes.value.splice(fromIndex, 1);
    if (movedCode) workingCodes.value.splice(index, 0, movedCode);
    stopDragging();
}

function stopDragging() {
    draggedIndex.value = null;
    dragOverIndex.value = null;
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
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 class="text-xl font-semibold text-slate-900">取込設定</h1>
                <p class="mt-1 text-sm text-slate-500">取込対象の品番を選択・削除し、並び順を設定します（1〜{{ MAX_TARGET_PRODUCTS }}件）。</p>
            </div>
            <div class="flex shrink-0 flex-col gap-2 sm:items-end">
                <div class="flex flex-wrap gap-2">
                    <BaseButton variant="primary" :disabled="!dirty" @click="save">この設定を保存</BaseButton>
                    <BaseButton variant="secondary" :disabled="!dirty" @click="resetChanges">変更を取り消す</BaseButton>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <p v-if="store.lastSyncedAt" class="text-xs text-slate-400">最終更新: {{ formatDateTime(store.lastSyncedAt) }}</p>
                    <span v-if="dirty" class="text-xs font-medium text-amber-600">未保存の変更があります</span>
                </div>
            </div>
        </div>

        <div class="grid items-start gap-6 lg:grid-cols-2">
            <BaseCard title="取込済み品番" description="ドラッグして表示順を並び替えられます。" :padded="false" class="lg:order-2">
                <template #actions>
                    <span class="text-xs font-medium text-slate-500">{{ workingCodes.length }} / {{ MAX_TARGET_PRODUCTS }}</span>
                </template>

                <BaseEmpty v-if="selectedProducts.length === 0" title="対象品番が設定されていません" description="品番追加から追加してください。" />

                <ul v-else class="max-h-[36rem] divide-y divide-slate-100 overflow-y-auto">
                    <li
                        v-for="(product, index) in selectedProducts"
                        :key="product.productCode"
                        draggable="true"
                        class="flex cursor-grab items-center justify-between gap-3 px-4 py-3 transition-colors active:cursor-grabbing"
                        :class="{
                            'bg-primary-50 ring-2 ring-primary-300 ring-inset': dragOverIndex === index && draggedIndex !== index,
                            'opacity-50': draggedIndex === index,
                        }"
                        @dragstart="startDragging($event, index)"
                        @dragover.prevent="dragOver(index)"
                        @drop.prevent="dropAt(index)"
                        @dragend="stopDragging"
                    >
                        <div class="flex min-w-0 items-center gap-2.5">
                            <AppIcon name="drag_indicator" :size="20" class="text-slate-400" />
                            <span class="w-5 shrink-0 text-center text-xs tabular-nums text-slate-400">{{ index + 1 }}</span>
                            <div class="min-w-0">
                                <p class="truncate text-sm font-medium text-slate-900">{{ product.productCode }}</p>
                                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                                    <BaseBadge>{{ product.brand }}</BaseBadge>
                                    <BaseBadge>{{ product.category }}</BaseBadge>
                                    <span class="text-xs text-slate-400">SKU {{ product.skus.length }}件</span>
                                </div>
                            </div>
                        </div>
                        <BaseButton variant="danger-ghost" size="sm" icon="delete" aria-label="対象から削除" @click="remove(product.productCode)" />
                    </li>
                </ul>
            </BaseCard>

            <BaseCard title="品番を追加" :padded="false" class="lg:order-1">
                <div class="grid grid-cols-2 gap-2 border-b border-slate-200 px-5 py-4">
                    <div class="col-span-2"><BaseInput v-model="search" size="sm" placeholder="品番で検索" /></div>
                    <BaseSelect v-model="brandFilter" size="sm" :options="brandOptions" placeholder="すべてのブランド" />
                    <BaseSelect v-model="categoryFilter" size="sm" :options="categoryOptions" placeholder="すべてのカテゴリ" />
                </div>

                <BaseEmpty v-if="candidateProducts.length === 0" icon="search_off" title="条件に一致する追加可能な品番がありません" />
                <ul v-else class="max-h-[36rem] divide-y divide-slate-100 overflow-y-auto">
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
    </div>
</template>
