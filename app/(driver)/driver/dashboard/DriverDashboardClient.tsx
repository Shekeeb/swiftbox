"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import { Power } from "lucide-react"

interface Order {
  _id: string
  pickup: { address: string }
  dropoff: { address: string }
  status: string
  price: number
  city: string
  packageDetails: {
    weight: number
    size: string
    fragile: boolean
  }
}

interface Props {
  driverId: string
  isOnline: boolean
  activeOrder: Order | null
  userId: string
  pendingOrders: Order[]
}

const DriverDashboardClient = ({ driverId, isOnline: initialOnline, activeOrder, userId, pendingOrders, }: Props) => {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(initialOnline)
  const [loading, setLoading] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
    )
    socketRef.current = socket

    socket.on("order:assigned", () => {
      router.refresh()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (isOnline && activeOrder) {
      startGPS()
    } else {
      stopGPS()
    }
    return () => stopGPS()
  }, [isOnline, activeOrder])

  const startGPS = () => {
    if (!navigator.geolocation) return

    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "denied") {
        alert("Please allow location access in browser settings")
        return
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords

          axios.patch("/api/driver/status", { currentLocation: { lat, lng }, })

          if (socketRef.current && activeOrder) {
            socketRef.current.emit("driver:location", {
              orderId: activeOrder._id,
              lat,
              lng,
            })
          }
        },
        (err) => {
          if (err.code === 1) {
            alert("Location permission denied. Please allow location access.")
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      )
    })
  }

  const stopGPS = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  const toggleOnline = async () => {
    setLoading(true)
    try {
      const newStatus = !isOnline
      await axios.patch("/api/driver/status", { isOnline: newStatus })
      setIsOnline(newStatus)
      if (newStatus) startGPS()
      else stopGPS()
      router.refresh()
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setLoading(false)
    }
  }

  const acceptOrder = async (orderId: string) => {
    setAcceptingId(orderId)
    try {
      await axios.patch(`/api/orders/${orderId}`, {
        status: "assigned",
        driverId,
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to accept order:", err)
    } finally {
      setAcceptingId(null)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status })
      router.refresh()
    } catch (err) {
      console.error("Failed to update order:", err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">
            {isOnline ? "You are online" : "You are offline"}
          </p>
          <p className="text-sm text-gray-400 mt-0.5">
            {isOnline ? "You can receive delivery orders" : "Go online to start receiving orders"}
          </p>
        </div>
        <button onClick={toggleOnline} disabled={loading} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 ${isOnline ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`} >
          <Power size={16} />
          {loading ? "..." : isOnline ? "Go offline" : "Go online"}
        </button>
      </div>

      {activeOrder && (
        <div className="bg-white rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Active order</h3>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full capitalize">
              {activeOrder.status.replace("_", " ")}
            </span>
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
                  {activeOrder.pickup?.address?.split(",")[0]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Dropoff</p>
                <p className="text-sm font-medium text-gray-900">
                  {activeOrder.dropoff?.address?.split(",")[0]}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Weight</p>
              <p className="text-sm font-medium">
                {activeOrder.packageDetails?.weight} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Size</p>
              <p className="text-sm font-medium capitalize">
                {activeOrder.packageDetails?.size}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Earnings</p>
              <p className="text-sm font-medium text-green-600">
                ₹{activeOrder.price}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {activeOrder.status === "assigned" && (
              <button onClick={() => updateOrderStatus(activeOrder._id, "picked_up")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition" >
                Mark as picked up
              </button>
            )}
            {activeOrder.status === "picked_up" && (
              <button onClick={() => updateOrderStatus(activeOrder._id, "in_transit")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg text-sm font-medium transition">
                Mark as in transit
              </button>
            )}
            {activeOrder.status === "in_transit" && (
              <button onClick={() => updateOrderStatus(activeOrder._id, "delivered")} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition">
                Mark as delivered
              </button>
            )}
          </div>
        </div>
      )}

      {isOnline && !activeOrder && pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">
              Available orders near you
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {pendingOrders.length} order
              {pendingOrders.length > 1 ? "s" : ""} waiting
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingOrders.map((order) => (
              <div key={order._id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {order.city} delivery
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.pickup?.address?.split(",")[0]} →{" "}
                      {order.dropoff?.address?.split(",")[0]}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {order.packageDetails?.weight} kg
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {order.packageDetails?.size}
                      </span>
                      {order.packageDetails?.fragile && (
                        <span className="text-xs text-red-500">
                          Fragile
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      ₹{order.price}
                    </p>
                    <button onClick={() => acceptOrder(order._id)} disabled={acceptingId === order._id} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition disabled:opacity-50" >
                      {acceptingId === order._id ? "..." : "Accept"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOnline && !activeOrder && pendingOrders.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-gray-400 text-sm">
            No pending orders in your city right now
          </p>
          <p className="text-xs text-gray-300 mt-1">
            New orders will appear here automatically
          </p>
        </div>
      )}
    </div>
  )
}

export default DriverDashboardClient