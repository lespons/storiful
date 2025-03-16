import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserAppNav } from '@/app/_components/UserAppNav';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Storiful',
  description: 'Storiful web app for your inventory'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center overflow-auto px-10 pt-6 xl:px-28">
          <SpeedInsights />
          <Analytics />
          <UserAppNav />
          <div className="min-w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
