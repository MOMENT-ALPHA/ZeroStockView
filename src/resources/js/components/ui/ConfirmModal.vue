<script setup lang="ts">
withDefaults(
    defineProps<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        danger?: boolean;
    }>(),
    {
        confirmLabel: "削除する",
        danger: true,
    },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
        <div class="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h2 class="text-base font-semibold text-slate-900">{{ title }}</h2>
            <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
            <div class="mt-5 flex justify-end gap-2">
                <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('cancel')"> キャンセル </button>
                <button
                    type="button"
                    class="rounded-lg px-4 py-2 text-sm font-medium text-white"
                    :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
                    @click="emit('confirm')"
                >
                    {{ confirmLabel }}
                </button>
            </div>
        </div>
    </div>
</template>
