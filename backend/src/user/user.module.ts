import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { User } from './user.entity';
import { UserSettings } from '../user-settings/user-settings.entity';

@Module({
  imports: [
  TypeOrmModule.forFeature([User, UserSettings]), // Registra le entità necessarie
  ],
  providers: [UsersService], // I servizi che saranno iniettabili
  controllers: [UsersController], // I controller che gestiranno le richieste
  exports: [UsersService], // Esporta UsersService per renderlo disponibile ad altri moduli (es. AuthModule)
})
export class UsersModule {}