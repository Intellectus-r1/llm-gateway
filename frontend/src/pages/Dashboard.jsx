import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getHealthStatus,
  getProviderUsage,
  getUsageHistory,
  getUsageSummary,
} from "../services/api";

function Dashboard() {
  const [usage, setUsage] = useState(null);
  const [health, setHealth] = useState(null);
  const [providerUsage, setProviderUsage] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [usageData, healthData, providerData, historyData] =
          await Promise.all([
            getUsageSummary(),
            getHealthStatus(),
            getProviderUsage(),
            getUsageHistory(),
        ]);

        setUsage(usageData);
        setHealth(healthData);
        setProviderUsage(providerData);
        setUsageHistory(historyData);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalProviderRequests = useMemo(() => {
    return providerUsage.reduce(
      (total, provider) => total + (provider.requests || 0),
      0
    );
  }, [providerUsage]);

  const getProviderPercentage = (requests) => {
    if (!totalProviderRequests) return 0;

    return Math.round((requests / totalProviderRequests) * 100);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value ?? 0);
  };

  const isGatewayHealthy = health?.status === "UP";

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-border)]" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-[var(--color-border)]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

        {/* Header */}
        <section className="flex min-w-0 flex-col gap-5 border-b border-[var(--color-border)] pb-6 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-[var(--color-muted)]">
                    <span>OVERVIEW</span>
                    <span className="opacity-50">/</span>
                    <span className="text-[var(--color-primary)]">DASHBOARD</span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                    Monitor gateway activity, token consumption, and provider performance
                    from one place.
                </p>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-3">
                <GatewayStatus healthy={isGatewayHealthy} />

                <Link
                    to="/playground"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md active:translate-y-0"
                >
                    <PlusIcon />
                    Open Playground
                </Link>
            </div>
        </section>


        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={formatNumber(usage?.totalRequests)}
          description="Gateway requests"
          icon={<RequestsIcon />}
        />

        <StatCard
          label="Total Tokens"
          value={formatNumber(
            (usage?.totalInputTokens || 0) +
              (usage?.totalOutputTokens || 0)
          )}
          description="Input + output tokens"
          icon={<TokenIcon />}
        />

        <StatCard
          label="Estimated Cost"
          value={`$${(usage?.totalEstimatedCost ?? 0).toFixed(4)}`}
          description="Tracked gateway usage"
          icon={<CostIcon />}
        />

        <StatCard
          label="Active Providers"
          value={providerUsage.length}
          description="Configured usage providers"
          icon={<ProviderIcon />}
        />
      </section>

      {/* Usage Overview */}
<section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
  <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-base font-semibold">
        Usage Overview
      </h2>

      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Token consumption from recent gateway requests.
      </p>
    </div>

    <Link
      to="/usage"
      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
    >
      View full history
    </Link>
  </div>

  <UsageChart history={usageHistory} />
</section>

      {/* Main Content */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Provider Usage */}
        <div className="xl:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
            <div>
              <h2 className="text-base font-semibold">
                Provider Usage
              </h2>

              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Request distribution across your configured LLM providers.
              </p>
            </div>

            <Link
              to="/usage"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              View details
            </Link>
          </div>

          <div className="space-y-6 p-6">
            {providerUsage.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-10 text-center">
                <ProviderIcon large />

                <p className="mt-3 text-sm font-medium">
                  No provider usage yet
                </p>

                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Send a request from the Playground to start tracking usage.
                </p>
              </div>
            ) : (
              providerUsage.map((provider) => {
                const percentage = getProviderPercentage(
                  provider.requests || 0
                );

                return (
                  <div key={provider.provider}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-primary)]">
                          <ProviderIcon />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold capitalize">
                            {provider.provider}
                          </p>

                          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                            {formatNumber(provider.requests)} requests
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {percentage}%
                        </p>

                        <p className="text-xs text-[var(--color-muted)]">
                          of requests
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-background)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                      <Metric
                        label="Input"
                        value={formatNumber(provider.inputTokens)}
                      />

                      <Metric
                        label="Output"
                        value={formatNumber(provider.outputTokens)}
                      />

                      <Metric
                        label="Total"
                        value={formatNumber(provider.totalTokens)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gateway Status */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <h2 className="text-base font-semibold">
              Gateway Status
            </h2>

            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Current backend service health.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div
              className={`rounded-lg border p-4 ${
                isGatewayHealthy
                  ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isGatewayHealthy
                      ? "bg-green-100 text-green-600 dark:bg-green-900/40"
                      : "bg-red-100 text-red-600 dark:bg-red-900/40"
                  }`}
                >
                  <StatusIcon />
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    {isGatewayHealthy
                      ? "Gateway Operational"
                      : "Gateway Unavailable"}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {health?.status ?? "UNKNOWN"}
                  </p>
                </div>
              </div>
            </div>

            <InfoRow
              label="Service"
              value={health?.service ?? "Unknown"}
            />

            <InfoRow
              label="Environment"
              value="Development"
            />

            <InfoRow
              label="Providers"
              value={`${providerUsage.length} configured`}
            />

            <div className="border-t border-[var(--color-border)] pt-5">
              <Link
                to="/monitoring"
                className="flex items-center justify-between text-sm font-medium text-[var(--color-primary)]"
              >
                <span>Open monitoring</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Requests */}
<section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
  <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-base font-semibold">
        Recent Requests
      </h2>

      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Latest requests processed through your gateway.
      </p>
    </div>

    <Link
      to="/usage"
      className="text-sm font-medium text-[var(--color-primary)] hover:underline"
    >
      View all
    </Link>
  </div>

  <RecentRequests history={usageHistory} />
</section>

      {/* Bottom Action Area */}
      <section className="grid gap-6 md:grid-cols-2">
        <QuickAction
          icon={<PlayIcon />}
          title="Test your gateway"
          description="Send a real request through Gemini or NVIDIA from the Playground."
          action="Open Playground"
          to="/playground"
        />

        <QuickAction
          icon={<ChartIcon />}
          title="Explore usage"
          description="Review provider usage, token consumption, and request history."
          action="View Usage"
          to="/usage"
        />
      </section>
    </div>
  );
}

