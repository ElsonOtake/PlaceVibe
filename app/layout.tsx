import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Every Visited Spot — Personal Spot & Cafe Journal',
  description: 'A personal journal for rating and tracking visits to spots like coffee shops, bookstores, and restaurants with Google Maps location intelligence.',
  openGraph: {
    title: 'Every Visited Spot',
    description: 'A personal journal for rating and tracking visits to spots like coffee shops, bookstores, and restaurants with Google Maps location intelligence.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Every Visited Spot',
    description: 'A personal journal for rating and tracking visits to spots like coffee shops, bookstores, and restaurants with Google Maps location intelligence.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
