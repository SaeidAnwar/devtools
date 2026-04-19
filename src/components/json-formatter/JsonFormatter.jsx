import JsonFormatterHeader from './JsonFormatterHeader';
import JsonFormatterTabs from './JsonFormatterTabs';
import JsonFormatterToolbar from './JsonFormatterToolbar';
import JsonFormatterWorkspace from './JsonFormatterWorkspace';
import { useJsonViewer } from './useJsonViewer';

export default function JsonFormatter() {
  const {
    jsonInput,
    setJsonInput,
    activeTab,
    setActiveTab,
    status,
    parsedData,
    handleKeyDown,
    handleFormat,
    handleMinify,
    handleCopy,
    handleClear,
  } = useJsonViewer();

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-300 antialiased">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-zinc-800/90 px-3 py-2">
        <span className="select-none text-xs tracking-wide text-zinc-400">JSON</span>
        <JsonFormatterTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="min-w-[1rem] flex-1" aria-hidden="true" />
        <JsonFormatterToolbar
          onFormat={handleFormat}
          onMinify={handleMinify}
          onCopy={handleCopy}
          onClear={handleClear}
        />
        <JsonFormatterHeader status={status} />
      </div>
      <JsonFormatterWorkspace
        className="min-h-0 flex-1"
        activeTab={activeTab}
        jsonInput={jsonInput}
        onJsonChange={setJsonInput}
        onKeyDown={handleKeyDown}
        parsedData={parsedData}
      />
    </div>
  );
}
