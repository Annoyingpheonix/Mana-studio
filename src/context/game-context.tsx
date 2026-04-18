'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { Player, GameState, GameEvent, CommanderDamage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STARTING_LIFE = 40;

type GameAction =
  | { type: 'ADD_PLAYER'; payload: { name: string } }
  | { type: 'REMOVE_PLAYER'; payload: { playerId: string } }
  | { type: 'UPDATE_PLAYER_NAME'; payload: { playerId: string; newName: string } }
  | { type: 'UPDATE_PLAYER_LIFE'; payload: { playerId: string; amount: number } }
  | { type: 'UPDATE_COMMANDER_DAMAGE'; payload: { playerId: string; sourcePlayerId: string; amount: number } }
  | { type: 'UPDATE_POISON_COUNTERS'; payload: { playerId: string; amount: number } }
  | { type: 'ADD_HISTORY_EVENT'; payload: { description: string } }
  | { type: 'RESET_GAME' }
  | { type: 'NEW_GAME' }
  | { type: 'LOAD_STATE'; payload: GameState };

interface GameContextProps {
  state: GameState;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerName: (playerId: string, newName: string) => void;
  updatePlayerLife: (playerId: string, amount: number) => void;
  updateCommanderDamage: (playerId: string, sourcePlayerId: string, amount: number) => void;
  updatePoisonCounters: (playerId: string, amount: number) => void;
  addHistoryEvent: (description: string) => void;
  resetGame: () => void;
  newGame: () => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: action.payload.name,
        life: STARTING_LIFE,
        commanderDamage: [],
        poisonCounters: 0,
      };
      const updatedPlayers = [...state.players, newPlayer];
      return {
        ...state,
        players: updatedPlayers.map(p => ({
          ...p,
          commanderDamage: updatedPlayers
            .filter(op => op.id !== p.id)
            .map(op => {
              const existingDamage = p.commanderDamage.find(cd => cd.sourcePlayerId === op.id);
              return {
                sourcePlayerId: op.id,
                sourcePlayerName: op.name,
                damage: existingDamage?.damage || 0,
              };
            }),
        })),
        history: [...state.history, { id: crypto.randomUUID(), timestamp: new Date().toISOString(), description: `${action.payload.name} joined the game.` }],
      };
    }
    case 'REMOVE_PLAYER': {
        const playerToRemove = state.players.find(p => p.id === action.payload.playerId);
        const updatedPlayers = state.players.filter(p => p.id !== action.payload.playerId);
        return {
            ...state,
            players: updatedPlayers.map(p => ({
                ...p,
                commanderDamage: p.commanderDamage.filter(cd => cd.sourcePlayerId !== action.payload.playerId)
            })),
            history: [...state.history, { id: crypto.randomUUID(), timestamp: new Date().toISOString(), description: `${playerToRemove?.name} left the game.` }],
        }
    }
    case 'UPDATE_PLAYER_NAME': {
        return {
            ...state,
            players: state.players.map(p => p.id === action.payload.playerId ? { ...p, name: action.payload.newName } : p)
        }
    }
    case 'UPDATE_PLAYER_LIFE': {
      const player = state.players.find(p => p.id === action.payload.playerId);
      const newLife = player ? player.life + action.payload.amount : 0;
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId ? { ...p, life: newLife } : p
        ),
      };
    }
    case 'UPDATE_COMMANDER_DAMAGE': {
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id === action.payload.playerId) {
            const newCommanderDamage = p.commanderDamage.map(cd => {
              if (cd.sourcePlayerId === action.payload.sourcePlayerId) {
                return { ...cd, damage: Math.max(0, cd.damage + action.payload.amount) };
              }
              return cd;
            });
            return { ...p, commanderDamage: newCommanderDamage };
          }
          return p;
        }),
      };
    }
    case 'UPDATE_POISON_COUNTERS': {
        return {
            ...state,
            players: state.players.map(p => {
                if (p.id === action.payload.playerId) {
                    return { ...p, poisonCounters: Math.max(0, p.poisonCounters + action.payload.amount) };
                }
                return p;
            }),
        };
    }
    case 'ADD_HISTORY_EVENT':
      return {
        ...state,
        history: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), description: action.payload.description }, ...state.history],
      };
    case 'RESET_GAME':
      return { players: [], history: [] };
    case 'NEW_GAME': {
        return {
            ...state,
            players: state.players.map(p => ({
                ...p,
                life: STARTING_LIFE,
                poisonCounters: 0,
                commanderDamage: p.commanderDamage.map(cd => ({...cd, damage: 0})),
            })),
            history: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), description: 'New game started. Scores and counters reset.' }, ...state.history]
        }
    }
    case 'LOAD_STATE':
      return action.payload;
    default: {
      // This should not be reached if all action types are handled
      console.error(`Unhandled action type: ${(action as any).type}`);
      return state;
    }
  }
};

