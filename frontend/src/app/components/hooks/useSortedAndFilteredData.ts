import { useMemo } from 'react';

export interface SortableItem {
  [key: string]: any;
}

export type SortOrder = 'asc' | 'desc';

/**
 * Hook per gestire il sorting e il filtro di una lista
 * Ottimizzato con useMemo per evitare re-calcoli
 */
export function useSortedAndFilteredData<T extends SortableItem>(
  data: T[],
  searchTerm: string,
  sortBy: keyof T,
  sortOrder: SortOrder,
  searchFields: (keyof T)[],
  customComparator?: (a: T, b: T, key: keyof T) => number
) {
  return useMemo(() => {
    // Debug log per capire i parametri
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 useSortedAndFilteredData:', {
        dataLength: data.length,
        searchTerm,
        sortBy,
        sortOrder,
        searchFields
      });
    }

    let filtered = data;

    // Filtro per ricerca
    if (searchTerm) {
      filtered = data.filter((item) =>
        searchFields.some((field) =>
          String(item[field] ?? '')
            .toLowerCase()
            .replace(/\s/g, '')
            .includes(searchTerm.toLowerCase().replace(/\s/g, ''))
        )
      );
    }

    // Sorting - Creiamo una copia per evitare mutazioni
    const sortedFiltered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (customComparator) {
        comparison = customComparator(a, b, sortBy);
      } else {
        const aVal = String(a[sortBy] ?? '').toLowerCase();
        const bVal = String(b[sortBy] ?? '').toLowerCase();
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sortedFiltered;
  }, [data, searchTerm, sortBy, sortOrder, searchFields, customComparator]);
}
