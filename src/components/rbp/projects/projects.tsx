// From DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412.
// Original layout and motion retained; IAVSE content only. See docs/licenses/RBP-Portfolio.txt.
import {
  ArrowRight,
  Compass,
  Layers,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/rbp/ui/motion-primitives";

import {portfolioCopy,resourceImage} from '@/lib/portfolio-content';
import {homeResourceSelections,homeExperienceCopy} from '@/lib/home-experience.mjs';

export type Project={id:string;icon:ComponentType<{className?:string}>;iconLabel:string;title:string;description:string;meta:string;imageRatio:number;image:string;imageAlt:string;href:string};
export function productProjects(locale='zh'):Project[]{
 const c=homeExperienceCopy(locale),zh=locale==='zh',ja=locale==='ja';
 return [
  {id:'designs',icon:Sparkles,iconLabel:zh?'UI 设计':ja?'UI デザイン':'UI design',title:zh?'从有来源的设计里，找到下一次创作的起点。':ja?'出典のあるデザインから、次の制作へ。':'Find the starting point for your next project in designs with a clear source.',description:zh?'浏览完整项目和品牌规范，打开预览，查看源码与各自的使用许可。':ja?'プロジェクトとブランド規範を見て、プレビュー、ソース、ライセンスを確認。':'Browse projects and brand guidelines, explore previews, and find the source and its license.',meta:zh?'资源目录 · 来源与许可':ja?'リソース · 出典とライセンス':'Resource directory · source and license',imageRatio:752/497,image:resourceImage(homeResourceSelections[0].items[0]),imageAlt:homeResourceSelections[0].items[0].title,href:'/resources?type=designs'},
  {id:'skills',icon:Wand2,iconLabel:'AI Skills',title:zh?'把方法整理成步骤，让工具多一种能力。':ja?'方法を手順にして、ツールの力に。':'Turn a method into steps that give your tools another capability.',description:zh?'查看 Skill 的能力、使用场景和原始来源，再带入自己的工作流程。':ja?'Skill の機能、用途、出典を確かめて、自分の作業へ。':'Read what a Skill does, when to use it, and where it comes from before adding it to your workflow.',meta:zh?'Skill 目录 · 原始来源':ja?'Skill · 原典':'Skill directory · original sources',imageRatio:1024/768,image:'/media/portfolio/skills.webp',imageAlt:'IAVSE Skill directory',href:'/resources?type=skills'},
  {id:'community',icon:Compass,iconLabel:c.community,title:c.communityTitle.join(''),description:c.communityBody,meta:zh?'社区 · 分享、讨论与收藏':ja?'コミュニティ · 投稿と対話':'Community · posts, discussions and bookmarks',imageRatio:1024/768,image:'/media/portfolio/community.webp',imageAlt:'IAVSE community',href:'/community'},
  {id:'blogs',icon:Layers,iconLabel:c.spaceAction,title:c.spaceTitle.join(''),description:c.spaceBody,meta:c.templateNote,imageRatio:1024/768,image:'/media/home-product/space-editorial.webp',imageAlt:c.templateNote,href:'/blogs'},
 ];
}

export type ProjectsProps = {
  withHeadline?: boolean;
  viewMoreVisible?: boolean;
  locale?: string;
  items?: Project[];
};

export function Projects({
  withHeadline = false,
  viewMoreVisible = false,
  locale="zh",
  items: suppliedItems,
}: ProjectsProps): ReactNode {
  const c=portfolioCopy(locale);
  const all=suppliedItems||productProjects(locale);
  const items = viewMoreVisible ? all.slice(0,4) : all;

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
        {withHeadline ? (
          <FadeIn className="flex flex-col items-center gap-5 pt-12 pb-10 text-center sm:pt-20 sm:pb-14">
            <h2 className="font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3rem] lg:text-[3.5rem]">
              {c.projectTitle}
            </h2>
            <p className="max-w-[33ch] text-[18px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
              {c.projectIntro}
            </p>
          </FadeIn>
        ) : null}

        <div className="columns-1 gap-6 md:columns-2 md:gap-7">
          {items.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {viewMoreVisible ? (
          <div className="mt-12 flex justify-center sm:mt-16">
            <Link
              href="/resources"
              className="border border-foreground/8 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              {c.more}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}): ReactNode {
  const Icon = project.icon;
  return (
    <FadeIn
      delay={Math.min(index * 0.06, 0.3)}
      className="mb-6 break-inside-avoid md:mb-7"
    >
      <Link href={project.href} className="project-card flex cursor-pointer flex-col gap-4 rounded-3xl border border-foreground/8 bg-background p-3 sm:p-3.5">
        <header className="flex items-center gap-2.5 px-1 pt-2">
          <span className="border-foreground/10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium tracking-tight text-foreground">
            {project.iconLabel}
          </span>
        </header>

        <div
          className="project-card__image ring-foreground/5 relative w-full overflow-hidden rounded-2xl bg-foreground/5 ring-1"
          style={{ aspectRatio: project.imageRatio }}
        >
          <div className="project-card__image-inner">
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              unoptimized
              sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 100vw"
              className="object-cover"
              priority={index < 2}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-1 pb-1">
          <h3 className="text-[20px] font-medium leading-[1.2] tracking-tight text-foreground sm:text-[22px]">
            {project.title}
          </h3>
          <p className="text-[14px] leading-normal tracking-tight text-foreground/65 sm:text-[15px]">
            {project.description}
          </p>
        </div>

        <p className="px-1 pb-2 text-[12px] tracking-tight text-foreground/50">
          {project.meta}
        </p>
      </Link>
    </FadeIn>
  );
}
