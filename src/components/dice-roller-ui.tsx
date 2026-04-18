'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, CircleDollarSign } from 'lucide-react';
import { DiceType, DiceRoll } from '@/lib/types';
import { useGame } from '@/context/game-context';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const diceTypes: DiceType[] = [4, 6, 8, 10, 12, 20, 100];

type DiceRollHistory = {
  type: 'dice';
  notation: string;
  rolls: DiceRoll[];
  total: number;
  id: string;
}

type CoinFlipHistory = {
    type: 'coin';
    result: 'Heads' | 'Tails';
    id: string;
}

type RollerHistory = DiceRollHistory | CoinFlipHistory;

function Dice({ value, isRolling }: { value: number; isRolling: boolean }) {
  return (
    <div
      className={cn(
        'flex h-24 w-24 items-center justify-center rounded-lg bg-primary/10 text-4xl font-bold text-primary shadow-inner transition-all duration-100',
        isRolling && 'animate-pulse'
      )}
    >
      {isRolling ? '...' : value}
    </div>
  );
}

function CoinDisplay({ result, isFlipping }: { result: string | null; isFlipping: boolean }) {
  return (
    <div
      className={cn(
        'flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary shadow-inner transition-all duration-100',
        isFlipping && 'animate-pulse'
      )}
    >
      {isFlipping ? '...' : result}
    </div>
  );
}

export function DiceRollerUI() {
  const [diceCount, setDiceCount] = useState(1);
  const [diceType, setDiceType] = useState<DiceType>(20);
  const [currentRoll, setCurrentRoll] = useState<DiceRoll[]>([]);
  const [history, setHistory] = useState<RollerHistory[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [key, setKey] = useState(0); // To re-trigger animation
  const { addHistoryEvent } = useGame();

  const [coinResult, setCoinResult] = useState<'Heads' | 'Tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);
    setCoinResult(null); // Clear coin result

    setTimeout(() => {
      const newRolls = Array.from({ length: diceCount }, () => ({
        type: diceType,
        value: Math.floor(Math.random() * diceType) + 1,
      }));
      
      const total = newRolls.reduce((sum, roll) => sum + roll.value, 0);
      const notation = `${diceCount}d${diceType}`;
      
      setCurrentRoll(newRolls);
      const newHistoryItem: DiceRollHistory = { type: 'dice', notation, rolls: newRolls, total, id: crypto.randomUUID() };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));

      setIsRolling(false);
      setKey(prev => prev + 1);

      const rollDetails = newRolls.map(r => r.value).join(', ');
      addHistoryEvent(`Rolled ${notation}: ${rollDetails} (Total: ${total})`);
    }, 500);
  };
  
  const handleCoinFlip = () => {
    setIsFlipping(true);
    setCurrentRoll([]); // Clear dice result

    setTimeout(() => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        setCoinResult(result);

        const newCoinHistoryItem: CoinFlipHistory = { type: 'coin', result, id: crypto.randomUUID() };
        setHistory(prev => [newCoinHistoryItem, ...prev].slice(0, 20));

        addHistoryEvent(`Flipped a coin: ${result}`);
        setIsFlipping(false);
        setKey(prev => prev + 1);
    }, 500);
  };

  const total = currentRoll.reduce((sum, roll) => sum + roll.value, 0);
  const isLoading = isRolling || isFlipping;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">Dice Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {diceTypes.map((d) => (
                <Button
                  key={d}
                  variant={diceType === d ? 'default' : 'outline'}
                  onClick={() => setDiceType(d)}
                >
                  d{d}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="dice-count" className="font-medium">Number of Dice</label>
            <Input
              id="dice-count"
              type="number"
              value={diceCount}
              onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value, 10)))}
              min="1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleRoll} disabled={isLoading} size="lg">
                <Dices className="mr-2 h-5 w-5" />
                {isRolling ? 'Rolling...' : 'Roll Dice'}
            </Button>
            <Button onClick={handleCoinFlip} disabled={isLoading} size="lg" variant="outline">
                <CircleDollarSign className="mr-2 h-5 w-5" />
                {isFlipping ? 'Flipping...' : 'Flip Coin'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          {currentRoll.length === 0 && coinResult === null && !isLoading ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground flex-grow">
              <Dices className="h-12 w-12 mb-4" />
              <p>Your results will appear here.</p>
            </div>
          ) : (
            <div key={key} className="space-y-4 flex flex-col items-center justify-center flex-grow animate-in fade-in-50 duration-500">
                {currentRoll.length > 0 && (
                    <>
                        <div className="flex flex-wrap justify-center gap-4">
                        {isRolling ?
                            Array.from({ length: diceCount }).map((_, i) => <Dice key={i} value={0} isRolling={true} />)
                            : currentRoll.map((roll, index) => <Dice key={index} value={roll.value} isRolling={false} />)
                        }
                        </div>
                        {currentRoll.length > 1 && (
                        <div className="text-center font-bold text-xl">
                            Total: <span className="text-primary">{total}</span>
                        </div>
                        )}
                    </>
                )}
                {coinResult !== null && (
                    <CoinDisplay result={coinResult} isFlipping={isFlipping} />
                )}
            </div>
          )}
        </CardContent>
        {history.length > 0 && (
            <>
                <Separator className="my-4"/>
                <CardContent>
                    <h3 className="text-lg font-medium mb-2">Recent Events</h3>
                    <ScrollArea className="h-32">
                        <div className="space-y-3 pr-4">
                        {history.map((hist) => (
                            <div key={hist.id} className="text-sm text-muted-foreground flex justify-between items-center">
                                {hist.type === 'dice' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Dices className="h-4 w-4" />
                                            <span>{hist.notation}: <span className="font-bold text-foreground text-base">{hist.total}</span></span>
                                        </div>
                                        <span className="text-xs truncate">({hist.rolls.map(r => r.value).join(', ')})</span>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            <CircleDollarSign className="h-4 w-4" />
                                            <span>Coin Flip:</span>
                                        </div>
                                        <span className="font-bold text-foreground text-base">{hist.result}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </>
        )}
      </Card>
    </div>
  );
}
