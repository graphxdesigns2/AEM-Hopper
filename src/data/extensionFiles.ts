export const EXTENSION_FILES: Record<string, string> = {
  'manifest.json': `{
  "manifest_version": 3,
  "name": "AEM Asset Hopper",
  "version": "1.2",
  "browser_specific_settings": {
    "gecko": {
      "id": "aem-asset-folder-jump@local",
      "data_collection_permissions": {
        "required": [
          "none"
        ]
      }
    }
  },
  "description": "Jump from an AEM Author editor page straight to the matching DAM assets folder. Created by Angelo Destro.",
  "permissions": [
    "tabs",
    "storage",
    "clipboardWrite"
  ],
  "host_permissions": [
    "https://author-canada-prod.adobecqms.net/*",
    "https://canada-preview.adobecqms.net/*",
    "https://*.canada.ca/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "AEM Asset Hopper"
  },
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "background": {
    "scripts": ["background.js"]
  },
  "icons": {
    "48": "icon.png"
  }
}`,

  'popup.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEM Asset Hopper</title>
  <link rel="stylesheet" href="popup.css">
  <base target="_blank">
</head>
<body>
  <div class="popup-wrapper">
    <!-- Header -->
    <header class="app-header">
      <div class="brand-row">
        <div class="brand-left">
          <div class="brand-titles">
            <div class="title-row">
              <h1 class="brand-title">AEM Asset Hopper</h1>
              <span class="version-pill">v1.2</span>
            </div>
            <span class="brand-credit">by Angelo Destro</span>
          </div>
        </div>

        <div class="header-actions">
          <button id="theme-toggle-btn" class="icon-btn" title="Toggle light/dark theme" type="button" aria-label="Toggle theme">
            <svg class="sun-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
            <svg class="moon-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </button>
          <button id="retry-btn" class="icon-btn" title="Re-check current page" type="button" aria-label="Re-check">
            <svg class="refresh-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-3.09-6.79"/>
              <path d="M21 4v5h-5"/>
            </svg>
          </button>
          <button id="settings-btn" class="icon-btn" title="Open Settings" type="button" aria-label="Settings">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Current Page URL Strip -->
      <div class="page-strip">
        <div class="page-badge">PAGE</div>
        <div id="page-info" class="page-url" title="Current Editor Path">Reading current tab…</div>
        <button id="copy-page-url-btn" class="strip-copy-btn" title="Copy editor path" type="button">
          <span class="icon-wrapper">
            <svg class="icon-copy" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            <svg class="icon-check" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </span>
        </button>
      </div>

      <!-- French / Translation Note Container -->
      <div id="lang-note" class="lang-note" style="display: none;"></div>
    </header>

    <!-- Author Switcher Banner for Live/Preview Pages -->
    <div id="env-switch-container" style="display: none;">
      <button id="open-author-btn" class="btn-author" type="button">
        <div class="author-btn-text">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>Open this page in <strong>Author Editor</strong></span>
        </div>
        <svg class="author-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <!-- Status Message -->
    <div id="status" class="status-msg"></div>

    <!-- Main Results Section -->
    <main id="results" class="results-grid">
      <div id="missing-folders-container" style="display: none;"></div>
    </main>

    <!-- Recently Viewed DAM Folders Section -->
    <div id="recently-viewed-container" style="display: none;"></div>

    <!-- Footer -->
    <footer class="app-footer">
      <a class="bug-link" href="mailto:angelo.destro@hc-sc.gc.ca?subject=Reporting a bug with AEM Asset Hopper" target="_blank">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
        </svg>
        <span>Feedback & Bug reporting</span>
      </a>
      <span class="footer-dept">Health Canada & PHAC</span>
    </footer>
  </div>

  <script src="popup.js"></script>
</body>
</html>`,

  'popup.css': `/* ==========================================================================
   AEM Asset Hopper — Popup Stylesheet (Light & Dark Theme)
   Modern, Compact, High-Density WebExtension Layout
   ========================================================================== */

:root {
  --bg-app: #ffffff;
  --bg-card: #ffffff;
  --bg-subtle: #f8fafc;
  --bg-hover: #f1f5f9;
  --bg-active: #e2e8f0;

  --border-light: #e2e8f0;
  --border-card: #e2e8f0;
  --border-hover: #cbd5e1;
  --border-focus: #dc2626;

  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-subtle: #94a3b8;
  --text-code: #1e293b;

  --primary: #dc2626;
  --primary-hover: #b91c1c;
  --primary-active: #991b1b;
  --primary-subtle: #fef2f2;
  --primary-border: #fecaca;
  --primary-glow: rgba(220, 38, 38, 0.15);

  --success: #059669;
  --success-bg: #ecfdf5;
  --success-border: #a7f3d0;
  --success-text: #047857;

  --warning: #d97706;
  --warning-bg: #fffbeb;
  --warning-border: #fde68a;
  --warning-text: #92400e;

  --info: #2563eb;
  --info-bg: #eff6ff;
  --info-border: #bfdbfe;
  --info-text: #1d4ed8;

  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", "Liberation Mono", Menlo, Consolas, monospace;

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-pill: 9999px;

  --shadow-card: 0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03);
  --shadow-hover: 0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04);
  --shadow-primary: 0 2px 8px var(--primary-glow);

  --transition-fast: 0.12s ease;
  --transition-base: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

[data-theme="dark"] {
  --bg-app: #0b0f17;
  --bg-card: #131b2c;
  --bg-subtle: #1c273e;
  --bg-hover: #263554;
  --bg-active: #32446a;

  --border-light: #1f2d45;
  --border-card: #25334d;
  --border-hover: #3d5075;
  --border-focus: #ef4444;

  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-subtle: #64748b;
  --text-code: #e2e8f0;

  --primary: #ef4444;
  --primary-hover: #dc2626;
  --primary-active: #b91c1c;
  --primary-subtle: rgba(239, 68, 68, 0.14);
  --primary-border: rgba(239, 68, 68, 0.3);
  --primary-glow: rgba(239, 68, 68, 0.25);

  --success: #34d399;
  --success-bg: rgba(16, 185, 129, 0.12);
  --success-border: rgba(16, 185, 129, 0.25);
  --success-text: #6ee7b7;

  --warning: #fbbf24;
  --warning-bg: rgba(245, 158, 11, 0.12);
  --warning-border: rgba(245, 158, 11, 0.28);
  --warning-text: #fde68a;

  --info: #60a5fa;
  --info-bg: rgba(37, 99, 235, 0.14);
  --info-border: rgba(37, 99, 235, 0.3);
  --info-text: #93c5fd;

  --shadow-card: 0 2px 6px rgba(0, 0, 0, 0.35);
  --shadow-hover: 0 6px 16px rgba(0, 0, 0, 0.5);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  width: 460px;
  min-width: 440px;
  max-width: 480px;
  font-family: var(--font-sans);
  background-color: var(--bg-app);
  color: var(--text-main);
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 10px 10px 8px;
  overflow-x: hidden;
  user-select: none;
}

