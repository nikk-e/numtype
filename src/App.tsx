import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TypingBox from './TypingBox';
import ModeSelect from './ModeSelect';
import GameLayout from './GameLayout';
import './App.css';

// Header component that changes subtitle based on route
const Header = () => {
  const location = useLocation();
  const subtitle = location.pathname === '/' 
    ? 'Choose your mode'
    : 'Type like an old phone keypad';

  return (
    <header className="main-header">
      <h1>NumType</h1>
      <p className="subtitle">{subtitle}</p>
    </header>
  );
};

function App() {
  return (
    <Router>
      <div className="main-container">
        <Header />
        <Routes>
          <Route path="/" element={<ModeSelect />} />
          <Route path="/1p" element={<GameLayout><TypingBox /></GameLayout>} />
          <Route path="/2p" element={<GameLayout><div>Coming soon!</div></GameLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
