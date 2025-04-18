import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: 'Username is required' })
    @IsString()
  email: string;
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  password: string;
}