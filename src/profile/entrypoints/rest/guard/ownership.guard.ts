import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Ensures the authenticated caller can only operate on their own resource.
 * Admins (ROLE_ADMIN) bypass the check and can operate on any user.
 *
 * Dev  (NODE_ENV !== 'production'): guard is bypassed so endpoints can be
 *   tested directly without Kong running locally.
 *
 * Prod (NODE_ENV === 'production'): requires KongAuthMiddleware to have run
 *   first so req['user'] is populated from the JWT propagated by Kong.
 *
 * Apply to any route that has a :userId path parameter representing the owner.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isProd = process.env['NODE_ENV'] === 'production';

    if (!isProd) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const caller = req['user'] as
      | { userId: string; roles: string[] }
      | undefined;

    if (!caller?.userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const roles: string[] = caller.roles ?? [];
    if (roles.includes('ROLE_ADMIN')) return true;

    const targetUserId = req.params['userId'];
    if (!targetUserId || caller.userId !== targetUserId) {
      throw new ForbiddenException('You can only modify your own profile.');
    }

    return true;
  }
}
