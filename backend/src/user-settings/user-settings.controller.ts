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
} from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from './dto/user-settings.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { UserRole } from '../user/user.entity';

@Controller('user-settings')
@UseGuards(JwtGuard)
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('test')
  testEndpoint() {
    return { message: 'User Settings API is working!', timestamp: new Date() };
  }

  @Get('my-settings')
  async getMySettings(@Request() req) {
    const userId = req.user.sub;
    const settings = await this.userSettingsService.findByUserId(userId);
    return settings || { customizationConfig: null, adminFieldRestrictions: null };
  }

  @Put('my-settings')
  async updateMySettings(@Request() req, @Body() updateDto: UpdateUserSettingsDto) {
    const userId = req.user.sub;
    return await this.userSettingsService.updateByUserId(userId, updateDto);
  }

  @Put('my-settings/customization')
  async updateMyCustomization(@Request() req, @Body() body: { customizationConfig: any }) {
    const userId = req.user.sub;
    return await this.userSettingsService.updateCustomizationConfig(userId, body.customizationConfig);
  }

  @Put('admin/field-restrictions/:targetUserId')
  async updateFieldRestrictions(
    @Request() req,
    @Param('targetUserId') targetUserId: number,
    @Body() body: { adminFieldRestrictions: any }
  ) {
    // Solo gli admin possono impostare restrizioni sui campi
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can set field restrictions');
    }
    
    return await this.userSettingsService.updateAdminFieldRestrictions(
      targetUserId, 
      body.adminFieldRestrictions
    );
  }

  @Get('admin/all-settings')
  async getAllSettings(@Request() req) {
    // Solo gli admin possono vedere tutte le impostazioni
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view all settings');
    }
    
    // TODO: Implementare logica per ottenere tutte le impostazioni
    // Potresti voler aggiungere un metodo nel service per questo
    return { message: 'Feature to be implemented' };
  }

  @Delete('my-settings')
  async deleteMySettings(@Request() req) {
    const userId = req.user.sub;
    await this.userSettingsService.remove(userId);
    return { message: 'Settings deleted successfully' };
  }
}
