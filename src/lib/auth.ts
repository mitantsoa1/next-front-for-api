"use server";

import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "./jwt";
import { cookies } from "next/headers";
import axios from "axios";
import { authApi } from "./axios";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function login(prevState: any, formData: FormData) {
  const cookieStore = await cookies()
  await getXsrfToken()

  try {
    const response = await authApi.post('/login', formData, {
      withCredentials: true,
    });

    if (response.status === 200 || response.status === 201) {
      // Create the session
      const user = response.data.data.user;
      const expires = new Date(Date.now() + 1000 * 60 * 60);
      const session = await encrypt({ user, expires });

      // Save the session in a cookie
      cookieStore.set("session", session, { expires, httpOnly: true });
    } else {
      return {
        status: response.status,
        message: response.data.message || "Login failed"
      };
    }
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "An unexpected error occurred"
    };
  }

  redirect('/profile');
}

export async function register(prevState: any, formData: FormData) {
  const cookieStore = await cookies()
  await getXsrfToken()

  try {
    const response = await authApi.post('/register', formData);

    if ((response.status === 200 || response.status === 201) && response.data.data) {
      const user = response.data.data.user;
      const expires = new Date(Date.now() + 1000 * 60 * 60);
      const session = await encrypt({ user, expires });
      cookieStore.set("session", session, { expires, httpOnly: true });
    } else {
      return {
        'status': response.status,
        'message': response.data.message
      }
    }
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "An unexpected error occurred"
    };
  }

  redirect('/profile');
}

export async function logout() {
  const cookieStore = await cookies()
  // Destroy the session
  cookieStore.set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  if (!parsed) return;

  parsed.expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

const getXsrfToken = async () => {
  await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}