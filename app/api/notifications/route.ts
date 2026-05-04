import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Notification from "@/models/Notification"

const GET = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string; role: string }

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unread") === "true"

    await connectDB()

    if (unreadOnly) {
      const count = await Notification.countDocuments({
        userId: user.id,
        read: false,
      })
      return NextResponse.json({ count })
    }

    const notifications = await Notification.find({
      userId: user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ notifications })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export { GET }