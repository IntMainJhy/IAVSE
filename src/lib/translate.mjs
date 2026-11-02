import {normalizeLocale} from './locale-format.mjs';
export function createTranslator(messages){
const key=text=>text.replace(/\s+/g,' ').trim();
const interpolate=(text,values)=>text.replace(/\{(\d+)\}/g,(whole,n)=>values[n]===undefined?whole:String(values[n]));
// Stored system notifications retain their original payload; only the surrounding UI is localized.
const patterns=Object.entries(messages).filter(([source])=>/\{\d+\}/.test(source)).map(([source,value])=>({expression:new RegExp('^'+source.split(/(\{\d+\})/).map(part=>/^\{\d+\}$/.test(part)?'([\\s\\S]+?)':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+'$'),value}));
return function translate(locale,text,values=[]){
 if(typeof text!=='string')return text;
 if(normalizeLocale(locale)==='zh')return interpolate(text,values);
 const source=key(text),entry=messages[source];let translated=entry;
 if(!translated){for(const pattern of patterns){const match=source.match(pattern.expression);if(match){translated=pattern.value;values=match.slice(1).map(value=>messages[value]||value);break;}}}
 if(!translated)return interpolate(text,values);
 return text.match(/^\s*/)[0]+interpolate(translated,values)+text.match(/\s*$/)[0];
}
}
