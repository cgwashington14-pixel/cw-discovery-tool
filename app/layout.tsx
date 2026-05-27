import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CW Discovery Tool — State & Local Government',
  description:
    'DocuSign IAM workflow discovery wizard for Solutions Consultants. Map customer approval processes and identify where DocuSign can drive the most impact.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#FAFAFA] text-[#18181B] antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
