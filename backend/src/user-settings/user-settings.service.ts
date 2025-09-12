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

  async findByUserId(userId: number, settingname?: string): Promise<UserSettings | null> {
    const where: any = { userId };
    if (settingname) where.settingname = settingname;
    return await this.userSettingsRepository.findOne({
      where,
      relations: ['user']
    });
  }

  // wrapper esplicito: trova lo setting specifico per user + settingname
  async findByUserIdAndSetting(adminId: number, settingname: string): Promise<UserSettings | null> {
    return this.findByUserId(adminId, settingname);
  }

  async updateByUserId(userId: number, updateUserSettingsDto: UpdateUserSettingsDto, settingname?: string): Promise<UserSettings> {
    let userSettings = await this.findByUserId(userId, settingname);

    if (!userSettings) {
      // Assicurati che userId e settingname siano inclusi quando si crea un nuovo record
      userSettings = await this.create({
        userId,
        settingname: settingname || updateUserSettingsDto?.settingname || 'default',
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

  // Rimuove la configurazione specifica (userId + settingname)
  async removeByUserIdAndSetting(userId: number, settingname: string): Promise<void> {
    const result = await this.userSettingsRepository.delete({ userId, settingname });
    if (result.affected === 0) {
      throw new NotFoundException(
        `User settings for user ${userId} and setting ${settingname} not found`,
      );
    }
  }

  // CORRETTO: Metodo per aggiornare solo le configurazioni di customizzazione
  async updateCustomizationConfig(userId: number, customizationConfig: any, settingname?: string): Promise<UserSettings> {
    console.log('Updating customization config for userId:', userId, 'with config:', customizationConfig);
    
    // Verifica che userId sia un numero valido
    if (!userId || isNaN(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

  return await this.updateByUserId(userId, { customizationConfig }, settingname);
  }
}
