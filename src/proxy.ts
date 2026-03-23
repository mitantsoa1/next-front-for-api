import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/jwt';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

const nextIntlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'en',

    // Disable automatic locale detection
    localeDetection: false
});

const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current route is an auth route (taking locales into account)
    const isAuthRoute = authRoutes.some(route =>
        pathname === route || locales.some(locale => pathname === `/${locale}${route}`)
    );

    if (isAuthRoute) {
        const session = request.cookies.get("session_user")?.value;
        if (session) {
            try {
                const parsed = await decrypt(session);
                if (parsed && parsed.user) {
                    const user = parsed.user;
                    const userRole = user.role?.toLowerCase() || 'user';

                    // Determine locale from path or default
                    const locale = locales.find(l => pathname.startsWith(`/${l}`)) || defaultLocale;

                    const isAdmin = ['admin', 'role_admin', 'superadmin', 'role_superadmin', 'ROLE_ADMIN', 'ROLE_SUPERADMIN'].includes(userRole);

                    if (isAdmin) {
                        return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
                    } else {
                        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
                    }
                }
            } catch (error) {
                // If decrypt fails, just continue to auth page
                console.error('Middleware session decryption error:', error);
            }
        }
    }

    return nextIntlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
