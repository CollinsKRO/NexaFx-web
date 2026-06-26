export interface ExchangeRate {
  from: string
  to: string
  rate: number
  updatedAt: string
}

export const getExchangeRate = (from: string, to: string): Promise<ExchangeRate> => {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const headers = new Headers({ "Content-Type": "application/json" });
    if (token) {
        headers.set("x-client-token", token);
    }

    return fetch(`/api/exchange-rates?from=${from}&to=${to}`, {
        method: "GET",
        headers,
    }).then(async (res) => {
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error || data?.message || res.statusText);
        }
        return res.json();
    });
};
