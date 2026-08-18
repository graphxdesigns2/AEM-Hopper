export interface DeptMapping {
  slug: string;
  code: string;
}

export interface PageException {
  contentPath: string;
  damPath: string;
}

export interface ExtensionConfig {
  deptMap: Record<string, string>;
  subfolders: string[];
  exceptions: PageException[];
  showRecent: boolean;
  darkMode: boolean;
}

export interface RecentItem {
  path: string;
  subfolder: string;
  origin: string;
  timestamp: number;
}

export interface SimulationResult {
  subfolder: string;
  basePath: string;
  exists: boolean;
  deepestPath: string;
  reachedSegments: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  url: string;
  isFrench?: boolean;
  frenchEquivalentUrl?: string;
  isLiveOrPreview?: boolean;
  authorUrl?: string;
  results: SimulationResult[];
  folderSegments: string[];
  deptCode: string;
  deptSlug: string;
  note?: string;
}
