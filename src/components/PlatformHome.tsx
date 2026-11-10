import {serverI18n} from '@/lib/server-i18n';
import {loadLandingContent} from '@/lib/landing-content.mjs';
import {IavseLanding} from './landing/IavseLanding';
// THESIS: an open, purple-white landing page brings community, resources and personal spaces together.
// FORM: the user-approved centred opening and community board; original public UI and flow field.
// FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
export async function PlatformHome({req}:{req:Request}){
 const {locale}=await serverI18n();
 const content=await loadLandingContent(req,locale);
 return <IavseLanding content={content}/>;
}
