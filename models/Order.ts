import mongoose, { Schema, Document, Model } from "mongoose"

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId
  driverId?: mongoose.Types.ObjectId | null
  pickup: {
    address: string
    coordinates: [number, number]
  }
  dropoff: {
    address: string
    coordinates: [number, number]
  }
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled"
  packageDetails: {
    weight: number
    size: "small" | "medium" | "large"
    fragile: boolean
    description?: string
  }
  price: number
  city: string
  scheduledAt: Date
  deliveredAt?: Date | null
  rating?: number | null
  ratingComment?: string
  isSubscription: boolean
  subscriptionId?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
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
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "pending",
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
      description: {
        type: String,
        default: "",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled time is required"],
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    ratingComment: {
      type: String,
      default: "",
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
  },
  { timestamps: true }
)

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema)

export default Order