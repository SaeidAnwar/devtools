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
      <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-zinc-800/90 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:px-3">
        <div className="flex min-w-0 justify-start">
          <JsonFormatterTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="flex flex-wrap justify-center">
          <JsonFormatterToolbar onFormat={handleFormat} onMinify={handleMinify} />
        </div>
        <div className="flex min-w-0 justify-end">
          <JsonFormatterHeader status={status} />
        </div>
      </div>
      <JsonFormatterWorkspace
        className="min-h-0 flex-1"
        activeTab={activeTab}
        jsonInput={jsonInput}
        onJsonChange={setJsonInput}
        onKeyDown={handleKeyDown}
        parsedData={parsedData}
        onFieldCopy={handleCopy}
        onFieldClear={handleClear}
      />
    </div>
  );
}
