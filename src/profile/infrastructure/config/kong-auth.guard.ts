import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  roles: string[];
}

@Injectable()
export class KongAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as AuthenticatedUser | undefined;

    if (!user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
