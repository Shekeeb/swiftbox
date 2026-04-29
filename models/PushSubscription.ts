import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
  },
  { timestamps: true }
)

const PushSubscription: Model<IPushSubscription> =
  mongoose.models.PushSubscription ||
  mongoose.model<IPushSubscription>("PushSubscription", pushSubscriptionSchema)

export default PushSubscription