export const locales=['en','zh','ja'];
export const normalizeLocale=value=>locales.includes(value)?value:'en';
export const htmlLocale=value=>({en:'en',zh:'zh-CN',ja:'ja'}[normalizeLocale(value)]);
const dateFormats=new Map();
export function localeDate(value,locale='en',dateOnly=false){
 if(!value)return '—';const date=new Date(value);if(Number.isNaN(date.getTime()))return String(value);
 const language=htmlLocale(locale),key=language+(dateOnly?':date':':time');
 if(!dateFormats.has(key))dateFormats.set(key,new Intl.DateTimeFormat(language,{timeZone:'Asia/Shanghai',year:'numeric',month:'short',day:'numeric',...(!dateOnly?{hour:'2-digit',minute:'2-digit',hour12:false}:{})}));
 return dateFormats.get(key).format(date);
}
