import React from 'react';
import { TemplatesGallerySkeleton } from '@/components/common/Skeleton';

export default function AdminTemplatesLoading() {
  return <TemplatesGallerySkeleton count={10} />;
}
