export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 md:p-8 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-clay-surface-strong/60 mb-3" />
      <div className="h-4 w-72 rounded-lg bg-clay-surface-strong/40 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-[24px] bg-clay-surface-strong/50" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-clay-surface-strong/40" />
        ))}
      </div>
    </div>
  );
}
