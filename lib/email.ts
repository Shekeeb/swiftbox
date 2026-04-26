import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL || "SwiftBox <onboarding@resend.dev>"

export const sendOrderPlacedEmail = async (to: string, name: string, orderId: string, city: string, price: number) => {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Order placed — SwiftBox",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb;margin-bottom:4px">SwiftBox</h2>
        <p style="color:#6b7280;font-size:14px;margin-top:0">Fast package delivery</p>
        <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0"/>
        <h3 style="color:#111827">Hi ${name}, your order is placed!</h3>
        <p style="color:#374151;font-size:14px">
          Your delivery in <strong>${city}</strong> has been confirmed.
          We are finding the nearest driver for you.
        </p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:13px;color:#6b7280">Order ID</p>
          <p style="margin:4px 0 12px;font-weight:600;color:#111827;font-family:monospace">
            #${orderId.slice(-6).toUpperCase()}
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280">Amount</p>
          <p style="margin:4px 0 0;font-weight:600;color:#111827">₹${price}</p>
        </div>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          You will receive updates as your delivery progresses.
        </p>
      </div>
    `,
  })
}

export const sendDriverAssignedEmail = async (to: string, name: string, orderId: string, driverName: string) => {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Driver assigned — SwiftBox",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb;margin-bottom:4px">SwiftBox</h2>
        <p style="color:#6b7280;font-size:14px;margin-top:0">Fast package delivery</p>
        <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0"/>
        <h3 style="color:#111827">Your driver is on the way!</h3>
        <p style="color:#374151;font-size:14px">
          <strong>${driverName}</strong> has been assigned to your order
          <span style="font-family:monospace">#${orderId.slice(-6).toUpperCase()}</span>.
          They will pick up your package shortly.
        </p>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          Track your delivery in real time on the SwiftBox app.
        </p>
      </div>
    `,
  })
}

export const sendPickedUpEmail = async (to: string, name: string, orderId: string) => {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Package picked up — SwiftBox",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb;margin-bottom:4px">SwiftBox</h2>
        <p style="color:#6b7280;font-size:14px;margin-top:0">Fast package delivery</p>
        <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0"/>
        <h3 style="color:#111827">Package picked up!</h3>
        <p style="color:#374151;font-size:14px">
          Your package for order
          <span style="font-family:monospace">#${orderId.slice(-6).toUpperCase()}</span>
          has been picked up and is on its way to the dropoff location.
        </p>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          Track your driver live on the SwiftBox app.
        </p>
      </div>
    `,
  })
}

export const sendDeliveredEmail = async (to: string, name: string, orderId: string, price: number) => {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Package delivered! — SwiftBox",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb;margin-bottom:4px">SwiftBox</h2>
        <p style="color:#6b7280;font-size:14px;margin-top:0">Fast package delivery</p>
        <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0"/>
        <h3 style="color:#111827">Your package has been delivered!</h3>
        <p style="color:#374151;font-size:14px">
          Order <span style="font-family:monospace">#${orderId.slice(-6).toUpperCase()}</span>
          has been successfully delivered. Thank you for using SwiftBox!
        </p>
        <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:13px;color:#6b7280">Amount paid</p>
          <p style="margin:4px 0 0;font-weight:600;color:#16a34a">₹${price}</p>
        </div>
        <p style="color:#6b7280;font-size:12px;margin-top:24px">
          Please rate your experience on the SwiftBox app.
        </p>
      </div>
    `,
  })
}