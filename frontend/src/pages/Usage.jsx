import { useEffect, useState } from "react";
import {
  getProviderUsage,
  getUsageHistory,
  getUsageSummary,
} from "../services/api";

function Usage() {
  const [summary, setSummary] = useState(null);
  const [providerUsage, setProviderUsage] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadUsage = async () => {
      try {
        setError("");

        const [summaryData, providerData, historyData] =
          await Promise.all([
            getUsageSummary(),
            getProviderUsage(),
            getUsageHistory(),
          ]);

        if (!cancelled) {
          setSummary(summaryData);
          setProviderUsage(providerData);
          setHistory(historyData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUsage();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Usage
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Loading usage data...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Usage
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Review requests, token consumption, and estimated costs.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={summary?.totalRequests ?? 0}
        />

        <StatCard
          label="Input Tokens"
          value={summary?.totalInputTokens ?? 0}
        />

        <StatCard
          label="Output Tokens"
          value={summary?.totalOutputTokens ?? 0}
        />

        <StatCard
          label="Estimated Cost"
          value={`$${(summary?.totalEstimatedCost ?? 0).toFixed(4)}`}
        />
      </div>

      {/* Provider usage */}
      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Provider Usage</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Usage breakdown across configured providers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Requests</th>
                <th className="px-6 py-4 font-medium">Input Tokens</th>
                <th className="px-6 py-4 font-medium">Output Tokens</th>
                <th className="px-6 py-4 font-medium">Total Tokens</th>
                <th className="px-6 py-4 font-medium">
                  Estimated Cost
                </th>
              </tr>
            </thead>

            <tbody>
              {providerUsage.map((provider) => (
                <tr
                  key={provider.provider}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="px-6 py-4 font-medium capitalize">
                    {provider.provider}
                  </td>

                  <td className="px-6 py-4">
                    {provider.requests}
                  </td>

                  <td className="px-6 py-4">
                    {provider.inputTokens}
                  </td>

                  <td className="px-6 py-4">
                    {provider.outputTokens}
                  </td>

                  <td className="px-6 py-4">
                    {provider.totalTokens}
                  </td>

                  <td className="px-6 py-4">
                    ${(provider.estimatedCost ?? 0).toFixed(4)}
                  </td>
                </tr>
              ))}

              {providerUsage.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-[var(--color-muted)]"
                  >
                    No provider usage recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Request history */}
      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Request History</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Recent requests processed through the gateway.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Input</th>
                <th className="px-6 py-4 font-medium">Output</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Cost</th>
                <th className="px-6 py-4 font-medium">Time</th>
              </tr>
            </thead>

            <tbody>
              {history.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="px-6 py-4 font-medium capitalize">
                    {record.provider}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs">
                    {record.model}
                  </td>

                  <td className="px-6 py-4">
                    {record.inputTokens}
                  </td>

                  <td className="px-6 py-4">
                    {record.outputTokens}
                  </td>

                  <td className="px-6 py-4">
                    {record.totalTokens}
                  </td>

                  <td className="px-6 py-4">
                    ${(record.estimatedCost ?? 0).toFixed(4)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-[var(--color-muted)]">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-[var(--color-muted)]"
                  >
                    No usage history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-sm text-[var(--color-muted)]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

export default Usage;