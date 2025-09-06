import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TypingBox.css';
import { sentences } from './data/sentences';

type WritingMode = 'abc' | 'ABC';

const phoneMap: { [key: string]: string[] } = {
	'7': ['.', ',', '?', '!', '\'', '\"', '-', '(', ')', '@', '/', ':', '1'],
	'8': ['a', 'b', 'c'],
	'9': ['d', 'e', 'f'],
	'4': ['g', 'h', 'i'],
	'5': ['j', 'k', 'l'],
	'6': ['m', 'n', 'o'],
	'1': ['p', 'q', 'r', 's'],
	'2': ['t', 'u', 'v'],
	'3': ['w', 'x', 'y', 'z'],
	' ': [' '], // Space key
	',': [''], // Mode switch key
	'Enter': [''], // Backspace key
};

const TypingBox: React.FC = () => {
	const navigate = useNavigate();
	const [text, setText] = useState('');
	const [lastKey, setLastKey] = useState<string | null>(null);
	const [pressCount, setPressCount] = useState(0);
	const [lastPressTime, setLastPressTime] = useState<number>(0);
	const [writingMode, setWritingMode] = useState<WritingMode>('abc');
	
	// New states for typing test
	const [targetText, setTargetText] = useState('');
	const [isTestActive, setIsTestActive] = useState(false);
	const [timeLeft, setTimeLeft] = useState(60);
	const [testCompleted, setTestCompleted] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);

	useEffect(() => {
		// Set initial target text
		setTargetText(sentences[Math.floor(Math.random() * sentences.length)]);
	}, []);

	useEffect(() => {
		let timer: ReturnType<typeof setInterval>;
		if (isTestActive && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft(prev => prev - 1);
			}, 1000);
		} else if (timeLeft === 0) {
			endTest();
		}
		return () => clearInterval(timer);
	}, [isTestActive, timeLeft]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Extract the actual number from numpad or regular number keys
			let key = e.key;
			if (key.startsWith('Numpad') || key.startsWith('Digit')) {
				key = key.slice(-1);
			}

			// Handle "+" key to go back to main menu (always available)
			if (key === '+') {
				e.preventDefault();
				navigate('/');
				return;
			}

			// Handle "-" key to restart game when test is completed
			if (key === '-' && testCompleted) {
				e.preventDefault();
				setText('');
				setTimeLeft(60);
				setTestCompleted(false);
				setStartTime(null);
				setTargetText(sentences[Math.floor(Math.random() * sentences.length)]);
				return;
			}

			// Handle completed test
			if (testCompleted) {
				e.preventDefault();
				return;
			}

			// Start test on first valid key press
			if (!isTestActive && phoneMap[key]) {
				startTest();
			}

			const now = Date.now();

			if (key === ',') {
				e.preventDefault();
				setWritingMode(current => current === 'abc' ? 'ABC' : 'abc');
				return;
			}

			if (key === 'Enter') {
				e.preventDefault();
				setText(text.slice(0, -1));
				setLastKey(null);
				setPressCount(0);
				setLastPressTime(now);
				return;
			}
			if (!phoneMap[key]) {
				e.preventDefault();
				return;
			}

			e.preventDefault();
			let newText = text;
			if (key === lastKey && now - lastPressTime < 1000) {
				setPressCount((prev) => {
					const letters = phoneMap[key];
					const formattedChar = formatText(letters[(prev + 1) % letters.length]);
					newText = newText.slice(0, -1) + formattedChar;
					setText(newText);
					return (prev + 1) % letters.length;
				});
			} else {
				setPressCount(0);
				const formattedChar = formatText(phoneMap[key][0]);
				newText = newText + formattedChar;
				setText(newText);
			}
			setLastKey(key);
			setLastPressTime(now);
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [navigate, testCompleted, isTestActive, text, lastKey, lastPressTime, writingMode]);

	const startTest = () => {
		setText('');
		setTimeLeft(60);
		setIsTestActive(true);
		setTestCompleted(false);
		setStartTime(Date.now());
	};

	const endTest = () => {
		setIsTestActive(false);
		setTestCompleted(true);
	};

	const calculateResults = () => {
		const accuracy = calculateAccuracy();
		const validChars = getValidCharCount();
		
		// Calculate time in seconds, minimum 1 second to avoid division by zero
		const timeInSeconds = startTime ? Math.max((Date.now() - startTime) / 1000, 1) : 1;
		
		// WPM formula: (characters / 5) * (60 / time in seconds)
		const wpm = Math.round((validChars / 5) * (60 / timeInSeconds));
		
		return { wpm, accuracy };
	};

	const getValidCharCount = (): number => {
		const typedChars = text.split('');
		const targetChars = targetText.split('');
		let validChars = 0;

		// Only count characters that match the target text
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

		// Only check up to the number of characters typed
		for (let i = 0; i < totalCharsTyped; i++) {
			if (typedChars[i] === targetChars[i]) {
				correctChars++;
			}
		}

		// If nothing has been typed yet, return 100%
		if (totalCharsTyped === 0) return 100;

		return Math.round((correctChars / totalCharsTyped) * 100);
	};

	const formatText = (char: string): string => {
		return writingMode === 'ABC' ? char.toUpperCase() : char.toLowerCase();
	};

	return (
		<div className="typingbox-container">
			<div className="stats">
				<div className={`timer ${isTestActive && timeLeft <= 10 ? 'low' : ''}`}>
					{isTestActive ? timeLeft : 60}
				</div>
				{testCompleted && (
					<div className="results">
						<h3>Results:</h3>
						<p>WPM: {calculateResults().wpm}</p>
						<p>Accuracy: {calculateResults().accuracy}%</p>
					</div>
				)}
			</div>
			<div className="typingbox-container">
				<div className="target-text">
					{(() => {
						// Split text into words to track current word
						const words = targetText.split(' ');
						const currentCharIndex = text.length;
						
						// Find which word we're currently on
						let currentWordIndex = 0;
						let charsBeforeCurrentWord = 0;
						for (let i = 0; i < words.length; i++) {
							if (charsBeforeCurrentWord + words[i].length + (i > 0 ? 1 : 0) > currentCharIndex) {
								currentWordIndex = i;
								break;
							}
							charsBeforeCurrentWord += words[i].length + (i > 0 ? 1 : 0); // +1 for space
						}

						return targetText.split('').map((char, index) => {
							// Determine if this character is part of the current word
							let isCurrentWord = false;
							let wordStart = 0;
							for (let i = 0; i < words.length; i++) {
								const wordLength = words[i].length + (i > 0 ? 1 : 0); // include space for all but first word
								if (index >= wordStart && index < wordStart + words[i].length) {
									isCurrentWord = (i === currentWordIndex);
									break;
								}
								wordStart += wordLength;
							}

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
						});
					})()}
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
			{testCompleted && (
				<button 
					onClick={() => {
						setText('');
						setTimeLeft(60);
						setTestCompleted(false);
						setStartTime(null);
						setTargetText(sentences[Math.floor(Math.random() * sentences.length)]);
					}} 
					className="retry-button"
				>
					Try Again
				</button>
			)}
		</div>
	);
};

export default TypingBox;
