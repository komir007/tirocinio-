import { FormSection } from '../types/customization.types';

export const DEFAULT_FORM_CONFIGS = {
  'user-registration': {
    sections: [
      {
        id: 'personal-info',
        label: 'Informazioni Personali',
        description: 'Dati anagrafici dell\'utente',
        defaultOrder: 1,
        collapsible: false,
        fields: [
          {
            id: 'name',
            label: 'Nome',
            type: 'text' as const,
            required: true,
            defaultOrder: 1,
            section: 'personal-info',
            validation: {
              min: 2,
              max: 50,
              message: 'Il nome deve essere tra 2 e 50 caratteri'
            }
          },
          {
            id: 'cognome',
            label: 'Cognome',
            type: 'text' as const,
            required: false,
            defaultOrder: 2,
            section: 'personal-info',
            validation: {
              min: 2,
              max: 50,
              message: 'Il nome deve essere tra 2 e 50 caratteri'
            }
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email' as const,
            required: true,
            defaultOrder: 3,
            section: 'personal-info',
            validation: {
              pattern: '^[^@]+@[^@]+\.[^@]+$',
              message: 'Inserisci un indirizzo email valido'
            }
          }
        ]
      },
      {
        id: 'security',
        label: 'Sicurezza',
        description: 'Credenziali di accesso',
        defaultOrder: 2,
        collapsible: false,
        fields: [
          {
            id: 'password',
            label: 'Password',
            type: 'password' as const,
            required: true,
            defaultOrder: 1,
            section: 'security',
            validation: {
              min: 8,
              message: 'La password deve essere di almeno 8 caratteri'
            }
          }
        ]
      },
      {
        id: 'permissions',
        label: 'Permessi',
        description: 'Ruolo e autorizzazioni',
        defaultOrder: 3,
        collapsible: true,
        fields: [
          {
            id: 'role',
            label: 'Ruolo',
            type: 'select' as const,
            required: true,
            defaultOrder: 1,
            section: 'permissions',
            options: [
              { value: 'admin', label: 'Amministratore' },
              { value: 'agent', label: 'Agente' },
              { value: 'client', label: 'Cliente' }
            ]
          }
        ]
      }
    ] as FormSection[]
  },

  'user-edit': {
    sections: [
      {
        id: 'user-info',
        label: 'Informazioni Utente',
        description: 'Modifica i dati dell\'utente',
        defaultOrder: 1,
        collapsible: false,
        fields: [
          {
            id: 'name',
            label: 'Nome',
            type: 'text' as const,
            required: true,
            defaultOrder: 1,
            section: 'user-info',
            validation: {
              min: 2,
              max: 50,
              message: 'Il nome deve essere tra 2 e 50 caratteri'
            }
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email' as const,
            required: true,
            defaultOrder: 2,
            section: 'user-info',
            readOnly: true,
            validation: {
              pattern: '^[^@]+@[^@]+\.[^@]+$',
              message: 'Inserisci un indirizzo email valido'
            }
          }
        ]
      },
      {
        id: 'role-info',
        label: 'Ruolo e Permessi',
        description: 'Gestione ruoli e autorizzazioni',
        defaultOrder: 2,
        collapsible: true,
        fields: [
          {
            id: 'role',
            label: 'Ruolo',
            type: 'select' as const,
            required: true,
            defaultOrder: 1,
            section: 'role-info',
            options: [
              { value: 'admin', label: 'Amministratore' },
              { value: 'agent', label: 'Agente' },
              { value: 'client', label: 'Cliente' }
            ]
          }
        ]
      }
    ] as FormSection[]
  },

  'user-profile': {
    sections: [
      {
        id: 'user-info',
        label: 'Informazioni Utente',
        description: 'Modifica i dati dell\'utente',
        defaultOrder: 1,
        collapsible: false,
        fields: [
          {
            id: 'name',
            label: 'Nome',
            type: 'text' as const,
            required: true,
            defaultOrder: 1,
            section: 'user-info',
            validation: {
              min: 2,
              max: 50,
              message: 'Il nome deve essere tra 2 e 50 caratteri'
            }
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email' as const,
            required: true,
            defaultOrder: 2,
            section: 'user-info'
          }
        ]
      },
      {
        id: 'security',
        label: 'Sicurezza',
        description: 'Modifica credenziali',
        defaultOrder: 2,
        collapsible: true,
        fields: [
          {
            id: 'password',
            label: 'Nuova Password',
            type: 'password' as const,
            required: false,
            defaultOrder: 1,
            section: 'security',
            placeholder: 'Lascia vuoto per non modificare',
            validation: {
              min: 8,
              message: 'La password deve essere di almeno 8 caratteri'
            }
          }
        ]
      },
      {
        id: 'permissions',
        label: 'Permessi',
        description: 'Modifica ruolo e autorizzazioni',
        defaultOrder: 3,
        collapsible: true,
        fields: [
          {
            id: 'role',
            label: 'Ruolo',
            type: 'select' as const,
            required: true,
            defaultOrder: 1,
            section: 'permissions',
            options: [
              { value: 'admin', label: 'Amministratore' },
              { value: 'agent', label: 'Agente' },
              { value: 'client', label: 'Cliente' }
            ]
          }
        ]
      }
    ] as FormSection[]
  }
};