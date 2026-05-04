import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import PushSubscription from "@/models/PushSubscription"

const POST = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string }

    const body = await req.json()
    const { subscription } = body

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      )
    }

    await connectDB()

    await PushSubscription.findOneAndUpdate(
      { userId: user.id },
      { userId: user.id, subscription },
      { upsert: true, new: true }
    )

    return NextResponse.json({ message: "Push subscription saved" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const DELETE = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string }

    await connectDB()

    await PushSubscription.findOneAndDelete({ userId: user.id })

    return NextResponse.json({ message: "Push subscription removed" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export { POST, DELETE }