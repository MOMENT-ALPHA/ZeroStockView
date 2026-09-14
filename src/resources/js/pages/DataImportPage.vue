<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import FileDropzone from "@/components/ui/FileDropzone.vue";
import { useImportSettingsStore } from "@/stores/importSettings";
import { useSurveysStore } from "@/stores/surveys";
import { useToastStore } from "@/stores/toast";
import { IMPORT_FILE_TYPES, type ImportFileType } from "@/types";

const importSettings = useImportSettingsStore();
const surveys = useSurveysStore();
const toast = useToastStore();
const router = useRouter();

const accepts: Record<ImportFileType, string> = {
    在庫商品レポート: ".txt",
    FBA在庫管理レポート: ".csv",
    倉庫毎の在庫数レポート: ".csv",
    KEEP一覧表: ".csv",
    在庫一覧照会表: ".csv",
};

const files = reactive<Record<ImportFileType, File | null>>({
    在庫商品レポート: null,
    FBA在庫管理レポート: null,
    倉庫毎の在庫数レポート: null,
    KEEP一覧表: null,
    在庫一覧照会表: null,
});

const readyFileCount = computed(() => Object.values(files).filter((f) => f !== null).length);
const allFilesReady = computed(() => readyFileCount.value === IMPORT_FILE_TYPES.length);
const canRun = computed(() => importSettings.isConfigured && allFilesReady.value);

const running = ref(false);
const errorMessage = ref("");
const simulateError = ref(false);

function setFile(type: ImportFileType, file: File | null) {
    files[type] = file;
}

function runImport() {
    if (!canRun.value || running.value) return;
    errorMessage.value = "";
    running.value = true;

    setTimeout(() => {
        running.value = false;

        if (simulateError.value) {
            errorMessage.value = "「FBA在庫管理レポート」に必須列「Amazon出荷在庫(出荷可)」が見つかりません。ファイルの形式を確認し、差し替えてから再実行してください。";
            toast.push("取込に失敗しました", "error");
            return;
        }

        importSettings.resyncFromApi();
        const survey = surveys.runImport(importSettings.selectedProductCodes);
        toast.push("取込・調査が完了しました");
        router.push({ name: "survey-result", params: { id: survey.id } });
    }, 1100);
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <div>
            <h1 class="text-xl font-semibold text-slate-900">データ取込</h1>
            <p class="mt-1 text-sm text-slate-500"> 5種類のファイルを添付し、取込・調査を実行します。実行前に取込対象品番の商品情報を最新化します。 </p>
        </div>

        <div
            v-if="!importSettings.isConfigured"
            class="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between"
        >
            <span>取込対象品番が未設定です。先に取込設定で対象品番を選択してください。</span>
            <RouterLink
                :to="{ name: 'import-settings' }"
                class="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
                取込設定へ
            </RouterLink>
        </div>
        <div v-else class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            取込対象品番:
            <span class="font-semibold text-slate-900">{{ importSettings.count }}件</span>
            設定済み（<RouterLink :to="{ name: 'import-settings' }" class="text-blue-600 hover:underline">変更する</RouterLink>）
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div v-for="fileType in IMPORT_FILE_TYPES" :key="fileType.type" class="rounded-xl border border-slate-200 bg-white p-4">
                <FileDropzone
                    :label="fileType.type"
                    :hint="`${fileType.format} ／ ${fileType.stockScope}`"
                    :accept="accepts[fileType.type]"
                    :model-value="files[fileType.type]"
                    @update:model-value="(f) => setFile(fileType.type, f)"
                />
            </div>
        </div>

        <div v-if="errorMessage" class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
            </svg>
            <div>
                <p class="font-medium">取込に失敗しました</p>
                <p class="mt-0.5">{{ errorMessage }}</p>
            </div>
        </div>

        <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-slate-600">
                添付状況:
                <span class="font-semibold" :class="allFilesReady ? 'text-green-600' : 'text-slate-900'">{{ readyFileCount }} / {{ IMPORT_FILE_TYPES.length }}</span>
                ファイル
            </div>
            <button
                type="button"
                :disabled="!canRun || running"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                @click="runImport"
            >
                <svg v-if="running" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
                </svg>
                {{ running ? "実行中…" : "取込・調査を実行" }}
            </button>
        </div>

        <label class="flex w-fit items-center gap-2 text-xs text-slate-400">
            <input v-model="simulateError" type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300" />
            （確認用）エラー表示のデモを有効にする
        </label>
    </div>
</template>
