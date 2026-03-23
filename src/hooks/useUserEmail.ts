'use client';

import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
    numberPhone?: string;
    address?: string;
    company?: string;
    [key: string]: any;
}

interface UseUserReturn {
    user: User | null;
    isLoading: boolean;
}

/**
 * Hook personnalisé pour récupérer l'utilisateur connecté
 * à partir du cookie session
 */
export function useUserEmail(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Appel à une API route pour récupérer la session
                const response = await fetch('/api/auth/session');

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();

                if (data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return {
        user,
        isLoading,
    };
}
