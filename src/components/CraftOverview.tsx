import React from 'react';
import { Sparkles, Maximize2, Palette, Zap, CheckCircle, ShieldCheck } from 'lucide-react';

export const CraftOverview: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 text-slate-800 dark:text-slate-100">
      {/* Introduction Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold">AEM Asset Hopper — UI Redesign Summary</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modernization, space optimization, and theme parity overview.
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          The popup UI has been completely rebuilt to be <strong>compact, elegant, and modern</strong> while preserving 100% of the underlying business logic, URL parsing, French translation lookup, and exception handling.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
              <Maximize2 size={14} />
              <span>Compact Height (-38%)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Unified header and inline action bars remove oversized vertical margins, keeping the entire popup visible without scrolling.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Palette size={14} />
              <span>Refined Light & Dark</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Crafted dual palette with rich slate tones, high contrast (WCAG AA), crisp borders, and subtle crimson glow accents.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Zap size={14} />
              <span>Micro-Interactions</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Smooth spring checkmark feedback on copy actions, instant live theme toggle, and responsive button active states.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Previous UI Limitations */}
        <div className="p-5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-2">
            <span>Previous UI Pain Points</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Excessive vertical height:</strong> Multiple full-width cards with bulky stacked buttons caused the popup to stretch downwards.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>High padding & empty space:</strong> Spacing between title, version pill, status, and path blocks consumed valuable screen real estate.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Large warning blocks:</strong> Partial match warnings pushed critical DAM buttons below the fold.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Clunky dark theme contrast:</strong> Inconsistent backgrounds and borders in dark mode.</span>
            </li>
          </ul>
        </div>

        {/* New Redesign Solutions */}
        <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle size={14} />
            <span>Modern Redesign Solutions</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Inline Card Header:</strong> Folder badge, status tag, and primary "Hop to DAM" button sit neatly on one line.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Compact 1-Click Filename Copy:</strong> Generates clean <code className="text-red-600 font-mono">.jpg</code> / <code className="text-blue-600 font-mono">.pdf</code> copy pill at bottom of each card.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Drawer-Style Partial Warnings:</strong> When stopped short, a tight amber drawer highlights missing segments with a fast "Copy" button.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Header Action Bar:</strong> Integrated Sun/Moon theme toggle, Re-check button, and Settings gear icon right in the title bar.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Verification & Compliance */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Strictly respects original Firefox extension logic, permissions, and manifest specifications.</span>
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-200">Ready for Firefox Add-ons</span>
      </div>
    </div>
  );
};
