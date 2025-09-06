import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModeSelect.css';

const ModeSelect: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'1p' | '2p'>('1p');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0') {
        e.preventDefault();
        setSelectedMode(current => current === '1p' ? '2p' : '1p');
      } else if (e.key === '-') {
        e.preventDefault();
        navigate(selectedMode === '1p' ? '/1p' : '/2p');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMode, navigate]);

  return (
    <div className="mode-select">
      <button 
        onClick={() => navigate('/1p')} 
        className={`mode-button ${selectedMode === '1p' ? 'selected' : ''}`}
      >
        1P Mode
      </button>
      <button 
        onClick={() => navigate('/2p')} 
        className={`mode-button ${selectedMode === '2p' ? 'selected' : ''}`}
      >
        2P Mode
      </button>
    </div>
  );
};

export default ModeSelect;
