import en from './locales/en.json' with {type:'json'};
import ja from './locales/ja.json' with {type:'json'};
import {createTranslator} from './translate.mjs';
import {normalizeLocale} from './locale-format.mjs';
export {normalizeLocale,htmlLocale} from './locale-format.mjs';
const english=createTranslator(en),japanese=createTranslator(ja);
export function translate(locale,text,values=[]){return (normalizeLocale(locale)==='ja'?japanese:english)(locale,text,values)}
