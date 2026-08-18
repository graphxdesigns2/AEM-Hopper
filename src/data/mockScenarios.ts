import { Scenario } from '../types';

export const DEFAULT_CONFIG = {
  deptMap: {
    'health-canada': 'hc-sc',
    'public-health': 'phac-aspc',
    health: 'hc-sc'
  },
  subfolders: ['images', 'documents'],
  exceptions: [
    {
      contentPath: '/content/canadasite/en/services/health/food-safety',
      damPath: '/content/dam/hc-sc/images/services/health/food-safety'
    }
  ],
  showRecent: true,
  darkMode: false
};

export const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 'health-canada-full',
    name: 'Standard Health Canada (Full Match)',
    description: 'A standard Health Canada service page with matching images and documents folders.',
    url: 'https://author-canada-prod.adobecqms.net/editor.html/content/canadasite/en/services/health/food-safety.html',
    deptSlug: 'health',
    deptCode: 'hc-sc',
    folderSegments: ['features'],
    results: [
      {
        subfolder: 'images',
        basePath: '/content/dam/hc-sc/images',
        exists: true,
        deepestPath: '/content/dam/hc-sc/images/features',
        reachedSegments: 1
      },
      {
        subfolder: 'documents',
        basePath: '/content/dam/hc-sc/documents',
        exists: true,
        deepestPath: '/content/dam/hc-sc/documents/features',
        reachedSegments: 1
      }
    ],
    note: 'Deep folders exist for both subfolders.'
  },
  {
    id: 'partial-match-short',
    name: 'Partial Match (Stopped Short)',
    description: 'Page has a deep path, but DAM only exists up to parent level (2 levels short).',
    url: 'https://author-canada-prod.adobecqms.net/editor.html/content/canadasite/en/services/health/food-recalls/alerts/listeria-outbreak.html',
    deptSlug: 'health',
    deptCode: 'hc-sc',
    folderSegments: ['food-recalls', 'alerts', 'listeria-outbreak'],
    results: [
      {
        subfolder: 'images',
        basePath: '/content/dam/hc-sc/images',
        exists: true,
        deepestPath: '/content/dam/hc-sc/images/food-recalls',
        reachedSegments: 1
      },
      {
        subfolder: 'documents',
        basePath: '/content/dam/hc-sc/documents',
        exists: true,
        deepestPath: '/content/dam/hc-sc/documents/food-recalls',
        reachedSegments: 1
      }
    ],
    note: 'Shows compact partial match warning with 1-click missing path copy.'
  },
  {
    id: 'preview-live-switcher',
    name: 'Live / Preview Page (Author Switcher)',
    description: 'User opened the popup on a live or preview canada.ca page.',
    url: 'https://canada-preview.adobecqms.net/services/health/drug-health-products.html',
    deptSlug: 'health',
    deptCode: 'hc-sc',
    isLiveOrPreview: true,
    authorUrl: 'https://author-canada-prod.adobecqms.net/editor.html/content/canadasite/services/health/drug-health-products.html',
    folderSegments: ['drug-health-products'],
    results: [],
    note: 'Displays the prominent "Open in Author Editor" action bar.'
  },
  {
    id: 'french-page-lookup',
    name: 'French Page (Auto-Resolved to EN)',
    description: 'User is editing a French page; extension auto-resolves English equivalent path in DAM.',
    url: 'https://author-canada-prod.adobecqms.net/editor.html/content/canadasite/fr/services/sante/salubrite-des-aliments.html',
    isFrench: true,
    frenchEquivalentUrl: 'https://author-canada-prod.adobecqms.net/editor.html/content/canadasite/en/services/health/food-safety.html',
    deptSlug: 'health',
    deptCode: 'hc-sc',
    folderSegments: ['features'],
    results: [
      {
        subfolder: 'images',
        basePath: '/content/dam/hc-sc/images',
        exists: true,
        deepestPath: '/content/dam/hc-sc/images/features',
        reachedSegments: 1
      },
      {
        subfolder: 'documents',
        basePath: '/content/dam/hc-sc/documents',
        exists: true,
        deepestPath: '/content/dam/hc-sc/documents/features',
        reachedSegments: 1
      }
    ],
    note: 'French path mapped to EN equivalent DAM repository.'
  },
  {
    id: 'phac-documents',
    name: 'Public Health Agency (PHAC)',
    description: 'PHAC department mapping test case (public-health -> phac-aspc).',
    url: 'https://author-canada-prod.adobecqms.net/editor.html/content/canadasite/en/public-health/services/diseases/flu-influenza.html',
    deptSlug: 'public-health',
    deptCode: 'phac-aspc',
    folderSegments: ['services', 'diseases', 'flu-influenza'],
    results: [
      {
        subfolder: 'images',
        basePath: '/content/dam/phac-aspc/images',
        exists: true,
        deepestPath: '/content/dam/phac-aspc/images/services/diseases/flu-influenza',
        reachedSegments: 3
      },
      {
        subfolder: 'documents',
        basePath: '/content/dam/phac-aspc/documents',
        exists: true,
        deepestPath: '/content/dam/phac-aspc/documents/services/diseases/flu-influenza',
        reachedSegments: 3
      }
    ]
  },
  {
    id: 'no-match-missing',
    name: 'No DAM Folder Found (Missing Folders)',
    description: 'Department exists, but neither folder exists yet in the DAM.',
    url: 'https://author-canada-prod.adobecqms.net/editor.html/content/canadasite/en/services/health/experimental-new-campaign.html',
    deptSlug: 'health',
    deptCode: 'hc-sc',
    folderSegments: ['experimental-new-campaign'],
    results: [
      {
        subfolder: 'images',
        basePath: '/content/dam/hc-sc/images/experimental-new-campaign',
        exists: false,
        deepestPath: '/content/dam/hc-sc/images/experimental-new-campaign',
        reachedSegments: 0
      },
      {
        subfolder: 'documents',
        basePath: '/content/dam/hc-sc/documents/experimental-new-campaign',
        exists: false,
        deepestPath: '/content/dam/hc-sc/documents/experimental-new-campaign',
        reachedSegments: 0
      }
    ],
    note: 'Displays the missing folders alert with "Copy all" button.'
  }
];

export const INITIAL_RECENT_PATHS = [
  {
    path: '/content/dam/hc-sc/images/services/health/food-safety',
    subfolder: 'images',
    origin: 'https://author-canada-prod.adobecqms.net',
    timestamp: Date.now() - 1000 * 60 * 5 // 5m ago
  },
  {
    path: '/content/dam/phac-aspc/documents/diseases/flu-influenza',
    subfolder: 'documents',
    origin: 'https://author-canada-prod.adobecqms.net',
    timestamp: Date.now() - 1000 * 60 * 42 // 42m ago
  },
  {
    path: '/content/dam/hc-sc/images/features/covid-guidelines',
    subfolder: 'images',
    origin: 'https://author-canada-prod.adobecqms.net',
    timestamp: Date.now() - 1000 * 60 * 60 * 3 // 3h ago
  }
];
