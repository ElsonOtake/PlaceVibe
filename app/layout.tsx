import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'PlaceVibe — Personal Spot & Cafe Visit Journal',
  description: 'A personal journal for rating and tracking visits to spots like coffee shops, bookstores, and restaurants.',
  openGraph: {
    title: 'PlaceVibe — Personal Spot & Cafe Visit Journal',
    description: 'A personal journal for rating and tracking visits to spots like coffee shops, bookstores, and restaurants.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlaceVibe — Personal Spot & Cafe Visit Journal',
    description: 'A personal journal for rating and tracking visits to spots like coffee shops, bookstores, and restaurants.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
