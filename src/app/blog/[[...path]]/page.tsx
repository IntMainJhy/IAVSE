import '@/app/route-styles/blog.css';
import {routePage} from '@/lib/route-page';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const route=routePage(['blog']);
export const generateMetadata=route.generateMetadata;
export default route.Page;
