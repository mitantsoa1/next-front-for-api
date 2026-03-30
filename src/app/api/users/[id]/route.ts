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

// GET /api/users/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getCookie("token");
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
            headers: getAuthHeaders(token),
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.response?.data?.message || "User not found" },
            { status: error.response?.status || 404 }
        );
    }
}

// PUT /api/users/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getCookie("token");
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        const response = await axios.put(`${API_BASE_URL}/users/${id}`, body, {
            headers: getAuthHeaders(token),
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to update user" },
            { status: error.response?.status || 500 }
        );
    }
}

// PATCH /api/users/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getCookie("token");
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        const response = await axios.patch(`${API_BASE_URL}/users/${id}`, body, {
            headers: getAuthHeaders(token),
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to update user" },
            { status: error.response?.status || 500 }
        );
    }
}

// DELETE /api/users/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getCookie("token");
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        await axios.delete(`${API_BASE_URL}/users/${id}`, {
            headers: getAuthHeaders(token),
        });

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.response?.data?.message || "Failed to delete user" },
            { status: error.response?.status || 500 }
        );
    }
}
