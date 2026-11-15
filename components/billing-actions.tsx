"use client";

import { useState } from "react";

type PlanKey = "pro_monthly" | "pro_yearly";
type BillingAction = PlanKey | "portal";

type BillingActionsProps = {
  hasCustomer: boolean;
};

export function BillingActions({ hasCustomer }: BillingActionsProps) {
  const [busy, setBusy] = useState<BillingAction | null>(null);
  const [error, setError] = useState("");

  async function run(path: string, planKey?: PlanKey) {
    setBusy(planKey ?? "portal");
    setError("");

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(planKey ? { body: JSON.stringify({ plan_key: planKey }) } : {})
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "Billing request failed.");
      if (!result.url) throw new Error("The billing provider did not return a redirect URL.");

      window.location.assign(result.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open billing.");
      setBusy(null);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      {hasCustomer ? (
        <button
          onClick={() => run("/api/billing/portal")}
          disabled={busy !== null}
          className="w-full rounded-full border border-black px-5 py-4 text-sm font-bold transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {busy === "portal" ? "Opening billing…" : "Manage subscription"}
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => run("/api/billing/checkout", "pro_monthly")}
            disabled={busy !== null}
            className="rounded-full bg-black px-5 py-4 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {busy === "pro_monthly" ? "Opening checkout…" : "Upgrade to Pro monthly"}
          </button>
          <button
            onClick={() => run("/api/billing/checkout", "pro_yearly")}
            disabled={busy !== null}
            className="rounded-full bg-[#c8f169] px-5 py-4 text-sm font-bold text-black transition hover:bg-[#b7e653] disabled:opacity-50"
          >
            {busy === "pro_yearly" ? "Opening checkout…" : "Upgrade to Pro yearly"}
          </button>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
