import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";

describe("router", () => {
    beforeEach(async () => {
        setActivePinia(createPinia());
        useAuthStore().isLoggedIn = true;
        await router.replace("/dashboard");
    });

    it("redirects the root path to the dashboard", async () => {
        await router.push("/");

        expect(router.currentRoute.value.name).toBe("dashboard");
        expect(router.currentRoute.value.path).toBe("/dashboard");
    });
});
