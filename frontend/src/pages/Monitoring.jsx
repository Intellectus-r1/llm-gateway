import { useEffect, useState } from "react";
import {
  getHealthStatus,
  getProviderHealth,
} from "../services/api";

function Monitoring() {
  const [health, setHealth] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMonitoring = async () => {
      try {
        setError("");

        const [healthData, providerData] = await Promise.all([
          getHealthStatus(),
          getProviderHealth(),
        ]);

        if (!cancelled) {
          setHealth(healthData);
          setProviders(providerData);
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

    loadMonitoring();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Monitoring
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Loading monitoring data...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Monitoring
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Monitor the health of your gateway and configured providers.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Gateway health */}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Gateway Health</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Current status of the LLM Gateway backend.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">
          <HealthItem
            label="Status"
            value={health?.status ?? "UNKNOWN"}
            active={health?.status === "UP"}
          />

          <HealthItem
            label="Service"
            value={health?.service ?? "Unknown"}
          />

          <HealthItem
            label="Last Checked"
            value={
              health?.timestamp
                ? new Date(health.timestamp).toLocaleString()
                : "-"
            }
          />
        </div>
      </section>

      {/* Provider health */}
      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Provider Status</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Configuration status of the connected LLM providers.
          </p>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {providers.map((provider) => (
            <div
              key={provider.provider}
              className="flex items-center justify-between px-6 py-5"
            >
              <div>
                <p className="font-medium capitalize">
                  {provider.provider}
                </p>

                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  LLM provider
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    provider.status === "CONFIGURED"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="text-sm font-medium">
                  {provider.status}
                </span>
              </div>
            </div>
          ))}

          {providers.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-[var(--color-muted)]">
              No provider information available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function HealthItem({ label, value, active = false }) {
  return (
    <div>
      <p className="text-sm text-[var(--color-muted)]">{label}</p>

      <div className="mt-2 flex items-center gap-2">
        {active && (
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        )}

        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

export default Monitoring;