import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform(({ value }) => value === 'true');
}
