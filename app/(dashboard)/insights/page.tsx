"use client";

import { useEffect, useState } from "react";
import { getTransactions, Transaction } from "@/lib/api/transactions";
import { calculateInsights, SpendingInsights } from "@/lib/utils/insights";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ArrowUpDown, ArrowDownLeft, ArrowUpRight, Calendar } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className="bg-primary/10 rounded-full p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<SpendingInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch all transactions (large limit) for full insight accuracy
        const result = await getTransactions({ page: 1, limit: 1000 });
        if (cancelled) return;
        if (result.data.length === 0) {
          setInsights(null);
        } else {
          setInsights(calculateInsights(result.data));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load insights");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-base font-medium">No insights yet</p>
        <p className="text-sm text-muted-foreground">
          Make your first transaction to see your spending patterns.
        </p>
      </div>
    );
  }

  const { biggestTransaction } = insights;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <h1 className="text-xl font-semibold">Spending Insights</h1>

      {/* This month summary */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">This Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Total Converted" value={fmt(insights.totalConvertedThisMonth)} icon={ArrowUpDown} />
          <StatCard label="Total Withdrawn" value={fmt(insights.totalWithdrawnThisMonth)} icon={ArrowUpRight} />
          <StatCard label="Total Deposited" value={fmt(insights.totalDepositedThisMonth)} icon={ArrowDownLeft} />
        </div>
      </section>

      {/* Highlights row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Top Currency Pair</p>
          <p className="text-sm font-semibold">
            You convert <span className="text-primary">{insights.mostUsedPair}</span> most often
          </p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Average Transaction</p>
          <p className="text-sm font-semibold">{fmt(insights.averageTransactionAmount)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Most Active Day</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">{insights.mostActiveDay}</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Biggest Transaction</p>
          <p className="text-sm font-semibold">
            {fmt(biggestTransaction.amount)} {biggestTransaction.currency}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{biggestTransaction.type} · {biggestTransaction.date}</p>
        </div>
      </div>

      {/* Monthly trend chart */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">6-Month Trend</h2>
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={insights.monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={60} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="converted" stroke="#EAB308" strokeWidth={2} dot={false} name="Converted" />
              <Line type="monotone" dataKey="withdrawn" stroke="#EF4444" strokeWidth={2} dot={false} name="Withdrawn" />
              <Line type="monotone" dataKey="deposited" stroke="#22C55E" strokeWidth={2} dot={false} name="Deposited" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
