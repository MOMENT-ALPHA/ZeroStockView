<script setup lang="ts">
import { computed, ref } from "vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useSurveysStore } from "@/stores/surveys";
import { useToastStore } from "@/stores/toast";
import { daysSince, formatDateTime, formatSizeKb } from "@/utils/format";
import type { SurveyFile } from "@/types";

const surveysStore = useSurveysStore();
const toast = useToastStore();

const FILE_RETENTION_DAYS = 30;

const groups = computed(() =>
    surveysStore.sortedSurveys.map((survey) => ({
        survey,
        files: survey.files.filter((f) => daysSince(f.uploadedAt) <= FILE_RETENTION_DAYS),
    })),
);

function downloadFile(file: SurveyFile) {
    toast.push(`ダウンロードしました（デモ）: ${file.fileName}`);
}

function downloadZip(surveyId: string) {
    toast.push("取込ファイル一式をZIPダウンロードしました（デモ）");
    void surveyId;
}

const pendingSingleDelete = ref<{ surveyId: string; file: SurveyFile } | null>(null);
const pendingBulkDelete = ref<{ surveyId: string; count: number } | null>(null);

function requestDeleteFile(surveyId: string, file: SurveyFile) {
    pendingSingleDelete.value = { surveyId, file };
}

function confirmDeleteFile() {
    if (!pendingSingleDelete.value) return;
    const { surveyId, file } = pendingSingleDelete.value;
    surveysStore.removeFile(surveyId, file.id);
    toast.push("ファイルを削除しました");
    pendingSingleDelete.value = null;
}

function requestBulkDelete(surveyId: string, count: number) {
    pendingBulkDelete.value = { surveyId, count };
}

function confirmBulkDelete() {
    if (!pendingBulkDelete.value) return;
    const { surveyId } = pendingBulkDelete.value;
    const group = groups.value.find((g) => g.survey.id === surveyId);
    if (group) {
        surveysStore.removeFiles(
            surveyId,
            group.files.map((f) => f.id),
        );
    }
    toast.push("ファイルを一括削除しました");
    pendingBulkDelete.value = null;
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <div>
            <h1 class="text-xl font-semibold text-slate-900">ファイル管理</h1>
            <p class="mt-1 text-sm text-slate-500">
                調査ごとに取込ファイルを一覧表示します。アップロードから{{ FILE_RETENTION_DAYS }}日を経過したファイルは自動的に削除されます（調査結果・メモは残ります）。
            </p>
        </div>

        <div v-if="groups.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-400"> 調査履歴がありません。 </div>

        <section v-for="group in groups" :key="group.survey.id" class="rounded-xl border border-slate-200 bg-white">
            <div class="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-slate-900">{{ formatDateTime(group.survey.executedAt) }}</p>
                    <RouterLink :to="{ name: 'survey-result', params: { id: group.survey.id } }" class="text-xs text-blue-600 hover:underline"> 調査結果を見る </RouterLink>
                </div>
                <div v-if="group.files.length > 0" class="flex gap-2">
                    <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50" @click="downloadZip(group.survey.id)">
                        一括ダウンロード（ZIP）
                    </button>
                    <button
                        type="button"
                        class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        @click="requestBulkDelete(group.survey.id, group.files.length)"
                    >
                        一括削除
                    </button>
                </div>
            </div>

            <div v-if="group.files.length === 0" class="px-4 py-6 text-sm text-slate-400">
                取込ファイルはありません（保存期間の経過、または削除済み）。調査結果の閲覧・メモ編集・Excel出力は引き続き可能です。
            </div>

            <ul v-else class="divide-y divide-slate-100">
                <li v-for="file in group.files" :key="file.id" class="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div class="flex min-w-0 items-center gap-3">
                        <span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ file.type }}</span>
                        <div class="min-w-0">
                            <p class="truncate text-sm text-slate-800">{{ file.fileName }}</p>
                            <p class="text-xs text-slate-400">{{ formatDateTime(file.uploadedAt) }} ／ {{ formatSizeKb(file.sizeKb) }}</p>
                        </div>
                    </div>
                    <div class="flex shrink-0 gap-1">
                        <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="ダウンロード" @click="downloadFile(file)">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                        <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="削除" @click="requestDeleteFile(group.survey.id, file)">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                            </svg>
                        </button>
                    </div>
                </li>
            </ul>
        </section>

        <ConfirmModal
            :open="pendingSingleDelete !== null"
            title="ファイルの削除"
            :message="`「${pendingSingleDelete?.file.fileName}」を削除します。調査結果とメモは残りますが、ファイルは元に戻せません。`"
            @cancel="pendingSingleDelete = null"
            @confirm="confirmDeleteFile"
        />
        <ConfirmModal
            :open="pendingBulkDelete !== null"
            title="ファイルの一括削除"
            :message="`この調査に紐づく取込ファイル ${pendingBulkDelete?.count}件をすべて削除します。調査結果とメモは残ります。`"
            @cancel="pendingBulkDelete = null"
            @confirm="confirmBulkDelete"
        />
    </div>
</template>
