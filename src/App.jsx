import { useState } from 'react';
import AppNavbar from './components/AppNavbar';
import { useLocalStorage } from './lib/useLocalStorage';
import Base64Tool from './components/base64-tool';
import JsonFormatter from './components/json-formatter';
import JwtTool from './components/jwt-tool';
import DiffTool from './components/diff-tool/DiffTool'
import './App.css';

function App() {
  const [activeTool, setActiveTool] = useState('json');
  
  const [tabsMap, setTabsMap] = useLocalStorage('app-tool-tabs', {
    json: [{ id: '1' }],
    base64: [{ id: '1' }],
    jwt: [{ id: '1' }],
    diff: [{ id: '1' }],
  });
  
  const [activeTabIds, setActiveTabIds] = useLocalStorage('app-tool-active-tabs', {
    json: '1',
    base64: '1',
    jwt: '1',
    diff: '1',
  });

  const handleAddTab = () => {
    setTabsMap((prev) => {
      const toolTabs = prev[activeTool] || [];
      if (toolTabs.length >= 10) return prev;
      
      const newId = String(Math.max(0, ...toolTabs.map(t => parseInt(t.id, 10) || 0)) + 1);
      
      setActiveTabIds((p) => ({ ...p, [activeTool]: newId }));
      return { ...prev, [activeTool]: [...toolTabs, { id: newId }] };
    });
  };

  const handleCloseTab = (tabId) => {
    setTabsMap((prev) => {
      const toolTabs = prev[activeTool] || [];
      const newTabs = toolTabs.filter(t => t.id !== tabId);
      
      if (newTabs.length === 0) {
        setActiveTabIds((p) => ({ ...p, [activeTool]: '1' }));
        return { ...prev, [activeTool]: [{ id: '1' }] };
      }
      
      setActiveTabIds((p) => {
        if (p[activeTool] === tabId) {
          return { ...p, [activeTool]: newTabs[newTabs.length - 1].id };
        }
        return p;
      });

      return { ...prev, [activeTool]: newTabs };
    });
  };

  const handleSelectTab = (tabId) => {
    setActiveTabIds((p) => ({ ...p, [activeTool]: tabId }));
  };

  const currentTabs = tabsMap[activeTool] || [{ id: '1' }];
  const currentTabId = activeTabIds[activeTool] || '1';

  return (
    <div className="flex h-dvh min-h-0 min-w-0 flex-col overflow-x-hidden">
      <AppNavbar 
        activeTool={activeTool} 
        onToolChange={setActiveTool} 
        activeToolTabs={currentTabs}
        activeTabId={currentTabId}
        onTabSelect={handleSelectTab}
        onTabAdd={handleAddTab}
        onTabClose={handleCloseTab}
      />
      <div className="relative min-h-0 flex-1">
        {(tabsMap.json || [{ id: '1' }]).map(tab => (
          <div
            key={`json-${tab.id}`}
            className={activeTool === 'json' && currentTabId === tab.id ? 'flex h-full min-h-0 min-w-0 flex-col' : 'hidden'}
            aria-hidden={activeTool !== 'json' || currentTabId !== tab.id}
          >
            <JsonFormatter instanceId={`json-${tab.id}`} />
          </div>
        ))}
        {(tabsMap.base64 || [{ id: '1' }]).map(tab => (
          <div
            key={`base64-${tab.id}`}
            className={activeTool === 'base64' && currentTabId === tab.id ? 'flex h-full min-h-0 min-w-0 flex-col' : 'hidden'}
            aria-hidden={activeTool !== 'base64' || currentTabId !== tab.id}
          >
            <Base64Tool instanceId={`base64-${tab.id}`} />
          </div>
        ))}
        {(tabsMap.jwt || [{ id: '1' }]).map(tab => (
          <div
            key={`jwt-${tab.id}`}
            className={activeTool === 'jwt' && currentTabId === tab.id ? 'flex h-full min-h-0 min-w-0 flex-col' : 'hidden'}
            aria-hidden={activeTool !== 'jwt' || currentTabId !== tab.id}
          >
            <JwtTool instanceId={`jwt-${tab.id}`} />
          </div>
        ))}
        {(tabsMap.diff || [{ id: '1' }]).map(tab => (
          <div
            key={`diff-${tab.id}`}
            className={activeTool === 'diff' && currentTabId === tab.id ? 'flex h-full min-h-0 min-w-0 flex-col' : 'hidden'}
            aria-hidden={activeTool !== 'diff' || currentTabId !== tab.id}
          >
            <DiffTool instanceId={`diff-${tab.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
