import mongoose, { Schema, Document, Model } from "mongoose"

export interface IChatMessage extends Document {
  orderId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  senderRole: "customer" | "driver"
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order ID is required"],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    senderRole: {
      type: String,
      enum: ["customer", "driver"],
      required: [true, "Sender role is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema)

export default ChatMessage