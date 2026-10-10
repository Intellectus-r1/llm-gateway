import { useEffect, useState } from "react";
import {
  createApiKey,
  getApiKeys,
  revokeApiKey,
} from "../services/api";

function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadApiKeys = async () => {
    try {
      setError("");
      const data = await getApiKeys();
      setApiKeys(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  let cancelled = false;

  const fetchApiKeys = async () => {
    try {
      setError("");

      const data = await getApiKeys();

      if (!cancelled) {
        setApiKeys(data);
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

  fetchApiKeys();

  return () => {
    cancelled = true;
  };
}, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      setError("");

      await createApiKey(name.trim());

      setName("");
      await loadApiKeys();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      setError("");

      await revokeApiKey(id);
      await loadApiKeys();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          API Keys
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Create and manage keys used to access your LLM Gateway.
        </p>
      </div>

      {/* Create API key */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Create API Key</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Give your key a descriptive name so you can identify it later.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="api-key-name"
              className="mb-2 block text-sm font-medium"
            >
              Key name
            </label>

            <input
              id="api-key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Development"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create API Key"}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* API key list */}
      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Your API Keys</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage the keys associated with your account.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-[var(--color-muted)]">
            Loading API keys...
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-muted)]">
            No API keys created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">API Key</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {apiKeys.map((apiKey) => (
                  <tr
                    key={apiKey.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="px-6 py-4 font-medium">
                      {apiKey.name}
                    </td>

                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <span className="font-mono text-xs">
                           {apiKey.keyValue}
                         </span>

                         <button
                           type="button"
                           onClick={() =>
                             navigator.clipboard.writeText(apiKey.keyValue)
                           }
                           className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                         >
                         Copy
                     </button>
                   </div>
                  </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          apiKey.active
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {apiKey.active ? "Active" : "Revoked"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {apiKey.createdAt
                        ? new Date(apiKey.createdAt).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {apiKey.active && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(apiKey.id)}
                          className="text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiKeys;