'use client';
import {localeDate} from '@/lib/locale-format.mjs';
import {useLocale} from './LocaleProvider';
import {SiteOwnerBadge} from './SiteOwnerBadge';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Icon} from './Icons';
import {type Doc,primary,Logout} from './CommunityUI';
import {FeedAvatar} from './FeedAvatar';
import {PostCover} from './PostCover';
import {PostActions} from './CommunityActions';
import {api} from '@/lib/client';
import {communityProfileDestination} from '@/lib/navigation.mjs';
import {usePageSeed} from './PageResources';
import {useCommunityRail} from './useCommunityRail';
import {useCommunitySidebarMotion} from './useCommunitySidebarMotion';

function AccountIdentity({user}:{user:Doc|null}){const {t:tr}=useLocale();
 const menu=useRef<HTMLDetailsElement>(null);
 const name=user?.displayName||user?.nickname||tr('登录 / 注册');
 const handle=user?.handle||user?.username;
 const role=user?.siteOwner?'站长':user?({owner:'站长',reviewer:'社区审核员',member:'社区成员'} as Doc)[user.role]||'社区成员':'';
 const profile=user?communityProfileDestination(user):'/login?next=/community';
 const settings='/workspace/account';
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(menu.current&&!menu.current.contains(event.target as Node))menu.current.open=false};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&menu.current?.open){menu.current.open=false;menu.current.querySelector('summary')?.focus()}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)};
 },[]);
 return <div className="feed-identity">
  <Link className="feed-account-link" href={profile} aria-label={user?tr('查看{0}的个人资料',[name]):tr("登录或注册社区账号")} title={user?name+(handle?' · @'+handle:''):tr("登录 / 注册")}>
   <FeedAvatar name={name} avatarId={user?.avatarId} guest={!user} className="feed-account-avatar"/><span className="feed-account-copy"><strong>{name}<SiteOwnerBadge siteOwner={user?.siteOwner} compact/></strong><small>{user?(handle?'@'+handle:role):tr("整理自己的分享")}</small></span>
  </Link>
  {user&&<details className="feed-account-menu" ref={menu}><summary aria-label={tr('{0}的账号选项',[name])} title={tr("账号选项")}><svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg></summary>
   <div className="feed-account-popover" role="group" aria-label={tr("账号菜单")}><p>{name}<small>{tr(role)}</small></p><Link href={profile}><Icon name="user"/>{tr(profile.startsWith('/community/')?'社区名片':'个人账号')}</Link><Link href={settings}><Icon name="eye"/>{tr("修改头像与资料")}</Link><Link href="/workspace/account"><Icon name="settings"/>{tr("账号与安全")}</Link><Link href="/legal/community"><Icon name="shield"/>{tr("社区规则")}</Link><Logout/></div>
  </details>}
 </div>;
}

export function CommunityNavigation({user,active='feed',compose=true}:{user:Doc|null,active?:string,compose?:boolean}){const {t:tr}=useLocale();
 const seed=usePageSeed('/api/community/notification-count'),[unread,setUnread]=useState(seed?.data?.unread||0);
 useEffect(()=>{if(!user){setUnread(0);return;}let live=true;const refresh=()=>{if(!document.hidden)api('/api/community/notification-count').then(result=>{if(live)setUnread(result.unread);}).catch(()=>{});};refresh();const timer=window.setInterval(refresh,60000);window.addEventListener('community-social-change',refresh);return()=>{live=false;window.clearInterval(timer);window.removeEventListener('community-social-change',refresh);};},[user?.id]);
 const login=(next:string)=>user?next:'/login?next='+encodeURIComponent(next);
 const items=[['feed','社区动态','home','/community'],['members','发现成员','search','/community/members'],['following','关注动态','user',login('/community?feed=following')],['bookmarks','我的收藏','bookmark',login('/workspace/bookmarks')],['posts','我的投稿','file',login('/workspace')],['notifications','消息通知','bell',login('/workspace/notifications')],['account','个人账号','user',login('/workspace/account')]];
 const rail=useCommunityRail(),nav=useRef<HTMLElement>(null);
 useCommunitySidebarMotion(nav,active);
 return <>
  <aside className="feed-navigation" ref={rail}>
   <nav ref={nav} aria-label={tr("社区导航")} className="feed-nav-links">
    <span className="feed-active-indicator" aria-hidden="true"/>
    {items.map(([key,label,icon,href])=><Link key={key} href={href} scroll={false} data-nav-key={key} aria-label={tr(label)} aria-current={active===key?'page':undefined} title={tr(label)}>
     <Icon name={icon}/><span>{tr(label)}</span>
     {key==='notifications'&&unread>0&&<span className="feed-unread" aria-label={tr('{0} 条未读消息',[unread])}>{unread>99?'99+':unread}</span>}
    </Link>)}
   </nav>
   <Link className={primary+' feed-write'} href={login('/workspace/submissions/new')}><Icon name="plus"/><span>{tr("写一份分享")}</span></Link>
   <AccountIdentity user={user}/>
  </aside>
  {compose&&<Link className="feed-mobile-compose" href={login('/workspace/submissions/new')} aria-label={tr("写一份分享")} title={tr("写一份分享")}><Icon name="plus"/></Link>}
 </>;
}

export function FeedPost({item,user,onBookmarkRemoved}:{item:Doc;user:Doc|null;onBookmarkRemoved?:()=>void}){const {t:tr,locale}=useLocale();
 return <article className="feed-post">{item.repostedBy&&<p className="feed-reposted"><Icon name="repost"/><Link href={'/community/members/'+item.repostedBy.id}>{item.repostedBy.name}<SiteOwnerBadge siteOwner={item.repostedBy.siteOwner} compact/></Link> {tr(" 转发了这份分享")}</p>}<div className="feed-author"><FeedAvatar name={item.authorName||tr("社区成员")} avatarId={item.authorAvatarId}/><div><Link href={'/community/members/'+item.authorId}><strong>{item.authorName}<SiteOwnerBadge siteOwner={item.authorSiteOwner} compact/></strong></Link></div><time dateTime={item.updated}>{localeDate(item.updated,locale,true)}</time></div>
 <div className="feed-post-body"><span className="feed-category">{tr(item.category)}{item.catalogId&&<> · <Link href={'/'+item.catalogKind+'/shared/'+item.catalogId}>{tr(({docs:'来自文档',skills:'来自 Skill',resources:'来自其他资源'} as Doc)[item.catalogKind])}</Link></>}</span><Link className="feed-post-content" href={'/community/'+item.id}>{item.title!==item.summary?.slice(0,80)&&<h2>{item.title}</h2>}<p>{item.summary}</p><PostCover id={item.coverId} alt={item.coverAlt} generated={item.catalogId?{kind:item.catalogKind,title:item.title,category:tr(item.category)}:undefined}/></Link>
 {item.sourceUrl&&<Link className="feed-source" href={'/community/'+item.id}><Icon name="link"/><span><strong>{item.sourceName}</strong><small>{new URL(item.sourceUrl).hostname}</small></span></Link>}
 <PostActions item={item} user={user} onBookmarkRemoved={onBookmarkRemoved}/></div></article>;
}
