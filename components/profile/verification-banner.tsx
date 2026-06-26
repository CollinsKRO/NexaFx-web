"use client";

import { useState, useEffect } from "react";
import { VerificationModal } from "@/components/profile/verification-modal";
import { getProfile } from "@/lib/api/users";

export function VerificationBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    getProfile()
      .then((profile) => setIsVerified(!!profile.isVerified))
      .catch(() => setIsVerified(false));
  }, []);

  if (isVerified === null) return null;
  if (isVerified) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-amber-100 dark:from-gray-800 dark:via-gray-900 dark:to-amber-900/20 p-6 shadow-sm border border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">
              Verify your account Now
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete your verification to unlock full access
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="whitespace-nowrap rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary/90 active:scale-95"
          >
            Verify Now
          </button>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 pointer-events-none" />
      </div>

      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
