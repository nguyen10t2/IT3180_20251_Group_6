import React from 'react';
import { Badge } from './Badge';
import { getStatusColor, getStatusLabel } from '@/utils/labels';

interface StatusBadgeProps {
  status: string;
  type: 'user' | 'fee' | 'feedback' | 'priority' | 'invoice';
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const label = getStatusLabel(status, type as 'user' | 'fee' | 'feedback');
  const colorClass = getStatusColor(status, type);

  return (
    <Badge variant="outline" className={`${colorClass} ${className || ''}`}>
      {label}
    </Badge>
  );
}
