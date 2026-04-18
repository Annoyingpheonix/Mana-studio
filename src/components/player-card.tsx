'use client';

import { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/game-context';
import type { Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Minus,
  Plus,
  Heart,
  Crown,
  Trash2,
  ChevronsUpDown,
  User,
  Biohazard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { state, updatePlayerLife, updateCommanderDamage, removePlayer, updatePlayerName, updatePoisonCounters } = useGame();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(player.name);
  const [lifeChange, setLifeChange] = useState<'' | 'up' | 'down'>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingName]);

  const handleNameChange = () => {
    if (name.trim() && name.trim() !== player.name) {
      updatePlayerName(player.id, name.trim());
    } else {
        setName(player.name);
    }
    setIsEditingName(false);
  };

  const handleLifeChange = (amount: number) => {
    updatePlayerLife(player.id, amount);
    setLifeChange(amount > 0 ? 'up' : 'down');
    setTimeout(() => setLifeChange(''), 500);
  };

  const isDefeated = player.life <= 0 || player.commanderDamage.some(cd => cd.damage >= 21) || player.poisonCounters >= 10;

  return (
    <Card className={cn('relative flex flex-col transition-all duration-300', isDefeated ? 'bg-muted/50' : 'bg-card')}>
        {isDefeated && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-destructive/80">
                <span className="transform -rotate-12 select-none font-headline text-5xl font-bold text-destructive-foreground/90">
                    DEFEATED
                </span>
            </div>
        )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary"/>
            {isEditingName ? (
                <Input
                    ref={inputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                    className="h-8 text-lg font-bold"
                />
            ) : (
                <h3
                    className="text-lg font-bold cursor-pointer hover:text-primary"
                    onClick={() => setIsEditingName(true)}
                >
                    {player.name}
                </h3>
            )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {player.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this player from the game?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => removePlayer(player.id)}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-center">
        <div className="flex items-center justify-center gap-4 my-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => handleLifeChange(-1)}
          >
            <Minus className="h-6 w-6" />
          </Button>
          <div className="text-center">
            <Heart className="h-8 w-8 mx-auto text-destructive" />
            <span
              className={cn(
                'text-7xl font-bold tracking-tighter tabular-nums',
                lifeChange === 'up' && 'animate-life-up',
                lifeChange === 'down' && 'animate-life-down',
              )}
            >
              {player.life}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => handleLifeChange(1)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        <Collapsible>
            <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-center gap-2 text-muted-foreground">
                Counters & Damage
                <ChevronsUpDown className="h-4 w-4" />
            </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div className="flex items-center gap-2">
                        <Biohazard className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">Poison Counters</span>
                    </div>
                    <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updatePoisonCounters(player.id, -1)}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg tabular-nums">
                        {player.poisonCounters || 0}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updatePoisonCounters(player.id, 1)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    </div>
                </div>

                {state.players.length > 1 && (
                    <>
                        <div className="flex items-center gap-2 text-muted-foreground pt-2">
                            <Crown className="h-4 w-4"/>
                            <span className="font-medium text-sm">Commander Damage</span>
                        </div>
                        {state.players
                            .filter((p) => p.id !== player.id)
                            .map((opponent) => (
                            <div
                                key={opponent.id}
                                className="flex items-center justify-between rounded-md border px-3 py-2"
                            >
                                <span className="font-medium text-sm">{opponent.name}</span>
                                <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateCommanderDamage(player.id, opponent.id, -1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold text-lg tabular-nums">
                                    {player.commanderDamage.find(cd => cd.sourcePlayerId === opponent.id)?.damage || 0}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateCommanderDamage(player.id, opponent.id, 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                </div>
                            </div>
                            ))}
                    </>
                )}
            </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
