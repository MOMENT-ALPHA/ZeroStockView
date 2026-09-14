<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
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

type SaveState = "idle" | "saving" | "saved";

const text = ref(props.modelValue);
const state = ref<SaveState>("idle");
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let savingTimer: ReturnType<typeof setTimeout> | undefined;
let savedTimer: ReturnType<typeof setTimeout> | undefined;

watch(
    () => props.modelValue,
    (v) => {
        text.value = v;
    },
);

function onInput(value: string) {
    text.value = value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(commit, 700);
}

function commit() {
    if (text.value === props.modelValue) return;
    state.value = "saving";
    clearTimeout(savingTimer);
    clearTimeout(savedTimer);
    savingTimer = setTimeout(() => {
        emit("update:modelValue", text.value);
        emit("save", text.value);
        state.value = "saved";
        savedTimer = setTimeout(() => (state.value = "idle"), 1600);
    }, 450);
}

onBeforeUnmount(() => {
    clearTimeout(debounceTimer);
    clearTimeout(savingTimer);
    clearTimeout(savedTimer);
});
</script>

<template>
    <div class="relative">
        <BaseTextarea v-if="multiline" :model-value="text" :placeholder="placeholder" :rows="rows" :bordered="false" @update:model-value="onInput" />
        <BaseInput v-else :model-value="text" size="sm" :placeholder="placeholder" :bordered="false" @update:model-value="onInput" />
        <Transition name="fade">
            <span v-if="state !== 'idle'" class="pointer-events-none absolute top-1/2 right-1.5 z-10 -translate-y-1/2">
                <AppIcon v-if="state === 'saving'" name="refresh" :size="14" class="animate-spin text-slate-400" />
                <AppIcon v-else name="check_circle" :size="14" class="text-emerald-600" />
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
