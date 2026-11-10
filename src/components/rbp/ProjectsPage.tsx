// Original app/projects/page.tsx layout, with IAVSE data supplied as props.
import {FadeIn} from './ui/motion-primitives';
import {Projects,type Project} from './projects/projects';
import {ContactCard} from './contact/contact-card';
export function ProjectsPage({title,intro,items,locale='zh'}:{title:string;intro:string;items:Project[];locale?:string}){
 return <div className="flex flex-1 flex-col">
  <section className="mx-auto w-full max-w-275 px-6 pt-44 pb-16 sm:px-10 sm:pt-100 sm:pb-20">
   <FadeIn className="flex flex-col items-center gap-5 text-center">
    <h1 className="font-serif text-[2.75rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3.25rem] lg:text-[3.75rem]">{title}</h1>
    <p className="max-w-[33ch] text-[20px] leading-[1.4] tracking-tight text-foreground/65 sm:text-[22px]">{intro}</p>
   </FadeIn>
  </section>
  <Projects items={items} locale={locale}/><ContactCard locale={locale}/><div className="h-12 sm:h-16"/>
 </div>;
}
