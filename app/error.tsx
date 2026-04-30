"use client"

import { useEffect } from "react"
import Link from "next/link"

interface Props {
    error: Error
    reset: () => void
}

const ErrorPage = ({ error, reset }: Props) => {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-4xl font-semibold text-red-500 mb-4">
                    Something went wrong
                </h1>
                <p className="text-gray-400 text-sm mb-8">
                    {error.message || "An unexpected error occurred"}
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={reset} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition">
                        Try again
                    </button>
                    <Link href="/" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium transition" >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage