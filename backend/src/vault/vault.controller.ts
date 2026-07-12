import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { GetUser } from '../common/decorators/user.decorator';
import { VaultService } from './vault.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { UpdateVaultItemDto } from './dto/update-vault-item.dto';

import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('vault')
@UseGuards(AuthGuard)
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query('categoryId') categoryId?: string,
    @Query('favorite') favorite?: string,
    @Query('search') search?: string,
  ) {
    const isFavorite = favorite === 'true' ? true : favorite === 'false' ? false : undefined;
    return this.vaultService.findAll(userId, categoryId, isFavorite, search);
  }

  @Get('stats')
  getStats(@GetUser('id') userId: string) {
    return this.vaultService.getStats(userId);
  }

  @Post('export/json')
  @UseGuards(ThrottlerGuard)
  exportJSON(@GetUser('id') userId: string) {
    return this.vaultService.exportJSON(userId);
  }

  @Post('export/csv')
  @UseGuards(ThrottlerGuard)
  async exportCSV(@GetUser('id') userId: string, @Res() res: any) {
    const csv = await this.vaultService.exportCSV(userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vault_export.csv');
    return res.status(200).send(csv);
  }

  @Get(':id/reveal')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @UseGuards(ThrottlerGuard)
  reveal(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.vaultService.reveal(userId, id);
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.vaultService.findOne(userId, id);
  }

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateVaultItemDto) {
    return this.vaultService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVaultItemDto,
  ) {
    return this.vaultService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.vaultService.remove(userId, id);
  }
}
