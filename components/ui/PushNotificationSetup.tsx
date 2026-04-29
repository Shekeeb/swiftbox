"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"

const PushNotificationSetup = () => {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")

        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })

        await axios.post("/api/push", {
          subscription: subscription.toJSON(),
        })
      } catch (err) {
        console.error("Push setup error:", err)
      }
    }

    setup()
  }, [session])

  return null
}

export default PushNotificationSetup