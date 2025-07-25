import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Il name è obbligatorio' })
  name: string;

  @IsNotEmpty({ message: 'Il surname è obbligatorio' })
  surname: string;

  @IsEmail({}, { message: 'Email non valida' })
  email: string;

  @MinLength(6, { message: 'La password deve avere almeno 6 caratteri' })
  password: string;

  @IsEnum(['admin', 'agent', 'client'], {
    message: 'Il ruolo deve essere admin, agent o client',
  })
  role: UserRole;
}