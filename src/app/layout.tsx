import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserAppNav } from '@/app/_components/UserAppNav';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

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
        <main className="flex min-h-screen flex-col items-center pt-6 px-10 xl:px-32 overflow-auto">
          <SpeedInsights />
          <Analytics />
          <UserAppNav />
          <div className="min-w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
