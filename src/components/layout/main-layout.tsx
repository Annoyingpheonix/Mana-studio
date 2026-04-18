'use client';

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';

const MobileHeader = () => {
    const { toggleSidebar } = useSidebar();
    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
            <Button size="icon" variant="outline" className="sm:hidden" onClick={toggleSidebar}>
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            <h1 className="text-xl font-bold font-headline text-primary">Mana Counter</h1>
        </header>
    )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
            <Sidebar>
                <SidebarNav />
            </Sidebar>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <MobileHeader />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  );
}
