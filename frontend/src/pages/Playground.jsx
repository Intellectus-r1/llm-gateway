import { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../services/api";

function Playground() {
    const [message, setMessage] = useState("");
    const [model, setModel] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, error]);

    const handleSubmit = async (e) => {
        e?.preventDefault();

        const prompt = message.trim();

        if (!prompt || loading) return;

        setMessage("");
        setError("");
        setMessages((prev) => [
            ...prev,
            { role: "user", content: prompt },
        ]);
        setLoading(true);

        try {
            const data = await sendChatMessage(prompt, model);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.response,
                    provider: data.provider,
                    model: data.model,
                    fallbackUsed: data.fallbackUsed,
                },
            ]);
        } catch (err) {
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const startNewChat = () => {
        if (loading) return;

        setMessages([]);
        setMessage("");
        setError("");
        inputRef.current?.focus();
    };

    const suggestions = [
        "Explain how an LLM Gateway works",
        "What is fallback routing?",
        "Explain API authentication",
    ];

    return (
        <div className="mx-auto flex h-[calc(100vh-8rem)] min-h-[500px] w-full max-w-5xl flex-col">
            {/* Page header */}
            <header className="mb-4 flex shrink-0 items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Playground
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Chat with your LLM Gateway.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={startNewChat}
                    disabled={loading || messages.length === 0}
                    className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm transition hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    + New chat
                </button>
            </header>

            {/* Chat panel */}
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {/* Messages */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {messages.length === 0 && !loading ? (
                        <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] text-2xl">
                                ✳
                            </div>

                            <h2 className="text-xl font-semibold tracking-tight">
                                What can I help you test?
                            </h2>

                            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                                Send a prompt to test your configured language models
                                through the gateway.
                            </p>

                            <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => {
                                            setMessage(suggestion);
                                            inputRef.current?.focus();
                                        }}
                                        className="rounded-full border border-[var(--color-border)] px-3 py-2 text-sm transition hover:bg-[var(--color-background)]"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-6 sm:px-6">
                            {messages.map((item, index) => (
                                <div
                                    key={`${index}-${item.role}`}
                                    className={`flex gap-3 ${
                                        item.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    {item.role === "assistant" && (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-xs font-semibold">
                                            AI
                                        </div>
                                    )}

                                    <div
                                        className={`min-w-0 max-w-[85%] ${
                                            item.role === "user"
                                                ? "rounded-2xl rounded-br-md bg-[var(--color-primary)] px-4 py-3 text-white"
                                                : "flex-1 py-1"
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap break-words text-sm leading-7">
                                            {item.content}
                                        </div>

                                        {item.role === "assistant" &&
                                            (item.provider || item.model) && (
                                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border)] pt-2 text-xs text-[var(--color-muted)]">
                                                    {item.provider && (
                                                        <span>
                                                            Provider: {item.provider}
                                                        </span>
                                                        )}
                                                    {item.model && (
                                                        <span>
                                                            Model: {item.model}
                                                        </span>
                                                        )}
                                                </div>
                                            )}
                                        {item.fallbackUsed && (
                                            <div className="mt-2 text-sm text-amber-600">
                                                The requested provider was unavailable. This response was generated
                                                using the fallback provider.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-xs font-semibold">
                                        AI
                                    </div>
                                    <div
                                        role="status"
                                        className="flex items-center gap-2 py-2 text-sm text-[var(--color-muted)]"
                                    >
                                        <span className="animate-pulse">●</span>
                                        Generating response...
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div
                                    role="alert"
                                    className="ml-11 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600 dark:text-red-400"
                                >
                                    <p>{error}</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const lastUserMessage = [...messages]
                                                .reverse()
                                                .find((item) => item.role === "user");

                                            if (lastUserMessage) {
                                                setMessage(lastUserMessage.content);
                                                setError("");
                                                inputRef.current?.focus();
                                            }
                                        }}
                                        className="mt-2 font-medium underline underline-offset-2"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Message composer */}
                <div className="shrink-2 border-t border-[var(--color-border)] p-3 sm:p-4">
                    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
                        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 transition focus-within:border-[var(--color-primary)]">
              <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={loading}
                  placeholder="Message your assistant ...."
                  aria-label="Message your assistant"
                  className="max-h-40 min-h-[48px] w-full resize-y bg-transparent px-1 py-1 text-sm leading-6 outline-none placeholder:text-[var(--color-muted)] disabled:opacity-50"
              />

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <label htmlFor="playground-model" className="sr-only">
                                        Select model
                                    </label>

                                    <select
                                        id="playground-model"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        disabled={loading}
                                        className="max-w-[220px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-xs outline-none focus:border-[var(--color-primary)]"
                                    >
                                        <option value="">Default model</option>
                                        <option value="gemini-3.1-flash-lite">
                                            Gemini 3.1 Flash-Lite
                                        </option>
                                        <option value="nvidia/nemotron-3-super-120b-a12b">
                                            NVIDIA Nemotron 3 Super
                                        </option>
                                    </select>

                                    <span className="hidden text-xs text-[var(--color-muted)] sm:inline">
                    Enter to send · Shift+Enter for a new line
                  </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !message.trim()}
                                    aria-label="Send message"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {loading ? (
                                        <span className="text-xs">...</span>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M12 19V5m-7 7 7-7 7 7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
                            Responses are generated by your configured LLM providers.
                        </p>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default Playground;