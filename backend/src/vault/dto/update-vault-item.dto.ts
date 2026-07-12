import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateVaultItemDto {
  @IsString()
  @IsOptional()
  websiteName?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

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
