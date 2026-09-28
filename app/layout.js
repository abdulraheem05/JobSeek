import "./globals.css";

import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration/ServiceWorkerRegistration";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";

export const metadata = {
  title: "JobSeek",
  description: "Find the opportunities meant for you.",

  applicationName: "JobSeek",

  appleWebApp: {
    capable: true,
    title: "JobSeek",
    statusBarStyle: "default",
  },

  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#123760",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* 
          IMPORTANT:
          This must be here instead of inside
          home/saved/career/profile pages.

          This keeps the SAME navigation mounted
          while Next.js changes routes.
        */}
        <BottomNavigation />

        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}