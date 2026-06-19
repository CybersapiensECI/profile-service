import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
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
