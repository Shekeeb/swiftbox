import mongoose, { Schema, Document, Model } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  orderId?: mongoose.Types.ObjectId | null
  type: "order_placed" | "driver_assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled"
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "order_placed",
        "driver_assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      required: [true, "Notification type is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema)

export default Notification