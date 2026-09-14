<script setup lang="ts">
import { ref, watch } from "vue";

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
let savedTimer: ReturnType<typeof setTimeout> | undefined;

watch(
    () => props.modelValue,
    (v) => {
        text.value = v;
    },
);

function commit() {
    if (text.value === props.modelValue) return;
    emit("update:modelValue", text.value);
    emit("save", text.value);
    saved.value = true;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => (saved.value = false), 1600);
}
</script>

<template>
    <div class="relative">
        <textarea
            v-if="multiline"
            v-model="text"
            :placeholder="placeholder"
            :rows="rows"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            @blur="commit"
        />
        <input
            v-else
            v-model="text"
            type="text"
            :placeholder="placeholder"
            class="w-full min-w-40 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            @blur="commit"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
        <Transition name="fade">
            <span v-if="saved" class="absolute top-full left-0 mt-0.5 flex items-center gap-1 text-xs font-medium text-green-600">
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
