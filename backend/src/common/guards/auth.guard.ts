import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authentication session token found');
    }

    // Look up the session in the database, including the user details
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    // Check if the session is expired
    if (new Date() > session.expiresAt) {
      // Clean up the expired session from the database in the background
      this.prisma.session.delete({ where: { token } }).catch(() => {});
      throw new UnauthorizedException('Session has expired');
    }

    // Attach user information to the request
    request.user = session.user;
    request.sessionToken = token;
    
    return true;
  }

  private extractToken(request: any): string | null {
    // 1. Check Authorization Bearer Header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    // 2. Check Cookie (better-auth.session-token)
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Better Auth cookies might be named "better-auth.session_token" or "__secure-better-auth.session-token"
      return (
        cookies['better-auth.session_token'] ||
        cookies['better-auth.session-token'] ||
        cookies['__secure-better-auth.session-token'] ||
        cookies['__secure-better-auth.session_token'] ||
        null
      );
    }

    return null;
  }
}
