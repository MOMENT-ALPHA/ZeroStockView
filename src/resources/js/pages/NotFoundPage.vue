<script setup lang="ts"></script>

<template>
    <div class="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <p class="text-5xl font-bold text-slate-300">404</p>
        <p class="text-sm text-slate-500">ページが見つかりませんでした。</p>
        <RouterLink :to="{ name: 'data-import' }" class="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"> データ取込に戻る </RouterLink>
    </div>
</template>
