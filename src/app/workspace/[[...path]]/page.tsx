import '@/app/route-styles/workspace.css';
import {routePage} from '@/lib/route-page';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const route=routePage(['workspace']);
export const generateMetadata=route.generateMetadata;
export default route.Page;
