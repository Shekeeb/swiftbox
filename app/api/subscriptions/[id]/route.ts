import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Subscription from "@/models/Subscription"

const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const { isActive } = await req.json()

        await connectDB()

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        )

        return NextResponse.json({ subscription })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        await connectDB()

        await Subscription.findByIdAndDelete(id)

        return NextResponse.json({ message: "Subscription deleted" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export { PATCH, DELETE }