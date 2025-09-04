import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameLayout.css';

interface GameLayoutProps {
  children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="game-layout">
      <button 
        onClick={() => navigate('/')} 
        className="back-button"
        aria-label="Back to mode selection"
      >
        ← Back
      </button>
      <div className="game-content">
        {children}
      </div>
    </div>
  );
};

export default GameLayout;
