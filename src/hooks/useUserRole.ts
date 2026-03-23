"use client"
import { useState, useEffect } from 'react';

export type UserRole = 'user' | 'admin' | 'superadmin';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
}

interface UseUserRoleReturn {
    role: UserRole;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isUser: boolean;
    user: User | null;
    isLoading: boolean;
}

/**
 * Hook personnalisé pour récupérer et vérifier le rôle de l'utilisateur
 * à partir du cookie session_user
 */
export function useUserRole(): UseUserRoleReturn {
    const [role, setRole] = useState<UserRole>('user');
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                // Appel à une API route pour récupérer la session
                const response = await fetch('/api/auth/session');

                if (!response.ok) {
                    setRole('user');
                    setUser(null);
                    return;
                }

                const data = await response.json();

                if (data.user) {
                    setUser(data.user);

                    // Normaliser le rôle
                    const userRole = data.user.role?.toLowerCase() || 'user';

                    if (userRole === 'role_superadmin' || userRole === 'superadmin') {
                        setRole('superadmin');
                    } else if (userRole === 'role_admin' || userRole === 'admin') {
                        setRole('admin');
                    } else {
                        setRole('user');
                    }
                } else {
                    setRole('user');
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                setRole('user');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    return {
        role,
        isAdmin: role === 'admin' || role === 'superadmin',
        isSuperAdmin: role === 'superadmin',
        isUser: role === 'user',
        user,
        isLoading,
    };
}
