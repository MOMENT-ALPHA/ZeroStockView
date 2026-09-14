<script setup lang="ts">
import { computed, ref } from "vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { MAX_SURVEY_HISTORY, useSurveysStore } from "@/stores/surveys";
import { useToastStore } from "@/stores/toast";
import { formatDateTime } from "@/utils/format";

const surveys = useSurveysStore();
const toast = useToastStore();

const list = computed(() => surveys.sortedSurveys);
const latestId = computed(() => surveys.latestSurvey?.id);

function skuCount(id: string): number {
    return surveys.getSurvey(id)?.products.reduce((sum, p) => sum + p.skus.length, 0) ?? 0;
}

const pendingDeleteId = ref<string | null>(null);
const pendingDeleteLabel = computed(() => {
    const survey = list.value.find((s) => s.id === pendingDeleteId.value);
    return survey ? formatDateTime(survey.executedAt) : "";
});

function requestDelete(id: string) {
    pendingDeleteId.value = id;
}

function confirmDelete() {
    if (!pendingDeleteId.value) return;
    surveys.removeSurvey(pendingDeleteId.value);
    toast.push("調査履歴を削除しました");
    pendingDeleteId.value = null;
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <div>
            <h1 class="text-xl font-semibold text-slate-900">在庫調査履歴</h1>
            <p class="mt-1 text-sm text-slate-500">
                調査結果を新しい順に一覧表示します（最大{{ MAX_SURVEY_HISTORY }}件保持、{{ MAX_SURVEY_HISTORY + 1 }}件目以降は自動的に削除されます）。全{{ list.length }}件。
            </p>
        </div>

        <div v-if="list.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-400"> 調査履歴がありません。 </div>

        <div v-else class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                    <tr>
                        <th class="px-4 py-2.5">調査日時</th>
                        <th class="px-4 py-2.5">対象品番数</th>
                        <th class="px-4 py-2.5">SKU数</th>
                        <th class="px-4 py-2.5">取込ファイル数</th>
                        <th class="px-4 py-2.5"></th>
                        <th class="w-40 px-4 py-2.5 text-right">操作</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr v-for="survey in list" :key="survey.id" class="hover:bg-slate-50">
                        <td class="px-4 py-3 font-medium text-slate-900">{{ formatDateTime(survey.executedAt) }}</td>
                        <td class="px-4 py-3 text-slate-600">{{ survey.products.length }}</td>
                        <td class="px-4 py-3 text-slate-600">{{ skuCount(survey.id) }}</td>
                        <td class="px-4 py-3 text-slate-600">{{ survey.files.length }}</td>
                        <td class="px-4 py-3">
                            <span v-if="survey.id === latestId" class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"> 最新 </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <div class="flex justify-end gap-2">
                                <RouterLink
                                    :to="{ name: 'survey-result', params: { id: survey.id } }"
                                    class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    結果を開く
                                </RouterLink>
                                <button type="button" class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50" @click="requestDelete(survey.id)">
                                    削除
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <ConfirmModal
            :open="pendingDeleteId !== null"
            title="調査履歴の削除"
            :message="`${pendingDeleteLabel} の調査結果を削除します。関連するメモと取込ファイルも削除され、元に戻せません。`"
            @cancel="pendingDeleteId = null"
            @confirm="confirmDelete"
        />
    </div>
</template>
