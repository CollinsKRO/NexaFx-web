"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getAdminTransactions } from "../../../../lib/api/admin";
import { Transaction } from "../../../../lib/api/transactions";

const TYPE_OPTIONS = ["All", "Deposit", "Withdraw", "Convert"] as const;
const STATUS_OPTIONS = ["All", "Success", "Failed", "Pending"] as const;

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getAdminTransactions()
      .then((data) => {
        if (!mounted) return;
        setTransactions(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Failed to load transactions");
        setTransactions([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!transactions) return null;
    return transactions.filter((t) => {
      if (typeFilter !== "All" && t.type !== typeFilter) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, statusFilter]);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Transactions</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div>
          <strong>Type:</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setTypeFilter(opt)}
                style={{
                  padding: "6px 10px",
                  background: typeFilter === opt ? "#1f2937" : "#f3f4f6",
                  color: typeFilter === opt ? "#fff" : "#000",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <strong>Status:</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                style={{
                  padding: "6px 10px",
                  background: statusFilter === opt ? "#1f2937" : "#f3f4f6",
                  color: statusFilter === opt ? "#fff" : "#000",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div>
          <div style={{ display: "grid", gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 40,
                  background: "#e5e7eb",
                  borderRadius: 6,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: 16, background: "#fee2e2", borderRadius: 6 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              getAdminTransactions()
                .then((d) => setTransactions(d))
                .catch((err) => setError(err?.message || "Failed to load"))
                .finally(() => setLoading(false));
            }}
            style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered && filtered.length === 0 && (
        <div style={{ padding: 24, background: "#f8fafc", borderRadius: 6 }}>
          No transactions found.
        </div>
      )}

      {!loading && !error && filtered && filtered.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>User Email</th>
                <th style={{ textAlign: "left", padding: 8 }}>Type</th>
                <th style={{ textAlign: "right", padding: 8 }}>Amount</th>
                <th style={{ textAlign: "left", padding: 8 }}>Currency</th>
                <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                <th style={{ textAlign: "left", padding: 8 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: 8 }}>{t.user?.email || "-"}</td>
                  <td style={{ padding: 8 }}>{t.type}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{t.amount.toFixed(2)}</td>
                  <td style={{ padding: 8 }}>{t.currency}</td>
                  <td style={{ padding: 8 }}>{t.status}</td>
                  <td style={{ padding: 8 }}>{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
