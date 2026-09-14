<script setup lang="ts">
import { computed, ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { formatSizeKb } from "@/utils/format";

const props = withDefaults(
    defineProps<{
        accept: string;
        modelValue: File | null;
        title?: string;
        description?: string;
        icon?: string;
    }>(),
    { title: "", description: "", icon: "description" },
);

const emit = defineEmits<{ "update:modelValue": [File | null] }>();

const dragging = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const acceptHint = computed(() => `${props.accept.replace(/^\./, "").toUpperCase()}形式のファイルを選択してください`);

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
    if (inputRef.value) inputRef.value.value = "";
}
</script>

<template>
    <label
        class="flex min-h-64 cursor-pointer flex-col rounded-lg border-2 border-dashed p-5 shadow-sm transition sm:p-6"
        :class="[
            props.modelValue ? 'border-primary-300 bg-primary-50/40' : 'border-slate-300 bg-white hover:border-primary-400',
            dragging ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-100' : '',
        ]"
        @dragenter.prevent="dragging = true"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent.stop="onDrop"
    >
        <span v-if="props.title" class="flex items-start gap-4">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-700">
                <AppIcon :name="props.icon" :size="24" />
            </span>
            <span class="min-w-0">
                <span class="block font-semibold text-slate-950">{{ props.title }}</span>
                <span v-if="props.description" class="block text-sm text-slate-500">{{ props.description }}</span>
            </span>
        </span>

        <span class="mt-6 flex flex-1 flex-col items-center justify-center rounded-md bg-slate-100 p-5 text-center">
            <AppIcon :name="props.modelValue ? 'check_circle' : 'upload_file'" :size="32" class="text-slate-400" />
            <span class="mt-2 text-sm font-semibold text-primary-700">{{ props.modelValue ? "選択済み" : "CSVをドロップまたはクリックして選択" }}</span>
            <span class="mt-1 text-xs text-slate-500">{{ acceptHint }}</span>
        </span>

        <span v-if="props.modelValue" class="mt-4 flex items-center gap-2 rounded-lg border border-primary-200 bg-white p-3 text-sm">
            <AppIcon name="attach_file" :size="18" class="shrink-0 text-primary-600" />
            <span class="min-w-0 flex-1 truncate text-slate-700">{{ props.modelValue.name }}（{{ formatSizeKb(Math.round(props.modelValue.size / 1024)) }}）</span>
            <button type="button" class="shrink-0 text-slate-400 transition hover:text-slate-600" aria-label="削除" @click.prevent.stop="clear">
                <AppIcon name="close" :size="18" />
            </button>
        </span>

        <input ref="inputRef" type="file" :accept="props.accept" class="sr-only" @change="onInputChange" />
    </label>
</template>
