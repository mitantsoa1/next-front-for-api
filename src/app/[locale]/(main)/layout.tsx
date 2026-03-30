import { Header } from '@/components/header'
import { getSession } from '@/lib/auth';
import React from 'react'

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await getSession('session');
    return (
        <>
            <Header session={session} />
            {children}
        </>
    )
}

export default MainLayout