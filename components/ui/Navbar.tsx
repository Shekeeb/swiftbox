"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

const Navbar = () => {
    const { data: session } = useSession()

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <Link href="/dashboard">
                <h1 className="text-lg font-semibold text-gray-900">
                    Swift<span className="text-blue-600">Box</span>
                </h1>
            </Link>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                    Hello, {session?.user?.name}
                </span>

                <Link href="/notifications" className="text-sm text-gray-500 hover:text-gray-900 transition">
                    Notifications
                </Link>

                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-red-500 hover:text-red-600 transition" >
                    Sign out
                </button>
            </div>
        </nav>
    )
}

export default Navbar