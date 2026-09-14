<script setup lang="ts">
import { ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { formatSizeKb } from "@/utils/format";

const props = defineProps<{
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
    <div>
        <div
            v-if="!props.modelValue"
            class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors"
            :class="dragging ? 'border-primary-400 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'"
            @click="openPicker"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
        >
            <AppIcon name="upload_file" :size="32" class="mb-2 text-slate-400" />
            <p class="text-sm text-slate-600"> <span class="font-medium text-primary-600">クリックして選択</span> またはドラッグ&ドロップ </p>
            <p class="mt-0.5 text-xs text-slate-400">{{ props.accept }}</p>
        </div>

        <div v-else class="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div class="flex min-w-0 items-center gap-2">
                <AppIcon name="description" :size="24" class="shrink-0 text-emerald-600" />
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-slate-800">{{ props.modelValue?.name }}</p>
                    <p class="text-xs text-slate-500">{{ formatSizeKb(Math.round(props.modelValue!.size / 1024)) }}</p>
                </div>
            </div>
            <div class="flex shrink-0 items-center gap-1">
                <BaseButton variant="ghost" size="sm" @click="openPicker">差し替え</BaseButton>
                <BaseButton variant="ghost" size="sm" icon="close" aria-label="削除" @click="clear" />
            </div>
        </div>
        <input ref="inputRef" type="file" :accept="props.accept" class="hidden" @change="onInputChange" />
    </div>
</template>
