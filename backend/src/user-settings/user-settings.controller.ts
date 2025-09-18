import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import {
  CreateUserSettingsDto,
  UpdateUserSettingsDto,
} from './dto/user-settings.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { UserRole } from '../user/user.entity';

@Controller('user-settings')
@UseGuards(JwtGuard)
export class UserSettingsController {
  private readonly logger = new Logger(UserSettingsController.name);

  constructor(private readonly userSettingsService: UserSettingsService) {}


  // -------------------
  // GET (current user)
  // -------------------

  @Get('my-settings')
  async getMySettings(@Request() req, @Query('settingname') settingname?: string) {
    try {
      const userId = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(
        `Getting settings for userId: ${userId}`,
      );

      if (!userId || isNaN(userId)) {
        this.logger.error(
          `Invalid user ID after parsing: ${userId}`,
        );
        throw new BadRequestException('Invalid user ID');
      }

      this.logger.log(`Using parsed userId: ${userId}`);
      const settings = await this.userSettingsService.findByUserId(
        userId,
        settingname,
      );
      
      return settings || { customizationConfig: null };
    } catch (error) {
      this.logger.error('Error getting user settings:', error);
      throw error;
    }
  }

  // -------------------
  // PUT (current user)/create if not exists
  // -------------------

  @Put('my-settings')
  async updateMyCustomization(@Request() req, @Body() body: any) {
    try {
      const userId = req.user.userId;
      this.logger.log(
        `Updating customization for userId: ${userId}`,
      );

      if (!userId || isNaN(userId)) {
        this.logger.error(
          `Invalid user ID after parsing: ${userId}`,
        );
        throw new BadRequestException('Invalid user ID');
      }

      if (!body || typeof body.customizationConfig === 'undefined') {
        throw new BadRequestException(
          'customizationConfig is required in request body',
        );
      }

      const settingname =
        typeof body.settingname === 'string' && body.settingname.length > 0 ? body.settingname : undefined;

      this.logger.log(
        `Using parsed userId: ${userId} for customization update, settingname: ${settingname}`,
      );
      const result = await this.userSettingsService.updateCustomizationConfig(
        userId,
        body.customizationConfig,
        settingname,
      );
      this.logger.log(
        `Successfully updated customization for userId: ${userId}`,
      );

      return result;
    } catch (error) {
      this.logger.error('Error updating customization:', error);
      throw error;
    }
  }

  // -------------------
  // GET (admin user)
  // -------------------
  // Recupera la config di un admin specifico (usato da agent per import)
  @Get('my-admin-setting')
  async getAdminConfig(@Request() req, @Query('settingname') settingname?: string) {
    const adminId = req.user.parentId;
    if (!adminId) throw new BadRequestException('Invalid admin id');

    const settings = await this.userSettingsService.findByUserId(
      adminId,
      settingname,
    );
    return settings || { customizationConfig: null };
  }

  // -------------------
  // DELETE (current user)
  // -------------------
  @Delete('my-settings')
  async deleteMySettings(@Request() req, @Query('settingname') settingname?: string) {
    try {
      const userId = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(
        `Deleting settings for userId: ${userId}, settingsname: ${settingname})`,
      );

      if (!userId || isNaN(userId)) {
        this.logger.error(
          `Invalid user ID after parsing: ${userId}`,
        );
        throw new BadRequestException('Invalid user ID');
      }

      if (settingname) {
        await this.userSettingsService.removeByUserIdAndSetting(
          userId,
          settingname
        );
        return { message: `Settings for ${settingname} deleted successfully` };
      }

      //await this.userSettingsService.remove(userId);
      //return { message: 'All settings deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting user settings:', error);
      throw error;
    }
  }
}
