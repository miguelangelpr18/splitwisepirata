"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-4 mt-10 rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-2 text-4xl">😬</div>
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-1 text-sm text-muted">{error.message}</p>
      <p className="mt-3 text-xs text-muted">
        If this keeps happening, check that <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set in Vercel.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}
