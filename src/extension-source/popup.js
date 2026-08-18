/**
 * AEM Asset Hopper — Popup Controller
 * Enhanced with modern compact UI, dual light/dark theme support, and micro-interactions.
 * Created by Angelo Destro.
 */

/* ── Global Constants & SVGs ── */
const AUTHOR_HOST = 'https://author-canada-prod.adobecqms.net';

const COPY_ICON_PATH =
  'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z';
const CHECK_ICON_PATH = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
const ARROW_RIGHT_ICON_PATH = 'M4 12h16M13 6l6 6-6 6';

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

/* ── Helpers ── */
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
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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

  lastSegment = lastSegment.replace(/\.html$/i, '');
  lastSegment = lastSegment.replace(FORBIDDEN_FILENAME_CHARS, '');

  const words = lastSegment
    .split(/[\s\-_]+/)
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

  const contentPath = u.pathname.replace(/^\/editor\.html/, '');
  const parts = contentPath.split('/').filter(Boolean);

  if (parts[0] !== 'content' || parts.length < 4) return null;

  const siteRoot = parts[1];
  const lang = parts[2];

  let deptSlug;
  let folderSegments = [];

  if (parts[3].toLowerCase() === 'services' && parts.length > 4) {
    const rawPart4 = parts[4].replace(/\.html$/i, '').toLowerCase();

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
      folderSegments[lastIdx] = folderSegments[lastIdx].replace(/\.html$/i, '');
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
    return `${AUTHOR_HOST}/editor.html${path}`;
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
    .replace(/^\/editor\.html/i, '')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '');

  return (exceptions || []).find((ex) => ex.contentPath === contentPath) || null;
}

async function resolveEnglishEquivalent(editorUrlStr) {
  let u;
  try {
    u = new URL(editorUrlStr);
  } catch (e) {
    return null;
  }

  const contentPath = u.pathname.replace(/^\/editor\.html/i, '');
  let renderPath = contentPath;
  if (!renderPath.endsWith('.html')) renderPath += '.html';

  const fetchUrl = `${u.origin}${renderPath}?wcmmode=disabled`;

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

  return `${u.origin}/editor.html${englishPath}`;
}

/* ── Storage / Config ── */
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

