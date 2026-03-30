import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "@/lib/auth";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

function getAuthHeaders(token: string) {
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
}

// GET /api/users - List all users
export async function GET(request: NextRequest) {
    try {
        const token = await getCookie("token");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await axios.get(`${API_BASE_URL}/users`, {
            headers: getAuthHeaders(token),
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("GET /api/users error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to fetch users" },
            { status: error.response?.status || 500 }
        );
    }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
    try {
        const token = await getCookie("token");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const response = await axios.post(`${API_BASE_URL}/users`, body, {
            headers: getAuthHeaders(token),
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
        console.error("POST /api/users error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to create user" },
            { status: error.response?.status || 500 }
        );
    }
}
