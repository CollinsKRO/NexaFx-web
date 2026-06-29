import { Transaction } from "@/lib/api/transactions";

export interface MonthlyTotal {
  month: string;
  converted: number;
  withdrawn: number;
  deposited: number;
}

export interface SpendingInsights {
  totalConvertedThisMonth: number;
  totalWithdrawnThisMonth: number;
  totalDepositedThisMonth: number;
  mostUsedPair: string;
  biggestTransaction: Transaction;
  averageTransactionAmount: number;
  monthlyTrend: MonthlyTotal[];
  mostActiveDay: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function calculateInsights(transactions: Transaction[]): SpendingInsights {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  let totalConvertedThisMonth = 0;
  let totalWithdrawnThisMonth = 0;
  let totalDepositedThisMonth = 0;
  const pairCount: Record<string, number> = {};
  const dayCounts: number[] = Array(7).fill(0);

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const isThisMonth = d.getMonth() === thisMonth && d.getFullYear() === thisYear;

    if (isThisMonth) {
      if (tx.type === "Convert") totalConvertedThisMonth += tx.amount;
      else if (tx.type === "Withdraw") totalWithdrawnThisMonth += tx.amount;
      else if (tx.type === "Deposit") totalDepositedThisMonth += tx.amount;
    }

    if (tx.type === "Convert" && tx.toCurrency) {
      const pair = `${tx.currency} → ${tx.toCurrency}`;
      pairCount[pair] = (pairCount[pair] ?? 0) + 1;
    }

    dayCounts[d.getDay()]++;
  }

  const mostUsedPair =
    Object.entries(pairCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const biggestTransaction = transactions.reduce(
    (max, tx) => (tx.amount > max.amount ? tx : max),
    transactions[0]
  );

  const averageTransactionAmount =
    transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length;

  const mostActiveDay = DAYS[dayCounts.indexOf(Math.max(...dayCounts))];

  // Build last 6 months trend
  const monthlyTrend: MonthlyTotal[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(thisYear, thisMonth - (5 - i), 1);
    return {
      month: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
      converted: 0,
      withdrawn: 0,
      deposited: 0,
    };
  });

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const idx = monthlyTrend.findIndex(
      (m) => m.month === d.toLocaleString("en-US", { month: "short", year: "numeric" })
    );
    if (idx === -1) continue;
    if (tx.type === "Convert") monthlyTrend[idx].converted += tx.amount;
    else if (tx.type === "Withdraw") monthlyTrend[idx].withdrawn += tx.amount;
    else if (tx.type === "Deposit") monthlyTrend[idx].deposited += tx.amount;
  }

  return {
    totalConvertedThisMonth,
    totalWithdrawnThisMonth,
    totalDepositedThisMonth,
    mostUsedPair,
    biggestTransaction,
    averageTransactionAmount,
    monthlyTrend,
    mostActiveDay,
  };
}
