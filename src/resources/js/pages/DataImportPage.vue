<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import BaseAlert from "@/components/ui/BaseAlert.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseToggle from "@/components/ui/BaseToggle.vue";
import FileDropzone from "@/components/ui/FileDropzone.vue";
import { useImportSettingsStore } from "@/stores/importSettings";
import { useSurveysStore } from "@/stores/surveys";
import { useUiStore } from "@/stores/ui";
import { IMPORT_FILE_TYPES, type ImportFileType } from "@/types";

const importSettings = useImportSettingsStore();
const surveys = useSurveysStore();
const toast = useUiStore();
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
            <p class="mt-1 text-sm text-slate-500">5種類のファイルを添付し、取込・調査を実行します。実行前に取込対象品番の商品情報を最新化します。</p>
        </div>

        <BaseAlert v-if="!importSettings.isConfigured" tone="warning">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>取込対象品番が未設定です。先に取込設定で対象品番を選択してください。</span>
                <BaseButton variant="primary" size="sm" @click="router.push({ name: 'import-settings' })">取込設定へ</BaseButton>
            </div>
        </BaseAlert>
        <BaseAlert v-else tone="info">
            取込対象品番: <span class="font-semibold">{{ importSettings.count }}件</span> 設定済み（<RouterLink
                :to="{ name: 'import-settings' }"
                class="text-primary-700 underline hover:text-primary-800"
                >変更する</RouterLink
            >）
        </BaseAlert>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FileDropzone
                v-for="fileType in IMPORT_FILE_TYPES"
                :key="fileType.type"
                :accept="accepts[fileType.type]"
                :model-value="files[fileType.type]"
                :title="fileType.type"
                :description="`${fileType.format} ／ ${fileType.stockScope}`"
                :icon="fileType.icon"
                @update:model-value="(f) => setFile(fileType.type, f)"
            />
        </div>

        <BaseAlert v-if="errorMessage" tone="danger" title="取込に失敗しました">{{ errorMessage }}</BaseAlert>

        <BaseCard>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="text-sm text-slate-600">
                    添付状況:
                    <span class="font-semibold" :class="allFilesReady ? 'text-emerald-600' : 'text-slate-900'">{{ readyFileCount }} / {{ IMPORT_FILE_TYPES.length }}</span>
                    ファイル
                </div>
                <BaseButton variant="primary" icon="play_arrow" :disabled="!canRun" :loading="running" @click="runImport">
                    {{ running ? "実行中…" : "取込・調査を実行" }}
                </BaseButton>
            </div>
        </BaseCard>

        <BaseToggle v-model="simulateError" label="（確認用）エラー表示のデモを有効にする" />
    </div>
</template>
