import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/jwt';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Authorization code is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/auth/google/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: data.error || 'Authentication failed',
                    message: data.message || 'Failed to authenticate with Google'
                },
                { status: response.status }
            );
        }

        // Extract user and token from response
        const user = data.user;
        const token = data.token;

        if (!token || !user) {
            return NextResponse.json(
                { error: 'Invalid response from authentication server' },
                { status: 500 }
            );
        }

        // Create session
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        const session = await encrypt({ user, expires });

        // Set cookies
        const cookieStore = await cookies();
        cookieStore.set("session_user", session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        cookieStore.set("token", token, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user,
            message: 'Successfully authenticated with Google'
        });

    } catch (error) {
        console.error('Error in Google callback:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
