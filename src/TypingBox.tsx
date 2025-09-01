import React, { useState } from 'react';
import './TypingBox.css';

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
	'0': [' '],
};

const TypingBox: React.FC = () => {
	const [text, setText] = useState('');
	const [lastKey, setLastKey] = useState<string | null>(null);
	const [pressCount, setPressCount] = useState(0);
	const [lastPressTime, setLastPressTime] = useState<number>(0);
	const [writingMode, setWritingMode] = useState<WritingMode>('abc');

	const handleModeSwitch = () => {
		setWritingMode(current => current === 'abc' ? 'ABC' : 'abc');
	};

	const formatText = (char: string): string => {
		return writingMode === 'ABC' ? char.toUpperCase() : char.toLowerCase();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const now = Date.now();
		const key = e.key;

		if (key === '+') {
			e.preventDefault();
			setWritingMode(current => current === 'abc' ? 'ABC' : 'abc');
			return;
		}

		if (key === 'Backspace') {
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

	return (
		<div className="typingbox-container">
			<div className="mode-indicator">
				{writingMode}
			</div>
			<textarea
				value={text}
				onKeyDown={handleKeyDown}
				className="typingbox-textarea"
				placeholder="Type using number keys (old phone style)... Press + to change mode"
				readOnly={false}
			/>
		</div>
	);
};

export default TypingBox;
