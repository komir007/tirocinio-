// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CLIENT = 'client',
}

@Entity('user') // Specifica il nome della tabella nel database
export class User {
  @PrimaryGeneratedColumn() // Colonna chiave primaria auto-incrementante
  id: number;

  @Column({ unique: true, length: 255 }) // Colonna per l'email, deve essere unica
  email: string;

  @Column({ length: 255 }) // Colonna per la password (hashata)
  password: string;

  @Column({ length: 255, nullable: true }) // Aggiunto il campo name, reso opzionale
  name: string;

  @Column({ length: 255, nullable: true }) // Aggiunto il campo surname, reso opzionale
  surname: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT, // Ruolo predefinito per i nuovi utenti
  })
  role: UserRole;

  @Column({ length: 255, nullable: true }) // Colonna per la password (hashata)
  createdBy: string;

  // Puoi aggiungere altre colonne a seconda delle tue esigenze:
  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // createdAt: Date;

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  // updatedAt: Date;
}