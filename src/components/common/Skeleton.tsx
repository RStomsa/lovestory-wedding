'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const variantClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-4'
      : 'rounded-xl';

  return (
    <div
      className={`animate-shimmer relative overflow-hidden bg-stone-200/70 dark:bg-stone-800/60 ${variantClass} ${className}`}
    />
  );
}

// 1. Metric Stat Card Skeleton (Used in Admin Dashboard & Stats)
export function MetricCardSkeleton() {
  return (
    <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" variant="text" />
        <Skeleton className="w-9 h-9" variant="circle" />
      </div>
      <Skeleton className="h-8 w-36" variant="text" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-16" variant="text" />
        <Skeleton className="h-3 w-24" variant="text" />
      </div>
    </div>
  );
}

// 2. Table Rows Skeleton (Used in Orders, Users, Sites, RSVPs)
interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ columns = 5, rows = 6, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="rounded-3xl bg-white border border-stone-200/90 shadow-2xs overflow-hidden">
      {showHeader && (
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-4 bg-stone-50/50">
          <Skeleton className="h-5 w-40" variant="text" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50/70 border-b border-stone-100">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4">
                  <Skeleton className="h-3.5 w-20" variant="text" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="hover:bg-stone-50/40 transition-colors">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="p-4">
                    {c === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-28" variant="text" />
                          <Skeleton className="h-2.5 w-16" variant="text" />
                        </div>
                      </div>
                    ) : c === columns - 1 ? (
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-7 w-16 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    ) : (
                      <Skeleton className={`h-3.5 ${c % 2 === 0 ? 'w-24' : 'w-32'}`} variant="text" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. Template Card Skeleton (Used in Admin Templates & Public Templates Catalog)
export function TemplateCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-white border border-stone-200/90 shadow-2xs overflow-hidden">
      {/* 9/13 or 9/16 aspect ratio thumbnail shimmer */}
      <div className="relative aspect-[9/14] w-full bg-stone-100/90 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 space-y-2">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-3 w-full" variant="text" />
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <Skeleton className="h-3 w-16" variant="text" />
          <Skeleton className="h-5 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// 4. Asset Card Skeleton (Used in Stock, Fonts, Audio)
export function AssetCardSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-3 space-y-2 shadow-2xs">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-3.5 w-3/4 mx-auto" variant="text" />
      <Skeleton className="h-2.5 w-1/2 mx-auto" variant="text" />
    </div>
  );
}

// 5. Full Admin Dashboard Skeleton Page
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar shimmer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" variant="text" />
          <Skeleton className="h-7 w-64" variant="text" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-2xl" />
          <Skeleton className="h-10 w-28 rounded-2xl" />
        </div>
      </div>

      {/* 4 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Activity Table */}
      <TableSkeleton columns={5} rows={5} />
    </div>
  );
}

// 6. Templates Gallery Skeleton Page
export function TemplatesGallerySkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" variant="text" />
          <Skeleton className="h-3 w-72" variant="text" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Grid of Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <TemplateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
