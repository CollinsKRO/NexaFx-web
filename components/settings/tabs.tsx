"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountIcon, SecurityIcon, IdentityIcon } from "../icons";
import { History, LogIn, KeyRound, Shield, ArrowUpFromLine, UserX, UserCheck, ShieldOff, Edit3, AlertCircle } from "lucide-react";
import { AccountInfo } from "./account-info";
import { Security } from "./security";
import { Notification } from "./notification";
import { ProfileOverview } from "../profile/profile-overview";
import { PersonalInfo } from "../profile/personal-info";
import { VerificationBanner } from "../profile/verification-banner";
import { FAQSection } from "../profile/faq-section";
import { TwoFactorSection } from "../dashboard/settings/two-factor-section";
import { getActivityLog } from "@/lib/api/activity";
import { Pagination } from "@/components/shared/pagination";

export function TabsSettings() {
  const [isActiveTap, setIsActiveTap] = useState<undefined | string>();

  return (
    <Tabs
      defaultValue="account"
      onValueChange={(tap) => {
        setIsActiveTap(tap);
      }}
    >
      <TabsList variant="line" className="gap-1 sm:gap-2 mb-7.5 sm:mb-9">
        <TabsTrigger value="account">
          <AccountIcon
            color={isActiveTap === "account" ? "#000" : ""}
            className="size-3.5"
          />
          Account Info
        </TabsTrigger>
        <TabsTrigger value="security">
          <SecurityIcon
            color={isActiveTap === "security" ? "#000" : ""}
            className="size-3.5"
          />
          Security
        </TabsTrigger>
        <TabsTrigger value="notification">
          <SecurityIcon
            color={isActiveTap === "notification" ? "#000" : ""}
            className="size-3.5"
          />
          Notification
        </TabsTrigger>
        <TabsTrigger value="identity">
          <IdentityIcon
            color={isActiveTap === "identity" ? "#000" : ""}
            className="size-3.5"
          />
          Identity Verification
        </TabsTrigger>
        <TabsTrigger value="activity">
          <History
            color={isActiveTap === "activity" ? "#000" : ""}
            className="size-3.5"
          />
          Activity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountInfo />
      </TabsContent>
      <TabsContent value="security">
        <div className="rounded-2xl border-[#8C8C8C] border-[0.25px] bg-card">
          <h3 className="text-muted-foreground mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
            Two-Factor Authentication
          </h3>
          <TwoFactorSection />
        </div>
        <div className="mt-6">
          <Security />
        </div>
      </TabsContent>
      <TabsContent value="notification">
        <Notification />
      </TabsContent>
      <TabsContent value="identity">
        {" "}
        {/* Identity Verification Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Left Column: Profile Card */}
          <div className="h-full">
            <ProfileOverview />
          </div>

          {/* Right Column: Content Stack */}
          <div className="space-y-6">
            <PersonalInfo />
            <VerificationBanner />
          </div>
        </div>
        {/* Full Width FAQ Section */}
        <div className="w-full">
          <FAQSection />
        </div>
      </TabsContent>
      <TabsContent value="activity">
        <ActivityContent />
      </TabsContent>
    </Tabs>
  );
}

function ActivityContent() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const eventIconMap: Record<string, any> = {
    login: LogIn,
    logout: UserX,
    password_changed: KeyRound,
    profile_updated: Edit3,
    '2fa_enabled': Shield,
    '2fa_disabled': ShieldOff,
    withdrawal_submitted: ArrowUpFromLine,
    kyc_verified: UserCheck,
  }

  const PER_PAGE = 20

  useEffect(() => {
    getActivityLog()
      .then(setEvents)
      .catch((err: any) => setError(err instanceof Error ? err.message : "Failed to load activity"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-muted-foreground">No activity recorded yet</p>
      </div>
    )
  }

  const totalPages = Math.ceil(events.length / PER_PAGE)
  const paginatedEvents = events.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {paginatedEvents.map((event: any) => {
          const Icon = eventIconMap[event.type] || LogIn
          return (
            <div key={event.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <div className="mt-0.5 rounded-full bg-muted p-2">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                  {event.deviceInfo && <span>{event.deviceInfo}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
              {event.type === "login" && (
                <button className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
                  This was not me
                </button>
              )}
            </div>
          )
        })}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
