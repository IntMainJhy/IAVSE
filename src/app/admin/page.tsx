import '@/app/route-styles/admin.css';
import Page,{generateMetadata as metadataForPage} from '@/components/AppPage';
import '@/app/admin-organic.css';
import '@/app/iavse-admin.css';
import '@/components/AdminOverview.module.css';

// Load the dashboard's structural CSS with its HTML, before the lazy client boundary.
export const dynamic='force-dynamic';
export const runtime='nodejs';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
const adapt=(props:Props)=>({params:Promise.resolve({path:['admin']}),searchParams:props.searchParams});
export const generateMetadata=(props:Props)=>metadataForPage(adapt(props));
export default function AdminPage(props:Props){return Page(adapt(props));}
