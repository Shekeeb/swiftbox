import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Subscription from "@/models/Subscription"

const GET = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string; role: string }

    await connectDB()

    const subscriptions = await Subscription.find({
      customerId: user.id,
    })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ subscriptions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const POST = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string; role: string }

    if (user.role !== "customer") {
      return NextResponse.json(
        { error: "Only customers can create subscriptions" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      pickup,
      dropoff,
      packageDetails,
      frequency,
      scheduledTime,
      city,
    } = body

    if (!pickup?.address || !dropoff?.address) {
      return NextResponse.json(
        { error: "Pickup and dropoff addresses are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const nextRunAt = new Date()
    nextRunAt.setDate(nextRunAt.getDate() + 1)
    const [hours, minutes] = (scheduledTime || "09:00").split(":")
    nextRunAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    const subscription = await Subscription.create({
      customerId: user.id,
      pickup,
      dropoff,
      packageDetails: {
        weight: packageDetails?.weight || 1,
        size: packageDetails?.size || "medium",
        fragile: packageDetails?.fragile || false,
      },
      frequency: frequency || "daily",
      scheduledTime: scheduledTime || "09:00",
      city,
      isActive: true,
      nextRunAt,
    })

    return NextResponse.json(
      { message: "Subscription created", subscription },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export { GET, POST }