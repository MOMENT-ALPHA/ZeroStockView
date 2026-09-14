<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseTextarea from "@/components/ui/BaseTextarea.vue";

const props = withDefaults(
    defineProps<{
        modelValue: string;
        multiline?: boolean;
        placeholder?: string;
        rows?: number;
    }>(),
    {
        multiline: false,
        placeholder: "メモを入力",
        rows: 2,
    },
);

const emit = defineEmits<{ "update:modelValue": [string]; save: [string] }>();

const text = ref(props.modelValue);
const saved = ref(false);
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let savedFlashTimer: ReturnType<typeof setTimeout> | undefined;

watch(
    () => props.modelValue,
    (v) => {
        text.value = v;
    },
);

function onInput(value: string) {
    text.value = value;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(commit, 700);
}

function commit() {
    if (text.value === props.modelValue) return;
    emit("update:modelValue", text.value);
    emit("save", text.value);
    saved.value = true;
    clearTimeout(savedFlashTimer);
    savedFlashTimer = setTimeout(() => (saved.value = false), 1600);
}

onBeforeUnmount(() => {
    clearTimeout(saveTimer);
    clearTimeout(savedFlashTimer);
});
</script>

<template>
    <div class="relative">
        <BaseTextarea v-if="multiline" :model-value="text" :placeholder="placeholder" :rows="rows" @update:model-value="onInput" />
        <BaseInput v-else :model-value="text" size="sm" :placeholder="placeholder" @update:model-value="onInput" />
        <Transition name="fade">
            <span v-if="saved" class="absolute top-full left-0 z-10 mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                保存しました
            </span>
        </Transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
