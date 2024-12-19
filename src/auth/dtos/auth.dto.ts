import { Expose } from 'class-transformer';

export class AuthDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string | null;
}
