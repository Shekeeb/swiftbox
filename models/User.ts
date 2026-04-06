import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: "customer" | "driver" | "admin"
  phone?: string
  city?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["customer", "driver", "admin"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema)

export default User