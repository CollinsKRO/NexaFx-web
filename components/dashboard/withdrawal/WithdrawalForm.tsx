"use client";

import { useState, useEffect } from "react";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { ChevronDown, ChevronLeft, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { getCurrencies, type Currency } from "@/lib/api/currencies";
import { getBalances } from "@/lib/api/wallet";
import { getRequestErrorMessage } from "@/lib/api-client";

interface CurrencyOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  balance: string;
}

function toCurrencyOption(
  c: Currency,
  balanceMap: Record<string, string>,
): CurrencyOption {
  return {
    id: c.code,
    name: c.name,
    icon: `/icons/${c.code.toLowerCase()}.svg`,
    balance: balanceMap[c.code] ?? "0.00",
  };
}

const withdrawalSchema = z.object({
  walletAddress: z.string().min(10, "Please enter a valid wallet address"),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num > 0;
  }, "Amount must be greater than 0"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export function WithdrawalForm() {
  const {
    currency,
    amount: storeAmount,
    walletAddress: storeWalletAddress,
    setStep,
    setFormData,
    close,
    reset,
  } = useWithdrawalStore();

  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      walletAddress: storeWalletAddress,
      amount: storeAmount,
    },
  });

  const walletAddress = watch("walletAddress");
  const amount = watch("amount");

  const fetchCurrenciesAndBalances = async () => {
    setIsLoadingCurrencies(true);
    setCurrencyError(null);

    try {
      const [currencyData, balanceData] = await Promise.all([
        getCurrencies(),
        getBalances(),
      ]);
      const balanceMap: Record<string, string> = {};
      for (const b of balanceData) {
        balanceMap[b.currency] = b.balance;
      }
      setCurrencies(currencyData.map((c) => toCurrencyOption(c, balanceMap)));
    } catch (error) {
      setCurrencyError(
        getRequestErrorMessage(error, {
          fallback: "Unable to load currencies or balances. Please try again.",
        }),
      );
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setIsLoadingCurrencies(true);
      setCurrencyError(null);

      try {
        const [currencyData, balanceData] = await Promise.all([
          getCurrencies(),
          getBalances(),
        ]);
        if (cancelled) return;
        const balanceMap: Record<string, string> = {};
        for (const b of balanceData) {
          balanceMap[b.currency] = b.balance;
        }
        setCurrencies(currencyData.map((c) => toCurrencyOption(c, balanceMap)));
      } catch (error) {
        if (!cancelled) {
          setCurrencyError(
            getRequestErrorMessage(error, {
              fallback:
                "Unable to load currencies or balances. Please try again.",
            }),
          );
        }
      } finally {
        if (!cancelled) setIsLoadingCurrencies(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCurrency =
    currencies.find((c) => c.id === currency) || currencies[0];

  const onSubmit = (data: WithdrawalFormValues) => {
    if (selectedCurrency) {
      const numAmount = parseFloat(data.amount.replace(/,/g, ""));
      if (numAmount > parseFloat(selectedCurrency.balance.replace(/,/g, ""))) {
        setError("amount", { message: "Insufficient balance" });
        return;
      }
    }
    setFormData({ walletAddress: data.walletAddress, amount: data.amount });
    setStep("review");
  };

  const handleMaxClick = () => {
    if (selectedCurrency) {
      const maxAmount = selectedCurrency.balance.replace(/,/g, "");
      setValue("amount", maxAmount, { shouldValidate: true });
      setFormData({ amount: maxAmount });
    }
  };

  const handleCancel = () => {
    close();
    setTimeout(() => reset(), 300);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => setStep("select")}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Back to withdrawal method"
        >
          <ChevronLeft className="size-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Withdraw to Wallet
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter withdrawal details
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Wallet Address
          </label>
          <input
            {...register("walletAddress")}
            type="text"
            placeholder="Enter wallet address or username"
            className={cn(
              "w-full px-4 py-3 rounded-xl bg-muted/50 border",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "transition-all duration-200",
              errors.walletAddress ? "border-destructive" : "border-border",
            )}
          />
          {errors.walletAddress && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle className="size-3.5" />
              <span className="text-xs">{errors.walletAddress.message}</span>
            </div>
          )}
        </div>

        {/* Currency Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Currency
          </label>
          <div className="relative">
            {currencyError ? (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-destructive/10 border border-destructive">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span className="text-sm">{currencyError}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchCurrenciesAndBalances}
                  className="text-xs font-semibold text-destructive underline underline-offset-2 hover:opacity-70 transition-opacity shrink-0"
                >
                  Retry
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isLoadingCurrencies}
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl",
                  "bg-muted/50 border border-border",
                  "hover:bg-muted transition-colors",
                  isLoadingCurrencies && "opacity-60 cursor-wait",
                )}
              >
                {isLoadingCurrencies ? (
                  <span className="text-sm text-muted-foreground animate-pulse">
                    Loading currencies…
                  </span>
                ) : selectedCurrency ? (
                  <div className="flex items-center gap-3">
                    {/* {selectedCurrency.icon} */ /* Icon not working perfectly in SSR, removed to avoid issues */}
                    <span className="font-medium text-foreground">
                      {selectedCurrency.id}
                    </span>
                  </div>
                ) : null}
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform",
                    showCurrencyDropdown && "rotate-180",
                  )}
                />
              </button>
            )}

            {/* Dropdown */}
            {showCurrencyDropdown && !isLoadingCurrencies && !currencyError && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
                {currencies.map((curr) => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => {
                      setFormData({ currency: curr.id });
                      setShowCurrencyDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3",
                      "hover:bg-muted transition-colors",
                      curr.id === currency && "bg-primary/10",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="font-medium text-foreground">{curr.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {curr.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {curr.balance}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Amount
            </label>
            <span className="text-xs text-muted-foreground">
              Balance: {selectedCurrency?.balance ?? "—"}{" "}
              {selectedCurrency?.id ?? ""}
            </span>
          </div>
          <div className="relative">
            <input
              {...register("amount")}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setValue("amount", value, { shouldValidate: true });
                setFormData({ amount: value });
              }}
              className={cn(
                "w-full px-4 py-3 pr-16 rounded-xl bg-muted/50 border",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "transition-all duration-200",
                errors.amount ? "border-destructive" : "border-border",
              )}
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              MAX
            </button>
          </div>
          {errors.amount && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle className="size-3.5" />
              <span className="text-xs">{errors.amount.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isLoadingCurrencies || !!currencyError}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 active:scale-[0.98]",
            "transition-all duration-200",
            (isLoadingCurrencies || currencyError) &&
              "opacity-50 cursor-not-allowed",
          )}
        >
          Withdraw
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
