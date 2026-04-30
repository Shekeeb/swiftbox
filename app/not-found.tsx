import Link from "next/link"

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-6xl font-semibold text-blue-600 mb-4">404</h1>
                <p className="text-xl font-medium text-gray-900 mb-2">
                    Page not found
                </p>
                <p className="text-gray-400 text-sm mb-8">
                    The page you are looking for does not exist.
                </p>
                <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition">
                    Back to home
                </Link>
            </div>
        </div>
    )
}

export default NotFound