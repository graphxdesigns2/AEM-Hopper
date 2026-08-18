const DEFAULT_DEPT_MAP = {
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
  path = path.replace(/^https?:\/\/[^/]+/i, '');
  path = path.replace(/^\/editor\.html/i, '').replace(/^\/assets\.html/i, '');
  path = path.replace(/\.html$/i, '').replace(/\/$/, '');
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
    damPath = damPath.replace(/^https?:\/\/[^/]+/i, '').replace(/\/$/, '');

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

loadSettings();