function UsageChart({ history }) {
  const dailyUsage = {};

  history.forEach((record) => {
    const date = new Date(record.createdAt);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = date.toISOString().slice(0, 10);

    dailyUsage[key] = (dailyUsage[key] || 0) + (record.totalTokens || 0);
  });

  const points = Object.entries(dailyUsage)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-7);

  if (points.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-primary)]">
          <ChartIcon />
        </div>

        <p className="mt-3 text-sm font-medium">
          No usage data yet
        </p>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Send a request through the Playground to populate this chart.
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...points.map(([, value]) => value), 1);

  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 30;
  const paddingY = 25;

  const coordinates = points.map(([date, value], index) => {
    const x =
      points.length === 1
        ? chartWidth / 2
        : paddingX +
          (index / (points.length - 1)) *
            (chartWidth - paddingX * 2);

    const y =
      chartHeight -
      paddingY -
      (value / maxValue) *
        (chartHeight - paddingY * 2);

    return {
      date,
      value,
      x,
      y,
    };
  });

  const linePath = coordinates
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  return (
    <div className="p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold tracking-tight">
            {new Intl.NumberFormat("en-US").format(
              points.reduce((sum, [, value]) => sum + value, 0)
            )}
          </p>

          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Tokens across the latest activity
          </p>
        </div>
      </div>

        <div className="w-full min-w-0">
            <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="block h-auto w-full"
                preserveAspectRatio="xMidYMid meet"
            >
          {[0, 1, 2, 3].map((line) => {
            const y =
              paddingY +
              (line / 3) *
                (chartHeight - paddingY * 2);

            return (
              <line
                key={line}
                x1={paddingX}
                x2={chartWidth - paddingX}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-[var(--color-border)]"
                strokeWidth="1"
              />
            );
          })}

          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            className="text-[var(--color-primary)]"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coordinates.map((point) => (
            <circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              className="text-[var(--color-primary)]"
            />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between gap-4">
        {points.map(([date]) => {
          const formatted = new Date(date).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          );

          return (
            <span
              key={date}
              className="text-xs text-[var(--color-muted)]"
            >
              {formatted}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function RecentRequests({ history }) {
  const recentRequests = history.slice(0, 5);

  if (recentRequests.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-[var(--color-muted)]">
        No requests have been recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
        <table className="w-full table-auto text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="px-6 py-4 font-medium text-[var(--color-muted)]">
              Time
            </th>

            <th className="px-6 py-4 font-medium text-[var(--color-muted)]">
              Provider
            </th>

              <th className="hidden px-6 py-4 font-medium text-[var(--color-muted)] md:table-cell">
                  Model
              </th>

            <th className="px-6 py-4 font-medium text-[var(--color-muted)]">
              Tokens
            </th>

              <th className="hidden px-6 py-4 text-right font-medium text-[var(--color-muted)] sm:table-cell">
                  Status
              </th>
          </tr>
        </thead>

        <tbody>
          {recentRequests.map((record) => (
            <tr
              key={record.id}
              className="border-b border-[var(--color-border)] last:border-0"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {formatRequestTime(record.createdAt)}
              </td>

              <td className="px-6 py-4">
                <span className="font-medium capitalize">
                  {record.provider}
                </span>
              </td>

                <td className="hidden max-w-[260px] px-6 py-4 md:table-cell">
                    <span
                  className="block truncate text-[var(--color-muted)]"
                  title={record.model}
                >
                  {record.model}
                </span>
              </td>

              <td className="px-6 py-4">
                {new Intl.NumberFormat("en-US").format(
                  record.totalTokens || 0
                )}
              </td>

                <td className="hidden px-6 py-4 text-right sm:table-cell">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Success
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatRequestTime(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ label, value, description, icon }) {
  return (
    <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-muted)]">
            {label}
          </p>

            <p className="mt-3 break-words text-xl font-semibold tracking-tight sm:text-2xl">
                {value}
            </p>

          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-primary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function GatewayStatus({ healthy }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 sm:px-3.5 sm:py-2.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          healthy ? "bg-green-500" : "bg-red-500"
        }`}
      />

      <span className="text-sm font-medium">
        {healthy ? "Gateway Operational" : "Gateway Unavailable"}
      </span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function QuickAction({ icon, title, description, action, to }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-primary)]">
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          {description}
        </p>

        <Link
          to={to}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          {action}
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

function RequestsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function TokenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v18M7 7h8a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8" />
    </svg>
  );
}

function CostIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8.5c-.7-.6-1.7-1-3-1-1.7 0-3 .9-3 2s1.2 2 3 2 3 .9 3 2-1.3 2-3 2c-1.3 0-2.3-.4-3-1" />
      <path d="M12 5.5v13" />
    </svg>
  );
}

function ProviderIcon({ large = false }) {
  const size = large ? 24 : 18;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h4M7 16h7" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12l4 4L19 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="8 5 19 12 8 19 8 5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V5M4 19h16" />
      <path d="M7 15l4-4 3 2 5-6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default Dashboard;
