import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../user/user.entity';

export const ROLES_KEY = 'roles';
// Puoi passare uno o più ruoli
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);