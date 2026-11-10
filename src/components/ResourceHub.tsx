import '@/app/resource-bento.css';
import '@/app/resource-frame.css';
import '@/app/resource-display.css';
import {DocsPage,SkillsPage} from './LearningPages';
import {ResourcesPage,type CatalogQuery} from './SharedCatalog';
import {ResourceTabs} from './ResourceTabs';
export {ResourceTabs} from './ResourceTabs';
import {ResourceIntroduction} from './ResourceIntroduction';
import {DesignLibrary} from './DesignLibrary';

export async function ResourceHub({query={},baseUrl}:{query?:CatalogQuery;baseUrl:string}){
 const requested=String(query.type||''),kind=['docs','skills','resources','designs'].includes(requested)?requested:query.category?'resources':'all';
 if(kind==='all')return <ResourceIntroduction/>;
 return <div className="rbp-native rbp-application organic-site v2-site public-content-site rbp-native-content resource-hub resource-bento resource-page-frame" data-surface="reading" data-reading-scene="quantum" data-resource-kind={kind}><ResourceTabs active={kind} query={query}/><div data-resource-panel>{kind==='designs'?<DesignLibrary query={query}/>:kind==='skills'?<SkillsPage baseUrl={baseUrl} query={query}/>:kind==='docs'?<DocsPage path={['docs']} query={query}/>:kind==='resources'?<ResourcesPage query={query}/>:<ResourceIntroduction/>}</div></div>;
}
