import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';

export class UserCreateInput {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsNotEmpty()
  password!: string;
}
