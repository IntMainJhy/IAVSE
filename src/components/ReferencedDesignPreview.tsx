'use client';
import {LinearStudy} from './design-references/LinearStudy';
import {NotionStudy} from './design-references/NotionStudy';
import {GithubStudy} from './design-references/GithubStudy';
import {StripeStudy} from './design-references/StripeStudy';
import {AppleStudy} from './design-references/AppleStudy';
import {VercelStudy} from './design-references/VercelStudy';
import {ClaudeStudy} from './design-references/ClaudeStudy';
import {FigmaStudy} from './design-references/FigmaStudy';
import {RaycastStudy} from './design-references/RaycastStudy';
import '@/app/referenced-design-preview.css';
const renderers={linear:LinearStudy,notion:NotionStudy,github:GithubStudy,stripe:StripeStudy,apple:AppleStudy,vercel:VercelStudy,claude:ClaudeStudy,figma:FigmaStudy,raycast:RaycastStudy};
export function ReferencedDesignPreview({entry,embedded=false}:{entry:Record<string,any>;embedded?:boolean}){
 const key=entry.studio.referenceKey as keyof typeof renderers,Scene=renderers[key];
 if(!Scene)return null;
 return <div className="referenced-design-preview" data-reference-study={key} data-embedded={embedded} data-design-scroll-root>{!embedded&&<div className="reference-preview-bar"><a href={'/resources/designs/'+entry.slug} target="_blank" rel="noopener noreferrer">{entry.title}</a><div><a href={entry.referenceSite.url} target="_blank" rel="noopener noreferrer">参考网站 · {entry.referenceSite.name} ↗</a><a href={'/resources/designs/'+entry.slug+'#design-prompt'} target="_blank" rel="noopener noreferrer">实现提示词 ↗</a></div></div>}<Scene/></div>;
}
