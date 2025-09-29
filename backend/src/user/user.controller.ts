// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request as NestRequest } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './user.service';
import { User, UserRole } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto'; // Importa i DTO aggiornati
import { JwtGuard } from '../auth/jwt.guard'; // Importa il guard JWT

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

   // Ottenere tutti gli utenti 
  // Usa il guard JWT per proteggere questa rotta
  @UseGuards(JwtGuard) 
  @Get()
  async findAll(@NestRequest() req: Request): Promise<User[]> {
  // req.user contiene i dati dell'utente autenticato (userId, email, role)
  console.log('Richiesta ricevuta da:', req.user);
  const userEmail = (req.user as any)?.email;
  const userRole = (req.user as any)?.role;

  //console.log('Email utente:', userEmail);
  return this.usersService.findAll(userEmail, userRole);
  }
  

  // Ottenere un utente per ID
  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findOne(id); // Converti stringa a numero
  }

  // Creare un nuovo utente 
  @UseGuards(JwtGuard) 
  @Post()
  async create(@NestRequest() req: Request, @Body() createUserDto: CreateUserDto): Promise<User> {
    const creatorEmail = (req.user as any)?.email;
    // Impostiamo createdBy se non presente
    if (creatorEmail && !createUserDto.createdBy) {
      (createUserDto as any).createdBy = creatorEmail;
    }
    return this.usersService.create(createUserDto); 
  }

  // Aggiornare un utente 
  @UseGuards(JwtGuard)
  @Put(':id')
  async update(@NestRequest() req: Request, @Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User | null> {
    const modifierEmail = (req.user as any)?.email;
    return this.usersService.update(id, updateUserDto, modifierEmail);
  }

  // Eliminare un utente (solo per admin)
  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  // Ottenere il proprio profilo (qualsiasi utente autenticato)
  @Get('me')
  async getMyProfile(@NestRequest() req: Request): Promise<User| null> {
    // req.user contiene i dati dell'utente autenticato (userId, email, role)
    // Recupera l'utente completo dal database se hai bisogno di name/surname
    return this.usersService.findOne((req.user as any).userId);
  }
  

}
