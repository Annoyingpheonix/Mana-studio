'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, Dices, History, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const navItems = [
  { href: '/', icon: HeartPulse, label: 'Life Tracker' },
  { href: '/dice-roller', icon: Dices, label: 'Dice Roller' },
  { href: '/history', icon: History, label: 'Game History' },
  { href: '/gamer-tag', icon: Sparkles, label: 'Gamer Tag' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 transition-all group-hover:scale-110"
            >
              <path d="M12 2.69l-5.66 5.66a8 8 0 1 0 11.31 0L12 2.69z" />
              <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
            </svg>
            <span className="sr-only">Mana Counter</span>
          </Link>
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                      pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </aside>

      {/* Mobile Sidebar (will be inside a Sheet) */}
      <nav className="flex flex-col items-start gap-2 p-4 sm:hidden">
        <div className="flex items-center gap-2 mb-4">
            <Link
                href="/"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground"
                onClick={() => setOpenMobile(false)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 transition-all group-hover:scale-110"
                >
                    <path d="M12 2.69l-5.66 5.66a8 8 0 1 0 11.31 0L12 2.69z" />
                    <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                </svg>
                <span className="sr-only">Mana Counter</span>
            </Link>
            <span className="text-xl font-bold font-headline text-primary">Mana Counter</span>
        </div>

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpenMobile(false)}
            className={cn(
              'flex w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-medium',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
