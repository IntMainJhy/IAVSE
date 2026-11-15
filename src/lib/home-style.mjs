/** Only these public, independently authored homepage styles are selectable. */
export const HOME_STYLES = ['fly', 'brand', 'anime', 'classic'];
export const HOME_STYLE_COOKIE = 'iavse-home-style';
export const DEFAULT_HOME_STYLE = 'classic';
export function normalizeHomeStyle(value) {
  return HOME_STYLES.includes(value) ? value : DEFAULT_HOME_STYLE;
}

export const CLASSIC_COLOR_COOKIE = 'iavse-classic-color-mode';
export function homeStyleColorMode(style, classicMode = 'light') {
  return style === 'classic' ? (classicMode === 'dark' ? 'dark' : 'light') : style === 'brand' ? 'light' : 'dark';
}
