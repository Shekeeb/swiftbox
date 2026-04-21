"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import dynamic from "next/dynamic"
import { Send } from "lucide-react"
import Loader from "@/components/ui/Loader"

const LiveMap = dynamic(() => import("@/components/map/LiveMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full bg-gray-100 flex items-center justify-center">
            <Loader />
        </div>
    ),
})

interface Message {
    senderRole: string
    message: string
    time?: string
}

interface Props {
    orderId: string
    status: string
    userId: string
    userRole: string
    pickupCoords?: [number, number]
    dropoffCoords?: [number, number]
}

const TrackingClient = ({ orderId, status, userId, userRole, pickupCoords, dropoffCoords }: Props) => {
    const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [connected, setConnected] = useState(false)
    const socketRef = useRef<Socket | null>(null)
    const chatBottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000")
        socketRef.current = socket

        socket.on("connect", () => {
            setConnected(true)
            socket.emit("track:join", orderId)
        })

        socket.on("disconnect", () => setConnected(false))

        socket.on(
            "location:update",
            ({ lat, lng }: { lat: number; lng: number }) => {
                setDriverLocation([lat, lng])
            }
        )

        socket.on("chat:new", (msg: Message) => {
            setMessages((prev) => [...prev, msg])
        })

        return () => {
            socket.disconnect()
        }
    }, [orderId])

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current) return

        socketRef.current.emit("chat:message", {
            orderId,
            sender: userId,
            senderRole: userRole,
            message: newMessage.trim(),
        })

        setNewMessage("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const showMap = status === "assigned" || status === "picked_up" || status === "in_transit"

    return (
        <div className="space-y-4">

            {showMap && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                            Live driver location
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${connected ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`} >
                            {connected ? "● Live" : "Connecting..."}
                        </span>
                    </div>
                    <div className="h-64">
                        <LiveMap driverLocation={driverLocation} pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">
                        Chat with driver
                    </h3>
                </div>

                <div className="h-56 overflow-y-auto px-6 py-4 space-y-3">
                    {messages.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                            No messages yet. Say hello to your driver!
                        </p>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.senderRole === userRole ? "justify-end" : "justify-start"}`} >
                                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${msg.senderRole === userRole ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}   >
                                    <p>{msg.message}</p>
                                    <p className={`text-xs mt-1 ${msg.senderRole === userRole ? "text-blue-200" : "text-gray-400"}`} >
                                        {msg.senderRole === userRole ? "You" : "Driver"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatBottomRef} />
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={sendMessage} disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-40" >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TrackingClient