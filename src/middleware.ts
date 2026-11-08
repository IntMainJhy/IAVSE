import {apiAllowed,pageRedirect,appSurface} from './lib/app-access.mjs';
import {NextRequest,NextResponse} from 'next/server';
import {clientIp} from './lib/request-security.mjs';
import {websiteArtifactHeaders} from './lib/website-artifact-security.mjs';
// ponytail: one bounded process-local window; use the trusted edge for multi-instance limits.
const windows=new Map<string,{count:number;reset:number}>();
function blocked(key:string,max:number){const now=Date.now();if(windows.size>=4096)for(const[k,v]of windows)if(v.reset<=now)windows.delete(k);let row=windows.get(key);if(!row||row.reset<=now){if(windows.size>=4096)return true;row={count:0,reset:now+60000};windows.set(key,row)}return ++row.count>max}
export function middleware(request:NextRequest){const pathname=request.nextUrl.pathname;
 if(appSurface()==='admin'&&pathname==='/robots.txt')return new NextResponse('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex, nofollow'}});
 if(pathname.startsWith('/api/')&&!apiAllowed(pathname))return NextResponse.json({error:'接口不存在'},{status:404,headers:{'Cache-Control':'no-store'}});
 const destination=pageRedirect(pathname,request.nextUrl.search);if(destination)return NextResponse.redirect(new URL(destination,process.env.PUBLIC_URL||request.url),307);
 if(appSurface()==='platform'&&/^\/admin(?:\/|$)/.test(pathname))return new NextResponse(null,{status:404});
 if(/(?:^|\/)(?:\.env(?:\.[^/]*)?|\.git|node_modules)(?:\/|$)|\.(?:sqlite(?:-wal|-shm)?|map|bak)$/i.test(pathname))return new NextResponse(null,{status:404});
 const upload=/^\/api\/(?:admin\/uploads|community\/(?:avatar|covers))/.test(pathname),api=pathname.startsWith('/api/'),bucket=upload?'upload':api?'api':'page';
 if(blocked(clientIp(request)+':'+bucket,upload?1800:api?600:180))return new NextResponse(api?JSON.stringify({error:'请求过于频繁，请稍后重试'}):'Too many requests. Please try again shortly.',{status:429,headers:{'Retry-After':'60','Cache-Control':'no-store','Content-Type':api?'application/json':'text/plain; charset=utf-8'}});
 // Uploaded documents enforce their own opaque-origin sandbox even when opened directly.
 if(pathname.startsWith('/site-files/'))return NextResponse.next();
 // Vendored MIT templates render in standalone documents, outside the platform layout.
 if(pathname.startsWith('/template-sites/')){
  const response=NextResponse.next();
  response.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'");
  response.headers.set('X-Frame-Options','SAMEORIGIN');response.headers.set('X-Robots-Tag','noindex, nofollow');
  return response;
 }

 // Independently authored/licensed HTML never receives the React document nonce
 // policy. Its response sandbox also protects direct visits to the public file.
 if(pathname.startsWith('/design-artifacts/')){
  const response=NextResponse.next();
  // Next development routing can normalize nextUrl.hostname to localhost while
  // the browser is using 127.0.0.1. Asset CSP must match the visible Host origin.
  const artifactOrigin=request.nextUrl.protocol+'//'+(request.headers.get('host')||request.nextUrl.host);
  for(const[key,value]of Object.entries(websiteArtifactHeaders(artifactOrigin)))response.headers.set(key,value);
  return response;
 }
 const galleryPreview=/^\/resources\/designs\/[a-z0-9-]+\/preview\/?$/.test(pathname)||/^\/blog\/[^/]+\/preview\/?$/.test(pathname)||/^\/(?:blog\/[^/]+|blogs\/showcase\/[^/]+)\/?$/.test(pathname)&&request.nextUrl.searchParams.get('embed')==='gallery';
 const designPreview=/^\/resources\/designs\/[a-z0-9-]+\/preview\/?$/.test(pathname);
 // Reviewed demo hosts are isolated in same-origin preview documents. Client route
 // changes keep the parent document's CSP, so directory pages must only embed self.
 const designFrames=designPreview?"frame-src 'self' https://astro-paper.pages.dev https://fuwari.vercel.app https://nextdevtpl.chaosyn.com":"frame-src 'self'";
 const nonce=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
 const csp=["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV==='development'?" 'unsafe-eval'":''}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self' data:","connect-src 'self' blob:"+(process.env.NODE_ENV==='development'?' ws:':''),"media-src 'self' blob:","object-src 'none'","base-uri 'none'","form-action 'self'",galleryPreview?"frame-ancestors 'self'":"frame-ancestors 'none'",...(process.env.PUBLIC_URL?.startsWith('https://')?['upgrade-insecure-requests']:[])].join('; ');
 const pageCsp=csp+'; '+designFrames;
 const headers=new Headers(request.headers);headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',pageCsp);const response=NextResponse.next({request:{headers}});response.headers.set('Content-Security-Policy',pageCsp);
 if(galleryPreview){response.headers.set('X-Frame-Options','SAMEORIGIN');response.headers.set('X-Robots-Tag','noindex, nofollow');}
 if(/^\/(?:admin|workspace|api|login|join|report)(?:\/|$)/.test(pathname))response.headers.set('X-Robots-Tag','noindex, nofollow');
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|images/|fonts/|template-site-assets/|template-covers/).*)']};
