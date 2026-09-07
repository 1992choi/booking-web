export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-100 animate-pulse ${className}`} />;
}

export function SkeletonList({
  count,
  itemClassName,
  className = 'space-y-3',
}: {
  count: number;
  itemClassName: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={itemClassName} />
      ))}
    </div>
  );
}
