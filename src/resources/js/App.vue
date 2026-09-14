<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import BaseToasts from "@/components/ui/BaseToasts.vue";

const route = useRoute();
const showChrome = computed(() => route.name !== "login");
</script>

<template>
    <div class="min-h-screen bg-slate-50 text-slate-900">
        <a href="#main-content" class="skip-link">本文へ移動</a>
        <BaseToasts />
        <Navbar v-if="showChrome" />
        <main id="main-content" :class="showChrome ? 'mx-auto w-full max-w-320 px-4 py-6 sm:px-6 sm:py-8 lg:px-8' : ''">
            <router-view />
        </main>
    </div>
</template>
