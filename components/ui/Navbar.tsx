"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Bell, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

const Navbar = () => {
    const { data: session } = useSession()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const { data } = await axios.get("/api/notifications?unread=true")
                setUnreadCount(data.count || 0)
            } catch {
                setUnreadCount(0)
            }
        }
        if (session) fetchUnread()
    }, [session])

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <Link href="/dashboard">
                <h1 className="text-lg font-semibold text-gray-900">
                    Swift<span className="text-blue-600">Box</span>
                </h1>
            </Link>

            <div className="flex items-center gap-5">
                <span className="text-sm text-gray-500">
                    Hello, {session?.user?.name}
                </span>

                <Link href="/notifications" className="relative">
                    <Bell size={20} className="text-gray-500 hover:text-gray-900 transition" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Link>

                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-red-500 transition" >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    )
}

export default Navbar