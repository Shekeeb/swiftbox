import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import User from "@/models/User"
import Driver from "@/models/Driver"
import Link from "next/link"
import AdminSignOut from "@/components/ui/AdminSignOut"
import AdminCharts from "./AdminCharts"

const AdminDashboard = async () => {
    const session = await auth()

    if (!session || !session.user) redirect("/login")
    const user = session.user as { id: string; name: string; email: string; role: string }
    if (user.role !== "admin") redirect("/dashboard")

    await connectDB()

    const totalOrders = await Order.countDocuments()
    const totalUsers = await User.countDocuments({ role: "customer" })
    const totalDrivers = await User.countDocuments({ role: "driver" })
    const totalRevenue = await Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
    ])

    const revenue = totalRevenue[0]?.total || 0

    const pendingOrders = await Order.countDocuments({ status: "pending" })
    const deliveredOrders = await Order.countDocuments({ status: "delivered" })
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" })
    const inProgressOrders = await Order.countDocuments({
        status: { $in: ["assigned", "picked_up", "in_transit"] },
    })

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).lean()

    const drivers = await Driver.find().lean()

    const onlineDrivers = drivers.filter((d: any) => d.isOnline).length

    const statusData = [
        { name: "Pending", value: pendingOrders, color: "#F59E0B" },
        { name: "In Progress", value: inProgressOrders, color: "#3B82F6" },
        { name: "Delivered", value: deliveredOrders, color: "#10B981" },
        { name: "Cancelled", value: cancelledOrders, color: "#EF4444" },
    ]

    const recentOrdersData = JSON.parse(JSON.stringify(recentOrders))
    const driversData = JSON.parse(JSON.stringify(drivers))

    return (
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900">
                    Swift<span className="text-blue-600">Box</span>
                    <span className="text-sm font-normal text-gray-400 ml-2">
                        Admin
                    </span>
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{user?.name}</span>
                    <AdminSignOut />
                </div>
            </nav>

            <div className="w-full px-6 py-8 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Total orders</p>
                        <p className="text-3xl font-semibold text-gray-900">
                            {totalOrders}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Total customers</p>
                        <p className="text-3xl font-semibold text-blue-600">
                            {totalUsers}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">
                            Drivers ({onlineDrivers} online)
                        </p>
                        <p className="text-3xl font-semibold text-green-500">
                            {totalDrivers}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 mb-1">Total revenue</p>
                        <p className="text-3xl font-semibold text-amber-500">
                            ₹{revenue}
                        </p>
                    </div>
                </div>

                <AdminCharts statusData={statusData} />

                <div className="bg-white rounded-xl border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">Drivers</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {driversData.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-400 text-sm">No drivers yet</p>
                            </div>
                        ) : (
                            driversData.map((driver: any) => (
                                <div key={driver._id} className="flex items-center justify-between px-6 py-4" >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {driver.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {driver.city} · Rating {driver.rating?.toFixed(1)} ·{" "}
                                            {driver.totalDeliveries} deliveries
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${driver.isOnline ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}  >
                                        {driver.isOnline ? "Online" : "Offline"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">Recent orders</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentOrdersData.map((order: any) => (
                            <Link key={order._id} href={`/track/${order._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {order.city} delivery
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {order.pickup?.address?.split(",")[0]} →{" "}
                                        {order.dropoff?.address?.split(",")[0]}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <StatusBadge status={order.status} />
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        ₹{order.price}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
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

export default AdminDashboard