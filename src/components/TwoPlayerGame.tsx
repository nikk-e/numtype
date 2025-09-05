import React, { useState, useEffect } from 'react';
import { useTypingGame, type KeyboardConfig } from '../hooks/useTypingGame';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import Player from './Player';
import { sentences } from '../data/sentences';
import './TwoPlayerGame.css';

// Both players now use the same number key layout
const numberKeyConfig: KeyboardConfig = {
  phoneMap: {
    '7': ['.', ',', '?', '!', '\'', '\"', '-', '(', ')', '@', '/', ':', '1'],
    '8': ['a', 'b', 'c'],
    '9': ['d', 'e', 'f'],
    '4': ['g', 'h', 'i'],
    '5': ['j', 'k', 'l'],
    '6': ['m', 'n', 'o'],
    '1': ['p', 'q', 'r', 's'],
    '2': ['t', 'u', 'v'],
    '3': ['w', 'x', 'y', 'z'],
    '0': [' '],
    'Backspace': [''],
  },
  modeSwitchKey: '+',
};

const TwoPlayerGame: React.FC = () => {
  const [targetText, setTargetText] = useState(() => sentences[Math.floor(Math.random() * sentences.length)]);
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [testCompleted, setTestCompleted] = useState(false);
  
  const { getPlayerForDevice, assignedDevices, resetDeviceAssignments } = useDeviceDetection();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTestActive(false);
      setTestCompleted(true);
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const handleTestEnd = () => {
    setIsTestActive(false);
    setTestCompleted(true);
  };

  const startNewGame = (isFirstGame?: boolean) => {
    // Only keep the current sentence if explicitly starting first game
    if (isFirstGame !== true) {
      setTargetText(sentences[Math.floor(Math.random() * sentences.length)]);
    }
    player1Game.reset();
    player2Game.reset();
    setTimeLeft(60);
    setTestCompleted(false);
    resetDeviceAssignments(); // Reset device assignments for new game
    // Don't set isTestActive here - let the first keypress do it
  };

  const player1Game = useTypingGame({
    targetText,
    isTestActive,
    timeLeft,
    keyboardConfig: numberKeyConfig,
    onTestEnd: handleTestEnd,
  });

  const player2Game = useTypingGame({
    targetText,
    isTestActive,
    timeLeft,
    keyboardConfig: numberKeyConfig,
    onTestEnd: handleTestEnd,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if this is a valid number key or mode switch
      const isValidKey = Object.keys(numberKeyConfig.phoneMap).includes(e.key) || e.key === numberKeyConfig.modeSwitchKey;
      
      if (!isValidKey) return;

      // Get device info to determine which player this input belongs to
      const deviceId = `${e.location === 3 ? "numpad" : "standard"}-${e.code}`;
      const playerNumber = getPlayerForDevice(deviceId);
      
      // If no player assigned yet, auto-assign based on device detection
      if (!isTestActive && !testCompleted) {
        startNewGame(true);
        setIsTestActive(true);
        
        // Handle the first keypress for the appropriate player
        if (playerNumber === 1) {
          player1Game.handleKeyDown(e);
        } else if (playerNumber === 2) {
          player2Game.handleKeyDown(e);
        } else {
          // If no player assigned, let device detection handle it in the background
          // The key will be processed in the next event after device assignment
        }
        return;
      }

      // Regular gameplay - route to appropriate player based on device
      if (isTestActive) {
        if (playerNumber === 1) {
          player1Game.handleKeyDown(e);
        } else if (playerNumber === 2) {
          player2Game.handleKeyDown(e);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player1Game, player2Game]);

  const determineWinner = () => {
    if (!testCompleted) return null;
    if (player1Game.wpm === player2Game.wpm) return "It's a tie!";
    return player1Game.wpm > player2Game.wpm ? "Player 1 wins!" : "Player 2 wins!";
  };

  return (
    <div className="two-player-game">
      {/* Device assignment status */}
      <div className="device-status">
        <div>
          Player 1: {assignedDevices.player1 ? 
            `${assignedDevices.player1.keyboardLocation} (${assignedDevices.player1.platform})` : 
            'No device assigned'}
        </div>
        <div>
          Player 2: {assignedDevices.player2 ? 
            `${assignedDevices.player2.keyboardLocation} (${assignedDevices.player2.platform})` : 
            'No device assigned'}
        </div>
      </div>

      <div className="players-container">
        <Player
          playerNumber={1}
          targetText={targetText}
          gameState={player1Game}
          isTestActive={isTestActive}
          timeLeft={timeLeft}
        />
        
        <Player
          playerNumber={2}
          targetText={targetText}
          gameState={player2Game}
          isTestActive={isTestActive}
          timeLeft={timeLeft}
        />
      </div>

      {testCompleted && (
        <div className="game-results">
          <h2>{determineWinner()}</h2>
          <button onClick={() => startNewGame()} className="retry-button">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoPlayerGame;
