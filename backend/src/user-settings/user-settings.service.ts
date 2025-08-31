import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './user-settings.entity';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
  ) {}

  async create(createUserSettingsDto: CreateUserSettingsDto): Promise<UserSettings> {
    const userSettings = this.userSettingsRepository.create(createUserSettingsDto);
    return await this.userSettingsRepository.save(userSettings);
  }

  async findByUserId(userId: number): Promise<UserSettings | null> {
    return await this.userSettingsRepository.findOne({
      where: { userId },
      relations: ['user']
    });
  }

  async updateByUserId(userId: number, updateUserSettingsDto: UpdateUserSettingsDto): Promise<UserSettings> {
    let userSettings = await this.findByUserId(userId);
    
    if (!userSettings) {
      // Crea nuove impostazioni se non esistono
      userSettings = await this.create({
        userId,
        ...updateUserSettingsDto
      });
    } else {
      // Aggiorna quelle esistenti
      Object.assign(userSettings, updateUserSettingsDto);
      userSettings = await this.userSettingsRepository.save(userSettings);
    }
    
    return userSettings;
  }

  async remove(userId: number): Promise<void> {
    const result = await this.userSettingsRepository.delete({ userId });
    if (result.affected === 0) {
      throw new NotFoundException(`User settings for user ${userId} not found`);
    }
  }

  // Metodo per aggiornare solo le configurazioni di customizzazione
  async updateCustomizationConfig(userId: number, customizationConfig: any): Promise<UserSettings> {
    return await this.updateByUserId(userId, { customizationConfig });
  }

  // Metodo per aggiornare le restrizioni admin (solo per admin)
  async updateAdminFieldRestrictions(userId: number, adminFieldRestrictions: any): Promise<UserSettings> {
    return await this.updateByUserId(userId, { adminFieldRestrictions });
  }
}
