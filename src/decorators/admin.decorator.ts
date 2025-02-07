import { applyDecorators, UseGuards } from '@nestjs/common';

export function AdminGuard() {
  return applyDecorators(UseGuards(AdminGuard));
}
