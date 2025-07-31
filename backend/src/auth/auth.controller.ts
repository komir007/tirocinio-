// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtGuard } from './jwt.guard'; // Per la strategia 'local' o 'jwt'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @Post('login')
  async login(@Body() loginUserDto: any) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      console.log("error log");//throw new UnauthorizedException('Credenziali non valide');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // L'oggetto user viene attaccato dal JwtStrategy
  }
}