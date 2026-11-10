// Exact frame geometry from rbp-portfolio/app/layout.tsx.
export function SiteFrame(){return <>
 <div className="site-frame site-frame--top" aria-hidden="true"/>
 <div className="site-frame site-frame--left" aria-hidden="true"/>
 <div className="site-frame site-frame--right" aria-hidden="true"/>
 {['left','right'].map(side=><svg key={side} className={'site-corner site-corner--top-'+side} width="50" height="50" viewBox="0 0 50 50" fill="none" aria-hidden="true"><path d="M5.50871e-06 0C-0.00788227 37.3001 8.99616 50.0116 50 50H5.50871e-06V0Z" fill="currentColor"/></svg>)}
 </>;}
