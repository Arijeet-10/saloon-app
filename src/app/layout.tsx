import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bookify',
  description: 'Book your services anytime and anywhere',
  icons: {
    icon: '/favicon.ico', // or '/favicon.ico' if you converted it
  },
  openGraph: {
    title: 'Bookify – Smart Salon Booking Made Simple',
    description: 'Bookify lets you discover and book salon services anytime, anywhere. Choose your favorite salon, schedule appointments in seconds, and enjoy a smooth, hassle-free grooming experience.',
    
    url: 'https://saloon-app-dq3i.onrender.com', // replace with your actual site URL
    siteName: 'Your Site Name',
    images: [
      {
        url: 'https://saloon-app-dq3i.onrender.com/og-image.png', // Replace with your actual preview image URL
        width: 1200,
        height: 630,
        alt: 'Preview image alt text',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

