import type { Product } from "@/types";

/**
 * 商品識別子管理システムからAPI取得したと仮定するダミーの品番マスタ。
 * 実装時はAPI経由で取得するため、ここではUI確認用の固定データを保持する。
 */
interface ProductSeed {
    productCode: string;
    productName: string;
    brand: string;
    category: string;
    variants: { colorNo: string; colorName: string; sizes: string[] }[];
}

const PRODUCT_SEEDS: ProductSeed[] = [
    {
        productCode: "A-1001",
        productName: "ライトダウンジャケット",
        brand: "ALPHA",
        category: "アウター",
        variants: [
            { colorNo: "01", colorName: "ブラック", sizes: ["S", "M", "L"] },
            { colorNo: "02", colorName: "ネイビー", sizes: ["M", "L"] },
        ],
    },
    {
        productCode: "A-1002",
        productName: "ステンカラーコート",
        brand: "ALPHA",
        category: "アウター",
        variants: [{ colorNo: "01", colorName: "ベージュ", sizes: ["S", "M", "L"] }],
    },
    {
        productCode: "B-2001",
        productName: "オーガニックコットンTシャツ",
        brand: "BRAVO",
        category: "トップス",
        variants: [
            { colorNo: "01", colorName: "ホワイト", sizes: ["S", "M", "L", "XL"] },
            { colorNo: "02", colorName: "ブラック", sizes: ["M", "L"] },
        ],
    },
    {
        productCode: "B-2002",
        productName: "ドライメッシュポロシャツ",
        brand: "BRAVO",
        category: "トップス",
        variants: [
            { colorNo: "01", colorName: "ホワイト", sizes: ["M", "L"] },
            { colorNo: "03", colorName: "ネイビー", sizes: ["M", "L"] },
        ],
    },
    {
        productCode: "B-2003",
        productName: "リブニットプルオーバー",
        brand: "BRAVO",
        category: "トップス",
        variants: [{ colorNo: "01", colorName: "グレー", sizes: ["F"] }],
    },
    {
        productCode: "C-3001",
        productName: "テーパードチノパンツ",
        brand: "CHARLIE",
        category: "パンツ",
        variants: [
            { colorNo: "01", colorName: "ベージュ", sizes: ["S", "M", "L"] },
            { colorNo: "02", colorName: "カーキ", sizes: ["M", "L"] },
        ],
    },
    {
        productCode: "C-3002",
        productName: "ストレッチデニムパンツ",
        brand: "CHARLIE",
        category: "パンツ",
        variants: [{ colorNo: "01", colorName: "インディゴ", sizes: ["S", "M", "L", "XL"] }],
    },
    {
        productCode: "C-3003",
        productName: "イージーワイドパンツ",
        brand: "CHARLIE",
        category: "パンツ",
        variants: [{ colorNo: "02", colorName: "ブラック", sizes: ["M", "L"] }],
    },
    {
        productCode: "D-4001",
        productName: "キャンバススニーカー",
        brand: "DELTA",
        category: "シューズ",
        variants: [{ colorNo: "01", colorName: "ホワイト", sizes: ["24.0", "25.0", "26.0", "27.0"] }],
    },
    {
        productCode: "D-4002",
        productName: "レザーローファー",
        brand: "DELTA",
        category: "シューズ",
        variants: [{ colorNo: "02", colorName: "ブラウン", sizes: ["25.0", "26.0", "27.0"] }],
    },
    {
        productCode: "D-4003",
        productName: "軽量ランニングシューズ",
        brand: "DELTA",
        category: "シューズ",
        variants: [{ colorNo: "01", colorName: "グレー", sizes: ["25.0", "26.0"] }],
    },
    {
        productCode: "E-5001",
        productName: "2WAYトートバッグ",
        brand: "ALPHA",
        category: "バッグ",
        variants: [
            { colorNo: "01", colorName: "ブラック", sizes: ["F"] },
            { colorNo: "02", colorName: "キャメル", sizes: ["F"] },
        ],
    },
    {
        productCode: "E-5002",
        productName: "撥水ナイロンリュック",
        brand: "BRAVO",
        category: "バッグ",
        variants: [{ colorNo: "01", colorName: "ブラック", sizes: ["F"] }],
    },
    {
        productCode: "E-5003",
        productName: "コンパクトショルダーバッグ",
        brand: "CHARLIE",
        category: "バッグ",
        variants: [{ colorNo: "03", colorName: "ネイビー", sizes: ["F"] }],
    },
    {
        productCode: "F-6001",
        productName: "ボーダー長袖カットソー",
        brand: "DELTA",
        category: "トップス",
        variants: [{ colorNo: "01", colorName: "ホワイト×ネイビー", sizes: ["S", "M", "L"] }],
    },
];

function buildAsin(productCode: string, colorNo: string, size: string): string {
    const raw = `${productCode}${colorNo}${size}`.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    const padded = (raw + "0000000000").slice(0, 9);
    return `B0${padded}`;
}

export const PRODUCT_MASTER: Product[] = PRODUCT_SEEDS.map((seed) => ({
    productCode: seed.productCode,
    productName: seed.productName,
    brand: seed.brand,
    category: seed.category,
    skus: seed.variants.flatMap((variant) =>
        variant.sizes.map((size) => ({
            skuCode: `${seed.productCode}-${variant.colorNo}-${size}`,
            colorName: variant.colorName,
            size,
            asin: buildAsin(seed.productCode, variant.colorNo, size),
            tqCode: seed.productCode,
            tqColorNo: variant.colorNo,
            tqSize: size,
        })),
    ),
}));

export const BRAND_LIST: string[] = Array.from(new Set(PRODUCT_MASTER.map((p) => p.brand)));
export const CATEGORY_LIST: string[] = Array.from(new Set(PRODUCT_MASTER.map((p) => p.category)));

export function findProduct(productCode: string): Product | undefined {
    return PRODUCT_MASTER.find((p) => p.productCode === productCode);
}
