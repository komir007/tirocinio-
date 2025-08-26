import { useEffect, useRef } from 'react';

/**
 * Hook per monitorare le performance dei componenti React
 * Utile per identificare bottleneck e migliorare le performance
 */
export function usePerformanceMonitor(componentName: string, dependencies: any[] = []) {
  const renderStart = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Misura l'inizio del render
  renderStart.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${componentName} - Render #${renderCount.current}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        dependencies: dependencies.length,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`♻️ ${componentName} - Dependencies changed:`, dependencies);
    }
  }, dependencies);
}

/**
 * Hook per misurare il tempo di esecuzione di operazioni costose
 */
export function useTimeMeasure(operationName: string) {
  return {
    start: () => {
      if (process.env.NODE_ENV === 'development') {
        console.time(`⏱️ ${operationName}`);
      }
    },
    end: () => {
      if (process.env.NODE_ENV === 'development') {
        console.timeEnd(`⏱️ ${operationName}`);
      }
    }
  };
}
