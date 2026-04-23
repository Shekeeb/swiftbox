import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Driver from "@/models/Driver"

const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        await connectDB()

        const order = await Order.findById(id).lean()

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ order })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

const PATCH = async (  req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { status, rating, ratingComment, driverId } = body

        await connectDB()

        const order = await Order.findById(id)

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        if (status) order.status = status
        if (rating) order.rating = rating
        if (ratingComment) order.ratingComment = ratingComment
        if (status === "delivered") order.deliveredAt = new Date()

        if (driverId) {
            const driver = await Driver.findById(driverId)
            if (driver) {
                order.driverId = driver._id
                driver.activeOrderId = order._id
                await driver.save()
            }
        }

        await order.save()

        return NextResponse.json({ order })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export { GET, PATCH }