'use client';

import { useState, useMemo } from 'react';
import type { SortParams } from '@/types';

export function useSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortParams | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.field as keyof T];
      const bValue = b[sortConfig.field as keyof T];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.order === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) {
        return sortConfig.order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const requestSort = (field: string) => {
    let order: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.field === field && sortConfig.order === 'asc') {
      order = 'desc';
    }

    setSortConfig({ field, order });
  };

  const clearSort = () => {
    setSortConfig(null);
  };

  return {
    sortedData,
    sortConfig,
    requestSort,
    clearSort,
  };
}
