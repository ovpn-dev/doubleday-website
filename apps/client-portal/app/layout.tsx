import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doubleday OS | Client Portal',
  description: 'Your ISO certification project, in one place.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}
