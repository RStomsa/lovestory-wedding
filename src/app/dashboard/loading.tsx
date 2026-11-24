import React from 'react';
import { MetricCardSkeleton, TableSkeleton, Skeleton } from '@/components/common/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" variant="text" />
          <Skeleton className="h-3.5 w-64" variant="text" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <TableSkeleton columns={5} rows={5} />
    </div>
  );
}
