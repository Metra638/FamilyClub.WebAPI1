import ProductDetailsClient from "./ProductDetailsClient";
import { apiBasePath } from "@/lib/api/services";

type ApiProduct = { id?: number | null };

type ProductParams = { id: string };

const yearFilters = [
    "2000–2002",
    "2003–2005",
    "2006–2010",
    "2011–2020",
    "2020+",
];

const fallbackParams = ["4", "18"];

export async function generateStaticParams(): Promise<ProductParams[]> {
    const params = new Set<string>([...yearFilters, ...fallbackParams]);

    try {
        const response = await fetch(`${apiBasePath}/api/Products`);
        if (response.ok) {
            const products = (await response.json()) as ApiProduct[];
            for (const product of products) {
                if (product?.id != null) {
                    params.add(String(product.id));
                }
            }
        }
    } catch {
        // Ignore failures; fallback params keep the build working in export mode.
    }

    return Array.from(params).map((id) => ({ id }));
}

export default async function ProductDetailsPage({ params }: { params: Promise<ProductParams> }) {
    const resolvedParams = await params;
    return <ProductDetailsClient id={resolvedParams.id} />;
}
