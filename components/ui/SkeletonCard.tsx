export default function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-100 overflow-hidden">
      <div className="skeleton aspect-[3/4]" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-24 rounded mt-3" />
      </div>
    </div>
  );
}
