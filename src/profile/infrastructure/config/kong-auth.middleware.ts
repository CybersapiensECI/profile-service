import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';

// Equivalente a OncePerRequestFilter de Spring — se ejecuta una vez por request
@Injectable()
export class KongAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(KongAuthMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');

      if (parts.length !== 3) return next();

      if (!this.signatureValid(parts[0], parts[1], parts[2])) {
        this.logger.warn('JWT con firma invalida');
        return next();
      }

      const decoded = Buffer.from(parts[1], 'base64url').toString('utf8');
      const claims = JSON.parse(decoded) as Record<string, unknown>;

      const userId = this.readTextClaim(claims, 'sub');
      if (!userId) return next();

      const roles = this.readRoles(claims);

      req['user'] = { userId, roles };
    } catch (e) {
      this.logger.warn(
        `JWT inválido: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    next();
  }

  private signatureValid(
    header: string,
    payload: string,
    signature: string,
  ): boolean {
    const secret = process.env['APP_JWT_SECRET'];
    if (!secret) {
      // Fail loud: never trust an unverifiable token.
      this.logger.error('APP_JWT_SECRET no esta configurado. Rechazando token.');
      return false;
    }

    const expected = createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(signature);
    if (expectedBuf.length !== actualBuf.length) return false;

    return timingSafeEqual(expectedBuf, actualBuf);
  }

  private readTextClaim(
    claims: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = claims[key];
    if (typeof value !== 'string' || value.trim().length === 0) return null;
    return value;
  }

  private readRoles(claims: Record<string, unknown>): string[] {
    const roles: string[] = [];

    if (typeof claims['role'] === 'string' && claims['role'].trim()) {
      roles.push(this.normalizeRole(claims['role']));
    }

    if (Array.isArray(claims['roles'])) {
      (claims['roles'] as unknown[]).forEach((r) => {
        if (typeof r === 'string' && r.trim()) {
          roles.push(this.normalizeRole(r));
        }
      });
    }

    if (roles.length === 0) roles.push('ROLE_USER');
    return roles;
  }

  private normalizeRole(role: string): string {
    const upper = role.trim().toUpperCase();
    return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`;
  }
}
