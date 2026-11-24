import React from 'react';
import { Skeleton } from '@/components/common/Skeleton';

export default function AdminToolsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-64" variant="text" />
          <Skeleton className="h-3.5 w-96" variant="text" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <Skeleton className="h-5 w-40" variant="text" />
            <Skeleton className="h-3 w-full" variant="text" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
