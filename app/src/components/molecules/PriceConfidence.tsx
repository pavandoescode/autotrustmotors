import { BadgeCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PriceConfidenceProps {
  price: number;
  marketPrice: number;
}

export default function PriceConfidence({ price, marketPrice }: PriceConfidenceProps) {
  if (marketPrice <= 0 || price <= 0) return null;

  const savingsPercent = Math.round(((marketPrice - price) / marketPrice) * 100);
  const isGoodDeal = price < marketPrice;

  if (!isGoodDeal) return null;

  return (
    <div className="mt-4">
      {/* Verdict */}
      <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-md border border-green-200">
        <BadgeCheck className="w-5 h-5 text-green-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-text-primary">
            Great Deal — {savingsPercent}% Below Market
          </p>
          <p className="text-xs text-text-muted mt-0.5 font-sans">
            You save {formatPrice(marketPrice - price)} compared to the market average of {formatPrice(marketPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
