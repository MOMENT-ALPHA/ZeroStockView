import { defineStore } from "pinia";

export interface ToastMessage {
    id: number;
    text: string;
    variant: "success" | "error" | "info";
}

let nextId = 1;

export const useToastStore = defineStore("toast", {
    state: () => ({
        messages: [] as ToastMessage[],
    }),
    actions: {
        push(text: string, variant: ToastMessage["variant"] = "success") {
            const id = nextId++;
            this.messages.push({ id, text, variant });
            setTimeout(() => this.dismiss(id), 3200);
        },
        dismiss(id: number) {
            this.messages = this.messages.filter((m) => m.id !== id);
        },
    },
});
