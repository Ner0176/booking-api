import { applyDecorators, UseGuards } from '@nestjs/common';

export function Admin() {
  return applyDecorators(UseGuards(Admin));
}
