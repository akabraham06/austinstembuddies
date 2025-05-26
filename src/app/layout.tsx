import type { Metadata } from "next";
import { Inter, Freckle_Face } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const freckleFace = Freckle_Face({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-freckle-face',
});

export const metadata: Metadata = {
  title: "Austin STEM Buddies",
  description: "Promoting STEM education among elementary school children through hands-on experiments",
  keywords: ["STEM", "Education", "Austin", "UT Austin", "Children", "Science", "Technology", "Engineering", "Mathematics"],
  authors: [{ name: "Austin STEM Buddies" }],
  openGraph: {
    title: "Austin STEM Buddies",
    description: "Promoting STEM education among elementary school children through hands-on experiments",
    url: "https://austinstembuddies.org",
    siteName: "Austin STEM Buddies",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Austin STEM Buddies",
    description: "Promoting STEM education among elementary school children through hands-on experiments",
  },
  icons: {
    icon: '/logo-cropped.png',
    shortcut: '/logo-cropped.png',
    apple: '/logo-cropped.png',
  },
  metadataBase: new URL('http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${freckleFace.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#2D3F84" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body className="min-h-screen bg-background-light text-text-primary font-sans antialiased mobile-container">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
