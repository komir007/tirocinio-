import { useMemo } from 'react';

/**
 * Hook per ottimizzare il rendering di grandi dataset
 * Implementa strategie di performance per tabelle con molti elementi
 */
export function useTablePerformance<T>(
  data: T[],
  pageSize: number,
  currentPage: number
) {
  // Calcola solo gli elementi visibili invece di renderizzare tutto
  const visibleData = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, pageSize, currentPage]);

  // Statistiche per il monitoraggio
  const stats = useMemo(() => ({
    totalItems: data.length,
    visibleItems: visibleData.length,
    currentPage: currentPage + 1,
    totalPages: Math.ceil(data.length / pageSize),
    renderOptimization: data.length > 50 ? 'High' : data.length > 20 ? 'Medium' : 'Low'
  }), [data.length, visibleData.length, currentPage, pageSize]);

  return {
    visibleData,
    stats,
    isLargeDataset: data.length > 100,
    shouldOptimize: data.length > 50
  };
}

/**
 * Hook per ottimizzare i re-render dei componenti lista
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useMemo(() => callback, deps) as T;
}
