// The site follows the system theme. The toggle is an override on top of
// that, and it is only ever stored while it disagrees with the system —
// toggling back to what the system already says removes it, which is what
// hands control back rather than pinning the choice forever.
//
// The class on <html> is the single source of truth for what is painted;
// globals.css hangs both the palette and color-scheme off it. The pre-paint
// script in app/layout.tsx mirrors read() + apply() so the first frame is
// already correct — keep the two in step.

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function storedOverride(): "dark" | "light" | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    // Safari throws on localStorage in private mode rather than returning
    // null, which would take the toggle down with it.
    return null;
  }
}

function systemPrefersDark() {
  return window.matchMedia(DARK_QUERY).matches;
}

export function applyTheme() {
  const override = storedOverride();
  const dark = override ? override === "dark" : systemPrefersDark();
  document.documentElement.classList.toggle("dark", dark);
}

export function toggleTheme() {
  const dark = !document.documentElement.classList.contains("dark");
  try {
    if (dark === systemPrefersDark()) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {}
  applyTheme();
}

// Only moves the page while no override is stored — applyTheme() decides that,
// so the listener can stay attached either way.
export function watchSystemTheme() {
  const query = window.matchMedia(DARK_QUERY);
  const onChange = () => applyTheme();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
