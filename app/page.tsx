'use client';

import { useTheme } from 'next-themes';
import React from 'react';

const HomePage: React.FC<unknown> = () => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                Chainboard
              </span>
            </a>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="/docs"
              >
                Docs
              </a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center">
              {/* <ThemeSwitcher className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0" /> */}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid gap-8 grid-cols-1">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          The shareable on-chain notebook
        </p>
        <div className="h-[800px]"></div>
      </main>
    </div>
  );
};

export default HomePage;
