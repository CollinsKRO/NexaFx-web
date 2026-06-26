"use client";

import {
  TrendingUp,
  DollarSign,
  PoundSterling,
  Euro,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getExchangeRate } from "@/lib/api/exchange-rates";

interface RateData {
  pair: string;
  rate: string;
  icon: React.ReactNode;
  unavailable: boolean;
}

const defaultPairs = [
  {
    to: "USD",
    from: "NGN",
    pair: "NGN/USD",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    to: "EUR",
    from: "NGN",
    pair: "NGN/EUR",
    icon: <Euro className="w-4 h-4" />,
  },
  {
    to: "GBP",
    from: "NGN",
    pair: "NGN/GBP",
    icon: <PoundSterling className="w-4 h-4" />,
  },
  {
    to: "BTC",
    from: "NGN",
    pair: "NGN/BTC",
    icon: <span className="text-xs font-bold">₿</span>,
  },
];

export function MarketOverview() {
  const [marketData, setMarketData] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    const results = await Promise.all(
      defaultPairs.map(async (p) => {
        try {
          const res = await getExchangeRate(p.from, p.to);
          return {
            pair: p.pair,
            rate: res.rate
              ? `₦${Number(res.rate).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "N/A",
            icon: p.icon,
            unavailable: false,
          };
        } catch {
          return {
            pair: p.pair,
            rate: "",
            icon: p.icon,
            unavailable: true,
          };
        }
      }),
    );
    setMarketData(results);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-lg font-semibold">Exchange Rates</h3>
        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live updates{" "}
          {lastUpdated && (
            <span className="hidden md:inline">
              • Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      <div className="exchange-rates flex items-center overflow-x-auto gap-3 pb-2">
        {loading && marketData.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[251px] rounded-sm border-[0.43px] border-[#79797966] bg-card p-5 shadow-[4px-4px-12px-0px-#0000001A]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                </div>
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-12 bg-muted animate-pulse rounded-full"></div>
                </div>
              </div>
            ))
          : marketData.map((item, index) => (
              <div
                key={index}
                className="min-w-[251px] rounded-sm border-[0.43px] border-[#79797966] bg-card p-5 hover:border-primary/50 transition-colors shadow-[4px-4px-12px-0px-#0000001A]"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.pair}
                  </p>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                    {item.icon}
                  </div>
                </div>

                {item.unavailable ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Rates temporarily unavailable</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 w-full">
                    <p className="text-lg font-bold tracking-tight">
                      {item.rate}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                      <TrendingUp className="h-2.5 w-2.5" />
                      Live
                    </div>
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