.popup-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Header */
.app-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  box-shadow: var(--shadow-card);
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.brand-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px var(--primary-glow);
  flex-shrink: 0;
}

.brand-titles {
  display: flex;
  flex-direction: column;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: var(--text-main);
  line-height: 1.2;
}

.version-pill {
  font-size: 9px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-subtle);
  border: 1px solid var(--primary-border);
  padding: 1px 5px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.brand-credit {
  font-size: 9px;
  color: var(--text-muted);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.icon-btn:hover {
  color: var(--text-main);
  background: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: scale(0.94);
}

.icon-btn svg {
  transition: transform var(--transition-base);
}

.icon-btn#retry-btn:hover svg {
  transform: rotate(180deg);
}

[data-theme="dark"] .sun-icon { display: block; }
[data-theme="dark"] .moon-icon { display: none; }
:root:not([data-theme="dark"]) .sun-icon { display: none; }
:root:not([data-theme="dark"]) .moon-icon { display: block; }

/* Current Page Strip */
.page-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 4px 6px;
}

.page-badge {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 2px 4px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
}

.page-url {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-code);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
  line-height: 1.3;
  user-select: text;
}

.strip-copy-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.strip-copy-btn:hover {
  color: var(--text-main);
  background: var(--bg-hover);
}

/* Language Note */
.lang-note {
  font-size: 10px;
  color: var(--info-text);
  background: var(--info-bg);
  border: 1px solid var(--info-border);
  border-radius: var(--radius-sm);
  padding: 4px 7px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Author Switcher */
.btn-author {
  width: 100%;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--primary-border);
  color: #ffffff;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: var(--shadow-primary);
  transition: all var(--transition-base);
}

.btn-author:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--primary-glow);
}

.btn-author:active {
  transform: scale(0.98);
}

.author-btn-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-arrow {
  transition: transform var(--transition-fast);
}

.btn-author:hover .author-arrow {
  transform: translateX(2px);
}

/* Status Message */
.status-msg {
  font-size: 10.5px;
  color: var(--text-muted);
  padding: 0 4px;
  min-height: 0;
  transition: all var(--transition-fast);
}

.status-msg:empty {
  display: none;
}

/* Results Grid */
.results-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Result Card */
.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all var(--transition-base);
  position: relative;
}

.result-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-hover);
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.folder-badge-group {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.folder-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.status-tag {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.status-tag.status-warn {
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  color: var(--warning-text);
}

.card-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-filename-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  font-size: 10.5px;
  font-weight: 700;
  font-family: var(--font-sans);
  color: #ffffff;
  background: #3E517A;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(62, 81, 122, 0.2);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-filename-copy:hover {
  background: #324264;
}

[data-theme="dark"] .btn-filename-copy {
  background: #3E517A;
}

[data-theme="dark"] .btn-filename-copy:hover {
  background: #4A5F8C;
}

.btn-filename-copy:active {
  transform: scale(0.97);
  background: #283552;
}

.btn-hop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  font-size: 10.5px;
  font-weight: 700;
  color: #ffffff;
  background: #dc2626;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.25);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-hop:hover {
  background: #b91c1c;
}

.btn-hop:active {
  background: #991b1b;
  transform: scale(0.97);
}

.btn-hop:hover {
  background: var(--primary-hover);
  box-shadow: 0 3px 10px var(--primary-glow);
  transform: translateY(-1px);
}

.btn-hop:active {
  transform: scale(0.96);
}

.btn-hop .hop-arrow {
  transition: transform var(--transition-fast);
}

.btn-hop:hover .hop-arrow {
  transform: translateX(2px);
}

/* Path Row */
.path-row {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 3px 6px;
}

.folder-path-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.path-text {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-code);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
  line-height: 1.35;
  user-select: text;
}

.btn-path-copy {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.btn-path-copy:hover {
  color: var(--text-main);
  background: var(--bg-hover);
}

/* Card Bottom Toolbar */
.card-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px solid var(--border-light);
}

.btn-filename-copy {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 500;
  font-family: var(--font-mono);
  color: var(--text-code);
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-filename-copy:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-main);
}

.btn-filename-copy:active {
  transform: scale(0.97);
}

.filename-badge {
  font-size: 8.5px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-subtle);
  padding: 1px 4px;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
}

/* Partial Warning Drawer */
.partial-drawer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-sm);
  padding: 5px 8px;
  font-size: 10px;
}

.partial-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: var(--warning-text);
}

.partial-path-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.partial-path-chip {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--text-code);
  background: var(--bg-card);
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-xs);
  padding: 2px 6px;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.partial-path-chip::-webkit-scrollbar {
  display: none;
}

.btn-partial-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  font-size: 9.5px;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-xs);
  color: var(--warning-text);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-partial-copy:hover {
  background: var(--warning-text);
  color: #ffffff;
}

/* Missing Section */
.missing-section {
  background: var(--bg-card);
  border: 1px solid var(--warning-border);
  border-left: 3px solid var(--warning);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-card);
}

.missing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.missing-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--warning-text);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-copy-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--warning-text);
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-copy-all:hover {
  background: var(--warning-text);
  color: #ffffff;
}

.missing-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  list-style: none;
}

.missing-item {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--text-code);
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xs);
  padding: 3px 6px;
  word-break: break-all;
}

/* Recent Section */
.recent-section {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  box-shadow: var(--shadow-card);
}

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.recent-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.recent-title svg,
.recent-title .recent-icon {
  color: #f59e0b;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xs);
  cursor: pointer;
  text-decoration: none;
  color: var(--text-main);
  transition: all var(--transition-fast);
}

.recent-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateX(1px);
}

.recent-item-path {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--text-code);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
}

.recent-item-time {
  font-size: 8.5px;
  color: var(--text-subtle);
  flex-shrink: 0;
}

