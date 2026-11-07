'use client';
import {useState} from 'react';
import {studioComponents,componentPrompt} from '@/lib/design-studio/components.mjs';
import {DesignCopy} from './DesignCopy';
import {useLocale} from './LocaleProvider';
import type {DesignEntry} from '@/lib/design-types';
export function StudioComponentPrompts({entry}:{entry:DesignEntry}){
 const {t}=useLocale(),options=entry.studio?.componentIds?.length?studioComponents.filter(c=>entry.studio!.componentIds.includes(c[0])):studioComponents,[selected,setSelected]=useState(entry.studio?.component||options[0]?.[0]||'button'),prompt=componentPrompt(entry,selected);
 return <section className="studio-component-prompts" id="component-prompts"><div><h2>{t('只需要一个组件？')}</h2><p>{t('保留当前风格，单独带走组件的视觉、行为和状态要求。')}</p></div><div className="studio-component-prompt-controls"><label htmlFor={'component-'+entry.slug}>{t('选择组件')}</label><select id={'component-'+entry.slug} value={selected} onChange={e=>setSelected(e.target.value)}>{options.map(c=><option key={c[0]} value={c[0]}>{t(c[1])}</option>)}</select><DesignCopy text={prompt} label={t('复制组件提示词')} filename={entry.slug+'-'+selected+'.md'}/><a href={'/resources/designs/'+entry.slug+'/preview?component='+selected} target="_blank" rel="noopener noreferrer">{t('操作这个组件')} ↗</a></div><pre className="design-prompt-text">{prompt}</pre></section>;
}
