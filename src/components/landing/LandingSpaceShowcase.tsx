'use client';

import Link from 'next/link';
import {ArrowRight, ArrowUpRight} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {FeedAvatar} from '@/components/FeedAvatar';
import {useLocale} from '@/components/LocaleProvider';
import {observeGalleryFrame} from '@/lib/gallery-frame-ready';
import {landingCopy} from '@/lib/landing-copy';
import type {LandingContent} from './IavseLanding';
import '@/app/landing-space-showcase.css';

type PublishedSpace = NonNullable<LandingContent['space']>;
const previewWidth = 1200;

function PublishedSpaceBoard({space}: {space: PublishedSpace}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);
  const name = space.name || space.handle;
  const viewport = useRef<HTMLDivElement>(null);
  const stopObserving = useRef<(() => void) | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const fit = () => element.style.setProperty('--iv-preview-scale', String(element.clientWidth / previewWidth));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => {
      observer.disconnect();
      stopObserving.current?.();
    };
  }, []);

  return <figure className="iv-space-board" data-landing-reveal>
    <div className="iv-space-mat" aria-hidden="true" inert>
      <div className="iv-blog-viewport" ref={viewport} data-ready={ready}>
        <div className="iv-blog-placeholder">
          {space.coverId ? <img src={'/media/' + encodeURIComponent(space.coverId)} alt="" loading="lazy"/> :
            <><FeedAvatar name={name} avatarId={space.avatarId}/><strong>{name}</strong></>}
        </div>
        <iframe src={space.previewHref} title={c.publicSpace + ' · ' + name} width={previewWidth} height={820}
          aria-hidden="true" tabIndex={-1} scrolling="no" loading="lazy" referrerPolicy="same-origin"
          sandbox={space.previewHref.endsWith('?embed=gallery') ? 'allow-scripts allow-same-origin' : 'allow-same-origin'}
          onLoad={event => {
            stopObserving.current?.();
            stopObserving.current = observeGalleryFrame(event.currentTarget, () => setReady(true));
          }}/>
      </div>
    </div>
    <figcaption>
      <Link href={space.href} className="iv-space-open">
        <FeedAvatar name={name} avatarId={space.avatarId}/>
        <span className="iv-blog-identity"><strong>{name}</strong><small>@{space.handle}</small></span>
        <span className="iv-blog-visit">{c.visitSpace}<ArrowUpRight size={16} aria-hidden="true"/></span>
      </Link>
    </figcaption>
  </figure>;
}

export function LandingSpaceShowcase({space}: {space: LandingContent['space']}) {
  const {locale} = useLocale();
  const c = landingCopy(locale);

  return <section className="iv-space-showcase" id="home-blog" aria-label={c.blogs}>
    <div className="iv-space-intro" data-landing-reveal>
      <h2>{c.spaceTitle}</h2>
      <p>{c.spaceBody}</p>
    </div>

    {space ? <PublishedSpaceBoard key={locale + space.previewHref} space={space}/> :
      <p className="iv-space-unavailable" data-landing-reveal>{c.spaceUnavailable}</p>}

    <div className="iv-space-details" data-landing-reveal>
      <div className="iv-space-destinations">
        <Link href="/workspace/blog" className="iv-button">{c.createSpace}<ArrowUpRight size={16} aria-hidden="true"/></Link>
        <Link href="/blogs" className="iv-text-link">{c.exploreSpace}<ArrowRight size={15} aria-hidden="true"/></Link>
      </div>
      <p className="iv-space-publishing">{c.spacePublishing}</p>
    </div>
  </section>;
}
