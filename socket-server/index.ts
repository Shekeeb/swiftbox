import { createServer } from "http"
import { Server } from "socket.io"

const httpServer = createServer()

const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})

// Track which socket belongs to which order room
const orderRooms = new Map<string, Set<string>>()

io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // ─── Customer joins order tracking room ───────────────
    socket.on("track:join", (orderId: string) => {
        socket.join(`order:${orderId}`)
        console.log(`Socket ${socket.id} joined order room: ${orderId}`)
    })

    // ─── Driver broadcasts GPS location ──────────────────
    socket.on(
        "driver:location",
        ({ orderId, lat, lng }: { orderId: string; lat: number; lng: number }) => {
            // Broadcast to everyone in that order's room
            socket.to(`order:${orderId}`).emit("location:update", { lat, lng })
            console.log(`GPS update for order ${orderId}: ${lat}, ${lng}`)
        }
    )

    // ─── Chat message between customer and driver ─────────
    socket.on(
        "chat:message",
        ({
            orderId,
            sender,
            senderRole,
            message,
        }: {
            orderId: string
            sender: string
            senderRole: string
            message: string
        }) => {
            const msgData = {
                sender,
                senderRole,
                message,
                time: new Date().toISOString(),
            }

            // Send to everyone in the order room including sender
            io.to(`order:${orderId}`).emit("chat:new", msgData)
            console.log(`Chat in order ${orderId} from ${senderRole}: ${message}`)
        }
    )

    // ─── Order status update notification ────────────────
    socket.on(
        "order:status",
        ({
            orderId,
            status,
            customerId,
        }: {
            orderId: string
            status: string
            customerId: string
        }) => {
            // Notify the customer room
            io.to(`order:${orderId}`).emit("order:status_update", { status })
            io.to(`user:${customerId}`).emit("notification:new", {
                type: status,
                message: `Your order status updated to ${status.replace("_", " ")}`,
            })
            console.log(`Order ${orderId} status: ${status}`)
        }
    )

    // ─── User joins their personal room ──────────────────
    socket.on("user:join", (userId: string) => {
        socket.join(`user:${userId}`)
        console.log(`User ${userId} joined personal room`)
    })

    // ─── Disconnect ───────────────────────────────────────
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`)
    })
})

const PORT = process.env.SOCKET_PORT || 4000

httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`)
})