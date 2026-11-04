import '@/app/route-styles/workspace.css';
import Page,{generateMetadata as metadataForPage} from '@/components/AppPage';
import '@/app/blog-editor.css';
import '@xyflow/react/dist/style.css';
import '@/app/blog-canvas.css';
import '@/app/blog-editor-controls.css';

// Preserve the shared request/auth adapter while making editor styles render-blocking.
export const dynamic='force-dynamic';
export const runtime='nodejs';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
const adapt=(props:Props)=>({params:Promise.resolve({path:['workspace','blog']}),searchParams:props.searchParams});
export const generateMetadata=(props:Props)=>metadataForPage(adapt(props));
export default function EditorPage(props:Props){return Page(adapt(props));}
