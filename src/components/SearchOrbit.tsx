'use client';

import {useState,type ReactNode,type CSSProperties} from 'react';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';
import '@/app/search-orbit.css';

export function SearchOrbit({children}:{children:ReactNode}){
 const {locale}=useLocale(),[paused,setPaused]=useState(false);
 const labels=locale==='en'?['Fresh ideas','AI Skills','Try a new tool','Make something']:locale==='ja'?['アイデアを探す','AI Skills','道具を見つける','つくってみよう']:['灵感正在路上','AI Skills','发现好工具','今天也要创作'];
 return <div className="search-orbit" data-orbit-paused={paused}>
  <div className="search-orbit-decoration" aria-hidden="true">{['🔥','🧩','⚡','✍️'].map((emoji,index)=><span className="search-orbit-chip" key={emoji} style={{'--orbit-delay':`${index*-7}s`,'--orbit-rest':`${index*25}%`} as CSSProperties}><i>{emoji}</i><span>{labels[index]}</span></span>)}</div>
  {children}
  <button type="button" className="search-orbit-control" onClick={()=>setPaused(value=>!value)} aria-pressed={paused} aria-label={locale==='en'?(paused?'Resume search decorations':'Pause search decorations'):locale==='ja'?(paused?'検索欄の動きを再開':'検索欄の動きを停止'):(paused?'继续搜索框装饰动画':'暂停搜索框装饰动画')}><Icon name={paused?'play':'pause'}/></button>
 </div>;
}
