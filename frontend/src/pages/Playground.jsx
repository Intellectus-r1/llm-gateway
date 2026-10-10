import { useState } from "react";
import { sendChatMessage } from "../services/api";

function Playground() {
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const data = await sendChatMessage(
        message,
        model
      );

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Playground
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Send requests through your unified LLM Gateway.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

        {/* Request panel */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">

          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <h2 className="font-medium">
              Request
            </h2>

            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Enter a message and optionally select a model.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6"
          >

            <div>
              <label
                htmlFor="model"
                className="mb-2 block text-sm font-medium"
              >
                Model
              </label>

              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="">
                  Default model
                </option>

                <option value="gemini-3.1-flash-lite">
                  Gemini 3.1 Flash-Lite
                </option>

                <option value="nvidia/nemotron-3-super-120b-a12b">
                  NVIDIA Nemotron 3 Super
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium"
              >
                Message
              </label>

              <textarea
                id="message"
                rows="10"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-full resize-y rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Send Request"}
            </button>

          </form>
        </div>

        {/* Response panel */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">

          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <h2 className="font-medium">
              Response
            </h2>

            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Gateway response from the selected provider.
            </p>
          </div>

          <div className="p-6">

            {loading && (
              <p className="text-sm text-[var(--color-muted)]">
                Waiting for provider response...
              </p>
            )}

            {error && (
              <div className="border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && !response && (
              <p className="text-sm text-[var(--color-muted)]">
                Your response will appear here.
              </p>
            )}

            {response && (
              <div>
                <div className="mb-5 flex flex-wrap gap-6 border-b border-[var(--color-border)] pb-4 text-sm">

                  <div>
                    <span className="text-[var(--color-muted)]">
                      Provider
                    </span>

                    <p className="mt-1 font-medium capitalize">
                      {response.provider}
                    </p>
                  </div>

                  <div>
                    <span className="text-[var(--color-muted)]">
                      Model
                    </span>

                    <p className="mt-1 font-medium">
                      {response.model}
                    </p>
                  </div>

                </div>

                <div className="whitespace-pre-wrap text-sm leading-7">
                  {response.response}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Playground;