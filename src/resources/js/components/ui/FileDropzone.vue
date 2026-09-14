<script setup lang="ts">
import { ref } from "vue";
import { formatSizeKb } from "@/utils/format";

const props = defineProps<{
    label: string;
    hint: string;
    accept: string;
    modelValue: File | null;
}>();

const emit = defineEmits<{ "update:modelValue": [File | null] }>();

const dragging = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

function openPicker() {
    inputRef.value?.click();
}

function onDrop(e: DragEvent) {
    dragging.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) emit("update:modelValue", file);
}

function onInputChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    if (file) emit("update:modelValue", file);
    (e.target as HTMLInputElement).value = "";
}

function clear() {
    emit("update:modelValue", null);
}
</script>

<template>
    <div class="flex flex-col gap-1.5">
        <div class="flex items-baseline justify-between">
            <span class="text-sm font-semibold text-slate-800">{{ props.label }}</span>
            <span class="text-xs text-slate-400">{{ props.hint }}</span>
        </div>

        <div
            v-if="!props.modelValue"
            class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors"
            :class="dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'"
            @click="openPicker"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
        >
            <svg class="mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3.75 3.75 0 0 1 4.157 3.7 4.5 4.5 0 0 1-1.302 8.955H6.75Z"
                />
            </svg>
            <p class="text-sm text-slate-600"> <span class="font-medium text-blue-600">クリックして選択</span> またはドラッグ&ドロップ </p>
            <p class="mt-0.5 text-xs text-slate-400">{{ props.accept }}</p>
        </div>

        <div v-else class="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <div class="flex min-w-0 items-center gap-2">
                <svg class="h-6 w-6 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                </svg>
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-slate-800">{{ props.modelValue?.name }}</p>
                    <p class="text-xs text-slate-500">{{ formatSizeKb(Math.round(props.modelValue!.size / 1024)) }}</p>
                </div>
            </div>
            <div class="flex shrink-0 items-center gap-1">
                <button type="button" class="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100" @click="openPicker"> 差し替え </button>
                <button type="button" class="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600" @click="clear">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        <input ref="inputRef" type="file" :accept="props.accept" class="hidden" @change="onInputChange" />
    </div>
</template>
