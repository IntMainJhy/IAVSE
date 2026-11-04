/** Bound raster work, while keeping geometry, animation cadence and CSS size intact. */
export function homePixelBudget(width:number){return width<768?1800000:4000000;}
