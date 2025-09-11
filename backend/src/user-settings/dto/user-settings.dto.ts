import { IsOptional, IsObject, IsNumber, IsString } from 'class-validator';

export class CreateUserSettingsDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsObject()
  customizationConfig?: any;

  @IsOptional()
  @IsString()
  settingname?: string;


}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsObject()
  customizationConfig?: any;

  @IsOptional()
  @IsString()
  settingname?: string;
}
