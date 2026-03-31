import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ReadmitAI | Healthcare Analytics Dashboard',
  description: 'Predicting 30-day hospital readmissions with an interactive analytics dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
