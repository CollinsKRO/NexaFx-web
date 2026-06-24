import { Transaction } from "./transactions";

const DEFAULT_BASE = "";

function getBaseUrl(): string {
  // Prefer a runtime env var when available; fall back to same-origin
  return (process.env.NEXT_PUBLIC_API_BASE_URL as string) || DEFAULT_BASE;
}

export const getAdminTransactions = async (): Promise<Transaction[]> => {
  const base = getBaseUrl();
  const url = `${base}/admin/transactions`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    // ensure cookies (session/admin cookie) are sent
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || res.statusText || `HTTP ${res.status}`;
    const error: any = new Error(msg);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();

  // Expect server to return an array of transactions
  if (!Array.isArray(data)) {
    throw new Error("Unexpected response format for admin transactions");
  }

  return data as Transaction[];
};
