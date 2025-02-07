import { AdminGuard } from 'src/guards';
import { applyDecorators, UseGuards } from '@nestjs/common';

export function Admin() {
  return applyDecorators(UseGuards(AdminGuard));
}
