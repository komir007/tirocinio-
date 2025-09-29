
// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserSettings } from '../user-settings/user-settings.entity';
import { CreateUserDto , UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // Inietta il repository di TypeORM per l'entità User
    private usersRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
  ) {}

  /**
   * Restituisce la configurazione dei campi (visibilità) per l'utente creatore.
   * Assunzione: esiste un record in user_settings con settingname='user_form' (o default) che contiene
   * customizationConfig = { fields: { name: { visible: true }, surname: { visible: false }, ... } }
   */
  private async getFieldVisibilityConfig(createdByEmail?: string, nameSettings?: string): Promise<Record<string, any>> {
    if (!createdByEmail) return {};
    // Trova l'utente creatore per email per ottenere il suo id, poi le sue impostazioni.
    const creator = await this.findOneByEmail(createdByEmail);
    if (!creator) return {};
    const settings = await this.userSettingsRepository.findOne({ where: { userId: creator.id, settingname: nameSettings || 'form_Registration' } });
    if (!settings || !settings.customizationConfig) return {};
    // Estrarre struttura attesa
    const fieldsCfg = settings.customizationConfig.fields || {};
    return fieldsCfg;
  }

  /**
   * Valida e sanifica i dati di input rispetto alla configurazione di visibilità.
   * Se un campo è marcato come non visibile (visible === false) e viene passato un valore, lancia eccezione.
   * In alternativa si potrebbe scegliere di rimuovere il campo invece di lanciare errore: qui lanciamo errore per sicurezza.
   */
  private async enforceHiddenFieldsPolicy(input: Partial<User>, createdByEmail?: string, nameSettings?: string): Promise<void> {
    const visibility = await this.getFieldVisibilityConfig(createdByEmail, nameSettings);
    if (!visibility || Object.keys(visibility).length === 0) return; // nessuna policy

    for (const [fieldName, meta] of Object.entries(visibility)) {
      const visibleFlag = (meta as any)?.visible;
      if (visibleFlag === false && input[fieldName as keyof User] !== undefined) {
        throw new BadRequestException(`Il campo '${fieldName}' non è attualmente visibile e non può essere impostato.`);
      }
    }
  }

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
    // Enforce hidden field policy (usa createdBy per recuperare configurazione del creatore)
    const nameSettings = "form_Registration";
    await this.enforceHiddenFieldsPolicy(userData, userData.createdBy, nameSettings);
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  // Aggiorna un utente
  // userData ora può includere name, surname, email, password, role
  async update(id: number, updateUserDto: UpdateUserDto, modifierEmail?: string): Promise<User | null> {
    // Enforce hidden field policy rispetto alla configurazione del modificatore (chi effettua la richiesta)
    const nameSettings = "form_Edit_User";
    await this.enforceHiddenFieldsPolicy(updateUserDto, modifierEmail, nameSettings);
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
  async findAll( email?: string, role?: string): Promise<User[]> {
    console.log('Email utente:', email);
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
