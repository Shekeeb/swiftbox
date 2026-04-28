import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Link from "next/link"
import TrackingClient from "./TrackingClient"
import RatingCard from "./RatingCard"

const statusSteps = [
    { key: "pending", label: "Order placed" },
    { key: "assigned", label: "Driver assigned" },
    { key: "picked_up", label: "Package picked up" },
    { key: "in_transit", label: "Out for delivery" },
    { key: "delivered", label: "Delivered" },
]

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

const StatusSteps = ({ status }: { status: string }) => {
    const currentIndex = statusSteps.findIndex((s) => s.key === status)

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
                Delivery progress
            </h3>
            <div className="space-y-3">
                {statusSteps.map((step, index) => {
                    const isDone = index <= currentIndex
                    const isCurrent = index === currentIndex
                    return (
                        <div key={step.key} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${isDone ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`} >
                                {isDone ? "✓" : index + 1}
                            </div>
                            <p className={`text-sm ${isCurrent ? "font-medium text-blue-600" : isDone ? "text-gray-900" : "text-gray-400"}`} >
                                {step.label}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const TrackPage = async ({ params, }: { params: Promise<{ orderId: string }> }) => {
    const session = await auth()
    if (!session) redirect("/login")

    const { orderId } = await params

    await connectDB()

    const order = await Order.findById(orderId).lean()

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Order not found</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const orderData = JSON.parse(JSON.stringify(order))

    const pickupCoords: [number, number] = [
        orderData.pickup.coordinates[1],
        orderData.pickup.coordinates[0],
    ]
    const dropoffCoords: [number, number] = [
        orderData.dropoff.coordinates[1],
        orderData.dropoff.coordinates[0],
    ]

    return (
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <Link href="/dashboard" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition" >
                    ←
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">
                    Track order
                </h1>
            </nav>

            <div className="w-full px-6 py-6 space-y-4">

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            Order{" "}
                            <span className="font-mono font-medium text-gray-900">
                                #{orderData._id.toString().slice(-6).toUpperCase()}
                            </span>
                        </p>
                        <StatusBadge status={orderData.status} />
                    </div>

                    <div className="flex gap-3 mb-4">
                        <div className="flex flex-col items-center pt-1">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <div className="w-0.5 h-8 bg-gray-200 my-1" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400">Pickup</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {orderData.pickup?.address}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Dropoff</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {orderData.dropoff?.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400">Weight</p>
                            <p className="text-sm font-medium text-gray-900">
                                {orderData.packageDetails?.weight} kg
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Size</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                                {orderData.packageDetails?.size}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Price</p>
                            <p className="text-sm font-medium text-gray-900">
                                ₹{orderData.price}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Scheduled</p>
                            <p className="text-sm font-medium text-gray-900">
                                {new Date(orderData.scheduledAt).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short" }
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <StatusSteps status={orderData.status} />
                        {orderData.status === "delivered" && !orderData.rating && (
                            <RatingCard orderId={orderData._id.toString()} />
                        )}
                    </div>

                    <div>
                        <TrackingClient orderId={orderData._id.toString()} status={orderData.status} userId={session.user.id} userRole={session.user.role} pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackPage