import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[] | number[]) => SetMetadata('roles', roles);
