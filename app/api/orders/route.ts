import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import Driver from "@/models/Driver"
import notifyUser from "@/lib/notify"

const calculatePrice = (weight: number, size: string, fragile: boolean): number => {
    const base = 50
    const weightCharge = weight * 20
    const sizeCharge =
        size === "large" ? 50 : size === "medium" ? 20 : 0
    const fragileCharge = fragile ? 30 : 0
    return Math.round(base + weightCharge + sizeCharge + fragileCharge)
}

const GET = async (req: NextRequest) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const { searchParams } = new URL(req.url)
        const forDriver = searchParams.get("driver") === "true"

        let orders

        if (forDriver && session.user.role === "driver") {
            const driver = await Driver.findOne({ userId: session.user.id })
            if (!driver) return NextResponse.json({ orders: [] })

            orders = await Order.find({ driverId: driver._id })
                .sort({ createdAt: -1 })
                .lean()
        } else {
            orders = await Order.find({ customerId: session.user.id })
                .sort({ createdAt: -1 })
                .lean()
        }

        return NextResponse.json({ orders })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

const POST = async (req: NextRequest) => {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.user.role !== "customer") {
            return NextResponse.json(
                { error: "Only customers can place orders" },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { pickup, dropoff, packageDetails, scheduledAt, city } = body

        if (!pickup?.address || !dropoff?.address) {
            return NextResponse.json(
                { error: "Pickup and dropoff addresses are required" },
                { status: 400 }
            )
        }

        if (!packageDetails?.weight) {
            return NextResponse.json(
                { error: "Package weight is required" },
                { status: 400 }
            )
        }

        if (!scheduledAt) {
            return NextResponse.json(
                { error: "Scheduled time is required" },
                { status: 400 }
            )
        }

        if (!city) {
            return NextResponse.json(
                { error: "City is required" },
                { status: 400 }
            )
        }

        await connectDB()

        const price = calculatePrice(
            packageDetails.weight,
            packageDetails.size || "medium",
            packageDetails.fragile || false
        )

        const order = await Order.create({
            customerId: session.user.id,
            pickup: {
                address: pickup.address,
                coordinates: pickup.coordinates || [76.2144, 10.5276],
            },
            dropoff: {
                address: dropoff.address,
                coordinates: dropoff.coordinates || [76.2673, 9.9312],
            },
            packageDetails: {
                weight: packageDetails.weight,
                size: packageDetails.size || "medium",
                fragile: packageDetails.fragile || false,
                description: packageDetails.description || "",
            },
            price,
            city,
            scheduledAt: new Date(scheduledAt),
            status: "pending",
            isSubscription: false,
        })

        await notifyUser({
            userId: session.user.id,
            orderId: order._id.toString(),
            type: "order_placed",
            message: `Order placed! Finding a driver near ${city}...`,
            extraData: { city, price },
        })

        return NextResponse.json(
            {
                message: "Order placed successfully",
                order: {
                    _id: order._id.toString(),
                    status: order.status,
                    price: order.price,
                    pickup: order.pickup,
                    dropoff: order.dropoff,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export { GET, POST }