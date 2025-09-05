import { useState, useEffect } from 'react';
import { sentences } from '../data/sentences';

type WritingMode = 'abc' | 'ABC';

export interface KeyboardConfig {
  phoneMap: { [key: string]: string[] };
  modeSwitchKey: string;
}

export interface UseTypingGameProps {
  targetText: string;
  isTestActive: boolean;
  timeLeft: number;
  keyboardConfig: KeyboardConfig;
  onTestEnd: () => void;
}

export interface UseTypingGameReturn {
  text: string;
  writingMode: WritingMode;
  accuracy: number;
  wpm: number;
  validCharCount: number;
  handleKeyDown: (e: KeyboardEvent) => void;
  reset: () => void;
}

export const useTypingGame = ({
  targetText,
  isTestActive,
  timeLeft,
  keyboardConfig,
  onTestEnd,
}: UseTypingGameProps): UseTypingGameReturn => {
  const [text, setText] = useState('');
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [pressCount, setPressCount] = useState(0);
  const [lastPressTime, setLastPressTime] = useState<number>(0);
  const [writingMode, setWritingMode] = useState<WritingMode>('abc');
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!startTime && isTestActive) {
      setStartTime(Date.now());
    }
  }, [isTestActive]);

  const getValidCharCount = (): number => {
    const typedChars = text.split('');
    const targetChars = targetText.split('');
    let validChars = 0;

    for (let i = 0; i < typedChars.length; i++) {
      if (typedChars[i] === targetChars[i]) {
        validChars++;
      }
    }

    return validChars;
  };

  const calculateAccuracy = (): number => {
    const typedChars = text.split('');
    const targetChars = targetText.split('');
    let correctChars = 0;
    let totalCharsTyped = typedChars.length;

    for (let i = 0; i < totalCharsTyped; i++) {
      if (typedChars[i] === targetChars[i]) {
        correctChars++;
      }
    }

    if (totalCharsTyped === 0) return 100;
    return Math.round((correctChars / totalCharsTyped) * 100);
  };

  const calculateWPM = (): number => {
    const validChars = getValidCharCount();
    const timeInSeconds = startTime ? Math.max((Date.now() - startTime) / 1000, 1) : 1;
    return Math.round((validChars / 5) * (60 / timeInSeconds));
  };

  const formatText = (char: string): string => {
    return writingMode === 'ABC' ? char.toUpperCase() : char.toLowerCase();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    let key = e.key;
    if (key.startsWith('Numpad') || key.startsWith('Digit')) {
      key = key.slice(-1);
    }
    
    // Return early only if the timer has run out
    if (timeLeft === 0) {
      return;
    }

    if (key === keyboardConfig.modeSwitchKey) {
      e.preventDefault();
      setWritingMode(current => current === 'abc' ? 'ABC' : 'abc');
      return;
    }

    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault();
      if (text.length > 0) {
        setText(text.slice(0, -1));
        setLastKey(null);
        setPressCount(0);
        setLastPressTime(Date.now());
      }
      return;
    }

    if (!keyboardConfig.phoneMap[key]) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const now = Date.now();

    if (key === lastKey && now - lastPressTime < 1000) {
      setPressCount((prev) => {
        const letters = keyboardConfig.phoneMap[key];
        const formattedChar = formatText(letters[(prev + 1) % letters.length]);
        const newText = text.slice(0, -1) + formattedChar;
        setText(newText);
        return (prev + 1) % letters.length;
      });
    } else {
      setPressCount(0);
      const formattedChar = formatText(keyboardConfig.phoneMap[key][0]);
      setText(text + formattedChar);
    }

    setLastKey(key);
    setLastPressTime(now);
  };

  const reset = () => {
    setText('');
    setLastKey(null);
    setPressCount(0);
    setLastPressTime(0);
    setWritingMode('abc');
    setStartTime(null);
  };

  return {
    text,
    writingMode,
    accuracy: calculateAccuracy(),
    wpm: calculateWPM(),
    validCharCount: getValidCharCount(),
    handleKeyDown,
    reset,
  };
};
