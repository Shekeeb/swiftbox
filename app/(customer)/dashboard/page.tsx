import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Navbar from "@/components/ui/Navbar"
import DashboardCharts from "./DashboardCharts"

const CustomerDashboard = async () => {
    const session = await auth()

    if (!session || !session.user) redirect("/login")
    const user = session.user as {
        id: string
        name: string
        email: string
        role: string
    }
    if (user.role !== "customer") redirect("/driver/dashboard")

    await connectDB()

    const totalOrders = await Order.countDocuments({
        customerId: user.id,
    })

    const deliveredOrders = await Order.countDocuments({
        customerId: user.id,
        status: "delivered",
    })

    const pendingOrders = await Order.countDocuments({
        customerId: user.id,
        status: { $in: ["pending", "assigned", "picked_up", "in_transit"] },
    })

    const cancelledOrders = await Order.countDocuments({
        customerId: user.id,
        status: "cancelled",
    })

    const activeOrder = await Order.findOne({
        customerId: user.id,
        status: { $in: ["assigned", "picked_up", "in_transit"] },
    }).lean()

    const recentOrders = await Order.find({
        customerId: user.id,
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()

    const statusData = [
        { name: "Pending", value: pendingOrders, color: "#F59E0B" },
        { name: "Delivered", value: deliveredOrders, color: "#10B981" },
        { name: "Cancelled", value: cancelledOrders, color: "#EF4444" },
    ]

    const smallOrders = await Order.countDocuments({
        customerId: user.id,
        "packageDetails.size": "small",
    })
    const mediumOrders = await Order.countDocuments({
        customerId: user.id,
        "packageDetails.size": "medium",
    })
    const largeOrders = await Order.countDocuments({
        customerId: user.id,
        "packageDetails.size": "large",
    })

    const sizeData = [
        { name: "Small", value: smallOrders },
        { name: "Medium", value: mediumOrders },
        { name: "Large", value: largeOrders },
    ]

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
            date: date.toLocaleDateString("en-IN", { weekday: "short" }),
            fullDate: date,
        }
    })

    const weeklyData = await Promise.all(
        last7Days.map(async ({ date, fullDate }) => {
            const start = new Date(fullDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(fullDate)
            end.setHours(23, 59, 59, 999)

            const count = await Order.countDocuments({
                customerId: user.id,
                createdAt: { $gte: start, $lte: end },
            })

            return { date, orders: count }
        })
    )

    const weightData = [
        { size: "Small", avgWeight: 1 },
        { size: "Medium", avgWeight: 3 },
        { size: "Large", avgWeight: 8 },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="w-full px-6 py-8 space-y-6">

                {activeOrder && (
                    <Link href={`/track/${(activeOrder as any)._id}`}>
                        <div className="bg-blue-600 text-white rounded-xl px-6 py-4 flex items-center justify-between hover:bg-blue-700 transition">
                            <div>
                                <p className="text-xs font-medium opacity-75 mb-1">
                                    Active delivery
                                </p>
                                <p className="font-medium text-sm">
                                    {(activeOrder as any).pickup?.address} →{" "}
                                    {(activeOrder as any).dropoff?.address}
                                </p>
                                <p className="text-xs opacity-75 mt-1 capitalize">
                                    Status:{" "}
                                    {(activeOrder as any).status?.replace("_", " ")}
                                </p>
                            </div>
                            <span className="text-xl">→</span>
                        </div>
                    </Link>
                )}

                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Total orders</p>
                        <p className="text-3xl font-semibold text-gray-900">
                            {totalOrders}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Delivered</p>
                        <p className="text-3xl font-semibold text-green-500">
                            {deliveredOrders}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">In progress</p>
                        <p className="text-3xl font-semibold text-amber-500">
                            {pendingOrders}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Cancelled</p>
                        <p className="text-3xl font-semibold text-red-500">
                            {cancelledOrders}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Link href="/book" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 transition" >
                        <p className="font-semibold mb-1">Book a delivery</p>
                        <p className="text-sm opacity-75">Send a package anywhere</p>
                    </Link>
                    <Link href="/subscriptions" className="bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-5 transition" >
                        <p className="font-semibold text-gray-900 mb-1">Subscriptions</p>
                        <p className="text-sm text-gray-400">
                            Manage recurring deliveries
                        </p>
                    </Link>
                </div>

                <DashboardCharts statusData={statusData} sizeData={sizeData} weeklyData={weeklyData} weightData={weightData} />

                <div className="bg-white rounded-xl border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-medium text-gray-900">Recent orders</h2>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-gray-400 text-sm mb-4">No orders yet</p>
                            <Link href="/book" className="text-sm text-blue-600 hover:underline"   >
                                Book your first delivery
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentOrders.map((order: any) => (
                                <Link key={order._id.toString()} href={`/track/${order._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"  >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {order.city}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {order.pickup?.address?.split(",")[0]} →{" "}
                                            {order.dropoff?.address?.split(",")[0]}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(order.createdAt).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            )}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        pending: "bg-gray-100 text-gray-600",
        assigned: "bg-blue-50 text-blue-600",
        picked_up: "bg-purple-50 text-purple-600",
        in_transit: "bg-amber-50 text-amber-600",
        delivered: "bg-green-50 text-green-600",
        cancelled: "bg-red-50 text-red-600",
    }

    return (
        <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`} >
            {status.replace("_", " ")}
        </span>
    )
}

export default CustomerDashboard