/* Copy Animation */
.icon-wrapper {
  position: relative;
  width: 12px;
  height: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrapper svg {
  position: absolute;
  inset: 0;
  width: 12px;
  height: 12px;
  fill: currentColor;
  transition: transform var(--transition-bounce), opacity var(--transition-fast);
}

.icon-copy {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.icon-check {
  opacity: 0;
  transform: scale(0.2) rotate(-45deg);
  color: var(--success);
}

.copied .icon-copy {
  opacity: 0;
  transform: scale(0.2) rotate(45deg);
}

.copied .icon-check {
  opacity: 1;
  transform: scale(1.15) rotate(0deg);
  color: var(--success);
}

/* Footer */
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 0;
  font-size: 9px;
  color: var(--text-subtle);
}

.bug-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.bug-link:hover {
  color: var(--primary);
  text-decoration: underline;
}

.footer-dept {
  font-weight: 500;
  color: var(--text-subtle);
}`,

  'popup.js': `/**
 * AEM Asset Hopper — Popup Controller
 * Enhanced with modern compact UI, dual light/dark theme support, and micro-interactions.
 * Created by Angelo Destro.
 */

const AUTHOR_HOST = 'https://author-canada-prod.adobecqms.net';

const COPY_ICON_PATH =
  'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z';
const CHECK_ICON_PATH = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';

const DOCUMENT_ICON_PATH =
  'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z';
const IMAGE_ICON_PATH =
  'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z';
const WARN_ICON_PATH =
  'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01';

const CONJUNCTION_WORDS = new Set([
  'and', 'or', 'but', 'nor', 'for', 'so', 'yet',
  'because', 'although', 'though', 'while', 'if', 'unless', 'since', 'as',
  'et', 'ou', 'mais', 'ni', 'car', 'donc', 'or', 'pourtant',
  'parce', 'quoique', 'bien', 'tandis', 'si', 'sauf', 'depuis', 'comme',
  'que', 'quand', 'lorsque', 'puisque', 'afin', 'pour', 'avec', 'sans'
]);

const FORBIDDEN_FILENAME_CHARS = /[#%&{}\\<>]/g;

function createSVG(pathD, strokeColor = null, strokeWidth = null) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  if (strokeColor) {
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', strokeColor);
    svg.setAttribute('stroke-width', strokeWidth || '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
  } else {
    svg.setAttribute('fill', 'currentColor');
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

function createIconWrapper() {
  const wrapper = document.createElement('span');
  wrapper.className = 'icon-wrapper';
  const copySvg = createSVG(COPY_ICON_PATH);
  copySvg.classList.add('icon-copy');
  const checkSvg = createSVG(CHECK_ICON_PATH);
  checkSvg.classList.add('icon-check');
  wrapper.appendChild(copySvg);
  wrapper.appendChild(checkSvg);
  return wrapper;
}

function copyToClipboard(text, buttonElement) {
  navigator.clipboard.writeText(text).then(() => {
    buttonElement.classList.add('copied');
    setTimeout(() => {
      buttonElement.classList.remove('copied');
    }, 1800);
  });
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return \`\${minutes}m ago\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \`\${hours}h ago\`;
  return \`\${Math.floor(hours / 24)}d ago\`;
}

function truncateEditorUrl(urlStr) {
  const prefix = 'https://author-canada-prod.adobecqms.net/editor.html';
  if (urlStr.startsWith(prefix)) {
    return '…' + urlStr.slice(prefix.length);
  }
  return urlStr;
}

function generateAssetName(urlStr) {
  let u;
  try {
    u = new URL(urlStr);
  } catch (e) {
    return null;
  }

  const pathNoQuery = u.pathname.split('?')[0].split('#')[0];
  const segments = pathNoQuery.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  let lastSegment = segments[segments.length - 1];
  try {
    lastSegment = decodeURIComponent(lastSegment);
  } catch (e) {}

  lastSegment = lastSegment.replace(/\\.html$/i, '');
  lastSegment = lastSegment.replace(FORBIDDEN_FILENAME_CHARS, '');

  const words = lastSegment
    .split(/[\\s\\-_]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !CONJUNCTION_WORDS.has(w.toLowerCase()));

  if (words.length === 0) return null;

  const name = words
    .join('-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return name || null;
}

function parseEditorUrl(urlStr, deptMap = {}) {
  let u;
  try {
    u = new URL(urlStr);
  } catch (e) {
    return null;
  }

  if (!u.pathname.startsWith('/editor.html/content/')) return null;

  const contentPath = u.pathname.replace(/^\\/editor\\.html/, '');
  const parts = contentPath.split('/').filter(Boolean);

  if (parts[0] !== 'content' || parts.length < 4) return null;

  const siteRoot = parts[1];
  const lang = parts[2];

  let deptSlug;
  let folderSegments = [];

  if (parts[3].toLowerCase() === 'services' && parts.length > 4) {
    const rawPart4 = parts[4].replace(/\\.html$/i, '').toLowerCase();

    if (deptMap[rawPart4]) {
      deptSlug = rawPart4;
      const remaining = parts.slice(5);

      if (remaining.length <= 1) {
        folderSegments = ['features'];
      } else {
        folderSegments = remaining;
      }
    } else {
      deptSlug = rawPart4;
      folderSegments = parts.slice(4);
    }
  } else {
    deptSlug = parts[3].toLowerCase();
    folderSegments = parts.slice(4);
  }

  if (folderSegments.length > 0) {
    const lastIdx = folderSegments.length - 1;
    if (folderSegments[lastIdx].endsWith('.html')) {
      folderSegments[lastIdx] = folderSegments[lastIdx].replace(/\\.html$/i, '');
    }
  }

  return { origin: u.origin, siteRoot, lang, deptSlug, folderSegments };
}

function getAuthorEditorUrl(urlStr) {
  let u;
  try {
    u = new URL(urlStr);
  } catch (e) {
    return null;
  }

  if (u.pathname.startsWith('/editor.html/')) return null;

  const isPreview = u.hostname === 'canada-preview.adobecqms.net';
  const isLive = u.hostname === 'canada.ca' || u.hostname.endsWith('.canada.ca');

  if (isPreview || isLive) {
    let path = u.pathname;
    if (!path.endsWith('.html') && !path.endsWith('/')) {
      path += '.html';
    }
    if (!path.startsWith('/content/')) {
      path = '/content/canadasite' + path;
    }
    return \`\${AUTHOR_HOST}/editor.html\${path}\`;
  }

  return null;
}

function findException(urlStr, exceptions) {
  let u;
  try {
    u = new URL(urlStr);
  } catch (e) {
    return null;
  }
  if (!u.pathname.startsWith('/editor.html/content/')) return null;

  const contentPath = u.pathname
    .replace(/^\\/editor\\.html/i, '')
    .replace(/\\.html$/i, '')
    .replace(/\\/$/, '');

  return (exceptions || []).find((ex) => ex.contentPath === contentPath) || null;
}

async function resolveEnglishEquivalent(editorUrlStr) {
  let u;
  try {
    u = new URL(editorUrlStr);
  } catch (e) {
    return null;
  }

  const contentPath = u.pathname.replace(/^\\/editor\\.html/i, '');
  let renderPath = contentPath;
  if (!renderPath.endsWith('.html')) renderPath += '.html';

  const fetchUrl = \`\${u.origin}\${renderPath}?wcmmode=disabled\`;

  let html;
  try {
    const res = await fetch(fetchUrl, { credentials: 'include' });
    if (!res.ok) return null;
    html = await res.text();
  } catch (e) {
    return null;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');

  const link =
    doc.querySelector('#wb-lng a[lang="en"]') ||
    doc.querySelector('#wb-lng a[hreflang^="en"]') ||
    doc.querySelector('#wb-lng a') ||
    doc.querySelector('link[rel="alternate"][hreflang^="en"]') ||
    doc.querySelector('a[hreflang^="en"]');

  const href = link?.getAttribute('href');
  if (!href) return null;

  let englishPath;
  try {
    englishPath = new URL(href, u.origin).pathname;
  } catch (e) {
    return null;
  }

  if (!englishPath.endsWith('.html')) englishPath += '.html';
  if (!englishPath.startsWith('/content/')) {
    englishPath = '/content/canadasite' + englishPath;
  }

  return \`\${u.origin}/editor.html\${englishPath}\`;
}

async function loadConfig() {
  const stored = await browser.storage.local.get([
    'deptMap',
    'subfolders',
    'exceptions',
    'darkMode'
  ]);

  const defaultDeptMap = {
    'health-canada': 'hc-sc',
    'public-health': 'phac-aspc',
    health: 'hc-sc'
  };

  const defaultExceptions = [
    {
      contentPath: '/content/canadasite/en/services/health/food-safety',
      damPath: '/content/dam/hc-sc/images/services/health/food-safety'
    }
  ];

  const deptMap = {
    ...defaultDeptMap,
    ...(stored.deptMap || {})
  };

  const subfolders =
    stored.subfolders && stored.subfolders.length
      ? stored.subfolders
      : ['images', 'documents'];

  const exceptions =
    stored.exceptions && stored.exceptions.length
      ? stored.exceptions
      : defaultExceptions;

  const darkMode = stored.darkMode === true;

  return { deptMap, subfolders, exceptions, darkMode };
}

async function loadRecentPaths() {
  const stored = await browser.storage.local.get(['recentPaths', 'showRecent']);
  return {
    recentPaths: stored.recentPaths || [],
    showRecent: stored.showRecent === true
  };
}

async function addRecentPath(origin, path, subfolder) {
  const stored = await browser.storage.local.get('recentPaths');
  let recent = stored.recentPaths || [];

  recent = recent.filter((r) => r.path !== path);

  recent.unshift({
    path,
    subfolder,
    origin,
    timestamp: Date.now()
  });

  if (recent.length > 6) recent = recent.slice(0, 6);

  await browser.storage.local.set({ recentPaths: recent });
}

function applyTheme(isDark) {
  if (isDark) {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.body.removeAttribute('data-theme');
  }
}

function showLangNote(text) {
  const el = document.getElementById('lang-note');
  if (!el) return;
  if (!text) {
    el.style.display = 'none';
    el.textContent = '';
    return;
  }
  el.style.display = 'flex';
  el.textContent = text;
}

function setLoadingState(isLoading) {
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.disabled = isLoading;
    retryBtn.style.opacity = isLoading ? '0.5' : '1';
  }
}

function renderRecentlyViewed(recentPaths, resultsContainer) {
  const existing = document.getElementById('recently-viewed-container');
  if (!existing) return;

  if (!recentPaths || recentPaths.length === 0) {
    existing.style.display = 'none';
    existing.innerHTML = '';
    return;
  }

  existing.style.display = 'block';
  existing.className = 'recent-section';
  existing.innerHTML = \`
    <div class="recent-header">
      <div class="recent-title">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>Recently viewed</span>
      </div>
    </div>
    <div class="recent-list" id="recent-list-items"></div>
  \`;

  const list = document.getElementById('recent-list-items');

  recentPaths.forEach((item) => {
    const isDocument = item.subfolder.toLowerCase().includes('doc');
    const row = document.createElement('a');
    row.className = 'recent-item';
    row.href = '#';
    row.title = 'Open in DAM';
    row.addEventListener('click', (e) => {
      e.preventDefault();
      browser.tabs.create({ url: \`\${item.origin}/assets.html\${item.path}\` });
    });

    const iconSvg = createSVG(isDocument ? DOCUMENT_ICON_PATH : IMAGE_ICON_PATH);
    iconSvg.style.width = '11px';
    iconSvg.style.height = '11px';
    iconSvg.style.flexShrink = '0';
    iconSvg.style.color = isDocument ? 'var(--info)' : 'var(--primary)';

    const rowPath = document.createElement('span');
    rowPath.className = 'recent-item-path';
    let displayPath = item.path || '';
    if (displayPath.includes('/content/dam')) {
      displayPath = displayPath.substring(displayPath.indexOf('/content/dam'));
    }
    rowPath.textContent = displayPath;

    const rowTime = document.createElement('span');
    rowTime.className = 'recent-item-time';
    rowTime.textContent = timeAgo(item.timestamp);

    row.appendChild(iconSvg);
    row.appendChild(rowPath);
    row.appendChild(rowTime);
    list.appendChild(row);
  });
}

function renderMissingFoldersSection(missingPaths) {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;

  const existingContainer = document.getElementById('missing-folders-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  if (!missingPaths || missingPaths.length === 0) return;

  const container = document.createElement('div');
  container.id = 'missing-folders-container';
  container.className = 'missing-section';

  const header = document.createElement('div');
  header.className = 'missing-header';

  const title = document.createElement('div');
  title.className = 'missing-title';
  const warnSvg = createSVG(WARN_ICON_PATH, 'currentColor', '2');
  warnSvg.style.width = '12px';
  warnSvg.style.height = '12px';

  const titleText = document.createElement('span');
  titleText.textContent = \`Missing Folder\${missingPaths.length > 1 ? 's' : ''}\`;
  title.appendChild(warnSvg);
  title.appendChild(titleText);
  header.appendChild(title);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn-copy-all';
  copyBtn.appendChild(createIconWrapper());
  const btnLabel = document.createElement('span');
  btnLabel.textContent = 'Copy all';
  copyBtn.appendChild(btnLabel);

  copyBtn.addEventListener('click', () => {
    copyToClipboard(missingPaths.join('\\n'), copyBtn);
  });

  header.appendChild(copyBtn);
  container.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'missing-list';
  missingPaths.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'missing-item';
    li.textContent = p;
    list.appendChild(li);
  });
  container.appendChild(list);

  resultsContainer.appendChild(container);
}

function renderResults(parsed, results, tabUrl) {
  const container = document.getElementById('results');
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const anyExists = results.some((r) => r.exists);
  if (!anyExists) {
    document.getElementById('status').textContent =
      'No DAM folder found under any configured paths.';

    const missingPaths = results.map(
      (r) =>
        r.basePath ||
        r.deepestPath ||
        \`/content/dam/\${r.deptCode || 'hc-sc'}/\${r.subfolder}\`
    );
    renderMissingFoldersSection(missingPaths);
    return;
  }

  document.getElementById('status').textContent = '';

  const baseName = generateAssetName(tabUrl) || 'asset-name';

  results
    .filter((r) => r.exists)
    .forEach((r) => {
      const card = document.createElement('div');
      card.className = 'result-card';

      const isDocument = r.subfolder.toLowerCase().includes('doc');
      const extension = isDocument ? '.pdf' : '.jpg';
      const fullFileName = \`\${baseName}\${extension}\`;
      const isPartial = r.reachedSegments < parsed.folderSegments.length;

      const topRow = document.createElement('div');
      topRow.className = 'card-top-row';

      const badgeGroup = document.createElement('div');
      badgeGroup.className = 'folder-badge-group';

      const folderPill = document.createElement('span');
      folderPill.className = \`folder-pill folder-\${isDocument ? 'documents' : 'images'}\`;

      const iconSvg = createSVG(isDocument ? DOCUMENT_ICON_PATH : IMAGE_ICON_PATH);
      iconSvg.style.width = '11px';
      iconSvg.style.height = '11px';
      folderPill.appendChild(iconSvg);

      const folderName = document.createElement('span');
      folderName.textContent = r.subfolder;
      folderPill.appendChild(folderName);
      badgeGroup.appendChild(folderPill);

      if (isPartial) {
        const statusTag = document.createElement('span');
        statusTag.className = 'status-tag status-warn';
        statusTag.textContent = 'Partial';
        badgeGroup.appendChild(statusTag);
      }

      topRow.appendChild(badgeGroup);

      const actionGroup = document.createElement('div');
      actionGroup.className = 'card-actions-group';

      const filenameBtn = document.createElement('button');
      filenameBtn.type = 'button';
      filenameBtn.className = 'btn-filename-copy';
      filenameBtn.title = \`Click to copy filename: \${fullFileName}\`;
      filenameBtn.appendChild(createIconWrapper());

      const fileNameLabel = document.createElement('span');
      fileNameLabel.className = 'copy-label-text';
      fileNameLabel.textContent = isDocument ? 'Copy .pdf' : 'Copy .jpg';
      filenameBtn.appendChild(fileNameLabel);

      filenameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(fullFileName, filenameBtn);
      });

      actionGroup.appendChild(filenameBtn);

      const hopBtn = document.createElement('button');
      hopBtn.type = 'button';
      hopBtn.className = 'btn-hop';
      hopBtn.title = \`Hop into \${r.subfolder} DAM folder\`;
      hopBtn.innerHTML = \`
        <span>Hop to DAM</span>
        <svg class="hop-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      \`;

      hopBtn.addEventListener('click', () => {
        addRecentPath(parsed.origin, r.deepestPath, r.subfolder);
        browser.tabs.create({ url: \`\${parsed.origin}/assets.html\${r.deepestPath}\` });
      });

      actionGroup.appendChild(hopBtn);
      topRow.appendChild(actionGroup);
      card.appendChild(topRow);

      let displayPath = r.deepestPath || '';
      if (displayPath.includes('/content/dam')) {
        displayPath = displayPath.substring(displayPath.indexOf('/content/dam'));
      }

      const pathRow = document.createElement('div');
      pathRow.className = 'path-row';

      const folderIcon = document.createElement('span');
      folderIcon.className = 'folder-path-icon';
      folderIcon.innerHTML = \`
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      \`;

      const pathText = document.createElement('div');
      pathText.className = 'path-text';
      pathText.textContent = displayPath;
      pathText.title = displayPath;

      const pathCopyBtn = document.createElement('button');
      pathCopyBtn.type = 'button';
      pathCopyBtn.className = 'btn-path-copy';
      pathCopyBtn.title = 'Copy full DAM path';
      pathCopyBtn.appendChild(createIconWrapper());

      pathCopyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(displayPath, pathCopyBtn);
      });

      pathRow.appendChild(folderIcon);
      pathRow.appendChild(pathText);
      pathRow.appendChild(pathCopyBtn);
      card.appendChild(pathRow);

      if (isPartial) {
        const shortLevels = parsed.folderSegments.length - r.reachedSegments;
        const missingSegments = parsed.folderSegments.slice(r.reachedSegments);
        const missingPathOnly = missingSegments.join('/');

        const partialDrawer = document.createElement('div');
        partialDrawer.className = 'partial-drawer';

        const partialHeader = document.createElement('div');
        partialHeader.className = 'partial-header';
        const warnIcon = createSVG(WARN_ICON_PATH, 'currentColor', '2');
        warnIcon.style.width = '11px';
        warnIcon.style.height = '11px';
        partialHeader.appendChild(warnIcon);

        const warnText = document.createElement('span');
        warnText.textContent = \`Stopped \${shortLevels} level\${shortLevels > 1 ? 's' : ''} short — deeper path missing:\`;
        partialHeader.appendChild(warnText);
        partialDrawer.appendChild(partialHeader);

        const partialPathRow = document.createElement('div');
        partialPathRow.className = 'partial-path-row';

        const chip = document.createElement('div');
        chip.className = 'partial-path-chip';
        chip.textContent = missingPathOnly;
        chip.title = missingPathOnly;

        const copyMissingBtn = document.createElement('button');
        copyMissingBtn.type = 'button';
        copyMissingBtn.className = 'btn-partial-copy';
        copyMissingBtn.title = 'Copy missing segment';
        copyMissingBtn.appendChild(createIconWrapper());

        const copyMissingLabel = document.createElement('span');
        copyMissingLabel.textContent = 'Copy';
        copyMissingBtn.appendChild(copyMissingLabel);

        copyMissingBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          copyToClipboard(missingPathOnly, copyMissingBtn);
        });

        partialPathRow.appendChild(chip);
        partialPathRow.appendChild(copyMissingBtn);
        partialDrawer.appendChild(partialPathRow);
        card.appendChild(partialDrawer);
      }

      container.appendChild(card);
    });

  const notFound = results.filter((r) => !r.exists);
  if (notFound.length > 0) {
    const missingPaths = notFound
      .map((r) => r.basePath || (r.deepestPath ? \`\${r.deepestPath}/\${r.subfolder}\` : null))
      .filter(Boolean);
    if (missingPaths.length > 0) {
      renderMissingFoldersSection(missingPaths);
    }
  }
}

function renderNotEditorPage() {
  document.getElementById('page-info').textContent = 'Not an AEM editor page';
  document.getElementById('status').textContent =
    'Please navigate to an AEM Author page (/editor.html) and reopen.';
}

function renderNoMapping(deptSlug) {
  document.getElementById('status').textContent =
    \`No DAM mapping found for department slug "\${deptSlug}". Add in Settings.\`;
}

async function run() {
  const statusEl = document.getElementById('status');
  setLoadingState(true);
  statusEl.textContent = 'Checking DAM folders…';

  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      renderNotEditorPage();
      return;
    }

    const pageInfoEl = document.getElementById('page-info');
    pageInfoEl.textContent = truncateEditorUrl(tab.url);

    const copyPageBtn = document.getElementById('copy-page-url-btn');
    if (copyPageBtn) {
      copyPageBtn.onclick = () => copyToClipboard(tab.url, copyPageBtn);
    }

    const authorUrl = getAuthorEditorUrl(tab.url);
    const envSwitchContainer = document.getElementById('env-switch-container');
    const authorBtn = document.getElementById('open-author-btn');

    if (authorUrl && authorBtn && envSwitchContainer) {
      envSwitchContainer.style.display = 'block';
      authorBtn.onclick = async () => {
        envSwitchContainer.style.display = 'none';
        statusEl.textContent = 'Opening in Author Editor…';
        setLoadingState(true);
        await browser.tabs.update(tab.id, { url: authorUrl });
        setTimeout(() => { run(); }, 1800);
      };

      statusEl.textContent = 'Preview/Live page detected. Use button above to open Author.';
      setLoadingState(false);
      return;
    } else if (envSwitchContainer) {
      envSwitchContainer.style.display = 'none';
    }

    const { deptMap, subfolders, exceptions, darkMode } = await loadConfig();
    applyTheme(darkMode);

    let effectiveUrl = tab.url;
    showLangNote('');

    const langCheck = parseEditorUrl(tab.url, deptMap);
    if (langCheck && langCheck.lang && langCheck.lang.toLowerCase() === 'fr') {
      statusEl.textContent = 'French page detected — resolving English equivalent…';
      const resolved = await resolveEnglishEquivalent(tab.url);
      if (resolved) {
        effectiveUrl = resolved;
        showLangNote(\`🌐 English equivalent: \${new URL(resolved).pathname.replace(/^\\/editor\\.html/, '')}\`);
      } else {
        showLangNote('⚠️ English equivalent not found — using French URL directly.');
      }
    }

    const exceptionMatch = findException(effectiveUrl, exceptions);
    if (exceptionMatch) {
      const origin = new URL(effectiveUrl).origin;
      const damParts = exceptionMatch.damPath.split('/').filter(Boolean);

      if (damParts[0] !== 'content' || damParts[1] !== 'dam' || damParts.length < 4) {
        statusEl.textContent = 'Malformed Exception DAM path in Settings.';
        return;
      }

      const deptCode = damParts[2];
      const segments = damParts.slice(4);

      statusEl.textContent = \`Checking exception folder for "\${deptCode}"…\`;

      const response = await Promise.race([
        browser.runtime.sendMessage({
          type: 'ASSETFOLDER_FIND',
          origin,
          deptCode,
          segments,
          subfolders,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), 10000)),
      ]);

      if (response && response.success) {
        renderResults({ origin, folderSegments: segments }, response.results, tab.url);
        const { recentPaths, showRecent } = await loadRecentPaths();
        if (showRecent) {
          renderRecentlyViewed(recentPaths, document.getElementById('results'));
        }
      } else {
        statusEl.textContent = response?.error || 'Failed to retrieve DAM folders.';
      }
      return;
    }

    const parsed = parseEditorUrl(effectiveUrl, deptMap);
    if (!parsed) {
      renderNotEditorPage();
      return;
    }

    const deptSlug = parsed.deptSlug.toLowerCase();
    const deptCode = deptMap[deptSlug];

    if (!deptCode) {
      renderNoMapping(parsed.deptSlug);
      return;
    }

    statusEl.textContent = \`Checking DAM folders for "\${deptCode}"…\`;

    const response = await Promise.race([
      browser.runtime.sendMessage({
        type: 'ASSETFOLDER_FIND',
        origin: parsed.origin,
        deptCode,
        segments: parsed.folderSegments,
        subfolders,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), 10000)),
    ]);

    if (response && response.success) {
      renderResults(parsed, response.results, tab.url);
      const { recentPaths, showRecent } = await loadRecentPaths();
      if (showRecent) {
        renderRecentlyViewed(recentPaths, document.getElementById('results'));
      }
    } else {
      statusEl.textContent = response?.error || 'Failed to retrieve DAM folders.';
    }
  } catch (err) {
    statusEl.textContent = \`Error: \${err.message || 'Could not communicate with background script.'}\`;
  } finally {
    setLoadingState(false);
  }
}

async function toggleTheme() {
  const { darkMode } = await loadConfig();
  const newTheme = !darkMode;
  await browser.storage.local.set({ darkMode: newTheme });
  applyTheme(newTheme);
}

document.getElementById('retry-btn')?.addEventListener('click', run);
document.getElementById('settings-btn')?.addEventListener('click', () => browser.runtime.openOptionsPage());
document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

run();`,

  'options.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEM Asset Hopper — Settings</title>
  <link rel="stylesheet" href="options.css">
  <base target="_blank">
</head>
<body>
  <div class="settings-container">
    <header class="settings-header">
      <div class="header-left">
        <div class="logo-box">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
        <div>
          <h1>AEM Asset Hopper — Settings</h1>
          <p class="subtitle">Configure department slug mappings, subfolders, page exceptions, and popup preferences.</p>
        </div>
      </div>
      <div class="header-actions">
        <button id="header-save-btn" class="btn btn-primary" type="button">Save Settings</button>
      </div>
    </header>

    <div class="tip-banner">
      <div class="tip-icon">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="tip-content">
        <strong>How Mapping Works:</strong> Mapping <code>health</code> &rarr; <code>hc-sc</code> automatically maps page URLs like <code>../services/health/..</code> to DAM folders under <code>../hc-sc/images/features/..</code>.
      </div>
    </div>

    <div class="settings-grid">
      <section class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Department Mappings</h2>
            <p>Map page URL department slug to DAM folder code (under <code>/content/dam/</code>).</p>
          </div>
          <button id="add-row" class="btn btn-sm btn-secondary" type="button">+ Add Mapping</button>
        </div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 46%;">Content Slug</th>
                  <th style="width: 46%;">DAM Dept Code</th>
                  <th style="width: 8%;"></th>
                </tr>
              </thead>
              <tbody id="mapping-rows"></tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h2>Asset Subfolders</h2>
            <p>Subfolders checked right after dept code (e.g. <code>images</code>, <code>documents</code>).</p>
          </div>
          <button id="add-subfolder-row" class="btn btn-sm btn-secondary" type="button">+ Add Subfolder</button>
        </div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 92%;">Subfolder Name</th>
                  <th style="width: 8%;"></th>
                </tr>
              </thead>
              <tbody id="subfolder-rows"></tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <section class="card" style="margin-top: 16px;">
      <div class="card-header">
        <div class="card-title-group">
          <h2>Page Overrides & Exceptions</h2>
          <p>For custom pages that don't follow regular slug hierarchy, set an exact content path and target DAM folder.</p>
        </div>
        <button id="add-exception-row" class="btn btn-sm btn-secondary" type="button">+ Add Exception</button>
      </div>
      <div class="card-body">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 46%;">Content Path <span>(/content/canadasite/...)</span></th>
                <th style="width: 46%;">Target DAM Path <span>(/content/dam/...)</span></th>
                <th style="width: 8%;"></th>
              </tr>
            </thead>
            <tbody id="exception-rows"></tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top: 16px;">
      <div class="card-header">
        <div class="card-title-group">
          <h2>Popup Appearance & History Preferences</h2>
          <p>Customize the look and behavior of the extension popup.</p>
        </div>
      </div>
      <div class="card-body">
        <div class="preferences-list">
          <label class="pref-item">
            <input type="checkbox" id="show-recent-toggle">
            <div class="pref-label">
              <strong>Show Recently Viewed DAM Folders</strong>
              <span>Displays up to 6 recently opened asset folders inside the popup for quick jumping.</span>
            </div>
          </label>
          <label class="pref-item">
            <input type="checkbox" id="dark-mode-toggle">
            <div class="pref-label">
              <strong>Dark Theme in Extension Popup</strong>
              <span>Use high-contrast dark theme with glowing red accents.</span>
            </div>
          </label>
        </div>
      </div>
    </section>

    <footer class="settings-footer">
      <div class="footer-left">
        <button id="save-btn" class="btn btn-primary" type="button">Save Settings</button>
        <div id="save-status" class="save-status-msg">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Settings saved successfully!</span>
        </div>
      </div>
      <div class="author-credit">
        AEM Asset Hopper v1.2 &bull; Created by Angelo Destro
      </div>
    </footer>
  </div>

  <script src="options.js"></script>
</body>
</html>`,

  'options.css': `/* Options CSS */
:root {
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --bg-subtle: #f1f5f9;
  --bg-hover: #e2e8f0;
  --border: #e2e8f0;
  --border-hover: #cbd5e1;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --primary: #dc2626;
  --primary-hover: #b91c1c;
  --primary-subtle: #fef2f2;
  --primary-glow: rgba(220, 38, 38, 0.2);
  --info: #2563eb;
  --info-bg: #eff6ff;
  --info-border: #bfdbfe;
  --info-text: #1e40af;
  --success-bg: #ecfdf5;
  --success-border: #a7f3d0;
  --success-text: #065f46;
  --danger: #ef4444;
  --danger-bg: #fef2f2;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-md: 0 4px 10px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04);
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-page: #0b0f17;
    --bg-card: #131b2c;
    --bg-subtle: #1c273e;
    --bg-hover: #263554;
    --border: #25334d;
    --border-hover: #3d5075;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --primary: #ef4444;
    --primary-hover: #dc2626;
    --info-bg: rgba(37, 99, 235, 0.14);
    --info-border: rgba(37, 99, 235, 0.3);
    --info-text: #93c5fd;
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-sans);
  background-color: var(--bg-page);
  color: var(--text-main);
  line-height: 1.5;
  padding: 24px 20px;
  min-height: 100vh;
}
.settings-container { max-width: 1000px; margin: 0 auto; }
.settings-header {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--border);
}
.header-left { display: flex; align-items: center; gap: 12px; }
.logo-box {
  width: 38px; height: 38px; border-radius: var(--radius-md);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #ffffff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px var(--primary-glow); flex-shrink: 0;
}
.settings-header h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; color: var(--text-main); line-height: 1.2; }
.settings-header .subtitle { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }

.tip-banner {
  background: var(--info-bg); border: 1px solid var(--info-border); border-left: 3px solid var(--info);
  border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 18px;
  display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--info-text);
}
.tip-icon { flex-shrink: 0; margin-top: 1px; }
code {
  font-family: var(--font-mono); font-size: 11.5px; background: var(--bg-subtle);
  color: var(--primary); padding: 2px 5px; border-radius: 4px; border: 1px solid var(--border); font-weight: 600;
}

.settings-grid { display: grid; grid-template-columns: 1.25fr 0.95fr; gap: 16px; }
@media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } }

