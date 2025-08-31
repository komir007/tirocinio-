import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy';
import { User } from './user/user.entity';
import { UserSettings } from './user-settings/user-settings.entity';



@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'devuser',
      password: 'devpass',
      database: 'miodb',
      entities: [User, UserSettings],
      autoLoadEntities: true,
      synchronize: true, // ❗ solo in sviluppo
    }),
      UsersModule,
      AuthModule,
      UserSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService,
  
    JwtStrategy,
  ],
})
export class AppModule {}
