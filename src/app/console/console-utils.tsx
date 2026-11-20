"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { AUTH_API_URL } from "@/lib/constants";
import { useConsole } from "./console-context";

export const SESSION_TOKEN_KEY = "wos-session-token";
export const REDIRECT_TO_KEY = "auth-redirect-to";
/** PKCE challenge of the editor waiting at REDIRECT_TO_KEY, when it sent one
 *  (lib/auth-login.ts): Continue then starts the editor's own sign-in. */
export const REDIRECT_CHALLENGE_KEY = "auth-redirect-challenge";

export function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(SESSION_TOKEN_KEY)
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// A 401 on any of the org-scoped fetches (/service/*, /auth/widget-token,
// etc.) means the bearer we have no longer speaks for the requested org —
// typically because the session was logged out or the account was
// switched in another tab. Drop the stale token and reload so the shell
// re-initialises and shows the correct (signed-out) state.
let reloadScheduled = false;
export function handleUnauthorized(): void {
  if (typeof window === "undefined" || reloadScheduled) return;
  reloadScheduled = true;
  localStorage.removeItem(SESSION_TOKEN_KEY);
  window.location.reload();
}

// ── Service Health ──────────────────────────────────────────────────────

export interface HealthInstance {
  status: string;
  deployments: string[];
  deploymentStatus?: {
    total: number;
    ready: number;
    compiling: number;
    failed: number;
  } | null;
  token?: string;
}

export interface HealthConfig {
  /** Slug: "free", "<templateName>", or "custom" (legacy paid orgs). */
  plan: string;
  /**
   * Friendly display name from the template definition (e.g. "Metered Plan").
   * Null for the "free" slug and legacy "custom" — those fall back to
   * PLAN_LABELS in planFromHealth().
   */
  planName: string | null;
  /**
   * Display-only billing period from the template definition
   * ("monthly" | "yearly"). Null for free and legacy plans.
   */
  billingPeriod: string | null;
  binaryUrl: string | null;
  suspended: boolean;
  /**
   * jl4-service runtime knobs. Namespaced to mirror the on-disk shape
   * in defaults.json / orgs/{slug}.json under `.jl4`. Field names match
   * the config file directly.
   */
  jl4: HealthJl4Config;
  /**
   * ai-proxy's `.ai` sub-object from the shared /efs/config files
   * (defaults merged with per-org override). Owned by ai-proxy's
   * schema — treat as an opaque record and read individual fields at
   * the call site. Undefined when no `.ai` block is configured.
   */
  ai?: HealthAiConfig;
}

export interface HealthJl4Config {
  dailyRequestLimit: number;
  blockOnOverage: boolean;
  maxConcurrentRequests: number;
  maxDeployments: number;
  evalMemoryMb: number;
  compileMemoryMb: number;
  evalTimeoutSeconds: number;
  compileTimeoutSeconds: number;
  maxZipSizeMb: number;
  idleTimeoutHours: number;
  publicDeployments: string[];
}

export interface HealthAiConfig {
  dailyTokenLimit?: number;
  conversationTtlDays?: number;
  blockOnOverage?: boolean;
  context?: Record<string, unknown>;
  /**
   * The org admin's daily AI spend limit, in minor units of `currency`
   * (the plan's currency when it was set). Absent = no limit. Set via
   * POST /billing/ai-spend-limit.
   */
  spendLimit?: AiSpendLimit;
}

export interface AiSpendLimit {
  dailyCents: number;
  currency: string;
}

export interface HealthData {
  status: string;
  instances: HealthInstance[];
  config: HealthConfig;
}

export type ServiceHealth =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ok"; data: HealthData };

/**
 * Plan label rendering rule:
 *
 *  1. If `config.planName` is present, use it directly. The auth-proxy
 *     resolves it from the template's `name` field, so adding a new
 *     paid template = no frontend change.
 *  2. Else fall back to PLAN_LABELS for the two slugs the backend
 *     produces without a template lookup: "free" (no subscription)
 *     and "custom" (legacy paid orgs upgraded before the template flow).
 *  3. Else title-case the slug so a future backend that surfaces a
 *     new slug still renders something legible.
 *
 * When the org is suspended, append " (suspended)" so the label on the
 * Subscription row is honest about state — the page also shows a
 * separate banner, but the row itself shouldn't claim everything's fine.
 */
const PLAN_LABELS: Record<string, string> = {
  free: "Free plan",
  custom: "Custom plan",
};

export function planFromHealth(health: ServiceHealth): string {
  if (health.state !== "ok" || !health.data.config) return "Free plan";
  const cfg = health.data.config;
  const baseLabel =
    cfg.planName ??
    PLAN_LABELS[cfg.plan] ??
    cfg.plan.charAt(0).toUpperCase() + cfg.plan.slice(1) + " plan";
  return cfg.suspended ? `${baseLabel} (suspended)` : baseLabel;
}

export function useServiceHealth(slug: string): ServiceHealth {
  const [health, setHealth] = useState<ServiceHealth>({ state: "loading" });

  useEffect(() => {
    if (!slug) {
      setHealth({ state: "error" });
      return;
    }

    function fetchHealth() {
      fetch(`${AUTH_API_URL}/service/health?org=${encodeURIComponent(slug)}`, {
        headers: authHeaders(),
        credentials: "include",
      })
        .then(async (res) => {
          if (res.status === 401) {
            handleUnauthorized();
            return;
          }
          if (!res.ok) {
            setHealth({ state: "error" });
            return;
          }
          const data: HealthData = await res.json().catch(() => ({}));
          setHealth({ state: "ok", data });
        })
        .catch(() => setHealth({ state: "error" }));
    }

    fetchHealth();

    let timer: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (!timer) timer = setInterval(fetchHealth, 10_000);
    }

    function stopPolling() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchHealth();
        startPolling();
      } else {
        stopPolling();
      }
    }

    if (document.visibilityState === "visible") startPolling();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [slug]);

  return health;
}

// ── Widget Token ────────────────────────────────────────────────────────

export function useWidgetToken(organizationId: string | null, scope: string) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    if (!organizationId || !scope) return;
    setToken(null);
    setError(null);

    try {
      const res = await fetch(`${AUTH_API_URL}/auth/widget-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          organizationId,
          scopes: [scope],
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Failed to load widget");
        return;
      }

      const data = await res.json();
      setToken(data.token);
    } catch {
      setError("Service temporarily unavailable");
    }
  }, [organizationId, scope]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return { token, error };
}

// ── Widget Page Wrapper ─────────────────────────────────────────────────

/**
 * Shared wrapper for WorkOS widget pages. Handles token fetching,
 * loading state, and error display — each page only needs to pass
 * the scope and render function.
 */
export function WidgetPage({
  scope,
  children,
}: {
  scope: string;
  children: (token: string) => ReactNode;
}) {
  const { session } = useConsole();
  const { token, error } = useWidgetToken(
    session?.organizationId ?? null,
    scope,
  );

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }
  if (!token) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return <>{children(token)}</>;
}
