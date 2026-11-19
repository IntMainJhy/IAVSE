'use client';

import {useCallback,useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {usePathname} from 'next/navigation';
import {useLocale} from './LocaleProvider';
import {Icon} from './Icons';
import '@/app/header-contact.css';

const contacts=[
 {id:'group',title:'我的交流群',short:'交流群',icon:'comment',image:'/contacts/wechat-group.jpg',width:966,height:1482,description:'微信扫一扫，加入 IAVSE 交流群。'},
 {id:'wechat',title:'个人微信',short:'微信',icon:'user',image:'/contacts/personal-wechat.jpg',width:888,height:1131,description:'微信扫一扫，添加 IntMain 为好友。'},
 {id:'support',title:'请我喝杯咖啡',short:'支持小站',icon:'heart',image:'/contacts/appreciation.jpg',width:828,height:1124,description:'如果这里的资源帮到了你，欢迎请我喝杯咖啡。你的支持，是我继续创作与分享的动力。'},
];

export function HeaderContact(){
 const {t}=useLocale(),path=usePathname(),id=useId(),[selected,setSelected]=useState<number|null>(null),panel=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement|null>(null);
 const position=useCallback(()=>{
  const node=panel.current,source=trigger.current;if(!node||!source)return;
  const rect=source.getBoundingClientRect(),box=node.getBoundingClientRect();
  node.style.left=Math.max(16,Math.min(rect.right-box.width,window.innerWidth-box.width-16))+'px';
  node.style.top=Math.max(16,Math.min(rect.bottom+10,window.innerHeight-box.height-16))+'px';
 },[]);
 useLayoutEffect(()=>{
  const node=panel.current;if(selected===null||!node)return;
  if(!node.matches(':popover-open')){node.showPopover();node.focus({preventScroll:true});}
  position();
 },[selected,position]);
 useEffect(()=>{setSelected(null);},[path]);
 useEffect(()=>{
  if(selected===null)return;
  const scroll=()=>{if((trigger.current?.getBoundingClientRect().bottom??0)<0)panel.current?.hidePopover();else position();};
  window.addEventListener('resize',position);window.addEventListener('scroll',scroll,{passive:true});
  return()=>{window.removeEventListener('resize',position);window.removeEventListener('scroll',scroll);};
 },[selected,position]);
 const open=(index:number,source:HTMLButtonElement)=>{if(selected===index){panel.current?.hidePopover();return;}trigger.current=source;setSelected(index);};
 const item=selected===null?null:contacts[selected];
 return <>
  <div className="header-contact" aria-label={t('联系与赞赏')}>
   <div className="header-contact-wide">{contacts.map((item,index)=><button key={item.id} type="button" aria-label={t(item.title)} title={t(item.title)} aria-haspopup="dialog" aria-controls={id} aria-expanded={selected===index} onClick={event=>open(index,event.currentTarget)}><Icon name={item.icon}/><span>{t(item.short)}</span></button>)}</div>
   <button type="button" className="header-contact-compact" aria-label={t('联系与赞赏')} title={t('联系与赞赏')} aria-haspopup="dialog" aria-controls={id} aria-expanded={selected!==null} onClick={event=>open(selected??0,event.currentTarget)}><Icon name="comment"/></button>
  </div>
  {item&&createPortal(<div id={id} ref={panel} className="contact-popover" popover="auto" role="dialog" tabIndex={-1} aria-labelledby={id+'-title'} onToggle={event=>{
   const node=event.currentTarget;if(node.matches(':popover-open'))return;
   const restore=node.contains(document.activeElement)||document.activeElement===document.body;setSelected(null);if(restore)trigger.current?.focus({preventScroll:true});
  }}>
   <header><span className="contact-popover-mark"><Icon name={item.icon}/></span><h2 id={id+'-title'}>{t(item.title)}</h2><button type="button" className="contact-popover-close" aria-label={t('关闭联系卡片')} onClick={()=>{panel.current?.hidePopover();trigger.current?.focus({preventScroll:true});}}><Icon name="close"/></button></header>
   <div className="contact-popover-tabs" role="tablist" aria-label={t('联系与赞赏')}>{contacts.map((item,index)=><button key={item.id} type="button" id={id+'-tab-'+index} role="tab" aria-controls={id+'-content'} aria-selected={selected===index} tabIndex={selected===index?0:-1} onClick={()=>setSelected(index)} onKeyDown={event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowLeft'?2:1))%3;setSelected(next);document.getElementById(id+'-tab-'+next)?.focus({preventScroll:true});
   }}>{t(item.short)}</button>)}</div>
   <div className="contact-popover-content" role="tabpanel" id={id+'-content'} aria-labelledby={id+'-tab-'+selected}>
    <p>{t(item.description)}</p>
    <img key={item.id} src={item.image} width={item.width} height={item.height} alt={t(item.title)+' · '+t('微信二维码')} onLoad={position}/>
   </div>
   <footer><a href={item.image} target="_blank" rel="noopener noreferrer">{t('查看原图')}<Icon name="arrow"/></a><a href={item.image} download={'iavse-'+item.id+'.jpg'}>{t('保存二维码')}<Icon name="download"/></a></footer>
  </div>,document.body)}
 </>;
}
