export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted">
      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-brand-light border-t-brand" />
      <div className="text-sm">{label}</div>
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="mx-4 my-8 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <div className="mb-2 text-4xl">✨</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
