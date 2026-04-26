import Notification from "@/models/Notification"
import User from "@/models/User"
import { sendOrderPlacedEmail, sendDriverAssignedEmail, sendPickedUpEmail, sendDeliveredEmail } from "./email"

interface NotifyParams {
  userId: string
  orderId: string
  type:
  | "order_placed"
  | "driver_assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  message: string
  extraData?: Record<string, any>
}

const notifyUser = async ({ userId, orderId, type, message, extraData = {}, }: NotifyParams) => {
  try {
    await Notification.create({
      userId,
      orderId,
      type,
      message,
      read: false,
    })

    const user = await User.findById(userId)
    if (!user?.email) return

    if (type === "order_placed") {
      await sendOrderPlacedEmail(
        user.email,
        user.name,
        orderId,
        extraData.city || "",
        extraData.price || 0
      )
    }

    if (type === "driver_assigned") {
      await sendDriverAssignedEmail(
        user.email,
        user.name,
        orderId,
        extraData.driverName || "Your driver"
      )
    }

    if (type === "picked_up") {
      await sendPickedUpEmail(user.email, user.name, orderId)
    }

    if (type === "delivered") {
      await sendDeliveredEmail(
        user.email,
        user.name,
        orderId,
        extraData.price || 0
      )
    }
  } catch (error) {
    console.error("Notify error:", error)
  }
}

export default notifyUser