import React, { useState, useEffect } from 'react';
import { useTypingGame, type KeyboardConfig } from '../hooks/useTypingGame';
import Player from './Player';
import { sentences } from '../data/sentences';
import './TwoPlayerGame.css';

const player1Keys: KeyboardConfig = {
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

const player2Keys: KeyboardConfig = {
  phoneMap: {
    'u': ['.', ',', '?', '!', '\'', '\"', '-', '(', ')', '@', '/', ':', '1'],
    'i': ['a', 'b', 'c'],
    'o': ['d', 'e', 'f'],
    'j': ['g', 'h', 'i'],
    'k': ['j', 'k', 'l'],
    'l': ['m', 'n', 'o'],
    'm': ['p', 'q', 'r', 's'],
    ',': ['t', 'u', 'v'],
    '.': ['w', 'x', 'y', 'z'],
    'space': [' '],
    'Delete': [''],  // Using Delete key for player 2's backspace
  },
  modeSwitchKey: '/',
};

const TwoPlayerGame: React.FC = () => {
  const [targetText, setTargetText] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [testCompleted, setTestCompleted] = useState(false);
  
  useEffect(() => {
    setTargetText(sentences[Math.floor(Math.random() * sentences.length)]);
  }, []);

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

  const startNewGame = () => {
    setTargetText(sentences[Math.floor(Math.random() * sentences.length)]);
    setTimeLeft(60);
    setIsTestActive(true);
    setTestCompleted(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTestActive && !testCompleted && 
          (player1Keys.phoneMap[e.key] || player2Keys.phoneMap[e.key])) {
        startNewGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTestActive, testCompleted]);

  const player1Game = useTypingGame({
    targetText,
    isTestActive,
    timeLeft,
    keyboardConfig: player1Keys,
    onTestEnd: handleTestEnd,
  });

  const player2Game = useTypingGame({
    targetText,
    isTestActive,
    timeLeft,
    keyboardConfig: player2Keys,
    onTestEnd: handleTestEnd,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Player 1 keys
      if (Object.keys(player1Keys.phoneMap).includes(e.key) || e.key === player1Keys.modeSwitchKey) {
        player1Game.handleKeyDown(e);
      }
      // Player 2 keys
      if (Object.keys(player2Keys.phoneMap).includes(e.key) || e.key === player2Keys.modeSwitchKey) {
        player2Game.handleKeyDown(e);
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

      {testCompleted && (
        <div className="game-results">
          <h2>{determineWinner()}</h2>
          <button onClick={startNewGame} className="retry-button">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoPlayerGame;
