import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { Toaster } from '@/components/ui/toaster';
import { GameProvider } from '@/context/game-context';

export const metadata: Metadata = {
  title: 'Mana Counter',
  description: 'Life counter and dice roller for Magic: The Gathering',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <GameProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </GameProvider>
      </body>
    </html>
  );
}
