import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";

function DashboardLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userInitials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-60 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              LLM Gateway
            </h1>

            <p className="text-xs text-[var(--color-muted)]">
              Developer Platform
            </p>
          </div>
        </div>

        <nav className="px-3 py-5">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Platform
          </p>

          <div className="space-y-1">
            <NavItem label="Dashboard" to="/dashboard" />
            <NavItem label="Playground" to="/playground" />
            <NavItem label="API Keys" to="/api-keys" />
            <NavItem label="Usage" to="/usage" />
            <NavItem label="Monitoring" to="/monitoring" />
          </div>

          <p className="mb-2 mt-8 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Account
          </p>

          <div className="space-y-1">
            <NavItem label="Settings" to="/settings" />
          </div>
        </nav>
      </aside>

      {/* Main area */}
      <div className="ml-60 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8">
          {/* Page context */}
          <div>
            <h2 className="text-sm font-semibold">
              Dashboard
            </h2>

            <p className="text-xs text-[var(--color-muted)]">
              LLM Gateway overview
            </p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            {/* User information */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.name || "User"}
              </p>

              <p className="max-w-56 truncate text-xs text-[var(--color-muted)]">
                {user?.email || ""}
              </p>
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              title={
                theme === "light"
                  ? "Dark mode"
                  : "Light mode"
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-label="Open user menu"
                aria-expanded={userMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white transition hover:opacity-90"
              >
                {userInitials}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  {/* User info */}
                  <div className="border-b border-[var(--color-border)] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
                        {userInitials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {user?.name || "User"}
                        </p>

                        <p className="truncate text-xs text-[var(--color-muted)]">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="p-2">
                    <NavLink
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--color-background)]"
                    >
                      <SettingsIcon />
                      <span>Settings</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <LogoutIcon />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          isActive
            ? "bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/30"
            : "text-[var(--color-text)] hover:bg-[var(--color-background)]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
          )}

          <span className={isActive ? "pl-1" : ""}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function MoonIcon() {
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
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
    </svg>
  );
}

function SunIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20h-2.4v-.21a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.55-1.03H6v-2.4h.91A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06A1.7 1.7 0 0 0 11.7 6.1 1.7 1.7 0 0 0 12.73 4.55V4h2.4v.55a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.55 1.03H21v2.4h-.05A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default DashboardLayout;