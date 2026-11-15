import type {ReactNode} from 'react';
import '@/app/directory-toolbar.css';

/** Directory choices stay visible and retain their native links or buttons. */
export function DirectoryFacet({label,children}:{label:string;children:ReactNode}){
 return <div className="directory-facet" role="group" aria-label={label}>
  <span className="directory-facet-label">{label}</span>
  <div className="directory-facet-options">{children}</div>
 </div>;
}
