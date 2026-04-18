'use client';

import { useGame } from '@/context/game-context';
import { PlayerCard } from '@/components/player-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, RotateCcw, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function LifeTrackerPage() {
  const { state, addPlayer, resetGame, newGame } = useGame();
  const { players } = state;
  const [newPlayerName, setNewPlayerName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">
          Mana Counter
        </h1>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
                <DialogDescription>
                  Enter the name for the new player. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="col-span-3"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddPlayer}>Save player</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={players.length === 0}>
                <RefreshCw />
                New Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start a new game?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all player life totals, counters, and commander damage, but will keep the current players. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={newGame}>
                  Yes, start new game
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={players.length === 0}>
                <RotateCcw />
                Reset Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all players and clear the game history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetGame}>
                  Yes, reset it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {players.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-lg border-2 border-dashed border-muted-foreground/30">
          <p className="text-lg font-medium text-muted-foreground">
            Welcome to Mana Counter!
          </p>
          <p className="text-sm text-muted-foreground/80 mb-4">
            Click the button below to add players and start tracking life totals.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Start by Adding a Player
          </Button>
        </div>
      )}
    </div>
  );
}
