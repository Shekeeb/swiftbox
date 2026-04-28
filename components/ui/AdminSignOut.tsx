"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

const AdminSignOut = () => {
    return (
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-red-500 transition" >
            <LogOut size={20} />
        </button>
    )
}

export default AdminSignOut