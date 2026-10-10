import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useTheme } from "../context/useTheme";

function Register() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await registerUser(name, email, password);

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 lg:px-10">
        <Link to="/login" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-bold text-white">
            LG
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight">
              LLM Gateway
            </p>
            <p className="text-[11px] text-[var(--color-muted)]">
              Developer Platform
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
      </header>

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden border-r border-[var(--color-border)] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
                Developer Platform
              </div>

              <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
                Build with multiple LLM providers through one gateway.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                Create an account to manage API keys, send requests through
                the gateway, and monitor your LLM usage from one place.
              </p>
            </div>

            <div className="space-y-4">
              <Feature
                title="One interface"
                description="Connect applications to multiple configured LLM providers through a unified gateway."
              />

              <Feature
                title="Usage tracking"
                description="Keep track of requests and token consumption for your gateway activity."
              />

              <Feature
                title="Operational visibility"
                description="Check gateway and provider status from a centralized dashboard."
              />
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
                  Get started
                </p>

                <h2 className="text-2xl font-semibold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Set up your developer account to access the gateway.
                </p>
              </div>

              {error && (
                <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-3.5 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 border-l-4 border-green-500 bg-green-50 p-3.5 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-300">
                  {success}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--color-border)]" />

                <span className="text-xs text-[var(--color-muted)]">
                  Already registered?
                </span>

                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>

              <Link
                to="/login"
                className="block w-full rounded-md border border-[var(--color-border)] px-5 py-3 text-center text-sm font-medium transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className="border-l-2 border-[var(--color-primary)] pl-4">
      <p className="text-sm font-medium">{title}</p>

      <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
        {description}
      </p>
    </div>
  );
}

export default Register;