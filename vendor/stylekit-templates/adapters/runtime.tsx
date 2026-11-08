import React from 'react';
import {createRoot} from 'react-dom/client';
class PreviewBoundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<main style={{padding:40,fontFamily:'system-ui'}}><h1>This template page is unavailable.</h1><p>The requested sample route was not found.</p><a href={location.pathname.split('/').slice(0,3).join('/')}>Return to the template</a></main>:this.props.children}}
export function mount(routes:any[],Layout?:any){
 const path=decodeURI(location.pathname).replace(/\/$/,'');let selected:any=null,params:any={};
 for(const route of routes){const match=path.match(new RegExp('^'+route.path.replace(/\[slug\]/g,'([^/]+)')+'$'));if(match){selected=route.component;if(match[1])params.slug=match[1];break}}
 if(!selected)throw new Error('TEMPLATE_ROUTE_NOT_FOUND');const Page=selected,content=<Page params={params}/>;
 createRoot(document.getElementById('template-root')!).render(<PreviewBoundary>{Layout?<Layout>{content}</Layout>:content}</PreviewBoundary>);
 // Native anchor and form behavior is retained. No account/network services are introduced.
}
