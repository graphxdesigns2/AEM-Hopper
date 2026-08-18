import React, { useState } from 'react';
import { EXTENSION_FILES } from '../data/extensionFiles';
import { generateExtensionZip, downloadBlob } from '../utils/zipExport';
import { Copy, Check, Download, FileCode, FileJson, FileType2 } from 'lucide-react';

interface CodeViewerProps {
  onToast: (msg: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ onToast }) => {
  const fileKeys = Object.keys(EXTENSION_FILES);
  const [selectedFile, setSelectedFile] = useState<string>('popup.html');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleCopyCode = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    onToast(`Copied ${filename} to clipboard!`);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      onToast('Generating extension ZIP package…');
      const blob = await generateExtensionZip(EXTENSION_FILES);
      downloadBlob(blob, 'aem-asset-hopper-v1.2.zip');
      onToast('Downloaded aem-asset-hopper-v1.2.zip!');
    } catch (err) {
      onToast('Failed to export ZIP file.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.json')) return <FileJson size={14} className="text-amber-500" />;
    if (filename.endsWith('.html')) return <FileCode size={14} className="text-orange-500" />;
    if (filename.endsWith('.css')) return <FileType2 size={14} className="text-blue-500" />;
    return <FileCode size={14} className="text-yellow-500" />;
  };

  const currentContent = EXTENSION_FILES[selectedFile] || '';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 text-slate-800 dark:text-slate-100">
      {/* Action Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-red-600/10 via-amber-500/10 to-blue-600/10 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📦</span> Complete Firefox Extension Source Code
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Download the ready-to-load ZIP file or copy individual files directly into your project.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-xs shadow-md shadow-red-500/20 transition whitespace-nowrap"
        >
          <Download size={14} />
          <span>{isExporting ? 'Packaging…' : 'Download Extension (.ZIP)'}</span>
        </button>
      </div>

      {/* Code File Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
        {/* File Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-2 py-1 overflow-x-auto">
          <div className="flex items-center gap-1">
            {fileKeys.map((filename) => {
              const isActive = selectedFile === filename;
              return (
                <button
                  key={filename}
                  type="button"
                  onClick={() => setSelectedFile(filename)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-inner border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {getFileIcon(filename)}
                  <span>{filename}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleCopyCode(selectedFile, currentContent)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition active:scale-95 ml-2 flex-shrink-0"
          >
            {copiedFile === selectedFile ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="relative p-4 max-h-[580px] overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-[#0b0f17]">
          <pre className="overflow-x-auto">
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
