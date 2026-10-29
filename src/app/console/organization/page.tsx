"use client";

import { useEffect, useState } from "react";
import { useConsole } from "../console-context";
import type { ConsoleOrganization } from "../console-context";
import {
  authHeaders,
  useServiceHealth,
  planFromHealth,
  type ServiceHealth,
  type HealthConfig,
} from "../console-utils";
import { AUTH_API_URL, SERVICE_DOMAIN } from "@/lib/constants";
import Link from "next/link";

export default function OrganizationPage() {
  const { session } = useConsole();

  if (!session?.organization) {
    return (
      <div className="text-gray-500 text-sm py-12 text-center">
        No organization selected.
      </div>
    );
  }

  return (
    <OrganizationInfo
      organization={session.organization}
      permissions={session.permissions}
    />
  );
}

function OrganizationInfo({
  organization,
  permissions,
}: {
  organization: ConsoleOrganization;
  permissions: string[];
}) {
  const health = useServiceHealth(organization.slug);
  const isAdmin = permissions.includes("l4:admin");

  // Shared period state: flipping daily/weekly/monthly on one chart
  // cascades to every other usage chart in the tab.
  const [period, setPeriod] = useState<Period>("daily");

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Registered as", value: (
      <div className="flex justify-between">
        <strong>{organization.name}</strong>
        <span className="italic text-gray-400">{new Date(organization.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) }
        </span>
      </div>
      )
    },
    {
      label: "Subscription",
      value: (
        <ServiceDetails
          health={health}
          isAdmin={isAdmin}
          slug={organization.slug}
        />
      ),
    },
    {
      label: "L4 Hosting",
      value: (
        <>
          <div className="w-full mb-4">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <DeploymentUrl slug={organization.slug} health={health} />
              {isAdmin && health.state === "ok" && (
                <RestartServiceButton slug={organization.slug} />
              )}
            </div>
          </div>
          <UsageChart
            slug={organization.slug}
            health={health}
            isAdmin={isAdmin}
            period={period}
            onPeriodChange={setPeriod}
          />
        </>
      ),
    },
    {
      label: "Legalese AI Usage",
      value: (
        <AiUsageChart
          slug={organization.slug}
          health={health}
          isAdmin={isAdmin}
          period={period}
          onPeriodChange={setPeriod}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <dl className="divide-y divide-gray-100 min-w-0">
        {rows.map(({ label, value }) => (
          <div key={label} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 break-words">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Deployment URL ──────────────────────────────────────────────────────

function DeploymentUrl({ slug, health }: { slug: string; health: ServiceHealth }) {
  const url = `https://${slug}.${SERVICE_DOMAIN}`;
  let dot: React.ReactNode;
  let suffix: React.ReactNode = null;

  if (health.state === "loading") {
    dot = (
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-300 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-300" />
      </span>
    );
  } else if (health.state === "error") {
    dot = (
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-300" />
      </span>
    );
    suffix = <span className="text-gray-400 text-sm">unavailable</span>;
  } else {
    const allStatuses = health.data.instances.map((i) => i.deploymentStatus).filter(Boolean);
    const total = allStatuses.reduce((sum, s) => sum + (s?.total ?? 0), 0);
    const failed = allStatuses.reduce((sum, s) => sum + (s?.failed ?? 0), 0);
    const compiling = allStatuses.reduce((sum, s) => sum + (s?.compiling ?? 0), 0);

    if (health.data.status === "idle") {
      dot = (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
        </span>
      );
      suffix = <span className="text-gray-400 text-sm">idle</span>;
    } else {
      const dotColor =
        failed > 0 ? "bg-red-500"
        : compiling > 0 ? "bg-yellow-400"
        : "bg-green-500";
      dot = (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
        </span>
      );
      suffix = (
        <span className="text-gray-400 text-sm">
          {total === 1 ? "1 deployment" : `${total} deployments`}
        </span>
      );
    }
  }

  // Extract build tag from binaryUrl (e.g. ".../releases/download/l4-ide-build-63/..." → "l4-ide-build-63")
  const buildTag = health.state === "ok" && health.data.config?.binaryUrl
    ? health.data.config.binaryUrl.match(/\/releases\/download\/([^/]+)\//)?.[1] ?? null
    : null;

  return (
    <div>
      <span className="inline-flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-2">
          {dot}
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
            {url}
          </a>
        </span>
        {suffix}
      </span>
      {buildTag && <div className="text-gray-400 font-mono text-xs mt-1">{buildTag}</div>}
    </div>
  );
}

// ── Restart Button ──────────────────────────────────────────────────────

function RestartServiceButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "confirming" | "restarting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleRestart() {
    setState("restarting");
    setErrorMsg("");
    try {
      const res = await fetch(`${AUTH_API_URL}/service/restart?org=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? body.detail ?? `HTTP ${res.status}`);
      }
      setState("success");
      setTimeout(() => setState("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Restart failed");
      setState("error");
      setTimeout(() => setState("idle"), 5000);
    }
  }

  if (state === "confirming") {
    return (
      <span className="inline-flex items-center gap-2 text-sm">
        <span className="text-gray-500">Restart service?</span>
        <button onClick={handleRestart} className="text-red-600 hover:text-red-700 font-medium underline underline-offset-2">Yes, restart</button>
        <button onClick={() => setState("idle")} className="text-gray-500 hover:text-gray-700 underline underline-offset-2">Cancel</button>
      </span>
    );
  }
  if (state === "restarting") {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-gray-500">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Restarting...
      </span>
    );
  }
  if (state === "success") return <span className="text-sm text-green-600">Service restarted</span>;
  if (state === "error") return <span className="text-sm text-red-600">{errorMsg}</span>;
  return (
    <button onClick={() => setState("confirming")} className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
      Restart service
    </button>
  );
}

// ── Service Details ─────────────────────────────────────────────────────

function ServiceDetails({
  health,
  isAdmin,
  slug,
}: {
  health: ServiceHealth;
  isAdmin: boolean;
  slug: string;
}) {
  if (health.state !== "ok" || !health.data.config) return null;
  const cfg = health.data.config;
  const instanceCount = health.data.instances.length;
  // jl4-service runtime knobs are namespaced under cfg.jl4 (mirrors the
  // on-disk shape under .jl4 in /efs/config). Same pattern as cfg.ai.
  const jl4 = cfg.jl4;
  const hostingDetails = [
    { label: "Instances", value: String(instanceCount) || "1" },
    { label: "Max deployments", value: String(jl4?.maxDeployments ?? "-") },
    { label: "Max concurrent requests", value: String(jl4?.maxConcurrentRequests ?? "-") },
    { label: "Max evaluation memory", value: `${jl4?.evalMemoryMb ?? "-"} MB` },
    { label: "Compile memory", value: `${jl4?.compileMemoryMb ?? "-"} MB` },
    { label: "Evaluation timeout", value: `${jl4?.evalTimeoutSeconds ?? "-"}s` },
    { label: "Compile timeout", value: `${jl4?.compileTimeoutSeconds ?? "-"}s` },
    { label: "Max deployment size", value: `${jl4?.maxZipSizeMb ?? "-"} MB` },
    { label: "Idle timeout", value: jl4?.idleTimeoutHours === 0 ? "Always on" : `${jl4?.idleTimeoutHours ?? "-"} hours` },
    { label: "Daily request limit", value: String(!jl4?.dailyRequestLimit ? "Unlimited (metered)" : jl4.dailyRequestLimit) },
  ];

  // Fold in AI limits when auth-proxy surfaced them from the shared
  // /efs/config files (.ai block). Undefined means no `.ai` configured
  // yet — we hide the rows rather than show a half-populated panel.
  const aiDetails: { label: string; value: string }[] = [];
  const ai = cfg.ai;
  if (ai) {
    if (typeof ai.dailyTokenLimit === "number") {
      aiDetails.push({
        label: "Daily token limit",
        value:
          ai.dailyTokenLimit > 0
            ? formatTokenLimit(ai.dailyTokenLimit)
            : "Unlimited (metered)",
      });
    }
    if (typeof ai.conversationTtlDays === "number") {
      aiDetails.push({
        label: "Conversation retention",
        value: `${ai.conversationTtlDays} days`,
      });
    }
  }
  return (
    <div>
      {cfg.suspended && (
        <div className="mb-3 flex items-start gap-2 rounded border border-yellow-400 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800">
          <span className="shrink-0">⚠</span>
          <span>
            This organization has been suspended.{" "}
            {isAdmin ? (
              <>Please contact <a href={`mailto:support@legalese.com?subject=${encodeURIComponent(`Account suspended - ${slug}`)}`} className="underline underline-offset-2">support@legalese.com</a>.</>
            ) : (
              "Please contact your administrator."
            )}
          </span>
        </div>
      )}
      <details className="group">
        <summary className="flex items-center justify-between gap-3 cursor-pointer select-none list-none text-gray-600 hover:text-gray-900">
          <span className="inline-flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-3.5 w-3.5 text-gray-400 transition-transform duration-150 group-open:rotate-90"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{planFromHealth(health)}</span>
          </span>
          <PlanActionButton
            slug={slug}
            mode={planActionMode(cfg)}
            isAdmin={isAdmin}
          />
        </summary>
        <div
          className="mt-2 grid sm:grid-cols-2 gap-x-8 gap-y-4"
          style={{ padding: "8px 12px", border: "1px solid #eee", borderRadius: "4px" }}
        >
          <div>
            <b className="block text-gray-500 mb-1.5">L4 Hosting</b>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              {hostingDetails.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-gray-400">{label}</dt>
                  <dd className="text-gray-600 font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {aiDetails.length > 0 && (
            <div>
              <b className="block text-gray-500 mb-1.5">Legalese AI</b>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                {aiDetails.map(({ label, value }) => (
                  <div key={label} className="contents">
                    <dt className="text-gray-400">{label}</dt>
                    <dd className="text-gray-600 font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

// ── Plan Action Button ─────────────────────────────────────────────────
//
// Sits to the right of the plan label inside the <summary> line.
// Free orgs see "Upgrade to Metered" → /console/billing/upgrade/metered.
// Paid orgs see "Manage" → POSTs to /billing/portal and follows the URL
// Stripe returns (same flow as /console/billing's manage button).
//
// Non-admins see nothing (the underlying endpoints require l4:admin, and
// the upgrade page itself renders an "ask an admin" hint — no need to
// surface a button that leads to a dead-end for them).
//
// stopPropagation everywhere so clicks don't also toggle the parent
// <details> element. preventDefault on the upgrade Link because the
// summary's default toggle action would otherwise fire alongside the
// client-side navigation.

// Free orgs whose daily caps are both already "unlimited" (the metered
// signal — dailyRequestLimit/dailyTokenLimit === 0) are typically
// internal / comp'd accounts. Surfacing an Upgrade button to them would
// be misleading: their limits already match the paid plan, they just
// don't have a Stripe relationship. Return null in that case so the
// summary line is clean.
function planActionMode(cfg: HealthConfig): "upgrade" | "manage" | null {
  if (cfg.plan !== "free") return "manage";
  const hasRequestCap = cfg.jl4.dailyRequestLimit > 0;
  const hasTokenCap = (cfg.ai?.dailyTokenLimit ?? 0) > 0;
  return hasRequestCap || hasTokenCap ? "upgrade" : null;
}

function PlanActionButton({
  slug,
  mode,
  isAdmin,
}: {
  slug: string;
  mode: "upgrade" | "manage" | null;
  isAdmin: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin || mode === null) return null;

  async function openPortal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        `${AUTH_API_URL}/billing/portal?org=${encodeURIComponent(slug)}`,
        {
          method: "POST",
          headers: authHeaders(),
          credentials: "include",
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (!url) throw new Error("Portal URL not returned");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open portal");
      setSubmitting(false);
    }
  }

  if (mode === "manage") {
    return (
      <span className="inline-flex items-center gap-2">
        {error && <span className="text-xs text-red-600">{error}</span>}
        <button
          onClick={openPortal}
          disabled={submitting}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:border-gray-400 hover:text-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Opening…" : "Manage"}
        </button>
      </span>
    );
  }

  return (
    <Link
      href="/console/billing/upgrade/metered"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center px-3 py-1 bg-accent text-white text-xs font-medium rounded hover:bg-accent-hover transition-colors"
    >
      Upgrade to Metered
    </Link>
  );
}

// ── Usage Chart ─────────────────────────────────────────────────────────

type Period = "daily" | "weekly" | "monthly";
const PERIODS: Period[] = ["daily", "weekly", "monthly"];

interface Bucket {
  label: string;
  count: number;
  /** Bucket cost in cents (integer, ceiled). 0 for free orgs. */
  costCents?: number;
}

type L4Metric = "requests" | "cost";

/**
 * Top-level currency from the /billing/usage response, derived from the
 * org's Stripe prices. Null for free orgs — gates whether the Cost option
 * is offered in the chart's metric dropdown.
 */
function isCostAvailable(currency: string | null): currency is string {
  return currency !== null;
}

function formatCostCents(cents: number, currency: string): string {
  // Backend already ceiled to whole cents. Display in major units.
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function UsageChart({
  slug,
  health,
  isAdmin,
  period,
  onPeriodChange,
}: {
  slug: string;
  health: ServiceHealth;
  isAdmin: boolean;
  period: Period;
  onPeriodChange: (p: Period) => void;
}) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [currency, setCurrency] = useState<string | null>(null);
  const [metric, setMetric] = useState<L4Metric>("requests");
  const [loading, setLoading] = useState(true);
  // Sticky today count for the limit-hit warning. Updated only when
  // the chart fetch is on the daily period (chart's last bucket =
  // today). Never overwritten back to null — once we know today's
  // value, we keep it so the warning persists across period
  // switches. Resets on full page reload (next UTC day).
  const [todayCount, setTodayCount] = useState<number | null>(null);

  const days = period === "daily" ? 30 : 90;

  useEffect(() => {
    if (health.state !== "ok") return;
    let cancelled = false;
    setLoading(true);

    fetch(`${AUTH_API_URL}/billing/usage?org=${encodeURIComponent(slug)}&period=${period}&days=${days}`, {
      headers: authHeaders(),
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          const b: Bucket[] = data.buckets ?? [];
          setBuckets(b);
          setCurrency(typeof data.currency === "string" ? data.currency : null);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug, period, days, health.state]);

  // If the cost option becomes unavailable (free plan), drop the user
  // back to the requests view rather than rendering an empty chart.
  useEffect(() => {
    if (metric === "cost" && !isCostAvailable(currency)) setMetric("requests");
  }, [metric, currency]);

  // Latch today's count from the daily chart fetch. Backend always
  // emits a today bucket (see
  // jl4-auth-proxy/src/billing/usage-api.ts:generateLabels).
  useEffect(() => {
    if (period === "daily" && buckets.length > 0) {
      setTodayCount(buckets[buckets.length - 1]!.count);
    }
  }, [period, buckets]);

  if (health.state === "loading") {
    return <div className="h-32 flex items-center justify-center text-gray-400 text-xs">Loading...</div>;
  }
  if (health.state === "error") {
    return <span className="text-gray-400 text-sm">Service temporarily unavailable</span>;
  }

  const labelInterval = period === "daily" ? 5 : 1;

  return (
    <div>
      {(() => {
        const limit = health.data.config?.jl4?.dailyRequestLimit ?? 0;
        if (limit > 0 && todayCount !== null && todayCount >= limit) {
          return (
            <div className="mb-3 flex items-start gap-2 rounded border border-yellow-400 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800">
              <span className="shrink-0">⚠</span>
              <span>
                You have reached your daily request limit.{" "}
                {isAdmin ? (
                  <Link
                    href="/console/billing/upgrade/metered"
                    className="underline underline-offset-2"
                  >
                    Upgrade your plan to unlock more.
                  </Link>
                ) : (
                  "Please contact your administrator."
                )}
              </span>
            </div>
          );
        }
        return null;
      })()}

      {/* Period selector + cost toggle (when the org has a paid plan) */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <PeriodSelector period={period} onChange={onPeriodChange} />
        {isCostAvailable(currency) && (
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as L4Metric)}
            className="text-xs rounded border border-gray-200 bg-white px-2 py-0.5 text-gray-600"
          >
            <option value="requests">Requests</option>
            <option value="cost">Cost</option>
          </select>
        )}
      </div>

      <BarChart
        series={[
          metric === "cost" && isCostAvailable(currency)
            ? {
                buckets: buckets.map((b) => ({
                  label: b.label,
                  count: b.costCents ?? 0,
                })),
                className: "bg-accent/70 hover:bg-accent",
                label: "Cost",
                formatValue: (n) => formatCostCents(n, currency),
              }
            : {
                buckets,
                className: "bg-accent/70 hover:bg-accent",
                label: "Requests",
              },
        ]}
        loading={loading}
        period={period}
        labelInterval={labelInterval}
        bucketLabels={buckets.map((b) => b.label)}
      />

      <p className="text-xs text-gray-500 mt-2">
        These are the number of requests made to your L4 service. To get started, deploy your first L4 rules using our <a href="https://marketplace.visualstudio.com/items?itemName=Legalese.l4-vscode" target="_blank" rel="noopener">Visual Studio Code L4 Extension</a> or try the <a href="https://play.legalese.com" target="_blank" rel="noopener">online editor</a>.
      </p>
    </div>
  );
}

// ── AI Usage Chart ──────────────────────────────────────────────────────
//
// Token consumption from the ai-proxy (via auth-proxy's shared
// /billing/usage endpoint with source=ai-chat). Filter by pipeline model
// and by token metric; inherits the shared `period` state so flipping
// daily/weekly/monthly moves this chart in lockstep with the L4 one.

type AiMetric =
  | "totalTokens"
  | "promptTokens"
  | "completionTokens"
  | "requests"
  | "audioSeconds"
  | "cost";
const AI_METRICS: { value: AiMetric; label: string }[] = [
  { value: "totalTokens", label: "Total tokens" },
  { value: "promptTokens", label: "Prompt tokens" },
  { value: "completionTokens", label: "Completion tokens" },
  { value: "requests", label: "Requests" },
  { value: "audioSeconds", label: "Audio minutes" },
  { value: "cost", label: "Cost" },
];

// No frontend-side mapping for model labels — we surface whatever id
// the /billing/usage response uses (`legalese-compose-4`, etc.) so a
// new pipeline shipped server-side surfaces here with no frontend
// deploy needed.

interface AiModelTotals {
  promptTokens: number;
  completionTokens: number;
  requests: number;
  /**
   * Seconds of audio transcribed. Only the dictation pipeline
   * (`legalese-listen-4`) has any — its speech-to-text model is priced
   * per second and reports no tokens, so this is its usage figure.
   */
  audioSeconds?: number;
  /** Per-model cost (whole cents). Absent when not priced. */
  costCents?: number;
}

interface AiBucket {
  label: string;
  perModel: Record<string, AiModelTotals>;
  /** Top-level cost — sum of per-model costs. */
  costCents?: number;
}

function aiMetricValue(m: AiModelTotals | undefined, metric: AiMetric): number {
  if (!m) return 0;
  switch (metric) {
    case "promptTokens":
      return m.promptTokens;
    case "completionTokens":
      return m.completionTokens;
    case "requests":
      return m.requests;
    case "totalTokens":
      return m.promptTokens + m.completionTokens;
    case "audioSeconds":
      return m.audioSeconds ?? 0;
    case "cost":
      return m.costCents ?? 0;
  }
}

/** Tooltip text for an audio duration: "45s", "3m 05s", "1h 02m". */
function formatAudioDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

function AiUsageChart({
  slug,
  health,
  isAdmin,
  period,
  onPeriodChange,
}: {
  slug: string;
  health: ServiceHealth;
  isAdmin: boolean;
  period: Period;
  onPeriodChange: (p: Period) => void;
}) {
  // One fetch per (slug, period, days) — the response carries the full
  // per-model breakdown so metric/model switching is purely client-side.
  const [aiBuckets, setAiBuckets] = useState<AiBucket[]>([]);
  const [currency, setCurrency] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<AiMetric>("totalTokens");
  const [model, setModel] = useState<string>("");
  const days = period === "daily" ? 30 : 90;

  useEffect(() => {
    if (health.state !== "ok") return;
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      org: slug,
      source: "ai-chat",
      period,
      days: String(days),
    });
    fetch(`${AUTH_API_URL}/billing/usage?${params.toString()}`, {
      headers: authHeaders(),
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setAiBuckets((data.buckets ?? []) as AiBucket[]);
          setCurrency(
            typeof data.currency === "string" ? data.currency : null,
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, period, days, health.state]);

  // If the buckets refresh and no longer carry the currently-selected
  // model (period changed, model retired, etc.), snap back to
  // "All uses" (model pipelines) so the dropdown's value isn't an option that's not
  // in its <option> list.
  useEffect(() => {
    if (!model) return;
    if (aiBuckets.length === 0) return;
    const stillThere = aiBuckets.some((b) => {
      const t = b.perModel[model];
      return (
        t &&
        (t.promptTokens > 0 || t.completionTokens > 0 || t.requests > 0)
      );
    });
    if (!stillThere) setModel("");
  }, [aiBuckets, model]);

  // "Audio minutes" is only offered while the window has dictation
  // usage. Same snap-back as above when a refresh takes it away.
  const hasAudio = aiBuckets.some((b) =>
    Object.values(b.perModel).some((m) => (m.audioSeconds ?? 0) > 0),
  );
  useEffect(() => {
    if (metric !== "audioSeconds") return;
    if (aiBuckets.length === 0) return;
    if (!hasAudio) setMetric("totalTokens");
  }, [aiBuckets, metric, hasAudio]);

  if (health.state === "loading") {
    return <div className="h-32 flex items-center justify-center text-gray-400 text-xs">Loading...</div>;
  }
  if (health.state === "error") {
    return <span className="text-gray-400 text-sm">Service temporarily unavailable</span>;
  }

  // Today's total tokens for the limit-hit warning. Cheap to derive each
  // render from the already-fetched buckets (no useEffect/latch needed).
  let todayTokens: number | null = null;
  if (period === "daily" && aiBuckets.length > 0) {
    const last = aiBuckets[aiBuckets.length - 1]!;
    todayTokens = Object.values(last.perModel).reduce(
      (sum, m) => sum + m.promptTokens + m.completionTokens,
      0,
    );
  }

  const labelInterval = period === "daily" ? 5 : 1;
  const isCostView = metric === "cost" && isCostAvailable(currency);
  const formatValue = isCostView
    ? (n: number) => formatCostCents(n, currency)
    : metric === "audioSeconds"
      ? formatAudioDuration
      : undefined;

  // Build a Bucket[] for a given model from the cached per-model
  // breakdown. The same shape works for token metrics and cost — the
  // selector lives in aiMetricValue().
  const bucketsForModel = (modelId: string): Bucket[] =>
    aiBuckets.map((b) => ({
      label: b.label,
      count: aiMetricValue(b.perModel[modelId], metric),
    }));

  // Models with any usage in the window, in a stable order. Drives
  // both the filter dropdown and the "All uses" (model pipelines) series stack — so a
  // new pipeline shipped server-side surfaces here automatically on
  // the next refresh, no frontend deploy needed. Sorted by first
  // appearance to keep the legend stable across re-renders.
  const usedModels: string[] = [];
  const seen = new Set<string>();
  for (const b of aiBuckets) {
    for (const [m, totals] of Object.entries(b.perModel)) {
      if (seen.has(m)) continue;
      if (
        totals.promptTokens > 0 ||
        totals.completionTokens > 0 ||
        totals.requests > 0
      ) {
        seen.add(m);
        usedModels.push(m);
      }
    }
  }

  // Opacity assigned by position in usedModels so the colors stay
  // distinct as the set grows. 5+ models would start to look samey —
  // acceptable for the foreseeable future (compose, summize, comply,
  // listen).
  const stackOpacities = [
    "bg-accent/70",
    "bg-accent/35",
    "bg-accent/55",
    "bg-accent/20",
  ];
  const stackHovers = [
    "hover:bg-accent",
    "hover:bg-accent/55",
    "hover:bg-accent/75",
    "hover:bg-accent/40",
  ];

  const visible = model === "" ? usedModels : [model];
  const series: Series[] = [];
  for (const m of visible) {
    const buckets = bucketsForModel(m);
    if (!buckets.some((b) => b.count > 0)) continue;
    const idx = usedModels.indexOf(m);
    const className =
      model === "" && idx >= 0
        ? `${stackOpacities[idx % stackOpacities.length]} ${stackHovers[idx % stackHovers.length]}`
        : "bg-accent/70 hover:bg-accent";
    series.push({
      buckets,
      className,
      label: m,
      formatValue,
    });
  }

  return (
    <div>
      {(() => {
        const limit = health.data.config?.ai?.dailyTokenLimit ?? 0;
        if (limit > 0 && todayTokens !== null && todayTokens >= limit) {
          return (
            <div className="mb-3 flex items-start gap-2 rounded border border-yellow-400 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800">
              <span className="shrink-0">⚠</span>
              <span>
                You have reached your daily AI token limit.{" "}
                {isAdmin ? (
                  <Link
                    href="/console/billing/upgrade/metered"
                    className="underline underline-offset-2"
                  >
                    Upgrade your plan to unlock more.
                  </Link>
                ) : (
                  "Please contact your administrator."
                )}
              </span>
            </div>
          );
        }
        return null;
      })()}

      {/* Period + model + metric controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <PeriodSelector period={period} onChange={onPeriodChange} />
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={usedModels.length <= 1}
          className="text-xs rounded border border-gray-200 bg-white px-2 py-0.5 text-gray-600 disabled:opacity-50"
        >
          <option value="">All uses</option>
          {usedModels.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as AiMetric)}
          className="text-xs rounded border border-gray-200 bg-white px-2 py-0.5 text-gray-600"
        >
          {AI_METRICS.filter(
            (m) =>
              (m.value !== "cost" || isCostAvailable(currency)) &&
              (m.value !== "audioSeconds" || hasAudio),
          ).map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <BarChart
        series={series}
        loading={loading}
        period={period}
        labelInterval={labelInterval}
        // Pass the full per-period label grid so an org with no AI
        // usage in the window still sees an empty grid with hoverable
        // "No use" cells, instead of a "No usage data" placeholder.
        bucketLabels={aiBuckets.map((b) => b.label)}
      />

      {/* <p className="text-xs text-gray-500 mt-2">
        Token consumption for Legalese AI chat use.
      </p> */}
    </div>
  );
}

// ── Shared chart primitives ─────────────────────────────────────────────

function PeriodSelector({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="flex gap-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-2 py-0.5 text-xs rounded transition-colors ${
            period === p
              ? "bg-accent text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
}

interface Series {
  buckets: Bucket[];
  /** Tailwind classes for the bar fill + hover state. */
  className: string;
  /** Shown in the tooltip when more than one series is visible. */
  label: string;
  /**
   * Tooltip formatter for the series' value. Defaults to integer
   * locale-string. Cost views pass a currency formatter.
   */
  formatValue?: (n: number) => string;
}

function BarChart({
  series,
  loading,
  period,
  labelInterval,
  bucketLabels,
}: {
  // Series stack in caller order: series[0] is the visual base, later
  // series layer on top. `flex-col-reverse` renders the first DOM child
  // at the bottom, matching this order naturally.
  series: Series[];
  loading: boolean;
  period: Period;
  labelInterval: number;
  /**
   * Authoritative grid labels (one entry per period bucket). When
   * provided we render every cell — including those with zero across
   * every series — so the user can hover an empty day and get a
   * "No use" tooltip. When omitted, falls back to series[0]'s
   * bucket labels (legacy callers).
   */
  bucketLabels?: string[];
}) {
  const labels = bucketLabels ?? series[0]?.buckets.map((b) => b.label) ?? [];

  if (loading || labels.length === 0) {
    return (
      <div>
        <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
          {loading ? "Loading..." : "No usage data for this period"}
        </div>
        {/* Spacer matches the label row height below the bars, so swapping
            between loading/empty/data states doesn't shift page layout. */}
        <div className="mt-1 text-[9px] leading-none invisible">&nbsp;</div>
      </div>
    );
  }

  // Scale by the tallest stacked column so bars never overflow the
  // container, regardless of how many layers each one has.
  const totals = labels.map((_, i) =>
    series.reduce((sum, s) => sum + (s.buckets[i]?.count ?? 0), 0),
  );
  const maxCount = Math.max(1, ...totals);

  return (
    <div>
      <div className="flex items-end gap-px h-32">
        {labels.map((bucketLabel, i) => {
          // Topmost visible segment = last non-zero series at this index.
          let topIdx = -1;
          for (let s = series.length - 1; s >= 0; s--) {
            if ((series[s].buckets[i]?.count ?? 0) > 0) {
              topIdx = s;
              break;
            }
          }
          const total = totals[i];
          const visibleCount = series.reduce(
            (n, s) => n + ((s.buckets[i]?.count ?? 0) > 0 ? 1 : 0),
            0,
          );
          return (
            <div
              key={bucketLabel}
              className="flex-1 flex flex-col-reverse items-stretch h-full group relative min-w-0"
            >
              {series.map((s, sIdx) => {
                const count = s.buckets[i]?.count ?? 0;
                if (count === 0) return null;
                const pct = (count / maxCount) * 100;
                const isTop = sIdx === topIdx;
                return (
                  <div
                    key={sIdx}
                    className={`w-full ${s.className} ${isTop ? "rounded-t" : ""} transition-colors min-h-[1px]`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                );
              })}
              <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {(() => {
                  if (visibleCount === 0) {
                    // Hovering an empty bucket — still show the date
                    // so the user can confirm which day they're
                    // pointing at. Beats falling back to nothing,
                    // which makes the cell feel non-interactive.
                    return (
                      <>
                        <div>{bucketLabel}</div>
                        <div className="text-gray-300">No use</div>
                      </>
                    );
                  }
                  if (visibleCount === 1) {
                    // Find the single contributing series explicitly —
                    // series[0] isn't always the one with the bar
                    // (e.g. a comply-only day in an "All uses" (model pipelines) window
                    // that also has compose / summize on other days).
                    const only = series.find(
                      (s) => (s.buckets[i]?.count ?? 0) > 0,
                    )!;
                    const c = only.buckets[i]?.count ?? 0;
                    const fmt =
                      only.formatValue ?? ((n: number) => n.toLocaleString());
                    return (
                      <>
                        <div>{bucketLabel}</div>
                        <div>
                          {only.label}: {fmt(c)}
                        </div>
                      </>
                    );
                  }
                  return (
                    <>
                      <div>{bucketLabel}</div>
                      {/* Reversed so the visually-topmost stack segment
                          (the last series) is listed first in the
                          bubble, mirroring the on-screen order. */}
                      {[...series].reverse().map((s) => {
                        const c = s.buckets[i]?.count ?? 0;
                        if (c === 0) return null;
                        const fmt =
                          s.formatValue ?? ((n: number) => n.toLocaleString());
                        return (
                          <div key={s.label}>
                            {s.label}: {fmt(c)}
                          </div>
                        );
                      })}
                      <div className="border-t border-gray-600 mt-0.5 pt-0.5">
                        Total:{" "}
                        {(
                          series[0]?.formatValue ??
                          ((n: number) => n.toLocaleString())
                        )(total)}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
      {/* text-[9px] leading-none on the row collapses each cell's line
          box to exactly 9px, matching the loading-state spacer below.
          Without this, cells inherit the larger ancestor line-height and
          the chart ends up ~12px taller than the loading placeholder. */}
      <div className="flex gap-px mt-1 text-[9px] leading-none">
        {labels.map((label, i) => {
          // Daily view: first label sits on the 2nd bar, then every 4th
          // (indices 1, 5, 9, …). Other periods: every `labelInterval`.
          const showLabel =
            period === "daily"
              ? i >= 1 && (i - 1) % 4 === 0
              : i % labelInterval === 0;
          return (
            <div key={label} className="flex-1 text-center">
              {showLabel ? (
                // -mx-[10px] lets the label overflow its narrow cell into
                // the (empty) neighbours so "Mar 23" stays on one line.
                <span className="text-gray-400 whitespace-nowrap inline-block -mx-[10px]">
                  {formatLabel(label, period)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatLabel(label: string, period: Period): string {
  if (period === "monthly") {
    // "2026-03" → "Mar" (noon UTC avoids day-boundary timezone shifts)
    const d = new Date(label + "-01T12:00:00Z");
    return d.toLocaleDateString(undefined, { month: "short" });
  }
  // daily/weekly: "2026-03-23" → "Mar 23"
  const d = new Date(label + "T12:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Render a token quota at human scale: "10M", "2.5M", "250K".
 * Plain `toLocaleString()` on "10000000" is readable but long — the
 * subscription panel is compact, so abbreviate when we can lose no
 * meaningful precision.
 */
function formatTokenLimit(tokens: number): string {
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000;
    const value = Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1);
    return `${value}M`;
  } else if (tokens >= 1_000) {
    const m = tokens / 1_000;
    const value = Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1);
    return `${value}K`;
  }
  return `${tokens}`;
}
