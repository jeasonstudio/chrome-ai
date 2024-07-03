'use client';

import * as React from 'react';
import { Sun, MoonStar } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '../utils';

export interface ThemeSwitcherProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  align?: 'start' | 'end' | 'center';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  align = 'start',
  className,
  ...props
}) => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        {...props}
        className={cn(
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'theme-switcher',
          className
        )}
      >
        <Button size="icon" variant="ghost">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonStar className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
