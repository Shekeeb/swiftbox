"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import dynamic from "next/dynamic"
import Loader from "@/components/ui/Loader"

const BookingMap = dynamic(() => import("@/components/map/BookingMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-xl">
            <p className="text-sm text-gray-400">Loading map...</p>
        </div>
    ),
})

interface LocationPoint {
    address: string
    coordinates: [number, number]
}

const BookPage = () => {
    const router = useRouter()

    const [pickup, setPickup] = useState<LocationPoint>({
        address: "",
        coordinates: [76.2144, 10.5276],
    })
    const [dropoff, setDropoff] = useState<LocationPoint>({
        address: "",
        coordinates: [76.2673, 9.9312],
    })
    const [selectingFor, setSelectingFor] = useState<"pickup" | "dropoff">(
        "pickup"
    )
    const [packageDetails, setPackageDetails] = useState({
        weight: "",
        size: "medium",
        fragile: false,
        description: "",
    })
    const [scheduledAt, setScheduledAt] = useState("")
    const [city, setCity] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const calculatePrice = () => {
        const weight = parseFloat(packageDetails.weight) || 0
        const base = 50
        const weightCharge = weight * 20
        const sizeCharge = packageDetails.size === "large" ? 50
            : packageDetails.size === "medium" ? 20
                : 0
        const fragileCharge = packageDetails.fragile ? 30 : 0
        return Math.round(base + weightCharge + sizeCharge + fragileCharge)
    }

    const handleMapClick = useCallback(
        async (lat: number, lng: number) => {
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                const address = res.data.display_name || `${lat}, ${lng}`

                if (selectingFor === "pickup") {
                    setPickup({ address, coordinates: [lng, lat] })
                } else {
                    setDropoff({ address, coordinates: [lng, lat] })
                }
            } catch {
                const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                if (selectingFor === "pickup") {
                    setPickup({ address, coordinates: [lng, lat] })
                } else {
                    setDropoff({ address, coordinates: [lng, lat] })
                }
            }
        },
        [selectingFor]
    )

    const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setPackageDetails({
            ...packageDetails,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!pickup.address) {
            setError("Please select a pickup location on the map")
            return
        }
        if (!dropoff.address) {
            setError("Please select a dropoff location on the map")
            return
        }
        if (!packageDetails.weight || Number(packageDetails.weight) <= 0) {
            setError("Please enter a valid package weight")
            return
        }
        if (!scheduledAt) {
            setError("Please select a pickup date and time")
            return
        }
        if (!city) {
            setError("Please enter your city")
            return
        }

        setLoading(true)

        try {
            const { data } = await axios.post("/api/orders", {
                pickup,
                dropoff,
                packageDetails: {
                    ...packageDetails,
                    weight: parseFloat(packageDetails.weight),
                },
                scheduledAt,
                city,
            })

            router.push(`/track/${data.order._id}`)
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                "Something went wrong. Please try again."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <Link href="/dashboard" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition" >                    ←
                </Link>
                <h1 className="text-lg font-semibold text-gray-900">
                    Book a delivery
                </h1>
            </nav>

            <div className="w-full px-6 py-6">
                <div className="grid grid-cols-2 gap-6">

                    <div className="space-y-3">
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-400 mb-3">
                                Click on the map to set location
                            </p>
                            <div className="flex gap-2 mb-4">
                                <button type="button" onClick={() => setSelectingFor("pickup")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${selectingFor === "pickup" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}  >
                                    Set pickup
                                </button>
                                <button type="button" onClick={() => setSelectingFor("dropoff")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${selectingFor === "dropoff" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`} >
                                    Set dropoff
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                                    <p className="text-xs text-gray-600">
                                        {pickup.address || "Pickup not set"}
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                    <p className="text-xs text-gray-600">
                                        {dropoff.address || "Dropoff not set"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-96 rounded-xl overflow-hidden border border-gray-100">
                            <BookingMap
                                pickupCoords={pickup.address ? [pickup.coordinates[1], pickup.coordinates[0]] : null}
                                dropoffCoords={dropoff.address ? [dropoff.coordinates[1], dropoff.coordinates[0]] : null}
                                onMapClick={handleMapClick}
                                selectingFor={selectingFor}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                            <h2 className="font-medium text-gray-900">Package details</h2>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Weight (kg)
                                    </label>
                                    <input type="number" name="weight" value={packageDetails.weight} onChange={handlePackageChange} step="0.1" min="0.1" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Size
                                    </label>
                                    <select name="size" value={packageDetails.size} onChange={handlePackageChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"  >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Description (optional)
                                </label>
                                <textarea name="description" value={packageDetails.description} onChange={handlePackageChange} placeholder="Books, clothes, electronics..." rows={2} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="fragile" checked={packageDetails.fragile} onChange={handlePackageChange} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                                <span className="text-sm text-gray-700">
                                    Fragile — handle with care (+₹30)
                                </span>
                            </label>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                            <h2 className="font-medium text-gray-900">Schedule</h2>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Pickup date and time
                                </label>
                                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    City
                                </label>
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {packageDetails.weight && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-blue-700">Estimated price</p>
                                    <p className="text-xl font-semibold text-blue-900">
                                        ₹{calculatePrice()}
                                    </p>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-blue-500">
                                        Base ₹50 + ₹20/kg + size charge
                                        {packageDetails.fragile ? " + ₹30 fragile" : ""}
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed" >
                            {loading ? <Loader /> : "Confirm booking"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default BookPage