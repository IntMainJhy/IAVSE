import manifest from '@/lib/template-sites-manifest.json';

export const runtime = 'nodejs';
const escapeHtml = (value:string) => value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));

export async function GET(request:Request,{params}:{params:Promise<{path:string[]}>}) {
  const {path:parts}=await params;
  const template=manifest.templates.find(entry=>entry.slug===parts[0]);
  const pathname='/template-sites/'+parts.join('/');
  const route=template?.routes.find(entry=>new RegExp('^'+entry.path.replace(/\[slug\]/g,'[^/]+')+'$').test(pathname));
  if(!template||!route)return new Response('Template page not found',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex, nofollow'}});
  const dark=new URL(request.url).searchParams.get('theme')==='dark';
  const css='css' in template?String(template.css):null;
  const html=`<!doctype html><html lang="zh-CN"${dark?' class="dark"':''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(template.titleEn)} · StyleKit template</title><meta name="description" content="${escapeHtml(template.summary)}"><link rel="stylesheet" href="${escapeHtml(manifest.css)}"><link rel="stylesheet" href="${escapeHtml(manifest.fontCss)}">${css?`<link rel="stylesheet" href="${escapeHtml(css)}">`:''}</head><body><div id="template-root"></div><noscript>This original React template needs JavaScript. <a href="${escapeHtml(template.upstreamDemoUrl)}">Open the original preview</a>.</noscript><script type="module" src="${escapeHtml(template.entry)}"></script></body></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Frame-Options':'SAMEORIGIN','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}});
}
