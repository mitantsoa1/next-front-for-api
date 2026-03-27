// lib/axios.ts
import axios from "axios";
import { redirect } from "next/navigation";
import { getCookie } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000';

// ============================================
// UTILITAIRE POUR LIRE LES COOKIES CLIENT
// ============================================
const getClientCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift() || null;
        // Décoder le cookie (Laravel encode les cookies)
        return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
}

// ============================================
// FONCTION POUR INITIALISER LE CSRF TOKEN
// ============================================
export const initCsrfToken = async (): Promise<void> => {
    try {
        await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du CSRF token:', error);
    }
};

// ============================================
// INSTANCE POUR LES APPELS NON AUTHENTIFIÉS
// ============================================
const authApi = axios.create({
    baseURL: `${API_BASE_URL}`,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token XSRF
authApi.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        // Récupérer le token XSRF depuis les cookies
        const xsrfToken = getClientCookie("XSRF-TOKEN");

        if (xsrfToken) {
            config.headers['X-XSRF-TOKEN'] = xsrfToken;
        } else {
            // Si pas de token, en obtenir un nouveau
            await initCsrfToken();
            const newXsrfToken = getClientCookie("XSRF-TOKEN");
            if (newXsrfToken) {
                config.headers['X-XSRF-TOKEN'] = newXsrfToken;
            }
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ============================================
// INSTANCE POUR LES APPELS AUTHENTIFIÉS
// ============================================
const authApiClient = axios.create({
    baseURL: `${API_BASE_URL}`,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token XSRF
authApiClient.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        // Récupérer le token XSRF depuis les cookies
        const xsrfToken = getClientCookie("XSRF-TOKEN");
        const token = await getCookie("token");

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (xsrfToken) {
            config.headers['X-XSRF-TOKEN'] = xsrfToken;
        } else {
            // Si pas de token, en obtenir un nouveau
            await initCsrfToken();
            const newXsrfToken = getClientCookie("XSRF-TOKEN");
            if (newXsrfToken) {
                config.headers['X-XSRF-TOKEN'] = newXsrfToken;
            }
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export { authApi, authApiClient };