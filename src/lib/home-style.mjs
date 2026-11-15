/** Only these public, independently authored homepage styles are selectable. */
export const HOME_STYLES = ['fly', 'brand', 'anime'];
export const HOME_STYLE_COOKIE = 'iavse-home-style';
export const DEFAULT_HOME_STYLE = 'anime';
export function normalizeHomeStyle(value) {
  return HOME_STYLES.includes(value) ? value : DEFAULT_HOME_STYLE;
}
