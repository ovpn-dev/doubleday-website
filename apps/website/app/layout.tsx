import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doubleday Expressions | Management Consulting',
  description: 'ISO management systems, HSE, information security, and management consulting in Nigeria.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
