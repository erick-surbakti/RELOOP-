export default function SkeletonCard() {
  return (
    <div className="bg-white overflow-hidden">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="p-4 pt-3.5 space-y-2.5">
        <div className="skeleton h-2.5 w-14 rounded-sm" />
        <div className="skeleton h-3.5 w-full rounded-sm" />
        <div className="skeleton h-3.5 w-3/4 rounded-sm" />
        <div className="skeleton h-4 w-24 rounded-sm mt-3" />
      </div>
    </div>
  );
}
