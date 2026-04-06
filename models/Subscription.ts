import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISubscription extends Document {
  customerId: mongoose.Types.ObjectId
  pickup: {
    address: string
    coordinates: [number, number]
  }
  dropoff: {
    address: string
    coordinates: [number, number]
  }
  packageDetails: {
    weight: number
    size: "small" | "medium" | "large"
    fragile: boolean
  }
  frequency: "daily" | "weekly"
  scheduledTime: string
  city: string
  isActive: boolean
  nextRunAt: Date
  createdAt: Date
  updatedAt: Date
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
    },
    pickup: {
      address: {
        type: String,
        required: [true, "Pickup address is required"],
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    dropoff: {
      address: {
        type: String,
        required: [true, "Dropoff address is required"],
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    packageDetails: {
      weight: {
        type: Number,
        required: [true, "Weight is required"],
      },
      size: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      fragile: {
        type: Boolean,
        default: false,
      },
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
    scheduledTime: {
      type: String,
      default: "09:00",
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    nextRunAt: {
      type: Date,
      required: [true, "Next run date is required"],
    },
  },
  { timestamps: true }
)

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema)

export default Subscription