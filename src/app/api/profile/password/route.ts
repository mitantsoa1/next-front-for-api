import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "@/lib/auth";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function POST(request: NextRequest) {
    try {
        const token = await getCookie("token");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const response = await axios.post(`${API_BASE_URL}/profile/password`, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("POST /api/profile/password error:", error.response?.data || error.message);
        return NextResponse.json(
            {
                error: error.response?.data?.message || "Failed to change password",
                errors: error.response?.data?.errors || {},
            },
            { status: error.response?.status || 500 }
        );
    }
}
