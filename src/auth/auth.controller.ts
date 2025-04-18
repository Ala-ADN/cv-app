import { Controller, Post, Body, HttpException, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        try {
            const result = await this.authService.signup(signupDto);
            return { message: 'User registered successfully', data: result };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            const token = await this.authService.login(loginDto);
            return { message: 'Login successful', token };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }
}