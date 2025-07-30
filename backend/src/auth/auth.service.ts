// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../user/user.entity';
import { CreateUserDto } from '../user/dto/user.dto'; // Importa CreateUserDto

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) { // Usa il DTO aggiornato
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userRole = createUserDto.role || UserRole.CLIENT; // Assicurati di impostare il ruolo di default

    const user = await this.usersService.create({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name, // Includi name
      surname: createUserDto.surname, // Includi surname
      role: userRole,
      createdBy: createUserDto.createdBy, // Includi createdBy
    });
    // Non restituire la password hashata
    const { password, ...result } = user;
    return this.login(result); // Effettua il login dell'utente appena registrato
  }
}