import '@/app/route-styles/catalog.css';
import {routePage} from '@/lib/route-page';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const route=routePage(['skills']);
export const generateMetadata=route.generateMetadata;
export default route.Page;
