// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthsService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Log in to the SSO server and retrieve access and refresh tokens
   */
  async login(email: string, password: string): Promise<void> {
    const url = `${this.configService.get<string>('SSO_SERVER_URL')}/login`;
    console.log(url);
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(url, { email, password }),
      );

      console.log(response.data);

      this.accessToken = response.data.accessToken;
      this.refreshToken = response.data.refreshToken;
    } catch (error) {
      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * Send a request to a protected resource with the access token
   */
  async getProtectedResource(endpoint: string): Promise<any> {
    const url = `${this.configService.get<string>('SSO_SERVER_URL')}${endpoint}`;

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      // If access token is expired, attempt to refresh it
      if (error.response?.status === 401) {
        await this.refreshTokens();
        return this.getProtectedResource(endpoint); // Retry with refreshed token
      }
      throw error;
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshTokens(): Promise<void> {
    if (!this.refreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    const url = `${this.configService.get<string>('SSO_SERVER_URL')}/refresh`;

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          url,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.refreshToken}`,
            },
          },
        ),
      );

      this.accessToken = response.data.accessToken;
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  /**
   * Log out the user and clear stored tokens
   */
  async logout(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
  }
}
