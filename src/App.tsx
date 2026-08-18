import React, { useState } from 'react';
import { MOCK_SCENARIOS, DEFAULT_CONFIG, INITIAL_RECENT_PATHS } from './data/mockScenarios';
import { Scenario, ExtensionConfig, RecentItem } from './types';
import { PopupSimulator } from './components/PopupSimulator';
import { CheckCircle } from 'lucide-react';

export default function App() {
  const [selectedScenario] = useState<Scenario>(MOCK_SCENARIOS[0]);
  const [popupTheme, setPopupTheme] = useState<'light' | 'dark'>('light');
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG);
  const [recentPaths, setRecentPaths] = useState<RecentItem[]>(INITIAL_RECENT_PATHS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleTogglePopupTheme = () => {
    setPopupTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    showToast(`Switched theme to ${popupTheme === 'light' ? 'Dark' : 'Light'}`);
  };

  const handleAddRecentPath = (path: string, subfolder: string) => {
    const updated = recentPaths.filter((r) => r.path !== path);
    updated.unshift({
      path,
      subfolder,
      origin: 'https://author-canada-prod.adobecqms.net',
      timestamp: Date.now()
    });
    setRecentPaths(updated.slice(0, 6));
  };

  const isDark = popupTheme === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300 ${
        isDark
          ? 'dark bg-gradient-to-br from-[#06090e] via-[#0b0f17] to-[#111726] text-[#f8fafc]'
          : 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-[#0f172a]'
      }`}
    >
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-medium shadow-2xl border border-slate-700 animate-fade-in">
          <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container centering purely popup.html screen */}
      <main className="w-full max-w-[460px] flex flex-col items-center">
        {/* The Extension Popup Screen */}
        <PopupSimulator
          scenario={selectedScenario}
          theme={popupTheme}
          onToggleTheme={handleTogglePopupTheme}
          config={config}
          onChangeConfig={setConfig}
          recentPaths={recentPaths}
          onAddRecent={handleAddRecentPath}
          onToast={showToast}
        />
      </main>
    </div>
  );
}

