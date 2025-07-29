// types/auth.ts

/**
 * Interfaccia che definisce la struttura di un utente nel sistema.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role; // Il ruolo dell'utente
}

/**
 * Interfaccia per la visualizzazione degli utenti, estende User e include 'createdBy'.
 */
export interface DisplayUser extends User {
  createdBy: string | null;
}

/**
 * Tipo unione che definisce i possibili ruoli di un utente.
 */
export type Role = 'admin' | 'agent' | 'client' | null;
