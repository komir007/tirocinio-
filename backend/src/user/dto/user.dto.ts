// src/users/dto/user.dto.ts
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La password deve essere di almeno 6 caratteri' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string; // Reso opzionale

  @IsOptional()
  @IsString()
  @MaxLength(255)
  surname?: string; // Reso opzionale

  @IsOptional() // Il ruolo può essere omesso nella creazione, userà il default
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La password deve essere di almeno 6 caratteri' })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  surname?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}