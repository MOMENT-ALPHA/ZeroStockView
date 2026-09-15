import { mount, RouterLinkStub } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "@/pages/DashboardPage.vue";
import { useSurveysStore } from "@/stores/surveys";
import type { Survey } from "@/types";

vi.mock("vue-router", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

describe("DashboardPage", () => {
    it("renders every product in the latest survey", () => {
        setActivePinia(createPinia());
        const surveys = useSurveysStore();
        surveys.surveys = [
            {
                id: "survey-1",
                executedAt: "2026-09-15T00:00:00.000Z",
                products: Array.from({ length: 6 }, (_, index) => ({
                    productCode: `PRODUCT-${String(index + 1).padStart(3, "0")}`,
                    brand: "Test Brand",
                    category: "Test Category",
                    parentAsin: `ASIN-${index + 1}`,
                    memo: "",
                    skus: [],
                })),
                files: [],
            } satisfies Survey,
        ];

        const wrapper = mount(DashboardPage, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub,
                },
            },
        });

        const displayedProductCodes = wrapper.findAll("li").map((item) => item.find("p").text());

        expect(displayedProductCodes).toEqual(["PRODUCT-001", "PRODUCT-002", "PRODUCT-003", "PRODUCT-004", "PRODUCT-005", "PRODUCT-006"]);
        expect(wrapper.text()).toContain("品番プレビュー（全件）");
    });
});
