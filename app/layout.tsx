import React from 'react';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import { cn } from './utils';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Chrome AI',
  description: 'Vercel AI provider for Chrome built-in model (Gemini Nano)',
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <html suppressHydrationWarning>
    <head />
    <body
      className={cn(
        'min-h-screen bg-background text-foreground',
        inter.variable
      )}
    >
      <ThemeProvider attribute="class" defaultTheme="system">
        {children}
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
