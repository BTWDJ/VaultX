import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter cache
const ipCache = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 10; // Max 10 requests
const WINDOW_MS = 60 * 1000; // 1 minute window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipCache.get(ip);

  if (!entry) {
    ipCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (now > entry.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > LIMIT) {
    return true;
  }

  return false;
}

const handler = async (req: NextRequest) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const url = new URL(req.url);

  // Rate limit login, register, and forgot password endpoints
  const isSensitive = 
    url.pathname.includes('/sign-in/email') ||
    url.pathname.includes('/sign-up/email') ||
    url.pathname.includes('/forget-password') ||
    url.pathname.includes('/reset-password');

  if (isSensitive && isRateLimited(ip)) {
    return new NextResponse(JSON.stringify({ message: 'Too Many Requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return auth.handler(req);
};

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
  handler as OPTIONS,
};
