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
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(
        `Getting settings for raw userId: ${userIdRaw} (type: ${typeof userIdRaw})`,
      );

      this.logger.log(`Using userId: ${req.user.userId}`);
      this.logger.log(`Using parentId: ${req.user.parentId}`);

      // Converti userId a numero se è una stringa
      const userId =
        typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;

      if (!userId || isNaN(userId)) {
        this.logger.error(
          `Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`,
        );
        throw new BadRequestException('Invalid user ID');
      }

      this.logger.log(`Using parsed userId: ${userId}`);
      const settings = await this.userSettingsService.findByUserId(
        userId,
        settingname,
      );
      console.log("Settings fetched--------------:", settings);
      return settings || { customizationConfig: null };
    } catch (error) {
      this.logger.error('Error getting user settings:', error);
      throw error;
    }
  }

  @Put('my-settings/OLD')
  async updateMySettings(
    @Request() req,
    @Body() updateDto: UpdateUserSettingsDto,
  ) {
    try {
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(
        `Updating settings for raw userId: ${userIdRaw} (type: ${typeof userIdRaw})`,
      );

      // Converti userId a numero se è una stringa
      const userId =
        typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;

      if (!userId || isNaN(userId)) {
        this.logger.error(
          `Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`,
        );
        throw new BadRequestException('Invalid user ID');
      }

      this.logger.log(`Using parsed userId: ${userId}`);
      // Ensure settingname is provided either in body or inside updateDto
      const settingname = updateDto?.settingname || req.body?.settingname;
      return await this.userSettingsService.updateByUserId(
        userId,
        updateDto,
        settingname,
      );
    } catch (error) {
      this.logger.error('Error updating user settings:', error);
      throw error;
    }
  }

  @Put('my-settings')
  async updateMyCustomization(@Request() req, @Body() body: any) {
    try {
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(
        `Updating customization for raw userId: ${userIdRaw} (type: ${typeof userIdRaw})`,
      );

      // Converti userId a numero se è una stringa
      const userId =
        typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;

      if (!userId || isNaN(userId)) {
        this.logger.error(
          `Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`,
        );
        throw new BadRequestException('Invalid user ID');
      }

      if (!body || typeof body.customizationConfig === 'undefined') {
        throw new BadRequestException(
          'customizationConfig is required in request body',
        );
      }

      // Optional settingname support: client may pass settingname to identify the form (fromKey)
      const settingname =
        typeof body.settingname === 'string' && body.settingname.length > 0
          ? body.settingname
          : undefined;

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

  // admin-only field restrictions endpoint removed; admin restrictions are now handled inside customizationConfig

  // Recupera la config di un admin specifico (usato da agent per import)
  @Get('my-admin-setting')
  async getAdminConfig(@Request() req, @Query('settingname') settingname?: string) {
    const adminId = req.user.parentId;
    if (!adminId) throw new BadRequestException('Invalid admin id');

    // solo admin o agent/client che hanno parentId uguale possono richiedere
    const requesterIdRaw = req.user.userId;
    const requesterId =
      typeof requesterIdRaw === 'string'
        ? parseInt(requesterIdRaw, 10)
        : requesterIdRaw;
    const role = req.user.role;

    const settings = await this.userSettingsService.findByUserId(
      adminId,
      settingname,
    );
    return settings || { customizationConfig: null };
  }

  @Delete('my-settings')
  async deleteMySettings(@Request() req, @Query('settingname') settingname?: string) {
    try {
      const userIdRaw = req.user.userId; // CORRETTO: usa userId invece di sub
      this.logger.log(
        `Deleting settings for raw userId: ${userIdRaw} (type: ${typeof userIdRaw}, settingsname: ${req.body.settingname})`,
      );

      // Converti userId a numero se è una stringa
      const userId =
        typeof userIdRaw === 'string' ? parseInt(userIdRaw, 10) : userIdRaw;

      if (!userId || isNaN(userId)) {
        this.logger.error(
          `Invalid user ID after parsing: ${userId} (original: ${userIdRaw})`,
        );
        throw new BadRequestException('Invalid user ID');
      }

      if (settingname) {
        await this.userSettingsService.removeByUserIdAndSetting(
          userId,
          String(settingname),
        );
        return { message: `Settings for ${settingname} deleted successfully` };
      }

      await this.userSettingsService.remove(userId);
      return { message: 'All settings deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting user settings:', error);
      throw error;
    }
  }
}
