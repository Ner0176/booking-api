import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform(({ value }) => {
    return value === 'true' ? true : false;
  });
}
