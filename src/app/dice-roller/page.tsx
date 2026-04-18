import { DiceRollerUI } from '@/components/dice-roller-ui';

export default function DiceRollerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">
        Dice Roller
      </h1>
      <DiceRollerUI />
    </div>
  );
}
