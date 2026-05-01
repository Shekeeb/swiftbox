const { createServer } = require("http")
const { Server } = require("socket.io")

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      process.env.NEXT_PUBLIC_APP_URL || "https://swiftbox.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  socket.on("track:join", (orderId) => {
    socket.join(`order:${orderId}`)
    console.log(`Socket ${socket.id} joined order room: ${orderId}`)
  })

  socket.on("driver:location", ({ orderId, lat, lng }) => {
    socket.to(`order:${orderId}`).emit("location:update", { lat, lng })
    console.log(`GPS update for order ${orderId}: ${lat}, ${lng}`)
  })

  socket.on("chat:message", ({ orderId, sender, senderRole, message }) => {
    const msgData = {
      sender,
      senderRole,
      message,
      time: new Date().toISOString(),
    }
    io.to(`order:${orderId}`).emit("chat:new", msgData)
    console.log(`Chat in order ${orderId} from ${senderRole}: ${message}`)
  })

  socket.on("order:status", ({ orderId, status, customerId }) => {
    io.to(`order:${orderId}`).emit("order:status_update", { status })
    io.to(`user:${customerId}`).emit("notification:new", {
      type: status,
      message: `Your order status updated to ${status.replace("_", " ")}`,
    })
  })

  socket.on("user:join", (userId) => {
    socket.join(`user:${userId}`)
    console.log(`User ${userId} joined personal room`)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})