/* ── Rendering ── */
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
    if (isLoading) {
      retryBtn.style.opacity = '0.5';
    } else {
      retryBtn.style.opacity = '1';
    }
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
  existing.innerHTML = `
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
  `;

  const list = document.getElementById('recent-list-items');

  recentPaths.forEach((item) => {
    const isDocument = item.subfolder.toLowerCase().includes('doc');
    const row = document.createElement('a');
    row.className = 'recent-item';
    row.href = '#';
    row.title = 'Open in DAM';
    row.addEventListener('click', (e) => {
      e.preventDefault();
      browser.tabs.create({ url: `${item.origin}/assets.html${item.path}` });
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
  titleText.textContent = `Missing Folder${missingPaths.length > 1 ? 's' : ''}`;
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
    copyToClipboard(missingPaths.join('\n'), copyBtn);
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
        `/content/dam/${r.deptCode || 'hc-sc'}/${r.subfolder}`
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
      const fullFileName = `${baseName}${extension}`;
      const isPartial = r.reachedSegments < parsed.folderSegments.length;

      // ── Card Top Row: Folder Badge + Hop CTA ──
      const topRow = document.createElement('div');
      topRow.className = 'card-top-row';

      const badgeGroup = document.createElement('div');
      badgeGroup.className = 'folder-badge-group';

      const folderPill = document.createElement('span');
      folderPill.className = `folder-pill folder-${isDocument ? 'documents' : 'images'}`;

      const iconSvg = createSVG(isDocument ? DOCUMENT_ICON_PATH : IMAGE_ICON_PATH);
      iconSvg.style.width = '11px';
      iconSvg.style.height = '11px';
      folderPill.appendChild(iconSvg);

      const folderName = document.createElement('span');
      folderName.textContent = r.subfolder;
      folderPill.appendChild(folderName);
      badgeGroup.appendChild(folderPill);

      const statusTag = document.createElement('span');
      statusTag.className = `status-tag ${isPartial ? 'status-warn' : 'status-ok'}`;
      statusTag.textContent = isPartial ? 'Partial' : 'In DAM';
      badgeGroup.appendChild(statusTag);

      topRow.appendChild(badgeGroup);

      // Primary "Hop to DAM" button
      const hopBtn = document.createElement('button');
      hopBtn.type = 'button';
      hopBtn.className = 'btn-hop';
      hopBtn.title = `Hop into ${r.subfolder} DAM folder`;
      hopBtn.innerHTML = `
        <span>Hop to DAM</span>
        <svg class="hop-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      `;

      hopBtn.addEventListener('click', () => {
        addRecentPath(parsed.origin, r.deepestPath, r.subfolder);
        browser.tabs.create({ url: `${parsed.origin}/assets.html${r.deepestPath}` });
      });

      topRow.appendChild(hopBtn);
      card.appendChild(topRow);

      // ── Path Row ──
      let displayPath = r.deepestPath || '';
      if (displayPath.includes('/content/dam')) {
        displayPath = displayPath.substring(displayPath.indexOf('/content/dam'));
      }

      const pathRow = document.createElement('div');
      pathRow.className = 'path-row';

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

      pathRow.appendChild(pathText);
      pathRow.appendChild(pathCopyBtn);
      card.appendChild(pathRow);

      // ── Partial Warning Drawer (if stopped short) ──
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
        warnText.textContent = `Stopped ${shortLevels} level${shortLevels > 1 ? 's' : ''} short — deeper path missing:`;
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

      // ── Card Bottom Row: Suggested Filename ──
      const bottomRow = document.createElement('div');
      bottomRow.className = 'card-bottom-row';

      const filenameBtn = document.createElement('button');
      filenameBtn.type = 'button';
      filenameBtn.className = 'btn-filename-copy';
      filenameBtn.title = `Click to copy generated filename: ${fullFileName}`;
      filenameBtn.appendChild(createIconWrapper());

      const fileBadge = document.createElement('span');
      fileBadge.className = 'filename-badge';
      fileBadge.textContent = extension;
      filenameBtn.appendChild(fileBadge);

      const fileNameLabel = document.createElement('span');
      fileNameLabel.textContent = fullFileName;
      filenameBtn.appendChild(fileNameLabel);

      filenameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(fullFileName, filenameBtn);
      });

      bottomRow.appendChild(filenameBtn);
      card.appendChild(bottomRow);

      container.appendChild(card);
    });

  const notFound = results.filter((r) => !r.exists);
  if (notFound.length > 0) {
    const missingPaths = notFound
      .map((r) => r.basePath || (r.deepestPath ? `${r.deepestPath}/${r.subfolder}` : null))
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
    `No DAM mapping found for department slug "${deptSlug}". Add in Settings.`;
}

/* ── Main Execution Controller ── */
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
        showLangNote(`🌐 English equivalent: ${new URL(resolved).pathname.replace(/^\/editor\.html/, '')}`);
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

      statusEl.textContent = `Checking exception folder for "${deptCode}"…`;

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

    statusEl.textContent = `Checking DAM folders for "${deptCode}"…`;

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
    statusEl.textContent = `Error: ${err.message || 'Could not communicate with background script.'}`;
  } finally {
    setLoadingState(false);
  }
}

/* ── Theme Toggle Handler ── */
async function toggleTheme() {
  const { darkMode } = await loadConfig();
  const newTheme = !darkMode;
  await browser.storage.local.set({ darkMode: newTheme });
  applyTheme(newTheme);
}

/* ── Event Listeners ── */
document.getElementById('retry-btn')?.addEventListener('click', run);
document.getElementById('settings-btn')?.addEventListener('click', () => browser.runtime.openOptionsPage());
document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

// Initialize
run();
