"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"

interface Subscription {
    _id: string
    pickup: { address: string }
    dropoff: { address: string }
    frequency: string
    scheduledTime: string
    city: string
    isActive: boolean
    packageDetails: {
        weight: number
        size: string
    }
}

const SubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const [form, setForm] = useState({
        pickupAddress: "",
        dropoffAddress: "",
        weight: "",
        size: "medium",
        frequency: "daily",
        scheduledTime: "09:00",
        city: "",
    })

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const fetchSubscriptions = async () => {
        try {
            const { data } = await axios.get("/api/subscriptions")
            setSubscriptions(data.subscriptions)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const createSubscription = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await axios.post("/api/subscriptions", {
                pickup: { address: form.pickupAddress, coordinates: [76.2144, 10.5276] },
                dropoff: { address: form.dropoffAddress, coordinates: [76.2673, 9.9312] },
                packageDetails: {
                    weight: parseFloat(form.weight),
                    size: form.size,
                    fragile: false,
                },
                frequency: form.frequency,
                scheduledTime: form.scheduledTime,
                city: form.city,
            })
            setShowForm(false)
            fetchSubscriptions()
        } catch (err) {
            console.error(err)
        }
    }

    const toggleSubscription = async (id: string, isActive: boolean) => {
        try {
            await axios.patch(`/api/subscriptions/${id}`, { isActive: !isActive })
            fetchSubscriptions()
        } catch (err) {
            console.error(err)
        }
    }

    const deleteSubscription = async (id: string) => {
        try {
            await axios.delete(`/api/subscriptions/${id}`)
            fetchSubscriptions()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition">
                        ←
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Subscriptions
                    </h1>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
                    + New subscription
                </button>
            </nav>

            <div className="w-full px-6 py-6 space-y-4">

                {showForm && (
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h2 className="font-medium text-gray-900 mb-4">
                            New recurring delivery
                        </h2>
                        <form onSubmit={createSubscription} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Pickup address
                                    </label>
                                    <input type="text" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Dropoff address
                                    </label>
                                    <input type="text" value={form.dropoffAddress} onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Weight (kg)
                                    </label>
                                    <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} step="0.1" min="0.1" required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Size
                                    </label>
                                    <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"  >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        City
                                    </label>
                                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Frequency
                                    </label>
                                    <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"  >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Pickup time
                                    </label>
                                    <input type="time" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition" >
                                    Create subscription
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium transition"  >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">
                            Your subscriptions
                        </h2>
                    </div>

                    {loading ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-400 text-sm">Loading...</p>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-gray-400 text-sm mb-2">
                                No subscriptions yet
                            </p>
                            <p className="text-xs text-gray-300">
                                Create one to automate your recurring deliveries
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {subscriptions.map((sub) => (
                                <div key={sub._id} className="flex items-start justify-between px-6 py-4"  >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {sub.city} — {sub.frequency}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {sub.pickup?.address?.split(",")[0]} →{" "}
                                            {sub.dropoff?.address?.split(",")[0]}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Every {sub.frequency} at {sub.scheduledTime} ·{" "}
                                            {sub.packageDetails?.weight}kg {sub.packageDetails?.size}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${sub.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}  >
                                            {sub.isActive ? "Active" : "Paused"}
                                        </span>
                                        <button onClick={() => toggleSubscription(sub._id, sub.isActive)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"  >
                                            {sub.isActive ? "Pause" : "Resume"}
                                        </button>
                                        <button onClick={() => deleteSubscription(sub._id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition"   >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SubscriptionsPage