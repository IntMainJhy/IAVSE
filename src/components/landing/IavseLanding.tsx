'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight, BookOpen, MessageCircle, PanelsTopLeft, Shapes, Sparkles} from 'lucide-react';
import {IavseHeader} from '@/components/IavseHeader';
import {GlassSwitch} from '@/components/ui/GlassSwitch';
import {BrandMark} from '@/components/BrandMark';
import {FeedAvatar} from '@/components/FeedAvatar';
import {LanguageSwitcher, useLocale} from '@/components/LocaleProvider';
import {landingCopy} from '@/lib/landing-copy';
import IavseFlowBackdrop from './IavseFlowBackdrop';

export type LandingPost = {
  id: string; title: string; summary: string; category: string; source: string; license: string;
  coverId: string; authorName: string; authorAvatarId: string; commentCount: number; likeCount: number; href: string;
};
export type LandingWork = {
  id: string; title: string; summary: string; coverId: string; authorName: string; authorAvatarId: string; href: string; type: 'work';
};
export type LandingContent = {
  posts: LandingPost[]; works: LandingWork[];
  space: {handle: string; name: string; intro: string; avatarId: string; coverId: string; href: string; count: number} | null;
  communityUnavailable: boolean;
};
type Filter = 'all' | 'work' | 'discussion';
const media = (id: string) => '/media/' + encodeURIComponent(id);

function Author({name, avatarId}: {name: string; avatarId: string}) {
  return name ? <span className="iv-author"><FeedAvatar name={name} avatarId={avatarId}/><span>{name}</span></span> : null;
}

function FeatureCard({item, kind}: {item: LandingWork | LandingPost; kind: 'work' | 'discussion'}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  return <div data-landing-reveal><Link href={item.href} className="iv-card iv-feature" data-landing-card>
    <div className={'iv-cover' + (!item.coverId ? ' is-missing' : '')}>
      {item.coverId ? <img src={media(item.coverId)} alt="" width={900} height={500} loading="lazy"/> : <div className="iv-cover-type" aria-hidden="true"><BrandMark/><span>IAVSE</span></div>}
    </div>
    <div className="iv-card-content"><div className="iv-meta"><span>{kind === 'work' ? c.work : c.post}</span>{'category' in item && item.category ? <span>{item.category}</span> : null}</div>
      <h3>{item.title}</h3>{item.summary ? <p className="iv-excerpt">{item.summary}</p> : null}
      <div className="iv-card-bottom"><Author name={item.authorName} avatarId={item.authorAvatarId}/><span className="iv-card-action">{kind === 'work' ? c.viewWork : c.viewPost}<ArrowUpRight size={15} aria-hidden="true"/></span></div>
    </div>
  </Link></div>;
}

function DiscussionCard({post}: {post: LandingPost}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  return <div data-landing-reveal><Link href={post.href} className="iv-card iv-discussion" data-landing-card>
    <div><div className="iv-meta"><span>{post.category || c.post}</span><span>{post.commentCount} {c.comments}</span></div><h3>{post.title}</h3>{post.summary ? <p className="iv-excerpt">{post.summary}</p> : null}<Author name={post.authorName} avatarId={post.authorAvatarId}/></div>
    <span className="iv-discussion-mark"><MessageCircle size={18} aria-hidden="true"/></span>
  </Link></div>;
}

function EmptyContent({filter, unavailable}: {filter: Filter; unavailable: boolean}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  const router = useRouter();
  const failed = unavailable && filter !== 'work';
  const title = failed ? c.unavailable : filter === 'work' ? c.emptyWorks : filter === 'discussion' ? c.emptyPosts : c.emptyTitle;
  const body = failed ? c.unavailableBody : filter === 'work' ? c.emptyWorksBody : filter === 'discussion' ? c.emptyPostsBody : c.emptyBody;
  return <div className="iv-card iv-empty" data-landing-card data-landing-empty>
    <MessageCircle size={28} strokeWidth={1.3} aria-hidden="true"/><h3>{title}</h3><p>{body}</p>
    <div className="iv-empty-actions"><Link href={filter === 'work' ? '/blogs' : '/community'} className="iv-text-link">{filter === 'work' ? c.exploreSpace : c.enter}<ArrowRight size={15} aria-hidden="true"/></Link>{failed ? <button type="button" className="iv-text-link" onClick={() => router.refresh()}>{c.retry}</button> : null}</div>
  </div>;
}

function ResourceRail() {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  const resources = [
    {id: 'designs', label: c.design, description: c.designBody, icon: PanelsTopLeft},
    {id: 'skills', label: c.skill, description: c.skillBody, icon: Sparkles},
    {id: 'docs', label: c.docs, description: c.docsBody, icon: BookOpen},
    {id: 'resources', label: c.tools, description: c.toolsBody, icon: Shapes},
  ];
  return <aside className="iv-resource-rail" data-landing-reveal aria-label={c.resources}><div className="iv-card iv-resources" data-landing-card>
    <h3>{c.resourceTitle}</h3><p>{c.resourceIntro}</p><div className="iv-resource-links">{resources.map(({id, label, description, icon: Icon}) => <Link key={id} href={'/resources?type=' + id}><Icon size={21} strokeWidth={1.5} aria-hidden="true"/><span>{label}<small>{description}</small></span><ArrowUpRight size={14} aria-hidden="true"/></Link>)}</div><p className="iv-resource-note">{c.resourceNote}</p>
  </div></aside>;
}

