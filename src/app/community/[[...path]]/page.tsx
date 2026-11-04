import '@/app/route-styles/community.css';
import {routePage} from '@/lib/route-page';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const route=routePage(['community']);
export const generateMetadata=route.generateMetadata;
export default route.Page;
