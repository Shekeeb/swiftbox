import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Driver from "@/models/Driver"
import User from "@/models/User"

const GET = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string; role: string }

    await connectDB()

    const driver = await Driver.findOne({ userId: user.id }).lean()

    return NextResponse.json({ driver })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const PATCH = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string; name: string; role: string }

    const body = await req.json()
    const { isOnline, currentLocation } = body

    await connectDB()

    let driver = await Driver.findOne({ userId: user.id })

    if (!driver) {
      const dbUser = await User.findById(user.id)
      driver = await Driver.create({
        userId: user.id,
        name: dbUser?.name || "Driver",
        phone: dbUser?.phone || "",
        city: dbUser?.city || "",
        isOnline: false,
      })
    }

    if (typeof isOnline === "boolean") driver.isOnline = isOnline
    if (currentLocation) {
      driver.currentLocation = {
        type: "Point",
        coordinates: [currentLocation.lng, currentLocation.lat],
      }
    }

    await driver.save()

    return NextResponse.json({ driver })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export { GET, PATCH }