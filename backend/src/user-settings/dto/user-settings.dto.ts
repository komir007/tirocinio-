import { IsOptional, IsObject, IsNumber } from 'class-validator';

export class CreateUserSettingsDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsObject()
  customizationConfig?: any;

  @IsOptional()
  @IsObject()
  adminFieldRestrictions?: any;
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsObject()
  customizationConfig?: any;

  @IsOptional()
  @IsObject()
  adminFieldRestrictions?: any;
}
