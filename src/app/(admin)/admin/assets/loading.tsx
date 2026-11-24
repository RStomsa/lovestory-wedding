import React from 'react';
import { Skeleton, AssetCardSkeleton } from '@/components/common/Skeleton';

export default function AdminAssetsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56" variant="text" />
          <Skeleton className="h-3 w-80" variant="text" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-xl flex-shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <AssetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