.card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md); overflow: hidden; display: flex; flex-direction: column;
}
.card-header {
  padding: 14px 18px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 10px; background: var(--bg-subtle);
}
.card-title-group h2 { font-size: 14px; font-weight: 700; color: var(--text-main); }
.card-title-group p { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
.card-body { padding: 14px 18px; }

.table-wrapper { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-card); }
table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
thead { background: var(--bg-subtle); border-bottom: 1px solid var(--border); }
th { padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11.5px; color: var(--text-muted); white-space: nowrap; }
th span { font-weight: 400; font-size: 10.5px; opacity: 0.8; }
td { padding: 6px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--bg-subtle); }

input[type="text"] {
  width: 100%; border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 6px 9px; font-size: 12px; font-family: var(--font-mono); color: var(--text-main);
  background: var(--bg-card); outline: none;
}
input[type="text"]:focus { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-subtle); }

.remove-btn {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  width: 24px; height: 24px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 14px;
}
.remove-btn:hover { color: var(--danger); background: var(--danger-bg); }

.preferences-list { display: flex; flex-direction: column; gap: 12px; }
.pref-item {
  display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 8px 10px;
  border-radius: var(--radius-sm); background: var(--bg-subtle); border: 1px solid var(--border);
}
.pref-item input[type="checkbox"] { width: 16px; height: 16px; margin-top: 2px; accent-color: var(--primary); }
.pref-label { display: flex; flex-direction: column; gap: 1px; }
.pref-label strong { font-size: 13px; font-weight: 600; color: var(--text-main); }
.pref-label span { font-size: 11.5px; color: var(--text-muted); }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 600; cursor: pointer; border: 1px solid transparent; white-space: nowrap;
}
.btn-sm { padding: 5px 10px; font-size: 11.5px; }
.btn-primary { color: #ffffff; background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 2px 6px var(--primary-glow); }
.btn-primary:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); transform: translateY(-1px); }
.btn-secondary { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-main); }
.btn-secondary:hover { background: var(--bg-hover); border-color: var(--border-hover); }

