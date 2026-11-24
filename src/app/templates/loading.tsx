import React from 'react';
import { TemplatesGallerySkeleton } from '@/components/common/Skeleton';

export default function TemplatesLoading() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <TemplatesGallerySkeleton count={12} />
    </div>
  );
}
