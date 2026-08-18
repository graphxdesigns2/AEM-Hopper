import JSZip from 'jszip';

// Import raw code as strings or definitions
export async function generateExtensionZip(files: Record<string, string>): Promise<Blob> {
  const zip = new JSZip();

  // Add all extension files
  Object.entries(files).forEach(([filename, content]) => {
    zip.file(filename, content);
  });

  // Add a friendly README
  const readmeContent = `# AEM Asset Hopper (v1.2) - Firefox Extension
Created by Angelo Destro

## Installation in Firefox:
1. Open Firefox and type \`about:debugging#/runtime/this-firefox\` in the address bar.
2. Click **"Load Temporary Add-on…"**.
3. Select the \`manifest.json\` file from this folder.
4. The extension icon will appear in your Firefox toolbar!

## Features in v1.2:
- 🚀 **Compact Modern UI**: Optimized vertical space, high-density layout.
- 🌓 **Light & Dark Theme**: Full dual-theme support with automatic or manual toggle.
- 📋 **1-Click Copy**: Fast filename (.jpg/.pdf), full path, and missing segment copying with animated feedback.
- 🔄 **Live/Preview Switcher**: Instant jump from public canada.ca / preview pages into Author Editor.
- 🌐 **French Page Resolution**: Automatic English DAM equivalent lookup.
- 📂 **Recent DAM Folders**: Quick-jump history of recently opened asset folders.
`;

  zip.file('README.md', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
