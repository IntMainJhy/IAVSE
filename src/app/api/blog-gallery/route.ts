import {publicSpaces} from '@/lib/spaces.mjs';
import {blogShowcases,showcaseProfile} from '@/lib/blog-showcase.mjs';
import {galleryLimit} from '@/lib/blog-gallery-space.mjs';

export const dynamic='force-dynamic';
export function GET(req:Request){
 const previews=[...publicSpaces(req).map((space:{handle:string;mode:string})=>space.mode==='static'?null:'/blog/'+encodeURIComponent(space.handle)+'/preview'),...blogShowcases.map(space=>showcaseProfile(space.handle)!.href+'&embed=gallery')].slice(0,galleryLimit);
 return Response.json({previews},{headers:{'Cache-Control':'private, no-store'}});
}
