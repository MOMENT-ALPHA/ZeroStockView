import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it } from "vitest";
import ImportSettingsPage from "@/pages/ImportSettingsPage.vue";
import { useImportSettingsStore } from "@/stores/importSettings";

describe("ImportSettingsPage", () => {
    it("reorders selected products by dragging and dropping", async () => {
        setActivePinia(createPinia());
        const store = useImportSettingsStore();
        store.selectedProductCodes = ["A-1001", "A-1002", "B-2001"];

        const wrapper = mount(ImportSettingsPage);

        const rows = wrapper.findAll('[draggable="true"]');
        await rows[0].trigger("dragstart");
        await rows[2].trigger("drop");

        const reorderedCodes = wrapper.findAll('[draggable="true"]').map((row) => row.find("p").text());

        expect(reorderedCodes).toEqual(["A-1002", "B-2001", "A-1001"]);
    });
});
