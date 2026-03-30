import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "@/lib/auth";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

// GET /api/dashboard/stats
export async function GET() {
    try {
        const token = await getCookie("token");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("GET /api/dashboard/stats error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to fetch dashboard stats" },
            { status: error.response?.status || 500 }
        );
    }
}
