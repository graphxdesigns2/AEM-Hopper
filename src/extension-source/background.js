const TIMEOUT_MS = 8000;

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
    const res = await fetchWithTimeout(`${origin}${path}.json`, { method: 'GET' });
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
    const candidate = `${currentPath}/${segment}`;
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
      const basePath = `/content/dam/${deptCode}/${subfolder}`;
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
});
