import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Account */}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Account</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Your current account information.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="text-sm text-[var(--color-muted)]">
              Name
            </p>

            <p className="mt-1 text-sm font-medium">
              {user?.name || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-[var(--color-muted)]">
              Email
            </p>

            <p className="mt-1 text-sm font-medium">
              {user?.email || "-"}
            </p>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Appearance</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Choose how the gateway interface appears.
          </p>
        </div>

        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium">
              Theme
            </p>

            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Currently using {theme} mode.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Switch to {theme === "light" ? "dark" : "light"}
          </button>
        </div>
      </section>

      {/* Session */}
      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          <h2 className="font-medium">Session</h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Sign out of your current account.
          </p>
        </div>

        <div className="p-6">
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}

export default Settings;