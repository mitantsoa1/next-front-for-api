"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useEffect, useState, useRef, createContext, useContext, useCallback } from "react"

interface AuthTransitionContextType {
    startTransition: (url: string) => void
}

const AuthTransitionContext = createContext<AuthTransitionContextType | undefined>(undefined)

export const useAuthTransition = () => {
    const context = useContext(AuthTransitionContext)
    if (!context) throw new Error("useAuthTransition must be used within an AuthLayout")
    return context
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    const router = useRouter()

    const [phase, setPhase] = useState<'idle' | 'covering' | 'uncovering'>('idle')
    const [targetUrl, setTargetUrl] = useState<string | null>(null)
    const lastPath = useRef(pathname)
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const isNavigating = useRef(false)
    const mountedRef = useRef(true)

    // Track mount status
    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    // Cleanup function
    const cleanupTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = undefined
        }
    }, [])

    const resetToIdle = useCallback(() => {
        if (!mountedRef.current) return

        setPhase('idle')
        setTargetUrl(null)
        isNavigating.current = false
        cleanupTimeout()
    }, [cleanupTimeout])

    useEffect(() => {
        console.log('Phase changed to:', phase)
    }, [phase])

    useEffect(() => {
        console.log('Target URL changed to:', targetUrl)
    }, [targetUrl])

    useEffect(() => {
        console.log('Pathname changed to:', pathname)
    }, [pathname])

    const startTransition = (url: string) => {
        console.log('startTransition called with:', url, 'current phase:', phase)
        if (phase !== 'idle' || isNavigating.current || !mountedRef.current) {
            console.log('Transition blocked - phase:', phase, 'isNavigating:', isNavigating.current)
            return
        }

        cleanupTimeout()
        setTargetUrl(url)
        setPhase('covering')
        isNavigating.current = true
        router.prefetch(url as any)

        timeoutRef.current = setTimeout(() => {
            console.log('TIMEOUT TRIGGERED - isNavigating:', isNavigating.current)
            if (isNavigating.current && mountedRef.current) {
                console.warn('Navigation timeout - resetting')
                resetToIdle()
            }
        }, 10000)
    }

    const handleCoverComplete = () => {
        if (phase === 'covering' && targetUrl && isNavigating.current && mountedRef.current) {
            router.push(targetUrl as any)
        }
    }

    useEffect(() => {
        // Détection de la fin de navigation
        if (lastPath.current !== pathname && mountedRef.current) {
            setPhase('uncovering')
            setTargetUrl(null)
            lastPath.current = pathname
            isNavigating.current = false
            cleanupTimeout()
        }
    }, [pathname, cleanupTimeout])

    const handleUncoverComplete = () => {
        if (phase === 'uncovering' && mountedRef.current) {
            resetToIdle()
        }
    }

    // Protection contre les timeouts fantômes
    useEffect(() => {
        return () => {
            cleanupTimeout()
            mountedRef.current = false
        }
    }, [cleanupTimeout])

    const isSignup = pathname.includes('/signup')

    return (
        <AuthTransitionContext.Provider value={{ startTransition }}>
            <div className={`flex min-h-svh bg-white dark:bg-slate-950 overflow-hidden relative w-full ${isSignup ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

                <motion.div
                    initial={false}
                    animate={{
                        width: phase === 'covering' ? "100%" : "50%",
                        zIndex: 50,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: [0.65, 0, 0.35, 1]
                    }}
                    onAnimationComplete={handleCoverComplete}
                    className={`absolute ${isSignup ? 'right-0' : 'left-0'} top-0 h-full hidden lg:block overflow-hidden bg-slate-100 dark:bg-slate-900`}
                >
                    <div className="relative w-full h-full">
                        <Image
                            src="/images/auth/BVT_POST31.jpg"
                            alt="Auth Background"
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                        <motion.div
                            animate={{ opacity: phase === 'covering' ? 0.3 : 0 }}
                            className="absolute inset-0 bg-slate-950 pointer-events-none"
                        />
                    </div>
                </motion.div>

                <div className="hidden lg:flex flex-1" />

                <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 md:p-12 relative z-20">
                    <div className="w-full max-w-md">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                                transition={{ duration: 0.4 }}
                                onAnimationComplete={handleUncoverComplete}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {phase === 'idle' && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className={`absolute top-1/4 ${isSignup ? 'right-1/4' : 'left-1/4'} w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]`} />
                        <div className={`absolute bottom-1/4 ${isSignup ? 'left-1/4' : 'right-1/4'} w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]`} />
                    </div>
                )}
            </div>
        </AuthTransitionContext.Provider>
    )
}

export default AuthLayout