.settings-footer {
  margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
}
.footer-left { display: flex; align-items: center; gap: 12px; }
.save-status-msg {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600;
  color: var(--success-text); background: var(--success-bg); border: 1px solid var(--success-border);
  padding: 6px 12px; border-radius: var(--radius-sm); opacity: 0; transform: translateX(-6px); transition: all 0.3s ease; pointer-events: none;
}
.save-status-msg.visible { opacity: 1; transform: translateX(0); }
.author-credit { font-size: 11.5px; color: var(--text-muted); }`,

  'options.js': `const DEFAULT_DEPT_MAP = {
  'health-canada': 'hc-sc',
  'public-health': 'phac-aspc',
  health: 'hc-sc'
};

const DEFAULT_SUBFOLDERS = ['images', 'documents'];

const DEFAULT_EXCEPTIONS = [
  {
    contentPath: '/content/canadasite/en/services/health/food-safety',
    damPath: '/content/dam/hc-sc/images/services/health/food-safety'
  }
];

function addMappingRow(slug = '', code = '') {
  const tbody = document.getElementById('mapping-rows');
  const tr = document.createElement('tr');

  const tdSlug = document.createElement('td');
  const inputSlug = document.createElement('input');
  inputSlug.type = 'text';
  inputSlug.className = 'slug-input';
  inputSlug.value = slug;
  inputSlug.placeholder = 'e.g. health-canada';
  tdSlug.appendChild(inputSlug);

  const tdCode = document.createElement('td');
  const inputCode = document.createElement('input');
  inputCode.type = 'text';
  inputCode.className = 'code-input';
  inputCode.value = code;
  inputCode.placeholder = 'e.g. hc-sc';
  tdCode.appendChild(inputCode);

  const tdAction = document.createElement('td');
  const btn = document.createElement('button');
  btn.className = 'remove-btn';
  btn.title = 'Remove mapping';
  btn.textContent = '✕';
  btn.addEventListener('click', () => tr.remove());
  tdAction.appendChild(btn);

  tr.append(tdSlug, tdCode, tdAction);
  tbody.appendChild(tr);
}

