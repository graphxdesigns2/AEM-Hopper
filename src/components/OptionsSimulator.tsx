import React, { useState } from 'react';
import { ExtensionConfig, PageException } from '../types';
import { Plus, Trash2, CheckCircle2, Info } from 'lucide-react';

interface OptionsSimulatorProps {
  config: ExtensionConfig;
  onChangeConfig: (newConfig: ExtensionConfig) => void;
  onToast: (msg: string) => void;
}

export const OptionsSimulator: React.FC<OptionsSimulatorProps> = ({ config, onChangeConfig, onToast }) => {
  const [deptMappings, setDeptMappings] = useState<Array<{ slug: string; code: string }>>(
    Object.entries(config.deptMap).map(([slug, code]) => ({ slug, code }))
  );
  const [subfolders, setSubfolders] = useState<string[]>(config.subfolders);
  const [exceptions, setExceptions] = useState<PageException[]>(config.exceptions);
  const [showRecent, setShowRecent] = useState<boolean>(config.showRecent);
  const [darkMode, setDarkMode] = useState<boolean>(config.darkMode);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleAddMapping = () => {
    setDeptMappings([...deptMappings, { slug: '', code: '' }]);
  };

  const handleRemoveMapping = (index: number) => {
    setDeptMappings(deptMappings.filter((_, i) => i !== index));
  };

  const handleAddSubfolder = () => {
    setSubfolders([...subfolders, '']);
  };

  const handleRemoveSubfolder = (index: number) => {
    setSubfolders(subfolders.filter((_, i) => i !== index));
  };

  const handleAddException = () => {
    setExceptions([...exceptions, { contentPath: '', damPath: '' }]);
  };

  const handleRemoveException = (index: number) => {
    setExceptions(exceptions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newDeptMap: Record<string, string> = {};
    deptMappings.forEach(({ slug, code }) => {
      if (slug.trim() && code.trim()) {
        newDeptMap[slug.trim().toLowerCase()] = code.trim().toLowerCase();
      }
    });

    const validSubfolders = subfolders.map((s) => s.trim().toLowerCase()).filter(Boolean);
    const validExceptions = exceptions.filter((e) => e.contentPath.trim() && e.damPath.trim());

    const updatedConfig: ExtensionConfig = {
      deptMap: newDeptMap,
      subfolders: validSubfolders.length ? validSubfolders : ['images', 'documents'],
      exceptions: validExceptions,
      showRecent,
      darkMode
    };

    onChangeConfig(updatedConfig);
    setIsSaved(true);
    onToast('Settings saved successfully in extension storage!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-500/20 text-lg">
            🐇
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AEM Asset Hopper — Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department mappings, subfolder definitions, page exceptions, and popup preferences.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-xs shadow-md shadow-red-500/20 transition active:scale-95"
        >
          <span>Save Settings</span>
        </button>
      </div>

      {/* Tip Banner */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
        <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Mapping Note:</strong> Mapping <code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded text-red-600 font-mono">health</code> &rarr; <code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded text-red-600 font-mono">hc-sc</code> automatically bridges page URLs like <code className="font-mono">../services/health/..</code> to DAM folders under <code className="font-mono">../hc-sc/images/features/..</code>.
        </div>
      </div>

      {/* Grid: Mappings & Subfolders */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
        {/* Department Mappings */}
        <div className="md:col-span-7 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Department Mappings
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Map content slug to DAM folder code.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddMapping}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>

          <div className="p-3 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                  <th className="pb-2">Content Slug</th>
                  <th className="pb-2">DAM Dept Code</th>
                  <th className="pb-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {deptMappings.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={item.slug}
                        placeholder="e.g. health-canada"
                        onChange={(e) => {
                          const updated = [...deptMappings];
                          updated[idx].slug = e.target.value;
                          setDeptMappings(updated);
                        }}
                        className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={item.code}
                        placeholder="e.g. hc-sc"
                        onChange={(e) => {
                          const updated = [...deptMappings];
                          updated[idx].code = e.target.value;
                          setDeptMappings(updated);
                        }}
                        className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMapping(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subfolders */}
        <div className="md:col-span-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Asset Subfolders
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Checked after dept code (images, documents).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSubfolder}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>

          <div className="p-3 flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                  <th className="pb-2">Subfolder Name</th>
                  <th className="pb-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {subfolders.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={item}
                        placeholder="e.g. images"
                        onChange={(e) => {
                          const updated = [...subfolders];
                          updated[idx] = e.target.value;
                          setSubfolders(updated);
                        }}
                        className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubfolder(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Page Overrides / Exceptions */}
      <div className="mt-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Page Overrides & Exceptions
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Direct mapping from specific content page path to exact DAM folder.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddException}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition"
          >
            <Plus size={12} />
            <span>Add Exception</span>
          </button>
        </div>

        <div className="p-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                <th className="pb-2">Content Path (/content/canadasite/...)</th>
                <th className="pb-2">Target DAM Path (/content/dam/...)</th>
                <th className="pb-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {exceptions.map((ex, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                  <td className="py-1.5 pr-2">
                    <input
                      type="text"
                      value={ex.contentPath}
                      placeholder="/content/canadasite/en/services/health/page.html"
                      onChange={(e) => {
                        const updated = [...exceptions];
                        updated[idx].contentPath = e.target.value;
                        setExceptions(updated);
                      }}
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="text"
                      value={ex.damPath}
                      placeholder="/content/dam/hc-sc/images/features"
                      onChange={(e) => {
                        const updated = [...exceptions];
                        updated[idx].damPath = e.target.value;
                        setExceptions(updated);
                      }}
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveException(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="mt-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3">
          Popup Appearance & Preferences
        </h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition">
            <input
              type="checkbox"
              checked={showRecent}
              onChange={(e) => setShowRecent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-red-600 accent-red-600 focus:ring-red-500"
            />
            <div>
              <strong className="text-xs font-semibold block text-slate-800 dark:text-slate-200">
                Show Recently Viewed DAM Folders in Popup
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Maintains a quick-jump list of the last 6 visited DAM folders directly in the popup.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-red-600 accent-red-600 focus:ring-red-500"
            />
            <div>
              <strong className="text-xs font-semibold block text-slate-800 dark:text-slate-200">
                Enable Dark Theme by Default
              </strong>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Uses the dark theme with crimson glow highlights in the popup.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Footer / Status */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-xs shadow-md shadow-red-500/20 transition active:scale-95"
          >
            <span>Save Settings</span>
          </button>
          {isSaved && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-fade-in">
              <CheckCircle2 size={14} />
              <span>Settings saved!</span>
            </div>
          )}
        </div>
        <div className="text-[11px] text-slate-400">
          AEM Asset Hopper v1.2 &bull; Created by Angelo Destro
        </div>
      </div>
    </div>
  );
};
