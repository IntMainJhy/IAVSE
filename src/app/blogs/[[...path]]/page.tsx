import '@/app/route-styles/blogs.css';
import {routePage} from '@/lib/route-page';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const route=routePage(['blogs']);
export const generateMetadata=route.generateMetadata;
export default route.Page;
