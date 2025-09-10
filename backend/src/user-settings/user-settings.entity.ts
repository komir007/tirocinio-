import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../user/user.entity';
import { UniqueMetadata } from 'typeorm/metadata/UniqueMetadata.js';

@Entity('user_settings')
export class UserSettings {
  @Unique(['id', 'userId', 'settingname'])
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ nullable: false })
  settingname: string;

  @Column({ nullable: false }) // CORRETTO: Esplicita che non può essere null
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('json', { nullable: true })
  customizationConfig: any;

  @Column('json', { nullable: true })
  adminRestrictions: any; // Configurazioni admin sui campi che gli agent non possono editare

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP' 
  })
  updatedAt: Date;
}
