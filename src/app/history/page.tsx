'use client';

import { useGame } from '@/context/game-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
  const { state } = useGame();
  const { history } = state;

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">
        Game History
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
          <CardDescription>A log of all actions taken during this game session.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <History className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
                <History className="h-16 w-16 opacity-50" />
                <h3 className="text-xl font-semibold">No Events Yet</h3>
                <p className="text-sm max-w-xs mx-auto">
                  As you play, a log of all actions like life changes and dice rolls will appear here.
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
