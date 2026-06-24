export type TransactionType = "Deposit" | "Withdraw" | "Convert";
export type TransactionStatus = "Success" | "Failed" | "Pending";

export type Transaction = {
  id: string;
  user: {
    id?: string;
    email: string;
  };
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string; // ISO date
};

export async function parseDate(dateIso: string): Promise<string> {
  return new Date(dateIso).toLocaleString();
}
