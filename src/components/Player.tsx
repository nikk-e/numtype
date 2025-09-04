import React from 'react';
import type { UseTypingGameReturn } from '../hooks/useTypingGame';
import './Player.css';

interface PlayerProps {
  playerNumber: 1 | 2;
  targetText: string;
  gameState: UseTypingGameReturn;
  isTestActive: boolean;
  timeLeft: number;
}

const Player: React.FC<PlayerProps> = ({
  playerNumber,
  targetText,
  gameState,
  isTestActive,
  timeLeft,
}) => {
  const { text, writingMode, accuracy, wpm } = gameState;

  return (
    <div className={`player player-${playerNumber}`}>
      <div className="player-stats">
        <div className={`timer ${isTestActive && timeLeft <= 10 ? 'low' : ''}`}>
          {isTestActive ? timeLeft : 60}
        </div>
        <div className="live-stats">
          <span>WPM: {wpm}</span>
          <span>Accuracy: {accuracy}%</span>
        </div>
      </div>

      <div className="player-typing-area">
        <div className="target-text">
          {targetText.split('').map((char, index) => {
            const isCurrentWord = true; // We'll implement this later
            return (
              <span
                key={index}
                className={`${
                  index < text.length
                    ? text[index] === char
                      ? 'correct'
                      : 'incorrect'
                    : 'remaining'
                } ${isCurrentWord ? 'current-word' : ''} ${
                  char !== ' ' && (
                    (index === text.length && (text.length === 0 || text[text.length - 1] === targetText[text.length - 1])) || 
                    (index < text.length && text[index] !== char)
                  )
                    ? 'current-char' 
                    : ''
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div className="typingbox-textarea-container">
          <textarea
            value={text}
            readOnly
            className="typingbox-textarea"
            tabIndex={-1}
            onFocus={(e) => e.target.blur()}
          />
          <div className="mode-indicator">
            {writingMode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
