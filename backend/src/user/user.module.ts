import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Registra l'entità User con TypeORM
  ],
  providers: [UsersService], // I servizi che saranno iniettabili
  controllers: [UsersController], // I controller che gestiranno le richieste
  exports: [UsersService], // Esporta UsersService per renderlo disponibile ad altri moduli (es. AuthModule)
})
export class UsersModule {}