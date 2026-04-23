import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Driver from "@/models/Driver"
import User from "@/models/User"

const GET = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const driver = await Driver.findOne({ userId: session.user.id }).lean()

    return NextResponse.json({ driver })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const PATCH = async (req: NextRequest) => {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { isOnline, currentLocation } = body

    await connectDB()

    let driver = await Driver.findOne({ userId: session.user.id })

    if (!driver) {
      const user = await User.findById(session.user.id)
      driver = await Driver.create({
        userId: session.user.id,
        name: user?.name || "Driver",
        phone: user?.phone || "",
        city: user?.city || "",
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