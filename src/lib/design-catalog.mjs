/** One application-oriented taxonomy, shared by imported and original studies. */
export const designCategories=['AI','开发工具','基建与云','设计生产','金融加密','企业消费','通用','落地页','分析仪表'];
const localCategories={
 'iavse-optical-glass':'落地页','iavse-spatial-gallery':'设计生产','iavse-resource-story':'通用','iavse-bento-control':'分析仪表',
 'apple-product-stage':'企业消费','notion-paper-workspace':'设计生产','linear-precision':'开发工具','stripe-gradient-platform':'金融加密',
 'geist-engineering':'开发工具','carbon-enterprise':'分析仪表','polaris-commerce':'企业消费','govuk-service':'通用',
 'figma-playful-canvas':'设计生产','framer-portfolio':'落地页','airbnb-discovery':'企业消费','material-adaptive':'通用',
 'lusion-spatial-story':'落地页','primer-developer-space':'开发工具','atlassian-teamwork':'设计生产','radix-component-lab':'开发工具',
};
export function designCategory(entry){return designCategories.includes(entry.category)?entry.category:localCategories[entry.slug]||'通用'}
export function designCollection(entry){const name=entry.collection?.name?.toLowerCase()||'';return name.includes('vibeui')?'vibeui':name.includes('stylekit')?'stylekit':'iavse'}
export function importedDesign(entry){return {...entry,external:true,preview:{theme:'light',layout:'product',accent:entry.palette?.[0]||'#4b5563'},typography:entry.typography||'',layout:entry.layout||'',motion:entry.motion||'',prompt:entry.prompt||'',specification:entry.specification||'',palette:entry.palette||[],tags:entry.tags||[]}}
export function externalPreviewUrl(entry,variant=0){const index=Number(variant),url=entry.previewVariants?.[Number.isInteger(index)&&index>=0?index:0]?.url||entry.previewUrl;try{return ['https://vibeui.top','https://yuanfu8899.github.io'].includes(new URL(url).origin)?url:null}catch{return null}}
export function designPage(entries,{page=1,pageSize=36}={}){const pages=Math.max(1,Math.ceil(entries.length/pageSize));const current=Math.max(1,Math.min(pages,Math.floor(Number(page))||1));return {items:entries.slice((current-1)*pageSize,current*pageSize),page:current,pages,total:entries.length}}
