import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession('session_user');

        if (!session || !session.user) {
            return NextResponse.json(
                { user: null, authenticated: false },
                { status: 200 }
            );
        }

        return NextResponse.json({
            user: session.user,
            authenticated: true,
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { user: null, authenticated: false },
            { status: 200 }
        );
    }
}
