import { useState } from 'react';
import AppNavbar from './components/AppNavbar';
import Base64Tool from './components/base64-tool';
import JsonFormatter from './components/json-formatter';
import './App.css';

function App() {
  const [activeTool, setActiveTool] = useState('json');

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <AppNavbar activeTool={activeTool} onToolChange={setActiveTool} />
      <div className="min-h-0 flex-1">
        {activeTool === 'json' && <JsonFormatter />}
        {activeTool === 'base64' && <Base64Tool />}
      </div>
    </div>
  );
}

export default App;
