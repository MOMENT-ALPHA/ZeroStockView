import { defineStore } from "pinia";
import type { Survey } from "@/types";
import { createDummySurveys, createSurveyRecord } from "@/constants/dummySurveys";
import { useImportSettingsStore } from "@/stores/importSettings";

export const MAX_SURVEY_HISTORY = 100;

export const useSurveysStore = defineStore("surveys", {
    state: () => ({
        surveys: [] as Survey[],
        initialized: false,
    }),
    getters: {
        sortedSurveys: (state) => [...state.surveys].sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()),
        latestSurvey(): Survey | null {
            return this.sortedSurveys[0] ?? null;
        },
    },
    actions: {
        ensureSeeded() {
            if (this.initialized && this.surveys.length > 0) return;
            const importSettings = useImportSettingsStore();
            this.surveys = createDummySurveys(importSettings.selectedProductCodes);
            this.initialized = true;
        },
        getSurvey(id: string): Survey | undefined {
            return this.surveys.find((s) => s.id === id);
        },
        runImport(productCodes: string[]): Survey {
            const id = `SV-${Date.now()}`;
            const survey = createSurveyRecord(id, new Date().toISOString(), productCodes, false);
            this.surveys.unshift(survey);
            if (this.surveys.length > MAX_SURVEY_HISTORY) {
                this.surveys = this.surveys.slice(0, MAX_SURVEY_HISTORY);
            }
            return survey;
        },
        removeSurvey(id: string) {
            this.surveys = this.surveys.filter((s) => s.id !== id);
        },
        updateProductMemo(surveyId: string, productCode: string, memo: string) {
            const survey = this.getSurvey(surveyId);
            const product = survey?.products.find((p) => p.productCode === productCode);
            if (product) product.memo = memo;
        },
        updateSkuMemo(surveyId: string, skuCode: string, memo: string) {
            const survey = this.getSurvey(surveyId);
            if (!survey) return;
            for (const product of survey.products) {
                const sku = product.skus.find((s) => s.skuCode === skuCode);
                if (sku) {
                    sku.memo = memo;
                    return;
                }
            }
        },
        removeFile(surveyId: string, fileId: string) {
            const survey = this.getSurvey(surveyId);
            if (!survey) return;
            survey.files = survey.files.filter((f) => f.id !== fileId);
        },
        removeFiles(surveyId: string, fileIds: string[]) {
            const survey = this.getSurvey(surveyId);
            if (!survey) return;
            survey.files = survey.files.filter((f) => !fileIds.includes(f.id));
        },
    },
    persist: {
        key: "zsv-surveys",
        storage: localStorage,
    },
});
