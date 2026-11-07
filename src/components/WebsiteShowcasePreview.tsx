'use client';
import type {DesignEntry} from '@/lib/design-types';
import {AppleWebsite} from './website-showcases/AppleWebsite';
import {StripeWebsite} from './website-showcases/StripeWebsite';
import {EditorialWebsite} from './website-showcases/EditorialWebsite';
import {BrutalistWebsite} from './website-showcases/BrutalistWebsite';
import {SwissWebsite} from './website-showcases/SwissWebsite';
import {MinimalWebsite} from './website-showcases/MinimalWebsite';
import {GlassWebsite} from './website-showcases/GlassWebsite';
import {BentoWebsite} from './website-showcases/BentoWebsite';
import {OrganicWebsite} from './website-showcases/OrganicWebsite';
import {PixelWebsite} from './website-showcases/PixelWebsite';
import {CyberWebsite} from './website-showcases/CyberWebsite';
import {DarkWebsite} from './website-showcases/DarkWebsite';
import '@/app/website-showcase-preview.css';
const websites:Record<string,React.ComponentType>={apple:AppleWebsite,stripe:StripeWebsite,editorial:EditorialWebsite,brutalist:BrutalistWebsite,swiss:SwissWebsite,minimal:MinimalWebsite,glass:GlassWebsite,bento:BentoWebsite,organic:OrganicWebsite,pixel:PixelWebsite,cyber:CyberWebsite,dark:DarkWebsite};
export function WebsiteShowcasePreview({entry,embedded=false}:{entry:DesignEntry;embedded?:boolean}){
 const Website=websites[entry.studio?.websiteKey];
 if(!Website)return null;
 return <div className="website-showcase-frame" data-website-showcase={entry.studio?.websiteKey} data-embedded={embedded}>
  {!embedded&&<div className="website-showcase-toolbar"><a href={'/resources/designs/'+entry.slug}>← {entry.title}</a><span>IAVSE 独立网站模板</span><a href={entry.referenceSite?.url} target="_blank" rel="noopener noreferrer">参考 · {entry.referenceSite?.name} ↗</a></div>}
  <div className="website-showcase-scroll" data-design-scroll-root="true"><Website/></div>
 </div>;
}
