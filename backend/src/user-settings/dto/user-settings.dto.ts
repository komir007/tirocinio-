import { IsOptional, IsObject, IsNumber, IsString } from 'class-validator';

export class CreateUserSettingsDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsObject()
  customizationConfig?: any;

  @IsString()
  settingname: string; // obbligatorio: identifica lo setting (es. formKey)

}

export class UpdateUserSettingsDto {
  // settingname dovrebbe essere passato quando si aggiorna uno specifico setting
  @IsOptional()
  @IsString()
  settingname?: string;

  @IsOptional()
  @IsObject()
  customizationConfig?: any;
}
