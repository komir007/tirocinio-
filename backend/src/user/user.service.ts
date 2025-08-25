
// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto , UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // Inietta il repository di TypeORM per l'entità User
    private usersRepository: Repository<User>,
  ) {}

  // Trova un utente per ID
  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  

  // Trova un utente per email (usato spesso per l'autenticazione)
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Crea un nuovo utente
  // userData ora può includere name, surname, email, password, role
  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  // Aggiorna un utente
  // userData ora può includere name, surname, email, password, role
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    // Se la password è presente, hashala prima di salvare
    if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  // Elimina un utente
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Trova tutti gli utenti, con filtraggio per ruolo
  /**
   * Trova tutti gli utenti secondo le regole:
   * - admin: restituisce tutti
   * - agent: restituisce solo quelli creati da lui (createdBy = email)
   * - client: restituisce array vuoto
   * @param role ruolo utente loggato
   * @param email email utente loggato (necessaria per agent)
   */
  async findAll( email?: string): Promise<User[]> {
    const role = (email) ? (await this.findOneByEmail(email))?.role : null;
    console.log('Ruolo utente:', role);
    if (!role || role === 'admin') {
      // Admin vede tutti
      return this.usersRepository.find();
    }
    if (role === 'agent' && email) {
      // Agent vede solo utenti creati da lui
      return this.usersRepository.find({ where: { createdBy: email } });
    }
    // Client o altri ruoli non vedono nulla
    return [];
  }
}