"use client";

import { useEffect, useState } from "react";
import { Copy, X, ArrowDownLeft, ArrowUpRight, RefreshCw, Printer, Share2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction, getTransactionById } from "@/lib/api/transactions";
import { TransactionReceipt, buildReceiptText } from "@/components/dashboard/transaction-receipt";

interface TransactionDetailsProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function TransactionDetails({
  transaction,
  open,
  onClose,
}: TransactionDetailsProps) {
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !transaction?.id) return;
    let cancelled = false;
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const data = await getTransactionById(transaction.id);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setDetail(transaction);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [open, transaction?.id, transaction]);

  if (!open || !transaction) return null;

  // Use fetched detail only when it matches the current transaction
  const tx = (detail?.id === transaction.id ? detail : null) ?? transaction;
  const canShare = typeof window !== "undefined" && typeof navigator.share === "function";

  const isDeposit = tx.type === "Deposit";
  const isConvert = tx.type === "Convert";

  let heroLabel = "";
  if (isConvert)
    heroLabel = `Convert ${tx.currency} to ${tx.toCurrency ?? "USDT"}`;
  else if (isDeposit) heroLabel = `Deposit ${tx.currency}`;
  else heroLabel = `Withdraw ${tx.currency}`;

  function handlePrint() {
    const receiptEl = document.getElementById("print-receipt");
    if (receiptEl) {
      receiptEl.style.display = "block";
    }
    window.print();
    if (receiptEl) {
      receiptEl.style.display = "none";
    }
  }

  async function handleShare() {
    const text = buildReceiptText(tx);
    try {
      await navigator.share({ title: "NexaFx Receipt", text });
    } catch {
      // user cancelled or share failed — no action needed
    }
  }

  function handleDownload() {
    const text = buildReceiptText(tx);
    const filename = `nexafx-receipt-${tx.reference || tx.id}.txt`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <TransactionReceipt transaction={tx} />
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Modal/Drawer Content */}
        <div
          className={cn(
            "relative z-50 w-full bg-background shadow-lg flex flex-col",
            "md:fixed md:top-1 md:right-4 md:bottom-4 md:w-[450px] md:rounded-xl",
            "rounded-t-3xl h-[85vh] md:h-auto",
            "animate-in slide-in-from-bottom duration-300 md:slide-in-from-right md:duration-300"
          )}
        >
          {/* Header */}
          <div className="flex-none flex items-center justify-between p-6 border-b border-border/10 md:border-none">
            <h2 className="text-xl font-bold md:hidden">Transaction Details</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-muted transition-colors ml-auto"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 md:pt-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Hero Section */}
                <div className="bg-muted rounded p-8 flex flex-col items-center justify-center space-y-4">
                  <div
                    className={cn(
                      "h-16 w-16 rounded-full flex items-center justify-center",
                      isDeposit
                        ? "bg-green-500/10"
                        : isConvert
                          ? "bg-orange-500/10"
                          : "bg-red-500/10"
                    )}
                  >
                    {isConvert ? (
                      <RefreshCw className="h-8 w-8 text-orange-500" />
                    ) : isDeposit ? (
                      <ArrowDownLeft className="h-8 w-8 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{heroLabel}</p>
                    <h2 className="text-2xl md:text-3xl font-bold mt-1">
                      {tx.amountString}
                    </h2>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Transaction Details</h3>
                  <div className="space-y-3">
                    <DetailRow label="Date & Time" value={tx.date} />
                    <DetailRow label="Type" value={tx.type} />
                    <DetailRow label="From" value={tx.currency} />
                    {tx.toCurrency && (
                      <DetailRow label="To" value={tx.toCurrency} />
                    )}
                    {tx.toAmount != null && (
                      <DetailRow
                        label="Amount Received"
                        value={`${tx.toAmount.toLocaleString()} ${tx.toCurrency ?? ""}`}
                      />
                    )}
                    {tx.exchangeRate != null && (
                      <DetailRow
                        label="Exchange Rate"
                        value={String(tx.exchangeRate)}
                      />
                    )}
                    {tx.fee != null && (
                      <DetailRow
                        label="Fee"
                        value={`${tx.fee.toLocaleString()} ${tx.currency}`}
                      />
                    )}
                    <DetailRow label="Status" value={tx.status} />
                    <DetailRow
                      label="Reference ID"
                      value={tx.reference}
                      isCopyable
                    />
                    {tx.description && (
                      <DetailRow label="Description" value={tx.description} />
                    )}
                  </div>
                </div>

                {/* Receipt Actions */}
                <div className="flex flex-row items-center gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:bg-muted/80 transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                  {canShare && (
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#FFD552] text-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:opacity-90 transition-opacity"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:bg-muted/80 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-full bg-transparent border border-border text-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  label,
  value,
  isCopyable,
}: {
  label: string;
  value: string;
  isCopyable?: boolean;
}) {
  return (
    <div className="flex justify-between items-start py-1">
      <span className="text-sm text-muted-foreground font-medium">
        {label}:
      </span>
      <div className="flex items-center gap-2 text-right">
        <span className="text-sm font-bold">{value}</span>
        {isCopyable && (
          <Copy className="h-3 w-3 text-muted-foreground cursor-pointer" />
        )}
      </div>
    </div>
  );
}
