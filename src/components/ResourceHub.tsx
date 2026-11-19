import '@/app/resource-hub.css';
import {DocsPage,SkillsPage} from './LearningPages';
import {ResourcesPage,type CatalogQuery} from './SharedCatalog';
import {ResourceTabs} from './ResourceTabs';
export {ResourceTabs} from './ResourceTabs';
import {DesignLibrary} from './DesignLibrary';

export async function ResourceHub({query={},baseUrl}:{query?:CatalogQuery;baseUrl:string}){
 const requested=String(query.type||''),kind=['docs','skills','resources','designs'].includes(requested)?requested:query.category?'resources':'designs';
 const navigation=<ResourceTabs active={kind} query={query}/>;
 return <div className="rbp-native rbp-application organic-site v2-site public-content-site rbp-native-content resource-hub resource-page-frame content-resource-hub" data-surface="reading" data-resource-kind={kind}>{kind!=='designs'&&navigation}<div data-resource-panel>{kind==='designs'?<DesignLibrary query={query} navigation={navigation}/>:kind==='skills'?<SkillsPage baseUrl={baseUrl} query={query}/>:kind==='docs'?<DocsPage path={['docs']} query={query}/>:<ResourcesPage query={query}/>}</div></div>;
}
