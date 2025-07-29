/*import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto , UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ✅ CREATE (critta la password)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  // ✅ READ - tutti gli utenti
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // ✅ READ - singolo utente
    async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

   async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
    }

  // ✅ UPDATE (ricripta password se aggiornata)
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  // ✅ DELETE
  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
*/
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
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  // Aggiorna un utente
  // userData ora può includere name, surname, email, password, role
  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  // Elimina un utente
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Trova tutti gli utenti
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}