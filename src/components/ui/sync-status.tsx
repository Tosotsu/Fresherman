import React from 'react';
import { CheckCircle, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SyncStatusProps {
  status: 'synced' | 'syncing' | 'error' | 'offline';
  className?: string;
}

export function SyncStatus({ status, className }: SyncStatusProps) {
  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      {status === 'synced' && (
        <>
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Saved</span>
        </>
      )}
      
      {status === 'syncing' && (
        <>
          <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
          <span className="text-blue-500">Saving...</span>
        </>
      )}
      
      {status === 'error' && (
        <>
          <CloudOff className="h-3 w-3 text-red-500" />
          <span className="text-red-500">Save failed</span>
        </>
      )}
      
      {status === 'offline' && (
        <>
          <Cloud className="h-3 w-3 text-gray-500" />
          <span className="text-gray-500">Offline</span>
        </>
      )}
    </div>
  );
} 