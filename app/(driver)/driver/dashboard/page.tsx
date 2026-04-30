import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectDB from "@/lib/db"
import Driver from "@/models/Driver"
import Order from "@/models/Order"
import DriverDashboardClient from "./DriverDashboardClient"
import DriverSignOut from "@/components/ui/DriverSignOut"
import Link from "next/link"
import { Bell } from "lucide-react"

const DriverDashboard = async () => {
  const session = await auth()

  if (!session || !session.user) redirect("/login")
  const user = session.user as {
    id: string
    name: string
    email: string
    role: string
  }
  if (user.role !== "driver") redirect("/dashboard")

  await connectDB()

  const driver = await Driver.findOne({
    userId: user.id,
  }).lean()

  const driverData = driver ? JSON.parse(JSON.stringify(driver)) : null

  const totalDeliveries = driver
    ? await Order.countDocuments({
      driverId: (driver as any)._id,
      status: "delivered",
    })
    : 0

  const activeOrder = driver
    ? await Order.findOne({
      driverId: (driver as any)._id,
      status: { $in: ["assigned", "picked_up", "in_transit"] },
    }).lean()
    : null

  const recentOrders = driver
    ? await Order.find({
      driverId: (driver as any)._id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
    : []

  const pendingOrders = driver
    ? await Order.find({
      status: "pending",
      city: (driver as any).city,
    })
      .sort({ createdAt: -1 })
      .lean()
    : []

  const pendingOrdersData = JSON.parse(JSON.stringify(pendingOrders))
  const activeOrderData = activeOrder
    ? JSON.parse(JSON.stringify(activeOrder))
    : null
  const recentOrdersData = JSON.parse(JSON.stringify(recentOrders))

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          Swift<span className="text-blue-600">Box</span>
          <span className="text-sm font-normal text-gray-400 ml-2">
            Driver
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.name}</span>
          <Link href="/driver/notifications" className="text-gray-500 hover:text-gray-900 transition">
            <Bell size={20} />
          </Link>
          <DriverSignOut />
        </div>
      </nav>

      <div className="w-full px-6 py-8 space-y-6">

        <DriverDashboardClient driverId={driverData?._id?.toString() || ""} isOnline={driverData?.isOnline || false} activeOrder={activeOrderData} userId={user.id} pendingOrders={pendingOrdersData} />

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Total deliveries</p>
            <p className="text-3xl font-semibold text-gray-900">
              {totalDeliveries}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Rating</p>
            <p className="text-3xl font-semibold text-amber-500">
              {driverData?.rating?.toFixed(1) || "5.0"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className={`text-3xl font-semibold ${driverData?.isOnline ? "text-green-500" : "text-gray-400"}`}  >
              {driverData?.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Recent deliveries</h2>
          </div>

          {recentOrdersData.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-gray-400 text-sm">
                No deliveries yet. Go online to start receiving orders!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrdersData.map((order: any) => (
                <div key={order._id.toString()} className="flex items-center justify-between px-6 py-4"  >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.city} delivery
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
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      ₹{order.price}
                    </p>
                  </div>
                </div>
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
    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}  >
      {status.replace("_", " ")}
    </span>
  )
}

export default DriverDashboard