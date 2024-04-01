import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppNav } from '@/components/AppNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Storiful',
  description: 'Generated by create next app'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center pt-12 px-32 overflow-auto">
          <AppNav />
          <div className="min-w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
