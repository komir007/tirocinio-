import { GridColumn } from '../types/customization.types';  

export const DEFAULT_GRID_CONFIGS = {
  'users-table': {
    columns: [
      {
        id: 'name',
        label: 'Nome',
        minWidth: 200,
        defaultOrder: 1,
        sortable: true,
        filterable: true,
      },
      {
        id: 'email',
        label: 'Email',
        minWidth: 250,
        defaultOrder: 2,
        sortable: true,
        filterable: true,
      },
      {
        id: 'role',
        label: 'Ruolo',
        minWidth: 150,
        defaultOrder: 3,
        sortable: true,
        filterable: true,
      },
      {
        id: 'createdAt',
        label: 'Data Creazione',
        minWidth: 180,
        defaultOrder: 4,
        sortable: true,
        filterable: false,
      },
    ] as GridColumn[]
  },

  'products-table': {
    columns: [
      {
        id: 'code',
        label: 'Codice',
        minWidth: 120,
        defaultOrder: 1,
        sortable: true,
        filterable: true,
      },
      {
        id: 'description',
        label: 'Descrizione',
        minWidth: 300,
        defaultOrder: 2,
        sortable: true,
        filterable: true,
      },
      {
        id: 'category',
        label: 'Categoria',
        minWidth: 150,
        defaultOrder: 3,
        sortable: true,
        filterable: true,
      },
      {
        id: 'price',
        label: 'Prezzo',
        minWidth: 100,
        defaultOrder: 4,
        align: 'right' as const,
        sortable: true,
        filterable: false,
      },
    ] as GridColumn[]
  }
};