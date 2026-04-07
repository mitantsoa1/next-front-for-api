"use server";

import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "./jwt";
import { cookies } from "next/headers";
import axios from "axios";
import { authApi } from "./axios";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function login(formData: FormData) {
  const cookieStore = await cookies();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Convert to plain object for JSON request
  const payload = { email, password };

  // Commenting out getXsrfToken as it might be unnecessary for JWT-based auth
  // and might be causing connection issues.
  // await getXsrfToken();

  try {
    await getXsrfToken();

    const response = await authApi.post('/login', payload);

    const data = response.data.data || response.data;

    if (response.status === 200 || response.status === 201) {
      const user = data.user || data;
      const token = data.access_token || data.token || data.data?.token;

      if (!token) {
        return {
          success: false,
          status: 400,
          message: "No authentication token received"
        };
      }

      const expires = new Date(Date.now() + 1000 * 60 * 60);
      const session = await encrypt({ user, expires });

      cookieStore.set("session", session, { expires, httpOnly: true });
      cookieStore.set("token", token, { expires, httpOnly: true });

      return {
        success: true,
        status: response.status,
        data: { user }
      };

    } else {
      return {
        success: false,
        status: response.status,
        message: response.data.message || "Login failed",
        data: response.data
      };
    }

  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error("Login Error:", error.message);

    if (!error.response) {
      return {
        success: false,
        status: 500,
        message: "Server unreachable. Please check your connection or try again later."
      };
    }

    const status = error.response?.status || 500;
    let message = "An unexpected error occurred";

    if (status === 401) {
      message = "Invalid credentials";
    } else if (status === 422) {
      message = "Validation failed";
    } else if (status === 429) {
      message = "Too many attempts. Please try again later";
    } else if (error.response?.data?.errors) {
      message = Object.values(error.response.data.errors).flat().join(', ');
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return {
      success: false,
      status,
      message,
      data: error.response?.data
    };
  }
}

export async function signup(formData: FormData) {

  try {
    await getXsrfToken();
    const response = await authApi.post('/register', formData, {
      withCredentials: true, // Ajouté pour la cohérence
    });

    const data = response.data.data || response.data;

    if (response.status === 200 || response.status === 201) {
      return {
        success: true,
        status: response.status,
        message: data.message || "Un e-mail de vérification a été envoyé."
      };

    } else {
      return {
        success: false,
        status: response.status,
        message: response.data.message || "Registration failed",
        data: response.data
      };
    }

  } catch (error: any) {
    // Gestion des redirections Next.js
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    // Erreur réseau ou autre
    if (!error.response) {
      return {
        success: false,
        status: 500,
        message: "Network error or server unreachable"
      };
    }

    // Erreur de l'API
    const status = error.response?.status || 500;
    let message = "An unexpected error occurred";

    if (error.response?.data?.errors) {
      message = Object.values(error.response.data.errors).flat().join(', ');
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (status === 400) {
      message = "Bad request. Please check your information";
    } else if (status === 409) {
      message = "User already exists with this email";
    } else if (status === 422) {
      message = "Validation failed";
    }

    return {
      success: false,
      status,
      message,
      data: error.response?.data
    };
  }
}

export async function verifyRegistration(token: string) {
  const cookieStore = await cookies();

  try {
    await getXsrfToken();
    const response = await authApi.post('/register/verify', { token });
    const data = response.data;

    if (response.status === 200 || response.status === 201) {
      const user = data.user;
      const tokenAuth = data.token;

      if (!tokenAuth) {
        return {
          success: false,
          message: "No authentication token received"
        };
      }

      const expires = new Date(Date.now() + 1000 * 60 * 60);
      const session = await encrypt({ user, expires });

      cookieStore.set("session", session, { expires, httpOnly: true });
      cookieStore.set("token", tokenAuth, { expires, httpOnly: true });

      return {
        success: true,
        data: { user }
      };
    } else {
      return {
        success: false,
        message: data.message || "Verification failed"
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred during verification"
    };
  }
}

export async function forgotPassword(email: string, locale: string = 'en') {
  try {
    await getXsrfToken();
    const response = await authApi.post('/forgot-password', { email, locale });
    return {
      success: true,
      message: response.data.message || "Reset link sent to your email"
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data?.email?.[0] || "Failed to send reset link"
    };
  }
}

export async function resendVerification(email: string) {
  try {
    await getXsrfToken();
    const response = await authApi.post('/verification/resend', { email });
    return {
      success: true,
      message: response.data.message || "Verification link sent"
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to resend verification link"
    };
  }
}

export async function resetPassword(data: any) {
  try {
    await getXsrfToken();
    const response = await authApi.post('/reset-password', data);
    return {
      success: true,
      message: response.data.message || "Password reset successfully"
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reset password"
    };
  }
}

export async function logout() {
  const cookieStore = await cookies()
  // Destroy the session
  cookieStore.set("session", "", { expires: new Date(0) });
  cookieStore.set("token", "", { expires: new Date(0) });
  cookieStore.delete("token");
  cookieStore.delete("session");
  cookieStore.delete("XSRF-TOKEN");
  redirect('/')
}

export async function getSession(name: string = "session") {
  try {
    const cookieStore = await cookies();
    if (!cookieStore) return null;
    const cookie = cookieStore.get(name);
    if (!cookie) return null;
    return await decrypt(cookie.value);
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

export async function getCookie(name: string) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore) return null;
    const cookie = cookieStore.get(name);
    if (!cookie) return null;
    return cookie.value;
  } catch (error) {
    console.error("getCookie error:", error);
    return null;
  }
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