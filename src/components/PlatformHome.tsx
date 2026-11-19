import {ResourceHub} from './ResourceHub';
import {FilingLink} from './FilingLink';
import type {CatalogQuery} from './SharedCatalog';

/** The front door is the real resource directory, with the same queries and actions. */
export async function PlatformHome({req,query={}}:{req:Request;query?:CatalogQuery}){
 return <><ResourceHub query={query} baseUrl={new URL(process.env.PUBLIC_URL||req.url).origin}/><footer className="iavse-filing-footer"><FilingLink/></footer></>;
}
