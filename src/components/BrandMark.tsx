// The surrounding wordmark link owns the accessible name.
import {brandSymbolPath,brandSymbolViewBox} from '@/lib/brand-icon';
export function BrandMark(){return <svg className="site-brand-mark" width={28} height={28} viewBox={brandSymbolViewBox} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false"><path d={brandSymbolPath}/></svg>}