function SpaceCard({space}: {space: LandingContent['space']}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  return <div data-landing-reveal><article className="iv-card iv-space" data-landing-card>
    <div className="iv-space-cover">{space ? space.coverId ? <img src={media(space.coverId)} alt="" width={400} height={240} loading="lazy"/> : <FeedAvatar name={space.name || space.handle} avatarId={space.avatarId}/> : <img src="/media/home-product/space-editorial.webp" alt={c.example} width={400} height={240} loading="lazy"/>}<span>{space ? c.publicSpace : c.example}</span></div>
    <div className="iv-space-copy"><h2>{space?.name || c.spaceTitle}</h2><p>{space?.intro || c.spaceBody}</p></div>
    <Link href={space?.href || '/blogs'} className="iv-text-link">{space ? c.visitSpace : c.exploreSpace}<ArrowUpRight size={16} aria-hidden="true"/></Link>
  </article></div>;
}

export function IavseLanding({content}: {content: LandingContent}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  const [filter, setFilter] = useState<Filter>('all');
  const root = useRef<HTMLDivElement>(null);
  const featuredWork = filter === 'all' ? content.works[0] : null;
  const featuredPost = filter === 'all' && !featuredWork ? content.posts[0] : null;
  const discussionItems = filter === 'discussion' ? content.posts : filter === 'all' ? content.posts.slice(featuredPost ? 1 : 0, featuredPost ? 2 : 1) : [];
  const hasContent = filter === 'work' ? content.works.length > 0 : !!featuredWork || !!featuredPost || discussionItems.length > 0;

  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
        observer.unobserve(entry.target);
        if (preference.matches || !(entry.target instanceof HTMLElement) || !entry.target.animate) return;
        const animation = entry.target.animate([{opacity: 0, transform: 'translateY(24px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 650, delay: Math.min(index * 70, 210), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
        animations.add(animation);
        animation.finished.catch(() => {}).finally(() => { animations.delete(animation); animation.cancel(); });
      });
    }, {threshold: .1});
    element.querySelectorAll('[data-landing-reveal]').forEach(node => observer.observe(node));
    const reduce = () => { if (preference.matches) for (const animation of animations) animation.cancel(); };
    const focus = (event: FocusEvent) => { const node = (event.target as Element).closest<HTMLElement>('[data-landing-reveal]'); if (node) { observer.unobserve(node); node.getAnimations().forEach(animation => animation.cancel()); } };
    preference.addEventListener('change', reduce);
    element.addEventListener('focusin', focus);
    return () => { observer.disconnect(); preference.removeEventListener('change', reduce); element.removeEventListener('focusin', focus); for (const animation of animations) animation.cancel(); };
  }, [filter, content]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let target: HTMLElement | null = null;
    let x = 0, y = 0;
    const move = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches) return;
      target = (event.target as Element).closest<HTMLElement>('[data-landing-card]');
      x = event.clientX; y = event.clientY;
      if (!target || frame) return;
      frame = requestAnimationFrame(() => { frame = 0; if (!target) return; const bounds = target.getBoundingClientRect(); target.style.setProperty('--iv-pointer-x', (x - bounds.left) + 'px'); target.style.setProperty('--iv-pointer-y', (y - bounds.top) + 'px'); });
    };
    element.addEventListener('pointermove', move, {passive: true});
    return () => { element.removeEventListener('pointermove', move); cancelAnimationFrame(frame); };
  }, []);

  return <div className="iavse-landing" ref={root} data-iavse-landing data-landing-locale={locale}>
    <div className="iv-backdrop-wrap"><IavseFlowBackdrop/></div>
    <div className="iv-container">
      <IavseHeader/>
      <section className="iv-hero"><h1 className="iv-title">{c.title.map(line => <span key={line}>{line}</span>)}</h1><p>{c.intro}</p><div className="iv-actions"><Link href="/community" className="iv-button">{c.enter}<ArrowUpRight size={16} aria-hidden="true"/></Link><Link href="/resources" className="iv-button iv-button-secondary">{c.discover}</Link></div></section>
      <section className="iv-community" aria-labelledby="iv-community-title"><div className="iv-section-heading"><h2 id="iv-community-title">{c.communityTitle}</h2><GlassSwitch className="iv-filter-switch" items={[{id: 'all', label: c.all}, {id: 'work', label: c.works}, {id: 'discussion', label: c.discussions}]} value={filter} onValueChange={value => setFilter(value as Filter)} ariaLabel={c.filters} size="compact"/></div>
        <div className="iv-board"><div className="iv-feed" aria-live="polite">
          {filter === 'work' ? content.works.map(work => <FeatureCard key={work.id} item={work} kind="work"/>) : null}
          {featuredWork ? <FeatureCard key={featuredWork.id} item={featuredWork} kind="work"/> : null}
          {featuredPost ? <FeatureCard key={featuredPost.id} item={featuredPost} kind="discussion"/> : null}
          {discussionItems.map(post => <DiscussionCard key={post.id} post={post}/>)}
          {!hasContent ? <EmptyContent filter={filter} unavailable={content.communityUnavailable}/> : null}
        </div><ResourceRail/></div>
      </section>
      <section className="iv-spaces" aria-label={c.blogs}><SpaceCard space={content.space}/></section>
      <footer className="iv-footer"><Link href="/" className="iv-footer-brand">IAVSE</Link><span>{c.footer}</span><nav aria-label={c.about}><Link href="/about">{c.about}</Link><a href="https://github.com/IntMainJhy/IAVSE" target="_blank" rel="noreferrer">{c.source}</a><Link href="/legal/privacy">{c.privacy}</Link><Link href="/workspace/account">{c.account}</Link></nav><LanguageSwitcher/></footer>
    </div>
  </div>;
}
