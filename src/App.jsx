import { useState } from 'react';
import AppNavbar from './components/AppNavbar';
import Base64Tool from './components/base64-tool';
import JsonFormatter from './components/json-formatter';
import JwtTool from './components/jwt-tool';
import './App.css';

function App() {
  const [activeTool, setActiveTool] = useState('json');

  return (
    <div className="flex h-dvh min-h-0 min-w-0 flex-col overflow-x-hidden">
      <AppNavbar activeTool={activeTool} onToolChange={setActiveTool} />
      <div className="relative min-h-0 flex-1">
        <div
          className={activeTool === 'json' ? 'flex h-full min-h-0 min-w-0 flex-col' : 'hidden'}
          aria-hidden={activeTool !== 'json'}
        >
          <JsonFormatter />
        </div>
        <div
          className={activeTool === 'base64' ? 'flex h-full min-h-0 min-w-0 flex-col' : 'hidden'}
          aria-hidden={activeTool !== 'base64'}
        >
          <Base64Tool />
        </div>
        <div
          className={activeTool === 'jwt' ? 'flex h-full min-h-0 min-w-0 flex-col' : 'hidden'}
          aria-hidden={activeTool !== 'jwt'}
        >
          <JwtTool />
        </div>
      </div>
    </div>
  );
}

export default App;
