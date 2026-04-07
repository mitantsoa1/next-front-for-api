import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookie, getSession } from "@/lib/auth";
import axios from "axios";
import { encrypt } from "@/lib/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function GET() {
    try {
        const token = await getCookie("token");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await axios.get(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("GET /api/profile error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to fetch profile" },
            { status: error.response?.status || 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = await getCookie("token");
        const session = await getSession("session");

        if (!token || !session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Call backend to update
        const response = await axios.post(`${API_BASE_URL}/profile`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200 || response.status === 201) {
            const updatedUser = response.data.data;

            // Update Next.js session cookie
            const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
            const newSession = await encrypt({
                ...session,
                user: { ...session.user, ...updatedUser },
                expires
            });

            const cookieStore = await cookies();
            cookieStore.set("session", newSession, { expires, httpOnly: true });

            return NextResponse.json(response.data);
        }

        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error("POST /api/profile error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to update profile" },
            { status: error.response?.status || 500 }
        );
    }
}