function addSubfolderRow(name = '') {
  const tbody = document.getElementById('subfolder-rows');
  const tr = document.createElement('tr');

  const tdSub = document.createElement('td');
  const inputSub = document.createElement('input');
  inputSub.type = 'text';
  inputSub.className = 'subfolder-input';
  inputSub.value = name;
  inputSub.placeholder = 'e.g. images';
  tdSub.appendChild(inputSub);

  const tdAction = document.createElement('td');
  const btn = document.createElement('button');
  btn.className = 'remove-btn';
  btn.title = 'Remove subfolder';
  btn.textContent = '✕';
  btn.addEventListener('click', () => tr.remove());
  tdAction.appendChild(btn);

  tr.append(tdSub, tdAction);
  tbody.appendChild(tr);
}

function addExceptionRow(contentPath = '', damPath = '') {
  const tbody = document.getElementById('exception-rows');
  const tr = document.createElement('tr');

  const tdContent = document.createElement('td');
  const inputContent = document.createElement('input');
  inputContent.type = 'text';
  inputContent.className = 'exception-content-input';
  inputContent.value = contentPath;
  inputContent.placeholder = '/content/canadasite/en/services/health/page.html';
  tdContent.appendChild(inputContent);

  const tdDam = document.createElement('td');
  const inputDam = document.createElement('input');
  inputDam.type = 'text';
  inputDam.className = 'exception-dam-input';
  inputDam.value = damPath;
  inputDam.placeholder = '/content/dam/hc-sc/images/features';
  tdDam.appendChild(inputDam);

  const tdAction = document.createElement('td');
  const btn = document.createElement('button');
  btn.className = 'remove-btn';
  btn.title = 'Remove exception';
  btn.textContent = '✕';
  btn.addEventListener('click', () => tr.remove());
  tdAction.appendChild(btn);

  tr.append(tdContent, tdDam, tdAction);
  tbody.appendChild(tr);
}

