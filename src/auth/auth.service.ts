import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user) {
      if (user.password) {
        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
          const { password,salt, ...result } = user;
          return result;
        } else {
        }
      } else {
      }
    } else {
    }
    return null;
  }

  async login(user: LoginDto) {
    const validated_user = await this.validateUser(
        user.email,
        user.password,
      );
      if (!validated_user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { username: validated_user.username, id: validated_user.id, role : validated_user.role};
    return {
      status: 'success',
      message: 'Logged in successfully',
      access_token: this.jwtService.sign(payload),
      data: validated_user.username,
    }
}
  async signup(user: SignupDto) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    const create_user = {
        ...user,
        password: hashedPassword,
        salt: salt,
        };
    return this.userService.create(create_user);
  }
}