This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# SwiftBox

A multi-city package courier web application with live GPS tracking, real-time chat, and smart driver assignment.

## Tech Stack

- **Frontend** — Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Auth** — NextAuth.js v5 (email/password)
- **Database** — MongoDB Atlas + Mongoose
- **Real-time** — Socket.io (live GPS, chat, notifications)
- **Maps** — Leaflet.js + OpenStreetMap (free)
- **Email** — Resend
- **Push Notifications** — Web Push API

## Features

- Customer registration and login
- Package booking with price calculator
- Live GPS driver tracking on map
- Real-time chat between customer and driver
- Smart driver assignment using geospatial queries
- Push and email notifications
- Recurring delivery subscriptions
- Admin dashboard with analytics