function normalizeContentPath(input) {
  let path = input.trim();
  path = path.replace(/^https?:\\/\\/[^/]+/i, '');
  path = path.replace(/^\\/editor\\.html/i, '').replace(/^\\/assets\\.html/i, '');
  path = path.replace(/\\.html$/i, '').replace(/\\/$/, '');
  return path;
}

async function loadSettings() {
  const stored = await browser.storage.local.get([
    'deptMap',
    'subfolders',
    'exceptions',
    'showRecent',
    'darkMode'
  ]);

  const deptMap = {
    ...DEFAULT_DEPT_MAP,
    ...(stored.deptMap || {})
  };

  const subfolders =
    stored.subfolders && stored.subfolders.length
      ? stored.subfolders
      : DEFAULT_SUBFOLDERS;

  const exceptions =
    stored.exceptions && stored.exceptions.length
      ? stored.exceptions
      : DEFAULT_EXCEPTIONS;

  Object.entries(deptMap).forEach(([slug, code]) => addMappingRow(slug, code));
  subfolders.forEach((name) => addSubfolderRow(name));
  exceptions.forEach((ex) => addExceptionRow(ex.contentPath, ex.damPath));

  const showRecent = stored.showRecent === true;
  const toggle = document.getElementById('show-recent-toggle');
  if (toggle) toggle.checked = showRecent;

  const darkMode = stored.darkMode === true;
  const darkToggle = document.getElementById('dark-mode-toggle');
  if (darkToggle) darkToggle.checked = darkMode;

  if (Object.keys(deptMap).length === 0) addMappingRow();
  if (subfolders.length === 0) addSubfolderRow();
  if (exceptions.length === 0) addExceptionRow();
}

