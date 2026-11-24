import React from 'react';
import { TableSkeleton, Skeleton } from '@/components/common/Skeleton';

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" variant="text" />
          <Skeleton className="h-3 w-64" variant="text" />
        </div>
      </div>
      <TableSkeleton columns={5} rows={7} />
    </div>
  );
}
