import '@/app/route-styles/account.css';
import {routePage} from '@/lib/route-page';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const route=routePage(['legal']);
export const generateMetadata=route.generateMetadata;
export default route.Page;
