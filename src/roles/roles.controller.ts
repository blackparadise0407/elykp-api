import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionGuard } from '@/common/guards/permission.guard';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './role.entity';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = new Role();
    role.name = createRoleDto.name.toLowerCase().trim();
    role.description = createRoleDto.description?.trim();
    await role.save();
    return role;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(PermissionGuard('read:roles'))
  findAll() {
    return this.rolesService.getMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
