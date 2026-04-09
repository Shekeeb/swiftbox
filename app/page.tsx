import Link from "next/link";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">
          Swift<span className="text-blue-600">Box</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Log in
          </Link>
          <Link href="/register" className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition" >
            Get started
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center flex-1 text-center px-4 py-24">
        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-6">
          Multi-city courier service
        </span>

        <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 max-w-2xl leading-tight mb-6">
          Fast, reliable package delivery with live tracking
        </h2>

        <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
          Book a courier in seconds. Watch your driver move in real time on
          the map. Chat directly with your delivery partner.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-lg transition" >
            Send a package
          </Link>
          <Link href="/register?role=driver" className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-6 py-3 rounded-lg transition" >
            Become a driver
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-16">
          {[
            "Live GPS map tracking",
            "In-app chat",
            "Instant notifications",
            "Smart driver assignment",
            "Recurring deliveries",
            "Multi-city support",
          ].map((feature) => (
            <span key={feature} className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full">
              {feature}
            </span>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        SwiftBox — built with Next.js, MongoDB, Socket.io
      </footer>
    </div>
  );
}

export default HomePage