<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";

const auth = useAuthStore();
const toast = useToastStore();

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

const MIN_LENGTH = 12;
const VALID_PATTERN = /^[\x21-\x7e]+$/;

const rules = computed(() => [
    { label: `${MIN_LENGTH}文字以上`, valid: newPassword.value.length >= MIN_LENGTH },
    { label: "半角英数字記号のみ", valid: newPassword.value.length > 0 && VALID_PATTERN.test(newPassword.value) },
]);

function submit() {
    errorMessage.value = "";

    if (currentPassword.value !== auth.password) {
        errorMessage.value = "現在のパスワードが正しくありません。";
        return;
    }
    if (newPassword.value.length < MIN_LENGTH || !VALID_PATTERN.test(newPassword.value)) {
        errorMessage.value = "新しいパスワードは半角英数字記号12文字以上で入力してください。";
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = "新しいパスワード（確認）が一致しません。";
        return;
    }

    auth.changePassword(newPassword.value);
    toast.push("パスワードを変更しました");
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
}
</script>

<template>
    <div class="mx-auto flex max-w-md flex-col gap-6">
        <div>
            <h1 class="text-xl font-semibold text-slate-900">パスワード変更</h1>
            <p class="mt-1 text-sm text-slate-500">共通アカウントのパスワードを変更します。次回以降のログインに反映されます。</p>
        </div>

        <form class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5" @submit.prevent="submit">
            <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {{ errorMessage }}
            </div>

            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">現在のパスワード</label>
                <input
                    v-model="currentPassword"
                    type="password"
                    autocomplete="current-password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">新しいパスワード</label>
                <input
                    v-model="newPassword"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <ul class="mt-1.5 flex flex-col gap-0.5">
                    <li v-for="rule in rules" :key="rule.label" class="flex items-center gap-1.5 text-xs" :class="rule.valid ? 'text-green-600' : 'text-slate-400'">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path v-if="rule.valid" stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            <circle v-else cx="12" cy="12" r="9" stroke-width="1.5" />
                        </svg>
                        {{ rule.label }}
                    </li>
                </ul>
            </div>
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">新しいパスワード（確認）</label>
                <input
                    v-model="confirmPassword"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <button type="submit" class="mt-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"> 変更を保存 </button>
        </form>
    </div>
</template>
