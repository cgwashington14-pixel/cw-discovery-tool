import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CW Discovery Tool — State & Local Government',
  description:
    'DocuSign IAM workflow discovery wizard for Solutions Consultants. Map customer approval processes and identify where DocuSign can drive the most impact.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full bg-[#F8F7FF] text-[#1A1535] antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