const initialState: GameState = {
  players: [],
  history: [],
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('mana-counter-game');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState && Array.isArray(parsedState.players)) {
            // Add default values for new properties if they don't exist in saved state
            parsedState.players = parsedState.players.map((p: any) => ({
                ...p,
                poisonCounters: p.poisonCounters ?? 0,
            }));
            dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (state !== initialState) {
        try {
            localStorage.setItem('mana-counter-game', JSON.stringify(state));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }
  }, [state]);

  const addPlayer = useCallback((name: string) => {
    dispatch({ type: 'ADD_PLAYER', payload: { name } });
    toast({ title: "Player Added", description: `${name} has joined the game.` });
  }, [toast]);

  const removePlayer = useCallback((playerId: string) => {
    const playerName = state.players.find(p => p.id === playerId)?.name;
    dispatch({ type: 'REMOVE_PLAYER', payload: { playerId } });
    toast({ title: "Player Removed", description: `${playerName || 'A player'} has left the game.`, variant: 'destructive' });
  }, [state.players, toast]);

  const updatePlayerName = useCallback((playerId: string, newName: string) => {
    const oldName = state.players.find(p => p.id === playerId)?.name;
    dispatch({ type: 'UPDATE_PLAYER_NAME', payload: { playerId, newName } });
    dispatch({ type: 'ADD_HISTORY_EVENT', payload: { description: `${oldName} is now known as ${newName}.` } });
  }, [state.players]);

  const updatePlayerLife = useCallback((playerId: string, amount: number) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    dispatch({ type: 'UPDATE_PLAYER_LIFE', payload: { playerId, amount } });
    const changeText = amount > 0 ? `gained ${amount}` : `lost ${-amount}`;
    dispatch({ type: 'ADD_HISTORY_EVENT', payload: { description: `${player.name} ${changeText} life. New total: ${player.life + amount}.` } });

    if (player.life + amount <= 0) {
      toast({
        title: "Player Defeated!",
        description: `${player.name} has been defeated!`,
        variant: 'destructive',
      });
    }
  }, [state.players, toast]);
  
  const updateCommanderDamage = useCallback((playerId: string, sourcePlayerId: string, amount: number) => {
    const player = state.players.find(p => p.id === playerId);
    const sourcePlayer = state.players.find(p => p.id === sourcePlayerId);
    if (!player || !sourcePlayer) return;

    dispatch({ type: 'UPDATE_COMMANDER_DAMAGE', payload: { playerId, sourcePlayerId, amount } });
    const currentDamage = player.commanderDamage.find(cd => cd.sourcePlayerId === sourcePlayerId)?.damage || 0;
    const changeText = amount > 0 ? `took ${amount}` : `healed ${-amount}`;
    dispatch({ type: 'ADD_HISTORY_EVENT', payload: { description: `${player.name} ${changeText} commander damage from ${sourcePlayer.name}. New total: ${currentDamage + amount}.` } });
    
    if (currentDamage + amount >= 21) {
        toast({
            title: "Player Defeated!",
            description: `${player.name} has been defeated by commander damage from ${sourcePlayer.name}!`,
            variant: 'destructive',
        });
    }
  }, [state.players, toast]);

  const updatePoisonCounters = useCallback((playerId: string, amount: number) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    dispatch({ type: 'UPDATE_POISON_COUNTERS', payload: { playerId, amount } });
    const changeText = amount > 0 ? `gained ${amount}` : `removed ${-amount}`;
    dispatch({ type: 'ADD_HISTORY_EVENT', payload: { description: `${player.name} ${changeText} poison counter(s). New total: ${player.poisonCounters + amount}.` } });

    if (player.poisonCounters + amount >= 10) {
        toast({
            title: "Player Defeated!",
            description: `${player.name} has been defeated by poison!`,
            variant: 'destructive',
        });
    }
  }, [state.players, toast]);

  const addHistoryEvent = useCallback((description: string) => {
    dispatch({ type: 'ADD_HISTORY_EVENT', payload: { description } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    toast({ title: "Game Reset", description: "All players and history have been cleared." });
  }, [toast]);

  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
    toast({ title: "New Game Started", description: "Player scores and counters have been reset." });
  }, [toast]);
  
  return (
    <GameContext.Provider value={{ state, addPlayer, removePlayer, updatePlayerName, updatePlayerLife, updateCommanderDamage, updatePoisonCounters, addHistoryEvent, resetGame, newGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextProps => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
