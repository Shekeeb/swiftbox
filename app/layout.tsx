import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionWrapper from "@/components/ui/SessionWrapper"
import PushNotificationSetup from "@/components/ui/PushNotificationSetup"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwiftBox — Fast Package Delivery",
  description: "Multi-city courier service with live tracking",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>
          <PushNotificationSetup />
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}

export default RootLayout