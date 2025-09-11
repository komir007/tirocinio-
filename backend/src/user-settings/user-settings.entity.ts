import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, VersionColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { UniqueMetadata } from 'typeorm/metadata/UniqueMetadata.js';

@Entity('user_settings')
@Unique(['userId', 'settingname'])
export class UserSettings {
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

  @VersionColumn()
  version: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP' 
  })
  updatedAt: Date;
}
