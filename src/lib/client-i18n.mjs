import {createTranslator} from './translate.mjs';
import {normalizeLocale} from './locale-format.mjs';
const translators=new Map();
/** @returns {Promise<ReturnType<typeof createTranslator>>} */
export function localeTranslator(locale){
 const language=normalizeLocale(locale);
 if(!translators.has(language))translators.set(language,language==='zh'?Promise.resolve(createTranslator({})):(language==='ja'?import('./locales/ja.json',{with:{type:'json'}}):import('./locales/en.json',{with:{type:'json'}})).then(module=>createTranslator(module.default)));
 return translators.get(language);
}
