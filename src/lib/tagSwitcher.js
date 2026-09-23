// Keep TAG_MODES in sync with the vanilla-JS switcher widget duplicated in
// public/errors.html and public/api-errors.html — see DEVELOPER.md.
export const STORAGE_KEY = 'supTagTestSite.activeTags'

export const TAG_MODES = [
  { value: 'all', label: 'All' },
  { value: 'cs', label: 'Contentsquare' },
  { value: 'heap', label: 'Heap' },
  { value: 'hotjar', label: 'Hotjar' },
]

export function getActiveTagMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (TAG_MODES.some((m) => m.value === stored)) return stored
  } catch (e) {
    // localStorage unavailable (private mode, etc.) — fall through to default.
  }
  return 'all'
}

// Persists the choice and navigates to a URL with ?tags=<mode> set (path/hash unchanged) —
// this both reflects the current mode visibly in the address bar and forces a full page load,
// which is required anyway since GTM's tags evaluate their firing triggers once at load time.
export function setActiveTagMode(mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch (e) {
    // ignore
  }
  const url = new URL(window.location.href)
  url.searchParams.set('tags', mode)
  window.location.href = url.toString()
}
