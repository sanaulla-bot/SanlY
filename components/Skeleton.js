export function VideoCardSkeleton() {
  return (
    <div>
      <div className="skeleton w-full aspect-video rounded-xl" />
      <div className="flex gap-3 mt-3">
        <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-4 w-full rounded mb-2" />
          <div className="skeleton h-3 w-2/3 rounded mb-1" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

export function VideoCardSkeletonGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HorizontalVideoSkeleton({ count = 8 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="skeleton w-40 h-24 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-3 w-full rounded mb-2" />
            <div className="skeleton h-3 w-4/5 rounded mb-2" />
            <div className="skeleton h-3 w-2/3 rounded mb-1" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
