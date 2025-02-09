import { IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsBoolean()
  isAdmin: boolean;
}
