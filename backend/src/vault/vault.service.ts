import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { AuditService } from '../common/services/audit.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { UpdateVaultItemDto } from './dto/update-vault-item.dto';

@Injectable()
export class VaultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(userId: string, categoryId?: string, favorite?: boolean, search?: string) {
    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (favorite !== undefined) {
      where.favorite = favorite;
    }

    if (search) {
      where.OR = [
        { websiteName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.vaultItem.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    // Do NOT return decrypted passwords
    return items.map((item) => {
      const { encryptedPassword, ...rest } = item;
      return {
        ...rest,
        hasPassword: true,
      };
    });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.vaultItem.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!item) {
      throw new NotFoundException('Vault item not found');
    }

    return {
      ...item,
      password: this.encryptionService.decrypt(item.encryptedPassword),
    };
  }

  async create(userId: string, dto: CreateVaultItemDto) {
    const encryptedPassword = this.encryptionService.encrypt(dto.password);

    const item = await this.prisma.vaultItem.create({
      data: {
        userId,
        websiteName: dto.websiteName,
        websiteUrl: dto.websiteUrl,
        username: dto.username,
        encryptedPassword,
        notes: dto.notes,
        categoryId: dto.categoryId,
        favorite: dto.favorite ?? false,
      },
      include: { category: true },
    });

    return {
      ...item,
      password: dto.password,
    };
  }

  async update(userId: string, id: string, dto: UpdateVaultItemDto) {
    // Verify ownership
    await this.findOne(userId, id);

    const updateData: any = {
      websiteName: dto.websiteName,
      websiteUrl: dto.websiteUrl,
      username: dto.username,
      notes: dto.notes,
      categoryId: dto.categoryId,
      favorite: dto.favorite,
    };

    if (dto.password) {
      updateData.encryptedPassword = this.encryptionService.encrypt(dto.password);
    }

    const updatedItem = await this.prisma.vaultItem.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return {
      ...updatedItem,
      password: dto.password ?? this.encryptionService.decrypt(updatedItem.encryptedPassword),
    };
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    const item = await this.findOne(userId, id);

    await this.prisma.vaultItem.delete({
      where: { id },
    });

    // Log delete action
    await this.auditService.logAction(userId, 'delete vault item', {
      vaultItemId: id,
      websiteName: item.websiteName,
    });

    return { success: true, message: 'Vault item deleted successfully' };
  }

  async getStats(userId: string) {
    const [total, favorites, categoriesBreakdown, recent] = await Promise.all([
      this.prisma.vaultItem.count({ where: { userId } }),
      this.prisma.vaultItem.count({ where: { userId, favorite: true } }),
      this.prisma.vaultItem.groupBy({
        by: ['categoryId'],
        where: { userId },
        _count: { id: true },
      }),
      this.prisma.vaultItem.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
    ]);

    // Fetch category details
    const categoryIds = categoriesBreakdown
      .map((cb) => cb.categoryId)
      .filter((id): id is string => !!id);
    
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryStats = categoriesBreakdown.map((cb) => {
      const categoryName = categories.find((c) => c.id === cb.categoryId)?.name || 'Uncategorized';
      return {
        categoryId: cb.categoryId,
        categoryName,
        count: cb._count.id,
      };
    });

    // Do NOT decrypt passwords for stats list
    const sanitizedRecent = recent.map((item) => {
      const { encryptedPassword, ...rest } = item;
      return {
        ...rest,
        hasPassword: true,
      };
    });

    return {
      total,
      favorites,
      categories: categoryStats,
      recent: sanitizedRecent,
    };
  }

  async reveal(userId: string, id: string) {
    const item = await this.prisma.vaultItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException('Vault item not found');
    }

    const decryptedPassword = this.encryptionService.decrypt(item.encryptedPassword);

    // Log password reveal
    await this.auditService.logAction(userId, 'password reveal', {
      vaultItemId: id,
      websiteName: item.websiteName,
    });

    return { password: decryptedPassword };
  }

  async exportJSON(userId: string) {
    const items = await this.prisma.vaultItem.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const decrypted = items.map(item => ({
      websiteName: item.websiteName,
      websiteUrl: item.websiteUrl,
      username: item.username,
      password: this.encryptionService.decrypt(item.encryptedPassword),
      notes: item.notes,
      category: item.category?.name || 'Uncategorized',
      favorite: item.favorite,
      createdAt: item.createdAt,
    }));

    await this.auditService.logAction(userId, 'export', { format: 'JSON', count: items.length });
    return decrypted;
  }

  async exportCSV(userId: string) {
    const items = await this.prisma.vaultItem.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'Website Name,Website URL,Username,Password,Notes,Category,Favorite,Created At\n';
    const escape = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    for (const item of items) {
      const pwd = this.encryptionService.decrypt(item.encryptedPassword);
      csv += `${escape(item.websiteName)},${escape(item.websiteUrl)},${escape(item.username)},${escape(pwd)},${escape(item.notes)},${escape(item.category?.name)},"${item.favorite}","${item.createdAt.toISOString()}"\n`;
    }

    await this.auditService.logAction(userId, 'export', { format: 'CSV', count: items.length });
    return csv;
  }
}
