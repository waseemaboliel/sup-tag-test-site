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

// Reloads the page so the inline dataLayer push in index.html re-runs with the new mode —
// GTM's tags evaluate their firing triggers once at load, so a reload is required for the
// change to actually take effect.
export function setActiveTagMode(mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch (e) {
    // ignore
  }
  window.location.reload()
}
