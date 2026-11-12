import {serverI18n} from '@/lib/server-i18n';
import {loadLandingContent} from '@/lib/landing-content.mjs';
import {IavseLanding} from './landing/IavseLanding';
export async function PlatformHome({req}:{req:Request}){
 const {locale}=await serverI18n();
 const content=await loadLandingContent(req,locale);
 return <IavseLanding content={content}/>;
}
