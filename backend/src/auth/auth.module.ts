// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtGuard } from './jwt.guard'; // Importa il guard JWT

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule, // Importa ConfigModule per usare ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: '123', // Usa variabile d'ambiente in produzione!
        signOptions: { expiresIn: '60m' }, // Scadenza del token
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService], // Esporta AuthService se necessario in altri moduli
})
export class AuthModule {}