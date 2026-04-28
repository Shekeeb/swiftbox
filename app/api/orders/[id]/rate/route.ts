import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Driver from "@/models/Driver"

const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const { rating, comment } = await req.json()

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            )
        }

        await connectDB()

        const order = await Order.findById(id)

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        if (order.status !== "delivered") {
            return NextResponse.json(
                { error: "Can only rate delivered orders" },
                { status: 400 }
            )
        }

        order.rating = rating
        order.ratingComment = comment || ""
        await order.save()

        if (order.driverId) {
            const allRatings = await Order.find({
                driverId: order.driverId,
                rating: { $exists: true, $ne: null },
            })

            const avg =
                allRatings.reduce((sum, o) => sum + (o.rating || 0), 0) /
                allRatings.length

            await Driver.findByIdAndUpdate(order.driverId, {
                rating: Math.round(avg * 10) / 10,
            })
        }

        return NextResponse.json({ message: "Rating submitted successfully" })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export { POST }