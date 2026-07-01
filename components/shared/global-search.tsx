"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const results = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Convert Currency", path: "/dashboard/convert" },
    { label: "Deposit Funds", path: "/dashboard/deposit" },
    { label: "Withdraw Funds", path: "/dashboard/withdraw" },
    { label: "Transactions History", path: "/dashboard/transactions" },
    { label: "Settings & Profile", path: "/dashboard/settings" },
  ].filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center border-b border-border px-4 py-3 gap-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          ) : (
            results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result.path)}
                className="w-full flex items-center px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors text-left"
              >
                {result.label}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
