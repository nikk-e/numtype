import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ModeSelect.css';

function test() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
    devices.forEach((device) => {
      console.log(device); // an InputDeviceInfo object if the device is an input device, otherwise a MediaDeviceInfo object.
    });
  });
  }

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
      <button onClick={ test } className="mode-button">
        Test
      </button>
    </div>
  );
};

export default ModeSelect;
