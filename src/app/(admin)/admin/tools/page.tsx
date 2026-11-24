import React from 'react';
import ToolsManagerClient from './ToolsManagerClient';

export const dynamic = 'force-dynamic';

export default function AdminToolsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ToolsManagerClient />
    </div>
  );
}
