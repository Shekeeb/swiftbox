import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectDB from "@/lib/db"
import Notification from "@/models/Notification"
import Link from "next/link"

const NotificationsPage = async () => {
    const session = await auth()
    if (!session) redirect("/login")

    await connectDB()

    await Notification.updateMany(
        { userId: session.user.id, read: false },
        { read: true }
    )

    const notifications = await Notification.find({
        userId: session.user.id,
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()

    const typeColors: Record<string, string> = {
        order_placed: "bg-blue-50 text-blue-600",
        driver_assigned: "bg-purple-50 text-purple-600",
        picked_up: "bg-amber-50 text-amber-600",
        in_transit: "bg-orange-50 text-orange-600",
        delivered: "bg-green-50 text-green-600",
        cancelled: "bg-red-50 text-red-600",
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <Link href="/dashboard" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition" >
                    ←
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">
                    Notifications
                </h1>
            </nav>

            <div className="w-full px-6 py-6">
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-gray-400 text-sm">
                                No notifications yet
                            </p>
                        </div>
                    ) : (
                        notifications.map((n: any) => (
                            <div key={n._id.toString()} className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 mt-0.5 ${typeColors[n.type] || "bg-gray-100 text-gray-600"}`}>
                                        {n.type.replace(/_/g, " ")}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(n.createdAt).toLocaleString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default NotificationsPage