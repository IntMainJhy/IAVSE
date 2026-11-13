import {publicGallery} from '@/lib/spaces.mjs';
import {blogShowcases} from '@/lib/blog-showcase.mjs';
import {galleryLimit} from '@/lib/blog-gallery-space.mjs';

export const dynamic='force-dynamic';
export function GET(req:Request){
 const {directory,featured}=publicGallery(req);
 const spaces=featured.length?featured:directory;
 const previews=[...spaces.map((space:{handle:string;mode:string})=>space.mode==='static'?null:'/blog/'+encodeURIComponent(space.handle)+'/preview'),...(featured.length?[]:blogShowcases).map(space=>'/blogs/showcase/'+encodeURIComponent(space.handle)+'?embed=gallery')].slice(0,galleryLimit);
 return Response.json({previews},{headers:{'Cache-Control':'private, no-store'}});
}