let saveStatusTimer;
function showSaveStatus() {
  const statusEl = document.getElementById('save-status');
  if (!statusEl) return;

  statusEl.classList.add('visible');
  clearTimeout(saveStatusTimer);
  saveStatusTimer = setTimeout(() => {
    statusEl.classList.remove('visible');
  }, 2600);
}

async function saveSettings() {
  const deptMap = {};
  document.querySelectorAll('#mapping-rows tr').forEach((tr) => {
    const slug = tr.querySelector('.slug-input')?.value.trim().toLowerCase();
    const code = tr.querySelector('.code-input')?.value.trim().toLowerCase();
    if (slug && code) deptMap[slug] = code;
  });

  const subfolders = [];
  document.querySelectorAll('#subfolder-rows tr').forEach((tr) => {
    const name = tr.querySelector('.subfolder-input')?.value.trim().toLowerCase();
    if (name && !subfolders.includes(name)) subfolders.push(name);
  });

  const exceptions = [];
  document.querySelectorAll('#exception-rows tr').forEach((tr) => {
    let contentPath = tr.querySelector('.exception-content-input')?.value.trim();
    let damPath = tr.querySelector('.exception-dam-input')?.value.trim();
    if (!contentPath || !damPath) return;

    contentPath = normalizeContentPath(contentPath);
    damPath = damPath.replace(/^https?:\\/\\/[^/]+/i, '').replace(/\\/$/, '');

    exceptions.push({ contentPath, damPath });
  });

  const showRecent = document.getElementById('show-recent-toggle')?.checked || false;
  const darkMode = document.getElementById('dark-mode-toggle')?.checked || false;

  await browser.storage.local.set({
    deptMap,
    subfolders,
    exceptions,
    showRecent,
    darkMode
  });

  showSaveStatus();
}

document.getElementById('add-row')?.addEventListener('click', () => addMappingRow());
document.getElementById('add-subfolder-row')?.addEventListener('click', () => addSubfolderRow());
document.getElementById('add-exception-row')?.addEventListener('click', () => addExceptionRow());
document.getElementById('save-btn')?.addEventListener('click', saveSettings);
document.getElementById('header-save-btn')?.addEventListener('click', saveSettings);

loadSettings();`,

  'background.js': `const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal, credentials: 'include' });
  } catch (err) {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

async function pathExists(path, origin) {
  try {
    const res = await fetchWithTimeout(\`\${origin}\${path}.json\`, { method: 'GET' });
    return res?.ok || false;
  } catch (e) {
    return false;
  }
}

async function walkDeepest(basePath, segments, origin) {
  const baseExists = await pathExists(basePath, origin);
  if (!baseExists) {
    return { exists: false, deepestPath: basePath, reachedSegments: 0 };
  }

  let currentPath = basePath;
  let reached = 0;

  for (const segment of segments) {
    const candidate = \`\${currentPath}/\${segment}\`;
    const ok = await pathExists(candidate, origin);
    if (!ok) break;
    currentPath = candidate;
    reached += 1;
  }

  return { exists: true, deepestPath: currentPath, reachedSegments: reached };
}

async function findAssetFolders(message) {
  const { origin, deptCode, segments, subfolders } = message;

  return Promise.all(
    subfolders.map(async (subfolder) => {
      const basePath = \`/content/dam/\${deptCode}/\${subfolder}\`;
      const walk = await walkDeepest(basePath, segments, origin);
      return { subfolder, basePath, ...walk };
    })
  );
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'ASSETFOLDER_FIND') {
    findAssetFolders(message)
      .then((results) => sendResponse({ success: true, results }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});`
};
