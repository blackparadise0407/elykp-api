import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Permission } from '@/permissions/permission.entity';
import { PermissionsService } from '@/permissions/permissions.service';
import { RoleType } from '@/roles/enums/role.enum';
import { Role } from '@/roles/role.entity';
import { RolesService } from '@/roles/roles.service';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

const initialPermissions = ['read:permissions', 'write:permissions'];

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly config: ConfigService,
  ) {}

  public async onApplicationBootstrap() {
    const existingRoles = await this.rolesService.getMany();
    if (!existingRoles.length) {
      const adminRole = new Role();
      adminRole.name = RoleType.admin;
      adminRole.description = 'Admin role of application';

      const userRole = new Role();
      userRole.name = RoleType.user;
      userRole.description = 'User role of application';
      await userRole.save();

      const existingPermissions = await this.permissionsService.getMany();
      if (!existingPermissions.length) {
        const permissions = await Promise.all(
          initialPermissions.map(async (it) => {
            const permission = new Permission();
            permission.name = it;
            await permission.save();
            return permission;
          }),
        );
        adminRole.permissions = permissions;
      }

      await adminRole.save();

      const existingUsers = await this.usersService.getMany();
      if (!existingUsers.length) {
        const admin = new User();
        admin.username = 'admin';
        admin.email = this.config.get('admin.email')!;
        admin.password = this.config.get('admin.password')!;
        admin.emailVerified = true;
        admin.roles = [adminRole, userRole];
        await admin.save();
      }
    }
  }
}
