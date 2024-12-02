// App.jsx
import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [isProcessing, setIsProcessing] = useState(false);
  const [textDirection, setTextDirection] = useState('ltr');
  const fileInputRef = useRef(null);

  const handleLoad = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setCopyStatus('Copy');
  };

  const callOllama = async (prompt) => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma2',
          prompt: prompt,
          stream: false,
        }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      return 'Error processing request';
    }
  };

  const handleSummarize = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    const prompt = `Summarize the following text:\n${inputText}`;
    const summary = await callOllama(prompt);
    setOutputText(summary);
    setIsProcessing(false);
    setTextDirection('ltr');
  };

  const handleExplain = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    const prompt = `Explain the following text in natural English, do not explain what you did:\n${inputText}`;
    const explanation = await callOllama(prompt);
    setOutputText(explanation);
    setIsProcessing(false);
    setTextDirection('ltr');
  };

  const handleFixAndRewrite = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    const prompt = `Rewrite following text in natural English while maintaining its meaning accurately, do not explain what you did:\n${inputText}`;
    const rewritten = await callOllama(prompt);
    setOutputText(rewritten);
    setIsProcessing(false);
    setTextDirection('ltr');
  };

  const handleTranslation = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    const prompt = `Translate in Persian while maintaining its meaning, do not explain what you did:\n${inputText}`;
    const rewritten = await callOllama(prompt);
    setOutputText(rewritten);
    setIsProcessing(false);
    setTextDirection('rtl');
  };

  const handleCopy = async () => {
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      setCopyStatus('Copied!');

      // Reset the button text after 2 seconds
      setTimeout(() => {
        setCopyStatus('Copy');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setCopyStatus('Failed to copy');
    }
  };

  return (
      <div className="app">
        <div className="button-container">
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{display: 'none'}}
              accept=".txt"
          />
          <button onClick={handleLoad}>Load</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleSummarize}
                  disabled={isProcessing || !inputText}>
            {isProcessing ? 'Processing...' : 'Summarize'}
          </button>
          <button onClick={handleExplain} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Explain'}
          </button>
          <button onClick={handleFixAndRewrite} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Rewrite'}
          </button>
          <button
              className={`copy-button ${copyStatus === 'Copied!' ? 'copied'
                  : ''}`}
              onClick={handleCopy}
              disabled={!outputText}
          >
            {copyStatus}
          </button>
          <button onClick={handleTranslation} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Explain2'}
          </button>
        </div>

        <div className="text-container">
        <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Input text here or load a file..."
        />
          <textarea
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              placeholder="Output will appear here..."
              style={{ direction: textDirection }}
          />
        </div>
      </div>
  );
}

export default App;