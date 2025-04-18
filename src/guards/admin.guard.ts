import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) throw new UnauthorizedException('No token');

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'yourSecretKeyHere',
      );

      if (
        typeof decoded === 'object' &&
        decoded !== null &&
        'role' in decoded &&
        (decoded as any).role === 'admin'
      ) {
        request.user = decoded;
        return true;
      }

      throw new ForbiddenException('Admin privileges required.');
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Invalid token');
    }
  }
}
