import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/user-settings.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { UserRole } from '../user/user.entity';

@Controller('user-settings')
@UseGuards(JwtGuard)
export class UserSettingsController {
  private readonly logger = new Logger(UserSettingsController.name);

  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('test')
  testEndpoint() {
    return { message: 'User Settings API is working!', timestamp: new Date() };
  }

  @Get('my-settings')
  async getMySettings(@Request() req) {
    try {
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(`Getting settings for raw userId: ${userIdRaw} (type: ${typeof userIdRaw})`);
      
      // Converti userId a numero se è una stringa
      const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;
      
      if (!userId || isNaN(userId)) {
        this.logger.error(`Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`);
        throw new BadRequestException('Invalid user ID');
      }

      this.logger.log(`Using parsed userId: ${userId}`);
      const settings = await this.userSettingsService.findByUserId(userId);
      return settings || { customizationConfig: null, adminFieldRestrictions: null };
    } catch (error) {
      this.logger.error('Error getting user settings:', error);
      throw error;
    }
  }

  @Put('my-settings')
  async updateMySettings(@Request() req, @Body() updateDto: UpdateUserSettingsDto) {
    try {
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(`Updating settings for raw userId: ${userIdRaw} (type: ${typeof userIdRaw})`);
      
      // Converti userId a numero se è una stringa
      const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;
      
      if (!userId || isNaN(userId)) {
        this.logger.error(`Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`);
        throw new BadRequestException('Invalid user ID');
      }

      this.logger.log(`Using parsed userId: ${userId}`);
      return await this.userSettingsService.updateByUserId(userId, updateDto);
    } catch (error) {
      this.logger.error('Error updating user settings:', error);
      throw error;
    }
  }

  @Put('my-settings/customization')
  async updateMyCustomization(@Request() req, @Body() body: { customizationConfig: any }) {
    try {
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(`Updating customization for raw userId: ${userIdRaw} (type: ${typeof userIdRaw})`);
      
      // Converti userId a numero se è una stringa
      const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;
      
      if (!userId || isNaN(userId)) {
        this.logger.error(`Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`);
        throw new BadRequestException('Invalid user ID');
      }

      if (!body || typeof body.customizationConfig === 'undefined') {
        throw new BadRequestException('customizationConfig is required in request body');
      }

      this.logger.log(`Using parsed userId: ${userId} for customization update`);
      const result = await this.userSettingsService.updateCustomizationConfig(userId, body.customizationConfig);
      this.logger.log(`Successfully updated customization for userId: ${userId}`);
      
      return result;
    } catch (error) {
      this.logger.error('Error updating customization:', error);
      throw error;
    }
  }

  @Put('admin/field-restrictions/:targetUserId')
  async updateFieldRestrictions(
    @Request() req,
    @Param('targetUserId') targetUserId: number,
    @Body() body: { adminFieldRestrictions: any }
  ) {
    try {
      // Solo gli admin possono impostare restrizioni sui campi
      if (req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can set field restrictions');
      }

      if (!targetUserId || isNaN(targetUserId)) {
        throw new BadRequestException('Invalid target user ID');
      }
      
      return await this.userSettingsService.updateAdminFieldRestrictions(
        targetUserId, 
        body.adminFieldRestrictions
      );
    } catch (error) {
      this.logger.error('Error updating field restrictions:', error);
      throw error;
    }
  }

  @Get('admin/all-settings')
  async getAllSettings(@Request() req) {
    // Solo gli admin possono vedere tutte le impostazioni
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view all settings');
    }
    
    // TODO: Implementare logica per ottenere tutte le impostazioni
    return { message: 'Feature to be implemented' };
  }

  @Delete('my-settings')
  async deleteMySettings(@Request() req) {
    try {
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(`Deleting settings for raw userId: ${userIdRaw} (type: ${typeof userIdRaw})`);
      
      // Converti userId a numero se è una stringa
      const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;
      
      if (!userId || isNaN(userId)) {
        this.logger.error(`Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`);
        throw new BadRequestException('Invalid user ID');
      }

      await this.userSettingsService.remove(userId);
      return { message: 'Settings deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting user settings:', error);
      throw error;
    }
  }
}
