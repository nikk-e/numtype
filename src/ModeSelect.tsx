import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ModeSelect.css';

const ModeSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mode-select">
      <button onClick={() => navigate('/1p')} className="mode-button">
        1P Mode
      </button>
      <button onClick={() => navigate('/2p')} className="mode-button">
        2P Mode
      </button>
    </div>
  );
};

export default ModeSelect;
