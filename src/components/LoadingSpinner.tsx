export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="inline-block border-2 border-white/20 border-t-gold-400 rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
