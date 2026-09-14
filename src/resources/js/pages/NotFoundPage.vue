<script setup lang="ts">
import { useRouter } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";

const router = useRouter();
</script>

<template>
    <div class="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <p class="text-5xl font-bold text-slate-300">404</p>
        <p class="text-sm text-slate-500">ページが見つかりませんでした。</p>
        <BaseButton variant="primary" class="mt-2" @click="router.push({ name: 'data-import' })">データ取込に戻る</BaseButton>
    </div>
</template>
