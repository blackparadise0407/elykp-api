import { Body, Controller, Get, Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionGuard } from '@/common/guards/permission.guard';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './permission.entity';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() body: CreatePermissionDto) {
    const perm = new Permission();
    perm.name = body.name;
    perm.description = body.description;
    await perm.save();
    return perm;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(PermissionGuard('read:permissions'))
  get() {
    return this.permissionsService.getMany();
  }
}
