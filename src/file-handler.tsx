import React, { useState, useRef } from 'react';

const FileHandler = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProcess, setActiveProcess] = useState('');
  const [lastFile, setLastFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleLoad = () => {
    fileInputRef.current.click();
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLastFile(file);
    try {
      const content = await readFile(file);
      setText(content);
      setSummary('');
      setExplanation('');
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const handleReload = async () => {
    if (!lastFile) return;

    try {
      const content = await readFile(lastFile);
      setText(content);
      setSummary('');
      setExplanation('');
    } catch (error) {
      console.error('Error reloading file:', error);
    }
  };

  const handleClear = () => {
    setText('');
    setSummary('');
    setExplanation('');
  };

  const handleSummarize = async () => {
    if (!text) return;

    setIsLoading(true);
    setActiveProcess('summarize');
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gemma2:2b",
          prompt: `Provide a concise summary of the following text in 2-3 sentences: ${text}`,
          stream: false
        }),
      });

      const data = await response.json();
      setSummary(data.response);
    } catch (error) {
      console.error('Error getting summary:', error);
      setSummary('Error generating summary. Please check if Ollama is running.');
    } finally {
      setIsLoading(false);
      setActiveProcess('');
    }
  };

  const handleExplain = async () => {
    if (!text) return;

    setIsLoading(true);
    setActiveProcess('explain');
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gemma2:2b",
          prompt: `Explain the following text in natural, conversational English, making it easy to understand: ${text}`,
          stream: false
        }),
      });

      const data = await response.json();
      setExplanation(data.response);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setExplanation('Error generating explanation. Please check if Ollama is running.');
    } finally {
      setIsLoading(false);
      setActiveProcess('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Original Text Box */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Original Text</h2>
          <div className="w-full h-48 border rounded-lg p-4 bg-gray-50 overflow-auto">
            {text || 'No content loaded'}
          </div>
        </div>

        {/* Summary Box */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Summary</h2>
          <div className="w-full h-32 border rounded-lg p-4 bg-gray-50 overflow-auto">
            {isLoading && activeProcess === 'summarize' ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              summary || 'No summary generated'
            )}
          </div>
        </div>

        {/* Explanation Box */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Explanation</h2>
          <div className="w-full h-48 border rounded-lg p-4 bg-gray-50 overflow-auto">
            {isLoading && activeProcess === 'explain' ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              explanation || 'No explanation generated'
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleLoad}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Load
            </button>

            <button
              onClick={handleReload}
              disabled={!lastFile}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors
                ${!lastFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
            >
              Reload
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
            >
              Clear
            </button>

            <button
              onClick={handleSummarize}
              disabled={!text || isLoading}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors flex items-center
                ${!text || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {isLoading && activeProcess === 'summarize' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Summarizing...
                </>
              ) : (
                'Summarize'
              )}
            </button>

            <button
              onClick={handleExplain}
              disabled={!text || isLoading}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors flex items-center
                ${!text || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
            >
              {isLoading && activeProcess === 'explain' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Explaining...
                </>
              ) : (
                'Explain'
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default FileHandler;