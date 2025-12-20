"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function Header({ session }: { session: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const user = session?.user;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-semibold text-gray-700 dark:text-white">
            Emiragate
          </span>
        </Link>
        <div>
          {
            (user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile">
                  <span className="text-gray-700 dark:text-white hover:underline">
                    {user.name || user.email}
                  </span>
                </Link>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            ))}
        </div>
      </nav>
    </header>
  )
}
