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
    if (!settingname) {
      console.log(`Finding settings with criteria: ${JSON.stringify({ userId, settingname })}`);
    }
    return await this.userSettingsRepository.findOne({
      where: { userId, settingname }
    });
  }

  async updateByUserId(userId: number, updateUserSettingsDto: UpdateUserSettingsDto, settingname?: string): Promise<UserSettings> {
    let userSettings = await this.findByUserId(userId, settingname);

    if (!userSettings) {
      // userSettings non esistono, creane uno nuovo
      userSettings = await this.create({
        userId,
        settingname: settingname || updateUserSettingsDto?.settingname || 'default',
        customizationConfig: updateUserSettingsDto?.customizationConfig || {},
      });
    } else {
      // Aggiorna quelle esistenti
      Object.assign(userSettings, updateUserSettingsDto);
      userSettings = await this.userSettingsRepository.save(userSettings);
    }

    return userSettings;
  }

  async removeByUserIdAndSetting(userId: number, settingname: string): Promise<void> {
    const result = await this.userSettingsRepository.delete({ userId, settingname });
    if (result.affected === 0) {
      throw new NotFoundException(
        `User settings for user ${userId} and setting ${settingname} not found`,
      );
    }
  }

  
  async updateCustomizationConfig(userId: number, customizationConfig: any, settingname?: string): Promise<UserSettings> {
    console.log('Updating customization config for userId:', userId, 'with config:', customizationConfig);
    
    // Verifica che userId sia un numero valido
    if (!userId || isNaN(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

  return await this.updateByUserId(userId, { customizationConfig }, settingname);
  }
}


  /*async remove(userId: number): Promise<void> {
  const result = await this.userSettingsRepository.delete({ userId });
  if (result.affected === 0) {
    throw new NotFoundException(`User settings for user ${userId} not found`);
    }
  }*/

      // wrapper esplicito: trova lo setting specifico per user + settingname
  /*async findByUserIdAndSetting(adminId: number, settingname: string): Promise<UserSettings | null> {
    return this.findByUserId(adminId, settingname);
  }*/