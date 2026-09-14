import { defineStore } from "pinia";

const DEFAULT_LOGIN_ID = "admin";
const DEFAULT_PASSWORD = "password1234";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        isLoggedIn: false,
        loginId: DEFAULT_LOGIN_ID,
        password: DEFAULT_PASSWORD,
    }),
    actions: {
        login(loginId: string, password: string): boolean {
            if (loginId === this.loginId && password === this.password) {
                this.isLoggedIn = true;
                return true;
            }
            return false;
        },
        logout() {
            this.isLoggedIn = false;
        },
        changePassword(newPassword: string) {
            this.password = newPassword;
        },
    },
    persist: {
        key: "zsv-auth",
        storage: localStorage,
    },
});
