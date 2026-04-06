import mongoose, { Schema, Document, Model } from "mongoose"

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  phone: string
  city: string
  isOnline: boolean
  activeOrderId?: mongoose.Types.ObjectId | null
  currentLocation: {
    type: string
    coordinates: [number, number]
  }
  vehicle: {
    type: string
    plate: string
  }
  rating: number
  totalDeliveries: number
  createdAt: Date
  updatedAt: Date
}

const driverSchema = new Schema<IDriver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    activeOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    vehicle: {
      type: { type: String, default: "bike" },
      plate: { type: String, default: "" },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

driverSchema.index({ currentLocation: "2dsphere" })

const Driver: Model<IDriver> =
  mongoose.models.Driver || mongoose.model<IDriver>("Driver", driverSchema)

export default Driver