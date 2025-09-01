import { useState } from 'react'
import TypingBox from './TypingBox'
import './App.css'


function App() {
  return (
    <div className="main-container">
      <header className="main-header">
        <h1>NumType</h1>
        <p className="subtitle">Type like an old phone keypad</p>
      </header>
      <div>
        <TypingBox />
      </div>
    </div>
  );
}

export default App
