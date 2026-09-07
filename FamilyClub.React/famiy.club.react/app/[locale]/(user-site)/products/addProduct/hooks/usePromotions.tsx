import { PromotionDto } from "@/lib/api/generated";
import { promotionService } from "@/lib/api/services";
import { useEffect, useState } from "react";

export function usePromotions() {
    const [promotions, setPromotions] = useState<PromotionDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        promotionService.apiPromotionsGet()
            .then(setPromotions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { promotions, loading };
}