// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './user.service';
import { User, UserRole } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto'; // Importa i DTO aggiornati

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Ottenere tutti gli utenti (solo per admin)
  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles(UserRole.ADMIN, UserRole.AGENT) // Permetti sia ad admin che agent di accedere
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Ottenere un utente per ID (solo per admin o l'utente stesso)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN) // Permetti agli admin e all'utente stesso di accedere
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findOne(id); // Converti stringa a numero
  }

  // Creare un nuovo utente (può essere pubblico o protetto, es. solo admin crea utenti)
  // Se la registrazione è gestita da AuthModule, questa rotta potrebbe essere solo per admin
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Esempio: solo gli admin possono creare utenti
  @Roles(UserRole.ADMIN , UserRole.AGENT) // Permetti sia ad admin che agent di creare utenti
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // La password verrà hashata nel servizio di autenticazione o qui prima di salvare
    return this.usersService.create(createUserDto); // o req.user.id per chi ha creato l'utente
  }

  // Aggiornare un utente (solo per admin o l'utente stesso)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT) // Per semplicità, solo admin possono aggiornare altri utenti
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.usersService.update(id, updateUserDto);
  }

  // Eliminare un utente (solo per admin)
  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles(UserRole.ADMIN, UserRole.AGENT) // Permetti sia ad admin che agent di eliminare utenti
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  // Ottenere il proprio profilo (qualsiasi utente autenticato)
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyProfile(@Request() req): Promise<User| null> {
    // req.user contiene i dati dell'utente autenticato (userId, email, role)
    // Recupera l'utente completo dal database se hai bisogno di name/surname
    return this.usersService.findOne(req.user.userId);
  }
}