import { NextResponse } from 'next/server';

export function middleware(request) {
  // Rotas públicas que não precisam de autenticação
  const publicPaths = ['/login', '/register', '/api/crypto/callback'];
  
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}; 