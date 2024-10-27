// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AuthsService],
  controllers: [AuthsController],
})
export class AuthsModule {}
