import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookie, getSession } from "@/lib/auth";
import { encrypt } from "@/lib/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function POST(request: NextRequest) {
    try {
        const token = await getCookie("token");
        const session = await getSession("session");
        
        if (!token || !session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();

        const backendResponse = await fetch(`${API_BASE_URL}/profile/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        const data = await backendResponse.json();

        if (backendResponse.ok) {
            const expires = new Date(Date.now() + 1000 * 60 * 60);
            const newSession = await encrypt({
                ...session,
                user: { ...session.user, avatar: data.avatar }
            });

            const cookieStore = await cookies();
            cookieStore.set("session", newSession, { expires, httpOnly: true });

            return NextResponse.json(data);
        }

        return NextResponse.json(data, { status: backendResponse.status });
    } catch (error: any) {
        console.error("POST /api/profile/avatar error:", error);
        return NextResponse.json(
            { error: "Failed to upload avatar" },
            { status: 500 }
        );
    }
}
