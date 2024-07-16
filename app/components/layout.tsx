'use client';

import React from 'react';
import {
  SquareTerminal,
  Chrome,
  Github,
  Twitter,
  SquareKanban,
  FileInput,
  FileDiff,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '../components/ui/tooltip';
import { ThemeSwitcher } from '../components/theme-switcher';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../utils';

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  children,
}) => {
  const pathname = usePathname();

  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="ghost" size="icon" aria-label="Home" asChild>
            <Link href="/">
              <Chrome className="size-6" />
            </Link>
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('rounded-lg', pathname === '/' && 'bg-muted')}
                  aria-label="Message Playground"
                  asChild
                >
                  <Link href="/">
                    <SquareTerminal className="size-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Chat Playground
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-lg',
                    pathname === '/orders' && 'bg-muted'
                  )}
                  aria-label="Orders Playground"
                  asChild
                >
                  <Link href="/orders">
                    <SquareKanban className="size-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Orders Playground
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-lg',
                    pathname === '/smart-form' && 'bg-muted'
                  )}
                  aria-label="Smart Form Playground"
                  asChild
                >
                  <Link href="/smart-form">
                    <FileInput className="size-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Smart Form Playground
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-lg',
                    pathname === '/embedding' && 'bg-muted'
                  )}
                  aria-label="Embedding Playground"
                  asChild
                >
                  <Link href="/embedding">
                    <FileDiff className="size-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Embedding Playground
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        {/* <nav className="mt-auto grid gap-1 p-2">
          <ThemeSwitcher />
        </nav> */}
      </aside>
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h2 className="text-xl font-semibold">Chrome AI</h2>

          {/* <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="size-3.5" />
            Share
          </Button> */}

          <Button variant="ghost" className="ml-auto" size="icon" asChild>
            <Link
              href="https://github.com/jeasonstudio/chrome-ai"
              target="_blank"
            >
              <Github className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://twitter.com/jeasonstudio" target="_blank">
              <Twitter className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>
          <ThemeSwitcher align="end" className="gap-1.5 text-sm" />
        </header>
        {children}
      </div>
    </div>
  );
};
