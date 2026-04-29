self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {}

  const title = data.title || "SwiftBox"
  const options = {
    body: data.body || "You have a new notification",
    icon: data.icon || "/icon.png",
    badge: "/icon.png",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  event.waitUntil(clients.openWindow("/dashboard"))
})