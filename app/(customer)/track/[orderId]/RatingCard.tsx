"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Loader from "@/components/ui/Loader"

const RatingCard = ({ orderId }: { orderId: string }) => {
    const router = useRouter()
    const [rating, setRating] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const submit = async () => {
        if (!rating) return
        setLoading(true)
        try {
            await axios.post(`/api/orders/${orderId}/rate`, { rating, comment })
            setDone(true)
            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-xl px-6 py-8 text-center">
                <p className="text-green-700 font-medium">
                    Thank you for your rating!
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-1">
                Rate your delivery
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                How was your experience?
            </p>

            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} className="text-3xl transition" >
                        <span className={star <= (hovered || rating) ? "text-amber-400" : "text-gray-200"}  >
                            ★
                        </span>
                    </button>
                ))}
            </div>

            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a comment (optional)" rows={2} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3" />

            <button onClick={submit} disabled={!rating || loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50" >
                {loading ? <Loader /> : "Submit rating"}
            </button>
        </div>
    )
}

export default RatingCard