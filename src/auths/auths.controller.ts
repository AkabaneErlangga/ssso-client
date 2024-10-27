// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthsService } from './auths.service';

@Controller('auth')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    await this.authsService.login(body.email, body.password);
    return { message: 'Logged in successfully' };
  }

  @Get('protected')
  async getProtectedResource(@Req() req: { endpoint: string }) {
    if (!this.authsService['accessToken']) {
      throw new UnauthorizedException('User is not logged in');
    }
    return this.authsService.getProtectedResource(req.endpoint);
  }

  @Post('logout')
  async logout() {
    await this.authsService.logout();
    return { message: 'Logged out successfully' };
  }
}
