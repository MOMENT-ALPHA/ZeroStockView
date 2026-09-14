import { defineStore } from "pinia";

export interface Toast {
    id: number;
    type: "success" | "error" | "info";
    message: string;
}

let nextId = 1;

export const useUiStore = defineStore("ui", {
    state: () => ({
        toasts: [] as Toast[],
    }),
    actions: {
        push(message: string, type: Toast["type"] = "success") {
            const id = nextId++;
            this.toasts.push({ id, type, message });
            setTimeout(() => this.dismiss(id), 3200);
        },
        dismiss(id: number) {
            this.toasts = this.toasts.filter((t) => t.id !== id);
        },
    },
});
