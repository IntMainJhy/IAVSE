/** `brand` is the compatibility identifier for the plain public website. */
export const HOME_STYLES = ['brand'];
export const HOME_STYLE_COOKIE = 'iavse-home-style';
export const DEFAULT_HOME_STYLE = 'brand';

/** Old and unknown preferences resolve to the same public appearance. */
export function normalizeHomeStyle(_value) {
  return DEFAULT_HOME_STYLE;
}

/** Retained for callers that still know the former preference cookie. */
export const CLASSIC_COLOR_COOKIE = 'iavse-classic-color-mode';
export function homeStyleColorMode(_style, _classicMode = 'light') {
  return 'light';
}
