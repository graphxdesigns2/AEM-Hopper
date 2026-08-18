import React, { useState } from 'react';
import { Scenario, RecentItem, ExtensionConfig, PageException } from '../types';
import { EXTENSION_FILES } from '../data/extensionFiles';
import { generateExtensionZip, downloadBlob } from '../utils/zipExport';
import {
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Settings,
  Sun,
  Moon,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Clock,
  ArrowRight,
  ArrowLeft,
  Bug,
  Globe,
  Code,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  FileCode,
  FileJson,
  FileType2,
  Send,
  Link2,
  Folder,
  Lock
} from 'lucide-react';

interface PopupSimulatorProps {
  scenario: Scenario;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  config: ExtensionConfig;
  onChangeConfig: (newConfig: ExtensionConfig) => void;
  recentPaths: RecentItem[];
  onAddRecent: (path: string, subfolder: string) => void;
  onToast: (msg: string) => void;
}

export type ExtensionView = 'popup' | 'settings' | 'code' | 'feedback';

export const PopupSimulator: React.FC<PopupSimulatorProps> = ({
  scenario,
  theme,
  onToggleTheme,
  config,
  onChangeConfig,
  recentPaths,
  onAddRecent,
  onToast
}) => {
  const [activeView, setActiveView] = useState<ExtensionView>('popup');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Settings State
  const [deptMappings, setDeptMappings] = useState<Array<{ slug: string; code: string }>>(
    Object.entries(config.deptMap).map(([slug, code]) => ({ slug, code }))
  );
  const [subfolders, setSubfolders] = useState<string[]>(config.subfolders);
  const [exceptions, setExceptions] = useState<PageException[]>(config.exceptions);
  const [showRecentSetting, setShowRecentSetting] = useState<boolean>(config.showRecent);
  const [darkModeSetting, setDarkModeSetting] = useState<boolean>(config.darkMode);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Code Viewer State
  const [selectedFile, setSelectedFile] = useState<string>('popup.html');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Feedback State
  const [feedbackSubject, setFeedbackSubject] = useState<string>('AEM Asset Hopper Feedback / Bug');
  const [feedbackBody, setFeedbackBody] = useState<string>('');

  const isDark = theme === 'dark';

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onToast(`Copied ${label} to clipboard`);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1800);
  };

  const handleRecheck = () => {
    setIsScanning(true);
    onToast('Re-checking DAM paths for current page…');
    setTimeout(() => {
      setIsScanning(false);
      onToast('DAM paths updated!');
    }, 550);
  };

  const handleHop = (path: string, subfolder: string) => {
    onAddRecent(path, subfolder);
    onToast(`Navigating to DAM folder: ${path}`);
  };

  const handleSaveSettings = () => {
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
      showRecent: showRecentSetting,
      darkMode: darkModeSetting
    };

    onChangeConfig(updatedConfig);
    setIsSaved(true);
    onToast('Settings saved in extension storage!');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      onToast('Packaging extension files…');
      const blob = await generateExtensionZip(EXTENSION_FILES);
      downloadBlob(blob, 'aem-asset-hopper-v1.2.zip');
      onToast('Downloaded aem-asset-hopper-v1.2.zip!');
    } catch {
      onToast('Failed to export ZIP file.');
    } finally {
      setIsExporting(false);
    }
  };

  // Truncate url for display
  const displayUrl = scenario.url.startsWith('https://author-canada-prod.adobecqms.net/editor.html')
    ? '…' + scenario.url.replace('https://author-canada-prod.adobecqms.net/editor.html', '')
    : scenario.url;

  // Extract base filename for assets
  const pathSegments = scenario.url.split('?')[0].split('#')[0].split('/').filter(Boolean);
  const lastRaw = pathSegments[pathSegments.length - 1] || 'asset-name';
  const baseFilename = lastRaw.replace(/\.html$/i, '').toLowerCase();

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.json')) return <FileJson size={12} className="text-amber-500" />;
    if (filename.endsWith('.html')) return <FileCode size={12} className="text-orange-500" />;
    if (filename.endsWith('.css')) return <FileType2 size={12} className="text-blue-500" />;
    return <FileCode size={12} className="text-yellow-500" />;
  };

  return (
    <div
      className={`w-full max-w-[460px] rounded-2xl border transition-all duration-200 select-none overflow-hidden ${
        isDark
          ? 'bg-[#0b0f17] border-[#25334d] text-[#f8fafc] shadow-2xl shadow-black/60'
          : 'bg-slate-50/60 border-slate-200/90 text-[#0f172a] shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12),0_4px_16px_-2px_rgba(15,23,42,0.06)]'
      }`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      <div className="p-3 flex flex-col gap-2.5">
        {/* =========================================================================
            VIEW 1: PRIMARY POPUP VIEW (popup.html)
           ========================================================================= */}
        {activeView === 'popup' && (
          <>
            {/* Header */}
            <header
              className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#131b2c] border-[#25334d] shadow-sm'
                  : 'bg-white border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <h1 className={`text-[13.5px] font-extrabold tracking-tight leading-none ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      AEM Asset Hopper
                    </h1>
                    <span className={`inline-flex items-center text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border ${
                      isDark
                        ? 'text-red-400 bg-red-950/60 border-red-800/60'
                        : 'text-red-700 bg-red-50 border-red-200/80 shadow-2xs'
                    }`}>
                      v1.2
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium leading-normal mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    by Angelo Destro &bull; Health Canada & PHAC
                  </span>
                </div>

                {/* Header Action Buttons - Styled specifically for light and dark themes */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    title="Toggle light / dark theme"
                    className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg border transition shadow-2xs ${
                      isDark
                        ? 'bg-[#1a2333] hover:bg-[#25334d] text-slate-300 hover:text-white border-[#25334d]'
                        : 'bg-slate-50 hover:bg-white active:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleRecheck}
                    title="Re-check current page DAM paths"
                    className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg border transition shadow-2xs ${
                      isDark
                        ? 'bg-[#1a2333] hover:bg-[#25334d] text-slate-300 hover:text-white border-[#25334d]'
                        : 'bg-slate-50 hover:bg-white active:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    } ${isScanning ? 'animate-spin' : ''}`}
                  >
                    <RotateCw size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('code')}
                    title="View extension source code & download ZIP"
                    className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg border transition shadow-2xs ${
                      isDark
                        ? 'bg-[#1a2333] hover:bg-[#25334d] text-slate-300 hover:text-white border-[#25334d]'
                        : 'bg-slate-50 hover:bg-white active:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <Code size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('settings')}
                    title="Open extension settings & mappings"
                    className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg border transition shadow-2xs ${
                      isDark
                        ? 'bg-[#1a2333] hover:bg-[#25334d] text-slate-300 hover:text-white border-[#25334d]'
                        : 'bg-slate-50 hover:bg-white active:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <Settings size={13} />
                  </button>
                </div>
              </div>

              {/* Current Page Strip - Clean tactile container */}
              <div className={`flex items-center gap-2 border rounded-lg px-2.5 py-1.5 shadow-2xs transition ${
                isDark
                  ? 'bg-[#1a2333] border-[#25334d]'
                  : 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
              }`}>
                <Link2 size={13} className={`flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <span
                  className={`flex-1 font-mono text-[11px] font-semibold truncate direction-rtl text-left select-text ${
                    isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}
                  title={scenario.url}
                >
                  {displayUrl}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(scenario.url, 'page-url', 'Page URL')}
                  title="Copy editor URL"
                  className={`p-1 rounded border transition shadow-2xs ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {copiedId === 'page-url' ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>

              {/* French notice if applicable */}
              {scenario.isFrench && (
                <div className={`flex items-center gap-2 text-[10.5px] rounded-lg px-2.5 py-1.5 font-medium border ${
                  isDark
                    ? 'text-blue-300 bg-blue-950/40 border-blue-800/50'
                    : 'text-blue-900 bg-blue-50/90 border-blue-200'
                }`}>
                  <Globe size={12} className={`flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className="truncate">
                    French page detected &rarr; EN DAM mapped: <strong>/food-safety</strong>
                  </span>
                </div>
              )}
            </header>

            {/* Live/Preview Page Banner (if preview or live URL) */}
            {scenario.isLiveOrPreview && (
              <button
                type="button"
                onClick={() => onToast('Simulated switching to Author Editor…')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium text-xs shadow-xs shadow-red-500/25 transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={13} />
                  <span>
                    Open this page in <strong className="underline underline-offset-2">Author Editor</strong>
                  </span>
                </div>
                <ArrowRight size={13} />
              </button>
            )}

            {/* Main Results List */}
            <div className="flex flex-col gap-2.5">
              {scenario.results && scenario.results.length > 0 && scenario.results.some((r) => r.exists) ? (
                scenario.results
                  .filter((r) => r.exists)
                  .map((r, idx) => {
                    const isDoc = r.subfolder.toLowerCase().includes('doc');
                    const ext = isDoc ? '.pdf' : '.jpg';
                    const filename = `${baseFilename}${ext}`;
                    const isPartial = r.reachedSegments < scenario.folderSegments.length;
                    const shortLevels = scenario.folderSegments.length - r.reachedSegments;
                    const missingSegments = scenario.folderSegments.slice(r.reachedSegments).join('/');
                    const copyCardId = `card-path-${idx}`;
                    const copyFileId = `file-${idx}`;
                    const copyMissingId = `missing-${idx}`;

                    return (
                      <div
                        key={r.subfolder}
                        className={`p-3 rounded-xl border flex flex-col gap-2.5 transition-all duration-150 ${
                          isDark
                            ? 'bg-[#131b2c] border-[#25334d] hover:border-[#384c73] shadow-sm'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)]'
                        }`}
                      >
                        {/* Top Action Row: Prominent Folder Header (matching Recently viewed) + [Solid Copy CTA] + [Solid Red Hop to DAM CTA] */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border shadow-2xs ${
                              isDark
                                ? 'bg-slate-800 text-slate-200 border-slate-700'
                                : 'bg-slate-100 text-slate-700 border-slate-200/90'
                            }`}>
                              {isDoc ? (
                                <FileText size={12} className={`flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                              ) : (
                                <ImageIcon size={12} className={`flex-shrink-0 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
                              )}
                              <span>{r.subfolder}</span>
                            </span>

                            {isPartial && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${
                                isDark
                                  ? 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                                  : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}>
                                Partial
                              </span>
                            )}
                          </div>

                          {/* Action Buttons Group: Solid Copy Filename (Left) + Solid Red Hop to DAM (Right) */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Solid Background Copy Filename Button (#3E517A) */}
                            <button
                              type="button"
                              onClick={() => handleCopy(filename, copyFileId, `${ext} Filename`)}
                              title={`Copy filename: ${filename}`}
                              className={`h-7.5 inline-flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-[11px] font-bold transition active:scale-[0.97] shadow-xs ${
                                copiedId === copyFileId
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : isDark
                                    ? 'bg-[#3E517A] hover:bg-[#4A5F8C] active:bg-[#2F3E5E] text-white'
                                    : 'bg-[#3E517A] hover:bg-[#324264] active:bg-[#283552] text-white'
                              }`}
                            >
                              {copiedId === copyFileId ? (
                                <>
                                  <Check size={12} className="text-white font-bold" />
                                  <span className="font-bold text-white">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} className="text-slate-200" />
                                  <span className="font-bold text-white">
                                    Copy {isDoc ? '.pdf' : '.jpg'}
                                  </span>
                                </>
                              )}
                            </button>

                            {/* Solid Red Hop to DAM Primary Action */}
                            <button
                              type="button"
                              onClick={() => handleHop(r.deepestPath, r.subfolder)}
                              className="h-7.5 inline-flex items-center justify-center gap-1.5 px-3 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs shadow-red-500/25 transition active:scale-[0.97]"
                            >
                              <span>Hop to DAM</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Path Row with 1-click Copy (Tactile container with Folder anchor) */}
                        <div className={`flex items-center gap-2 border rounded-lg px-2.5 py-1.5 shadow-2xs transition ${
                          isDark
                            ? 'bg-[#1a2333] border-[#25334d]'
                            : 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                        }`}>
                          <Folder size={12} className={`flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                          <span
                            className={`flex-1 font-mono text-[11px] font-semibold truncate direction-rtl text-left select-text ${
                              isDark ? 'text-slate-100' : 'text-slate-800'
                            }`}
                            title={r.deepestPath}
                          >
                            {r.deepestPath}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(r.deepestPath, copyCardId, 'DAM Path')}
                            title="Copy full DAM path"
                            className={`p-1 rounded border transition shadow-2xs flex-shrink-0 ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            {copiedId === copyCardId ? (
                              <Check size={12} className="text-emerald-600 dark:text-emerald-400 font-bold" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>

                        {/* Partial Warning Drawer (if stopped short) */}
                        {isPartial && (
                          <div className={`flex flex-col gap-1.5 border rounded-lg p-2.5 text-[10px] ${
                            isDark
                              ? 'bg-amber-950/40 border-amber-800/60'
                              : 'bg-amber-50/80 border-amber-200'
                          }`}>
                            <div className={`flex items-center gap-1 font-bold text-[10.5px] ${
                              isDark ? 'text-amber-300' : 'text-amber-900'
                            }`}>
                              <AlertTriangle size={12} />
                              <span>Stopped {shortLevels} level short in DAM — missing:</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`flex-1 font-mono text-[10.5px] font-semibold border rounded px-2 py-1 truncate ${
                                  isDark
                                    ? 'text-slate-200 bg-slate-900 border-amber-800/50'
                                    : 'text-slate-900 bg-white border-amber-200'
                                }`}
                                title={missingSegments}
                              >
                                {missingSegments}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(missingSegments, copyMissingId, 'Missing segment')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded border transition shadow-2xs ${
                                  isDark
                                    ? 'bg-slate-900 border-amber-700 text-amber-300 hover:bg-amber-950'
                                    : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                                }`}
                              >
                                {copiedId === copyMissingId ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                /* Missing Folders / No DAM match fallback */
                <div className={`border border-l-4 rounded-xl p-3 flex flex-col gap-2 shadow-xs ${
                  isDark
                    ? 'bg-[#131b2c] border-amber-800/60 border-l-amber-500'
                    : 'bg-amber-50/90 border-amber-200 border-l-amber-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider ${
                      isDark ? 'text-amber-400' : 'text-amber-900'
                    }`}>
                      <AlertTriangle size={13} />
                      <span>Missing Folders in DAM</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          scenario.folderSegments.map((s) => `/content/dam/${scenario.deptCode}/images/${s}`).join('\n'),
                          'missing-all',
                          'Missing paths'
                        )
                      }
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md border transition shadow-2xs ${
                        isDark
                          ? 'bg-amber-950/60 border-amber-700 text-amber-300 hover:bg-amber-900'
                          : 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      {copiedId === 'missing-all' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      <span>Copy all</span>
                    </button>
                  </div>

                  <p className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    No matching DAM folders found for this page under department <code className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                      isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-100 text-amber-950'
                    }`}>{scenario.deptCode}</code>.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <div className={`font-mono text-[10.5px] font-semibold p-2 rounded-md border break-all shadow-2xs ${
                      isDark
                        ? 'bg-[#1a2333] border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      /content/dam/{scenario.deptCode}/images/{scenario.folderSegments.join('/')}
                    </div>
                    <div className={`font-mono text-[10.5px] font-semibold p-2 rounded-md border break-all shadow-2xs ${
                      isDark
                        ? 'bg-[#1a2333] border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      /content/dam/{scenario.deptCode}/documents/{scenario.folderSegments.join('/')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recently Viewed DAM Folders Section */}
            {config.showRecent && recentPaths && recentPaths.length > 0 && (
              <div
                className={`p-3 rounded-xl border shadow-xs flex flex-col gap-2 ${
                  isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border shadow-2xs ${
                    isDark
                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200/90'
                  }`}>
                    <Clock size={12} className="flex-shrink-0 text-amber-500 dark:text-amber-400" />
                    <span>Recently viewed</span>
                  </span>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {recentPaths.length} stored
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {recentPaths.slice(0, 4).map((item, idx) => {
                    const isDoc = item.subfolder.toLowerCase().includes('doc');
                    const cleanDisplay = item.path.includes('/content/dam')
                      ? item.path.substring(item.path.indexOf('/content/dam'))
                      : item.path;

                    return (
                      <div
                        key={`${item.path}-${idx}`}
                        onClick={() => handleHop(item.path, item.subfolder)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition text-[10.5px] shadow-2xs group ${
                          isDark
                            ? 'bg-[#1a2333] hover:bg-[#25334d] border-[#25334d] text-slate-200'
                            : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {isDoc ? (
                          <FileText size={12} className={`flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        ) : (
                          <ImageIcon size={12} className={`flex-shrink-0 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
                        )}
                        <span className={`flex-1 font-mono font-medium truncate direction-rtl text-left group-hover:underline ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {cleanDisplay}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                            {Math.max(1, Math.round((Date.now() - item.timestamp) / 60000))}m ago
                          </span>
                          <ArrowRight size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer with clean links */}
            <footer className="flex items-center justify-between pt-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
              <button
                type="button"
                onClick={() => setActiveView('feedback')}
                className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                <Bug size={11} />
                <span>Bug reporting & Feedback</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('code')}
                  className="hover:text-slate-700 dark:hover:text-slate-300 transition"
                >
                  Files & ZIP
                </button>
                <span>&bull;</span>
                <span className="font-medium text-slate-500 dark:text-slate-400">HC &bull; PHAC</span>
              </div>
            </footer>
          </>
        )}

        {/* =========================================================================
            VIEW 2: SETTINGS / OPTIONS SCREEN (options.html)
           ========================================================================= */}
        {activeView === 'settings' && (
          <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-0.5">
            {/* Settings Sub-Header */}
            <div
              className={`flex items-center justify-between p-2 rounded-xl border ${
                isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-300 shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveView('popup')}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:text-red-600 transition ${
                  isDark ? 'text-slate-300' : 'text-slate-800'
                }`}
              >
                <ArrowLeft size={13} />
                <span>Back to Hopper</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold transition"
              >
                <span>Save</span>
                {isSaved && <CheckCircle2 size={12} />}
              </button>
            </div>

            {/* Department Mappings */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-2 ${
                isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}>
                  Department Mappings
                </span>
                <button
                  type="button"
                  onClick={() => setDeptMappings([...deptMappings, { slug: '', code: '' }])}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded border transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <Plus size={10} />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {deptMappings.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={item.slug}
                      placeholder="slug (e.g. health)"
                      onChange={(e) => {
                        const updated = [...deptMappings];
                        updated[idx].slug = e.target.value;
                        setDeptMappings(updated);
                      }}
                      className={`flex-1 px-2 py-1 text-[10.5px] font-mono rounded border focus:outline-none focus:border-red-500 ${
                        isDark
                          ? 'border-slate-700 bg-slate-900 text-slate-100'
                          : 'border-slate-300 bg-[#f8fafc] text-slate-900'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400">&rarr;</span>
                    <input
                      type="text"
                      value={item.code}
                      placeholder="code (e.g. hc-sc)"
                      onChange={(e) => {
                        const updated = [...deptMappings];
                        updated[idx].code = e.target.value;
                        setDeptMappings(updated);
                      }}
                      className={`w-24 px-2 py-1 text-[10.5px] font-mono rounded border focus:outline-none focus:border-red-500 ${
                        isDark
                          ? 'border-slate-700 bg-slate-900 text-slate-100'
                          : 'border-slate-300 bg-[#f8fafc] text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setDeptMappings(deptMappings.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Subfolders */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-2 ${
                isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}>
                  Asset Subfolders
                </span>
                <button
                  type="button"
                  onClick={() => setSubfolders([...subfolders, ''])}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded border transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <Plus size={10} />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {subfolders.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={item}
                      placeholder="e.g. images"
                      onChange={(e) => {
                        const updated = [...subfolders];
                        updated[idx] = e.target.value;
                        setSubfolders(updated);
                      }}
                      className={`flex-1 px-2 py-1 text-[10.5px] font-mono rounded border focus:outline-none focus:border-red-500 ${
                        isDark
                          ? 'border-slate-700 bg-slate-900 text-slate-100'
                          : 'border-slate-300 bg-[#f8fafc] text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSubfolders(subfolders.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Popup Appearance Preferences */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-2 ${
                isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-300 shadow-2xs'
              }`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-900'
              }`}>
                Preferences
              </span>
              <label className={`flex items-center gap-2 text-[11px] font-medium cursor-pointer ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}>
                <input
                  type="checkbox"
                  checked={showRecentSetting}
                  onChange={(e) => setShowRecentSetting(e.target.checked)}
                  className="rounded text-red-600 accent-red-600"
                />
                <span>Show Recently Viewed DAM Folders in Popup</span>
              </label>

              <label className={`flex items-center gap-2 text-[11px] font-medium cursor-pointer ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}>
                <input
                  type="checkbox"
                  checked={darkModeSetting}
                  onChange={(e) => setDarkModeSetting(e.target.checked)}
                  className="rounded text-red-600 accent-red-600"
                />
                <span>Default Dark Theme</span>
              </label>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: SOURCE CODE & ZIP EXPORT SCREEN
           ========================================================================= */}
        {activeView === 'code' && (
          <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-0.5">
            <div
              className={`flex items-center justify-between p-2 rounded-xl border ${
                isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-300 shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveView('popup')}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:text-red-600 transition ${
                  isDark ? 'text-slate-300' : 'text-slate-800'
                }`}
              >
                <ArrowLeft size={13} />
                <span>Back to Hopper</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold transition"
              >
                <Download size={12} />
                <span>{isExporting ? 'Packaging…' : 'Download ZIP'}</span>
              </button>
            </div>

            {/* File Switcher Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {Object.keys(EXTENSION_FILES).map((filename) => {
                const isActive = selectedFile === filename;
                return (
                  <button
                    key={filename}
                    type="button"
                    onClick={() => setSelectedFile(filename)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono whitespace-nowrap transition border ${
                      isActive
                        ? 'bg-red-600 text-white font-bold border-red-700 shadow-xs'
                        : isDark
                        ? 'bg-[#131b2c] text-slate-300 hover:bg-[#1f2b44] border-[#25334d]'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300 shadow-2xs'
                    }`}
                  >
                    {getFileIcon(filename)}
                    <span>{filename}</span>
                  </button>
                );
              })}
            </div>

            {/* Code Content Container - Off-white in light mode */}
            <div className={`relative rounded-xl border p-2.5 text-[10.5px] font-mono overflow-x-auto max-h-[360px] shadow-2xs transition ${
              isDark
                ? 'border-[#25334d] bg-[#0c1220] text-slate-100'
                : 'border-slate-300 bg-[#f8fafc] text-slate-900'
            }`}>
              <div className={`flex items-center justify-between pb-1.5 mb-1.5 border-b ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'
              }`}>
                <span className="font-semibold">{selectedFile}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(EXTENSION_FILES[selectedFile] || '', 'file-code', selectedFile)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-sans font-semibold flex items-center gap-1 transition ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                  }`}
                >
                  {copiedId === 'file-code' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="leading-relaxed">
                <code>{EXTENSION_FILES[selectedFile] || ''}</code>
              </pre>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 4: FEEDBACK & BUG REPORTING SCREEN
           ========================================================================= */}
        {activeView === 'feedback' && (
          <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-0.5">
            <div
              className={`flex items-center justify-between p-2 rounded-xl border ${
                isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-300 shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveView('popup')}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:text-red-600 transition ${
                  isDark ? 'text-slate-300' : 'text-slate-800'
                }`}
              >
                <ArrowLeft size={13} />
                <span>Back to Hopper</span>
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                Bug Report / Feedback
              </span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
                isDark ? 'bg-[#131b2c] border-[#25334d]' : 'bg-white border-slate-300 shadow-2xs'
              }`}
            >
              <div className={`flex items-center gap-2 text-xs font-semibold ${
                isDark ? 'text-slate-200' : 'text-slate-900'
              }`}>
                <Bug size={14} className="text-red-600" />
                <span>Submit Feedback to Maintainer</span>
              </div>
              <p className={`text-[10.5px] leading-snug ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                For issues with DAM folder mapping or feature requests, contact Angelo Destro (HC/PHAC).
              </p>

              <div className="flex flex-col gap-1">
                <label className={`text-[9.5px] font-bold uppercase ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>Subject</label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  className={`px-2 py-1 text-xs font-medium rounded-md border focus:outline-none focus:border-red-500 ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-slate-300 bg-[#f8fafc] text-slate-900'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={`text-[9.5px] font-bold uppercase ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>Message / Issue Details</label>
                <textarea
                  rows={4}
                  value={feedbackBody}
                  onChange={(e) => setFeedbackBody(e.target.value)}
                  placeholder="Describe the URL and DAM folder behavior you encountered..."
                  className={`px-2.5 py-2 text-xs rounded-md border resize-none focus:outline-none focus:border-red-500 ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 text-slate-100'
                      : 'border-slate-300 bg-[#f8fafc] text-slate-900'
                  }`}
                />
              </div>

              <a
                href={`mailto:angelo.destro@hc-sc.gc.ca?subject=${encodeURIComponent(
                  feedbackSubject
                )}&body=${encodeURIComponent(feedbackBody || `AEM Page URL: ${scenario.url}`)}`}
                onClick={() => onToast('Opening email client for Angelo Destro…')}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-xs rounded-lg shadow-xs shadow-red-500/25 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
              >
                <Send size={12} />
                <span>Send Email to Angelo Destro</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

