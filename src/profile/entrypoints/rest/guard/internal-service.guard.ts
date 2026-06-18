import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Protects routes intended exclusively for inter-service communication.
 *
 * Dev  (NODE_ENV !== 'production'): guard is bypassed so services can be
 *   called directly without Kong running locally.
 *
 * Prod (NODE_ENV === 'production'): enforces the X-Internal-Key header.
 *   If INTERNAL_API_KEY is not set the service will refuse all internal
 *   requests rather than silently allowing them — fail loudly, not silently.
 *
 * Kong must be configured to:
 *   1. Block external access to /api/v1/internal/** at the gateway level.
 *   2. Inject  X-Internal-Key: <INTERNAL_API_KEY>  on inter-service calls.
 */
@Injectable()
export class InternalServiceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isProd = process.env['NODE_ENV'] === 'production';

    if (!isProd) return true;

    const expectedKey = process.env['INTERNAL_API_KEY'];
    if (!expectedKey) {
      // Misconfiguration: guard is active but no key was ever set.
      throw new ForbiddenException(
        'INTERNAL_API_KEY is not configured. Access denied.',
      );
    }

    const req = context.switchToHttp().getRequest<Request>();
    if (req.headers['x-internal-key'] !== expectedKey) {
      throw new ForbiddenException('Access restricted to internal services.');
    }

    return true;
  }
}
