import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVaultItemDto {
  @IsString()
  @IsNotEmpty()
  websiteName: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  favorite?: boolean;
}
