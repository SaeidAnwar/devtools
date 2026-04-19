import React, { useState, useEffect } from 'react';
import JsonNode from './components/JsonNode';
import './App.css';

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState('text'); 
  const [status, setStatus] = useState({ message: '', type: '' });
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    try {
      if (jsonInput.trim()) setParsedData(JSON.parse(jsonInput));
      else setParsedData(null);
    } catch (e) { setParsedData(null); }
  }, [jsonInput]);

  // VS Code Style Smart Indentation & Tab Support
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const lastNewLine = value.lastIndexOf('\n', selectionStart - 1);
      const currentLine = value.substring(lastNewLine + 1, selectionStart);
      const whitespace = currentLine.match(/^\s*/)?.[0] || '';
      const lastChar = currentLine.trim().slice(-1);
      const extraIndent = (lastChar === '{' || lastChar === '[') ? "  " : "";

      const newValue = value.substring(0, selectionStart) + "\n" + whitespace + extraIndent + value.substring(selectionEnd);
      setJsonInput(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 1 + whitespace.length + extraIndent.length;
      }, 0);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = jsonInput.substring(0, selectionStart) + "  " + jsonInput.substring(selectionEnd);
      setJsonInput(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  const handleFormat = () => {
    let input = jsonInput.trim();
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setStatus({ message: 'Formatted Successfully!', type: 'success' });
    } catch (err) {
      try {
        let fixed = input;
        const oB = (input.match(/\{/g) || []).length;
        const cB = (input.match(/\}/g) || []).length;
        const oSq = (input.match(/\[/g) || []).length;
        const cSq = (input.match(/\]/g) || []).length;
        if (oB > cB) fixed += '}'.repeat(oB - cB);
        if (oSq > cSq) fixed += ']'.repeat(oSq - cSq);
        setJsonInput(JSON.stringify(JSON.parse(fixed), null, 2));
        setStatus({ message: 'Auto-fixed & Formatted!', type: 'success' });
      } catch (e2) {
        const rough = input.replace(/([\{\[])/g, '$1\n  ').replace(/([\}\]])/g, '\n$1').replace(/,/g, ',\n  ').replace(/\n\s*\n/g, '\n');
        setJsonInput(rough);
        setStatus({ message: 'Rough Format (Invalid JSON)', type: 'error' });
      }
    }
  };

  const handleMinify = () => {
    if (!jsonInput.trim()) return;
    try {
      setJsonInput(JSON.stringify(JSON.parse(jsonInput)));
      setStatus({ message: 'Minified!', type: 'success' });
    } catch (err) {
      const min = jsonInput.replace(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '').replace(/[\n\r]/g, '');
      setJsonInput(min);
      setStatus({ message: 'Minified (Still Invalid)', type: 'error' });
    }
  };

  const handleCopy = () => {
    if (!jsonInput) return;
    navigator.clipboard.writeText(jsonInput);
    setStatus({ message: 'Copied to Clipboard!', type: 'success' });
    setTimeout(() => setStatus({ message: '', type: '' }), 2000);
  };

  const handleClear = () => {
    setJsonInput('');
    setParsedData(null);
    setStatus({ message: 'Cleared', type: 'success' });
    setTimeout(() => setStatus({ message: '', type: '' }), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - Uper ka hissa */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Dev<span className="text-blue-500">Tools</span>
            </h1>
            <p className="text-slate-500 text-sm">JSON Viewer & Formatter</p>
          </div>
          {status.message && (
            <div className={`px-4 py-2 rounded-md text-sm font-medium border shadow-lg transition-all ${
              status.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
            }`}>
              {status.message}
            </div>
          )}
        </header>

        {/* Tabs Section */}
        <div className="flex gap-1">
          <button 
            onClick={() => setActiveTab('viewer')}
            className={`px-5 py-2 rounded-t-lg text-sm font-bold transition-all border-t border-x ${activeTab === 'viewer' ? 'bg-[#1e293b] text-blue-400 border-slate-700' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'}`}
          >
            Viewer
          </button>
          <button 
            onClick={() => setActiveTab('text')}
            className={`px-5 py-2 rounded-t-lg text-sm font-bold transition-all border-t border-x ${activeTab === 'text' ? 'bg-[#1e293b] text-blue-400 border-slate-700' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'}`}
          >
            Text
          </button>
        </div>

        {/* Toolbar - All buttons included */}
        <div className="flex flex-wrap gap-3 mb-0 bg-[#1e293b] p-3 border border-slate-700 shadow-lg relative z-10">
          <button onClick={handleFormat} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-lg active:scale-95 font-medium">
            Format
          </button>
          <button onClick={handleMinify} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-all active:scale-95 font-medium">
            Remove White Space
          </button>
          <button onClick={handleCopy} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-all active:scale-95 font-medium">
            Copy
          </button>
          <button onClick={handleClear} className="ml-auto bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 px-4 py-2 rounded-lg text-sm transition-all font-medium">
            Clear
          </button>
        </div>

        {/* Content Area */}
        <div className="relative bg-[#020617] border-x border-b border-slate-700 min-h-[65vh] shadow-2xl overflow-hidden rounded-b-xl">
          {activeTab === 'text' ? (
            <textarea
              className="w-full h-[65vh] bg-transparent text-blue-400 p-6 focus:outline-none font-mono text-sm leading-relaxed resize-none border-t border-slate-800 scrollbar-thin scrollbar-thumb-slate-700"
              placeholder="// Paste your JSON code here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="w-full h-[65vh] bg-[#020617] p-8 overflow-auto border-t border-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
              {parsedData ? (
                <div className="text-slate-300">
                  <JsonNode label="JSON" value={parsedData} isLast={true} />
                </div>
              ) : (
                <div className="text-slate-600 italic font-mono text-sm flex items-center h-full justify-center tracking-widest">
                  {jsonInput ? "// Invalid JSON syntax - Tree view disabled" : "// Waiting for data..."}
                </div>
              )}
            </div>
          )}
          
          <div className="absolute bottom-4 right-6 text-slate-600 text-[10px] pointer-events-none uppercase tracking-widest bg-[#020617] px-2">
            {activeTab} mode
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;