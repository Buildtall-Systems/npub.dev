import type { BrowserType } from '$lib/utils/browser';

export interface ExtensionInfo {
  name: string;
  description: string;
  url: string;
  storeUrl: string;
  isPrimary: boolean;
}

export const extensionsByBrowser: Record<BrowserType, ExtensionInfo[]> = {
  chrome: [
    {
      name: 'Alby',
      description: 'Popular extension for Nostr signing and Bitcoin Lightning payments',
      url: 'https://getalby.com',
      storeUrl: 'https://chrome.google.com/webstore/detail/alby-bitcoin-wallet/iokeahhehimjnekafflcihljlcjccdbe',
      isPrimary: true
    },
    {
      name: 'nos2x',
      description: 'Minimal, focused purely on Nostr key management',
      url: 'https://github.com/fiatjaf/nos2x',
      storeUrl: 'https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp',
      isPrimary: false
    }
  ],
  firefox: [
    {
      name: 'nos2x-fox',
      description: 'Lightweight Nostr key manager, focused and minimal',
      url: 'https://github.com/diegogurpegui/nos2x-fox',
      storeUrl: 'https://addons.mozilla.org/en-US/firefox/addon/nos2x-fox/',
      isPrimary: true
    },
    {
      name: 'Alby',
      description: 'Feature-rich extension with Bitcoin Lightning payments',
      url: 'https://getalby.com',
      storeUrl: 'https://addons.mozilla.org/en-US/firefox/addon/alby/',
      isPrimary: false
    }
  ],
  edge: [
    {
      name: 'Alby',
      description: 'Popular extension for Nostr signing and Bitcoin Lightning payments',
      url: 'https://getalby.com',
      storeUrl: 'https://microsoftedge.microsoft.com/addons/detail/alby-bitcoin-wallet/faljpfhfkpcgpkdnaclolgfncgbconpl',
      isPrimary: true
    },
    {
      name: 'nos2x',
      description: 'Minimal Nostr key manager (via Chrome Web Store)',
      url: 'https://github.com/fiatjaf/nos2x',
      storeUrl: 'https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp',
      isPrimary: false
    }
  ],
  safari: [],
  mobile: [],
  unknown: []
};

export function getExtensionsForBrowser(browser: BrowserType): ExtensionInfo[] {
  return extensionsByBrowser[browser] || [];
}

export function getPrimaryExtension(browser: BrowserType): ExtensionInfo | null {
  const extensions = getExtensionsForBrowser(browser);
  return extensions.find(ext => ext.isPrimary) || extensions[0] || null;
}
