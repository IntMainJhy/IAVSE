const xml=value=>String(value).replace(/[<>&"']/g,char=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]));
const words=new Intl.Segmenter('und',{granularity:'word'}),graphemes=new Intl.Segmenter('und',{granularity:'grapheme'});
const glyphs=value=>Array.from(graphemes.segment(value),part=>part.segment);
// Approximate sans-serif advances in ems. This avoids cutting an ordinary
// Latin word while allowing Chinese and Japanese to wrap at natural segments.
const width=value=>glyphs(value).reduce((total,char)=>total+(/^\s$/u.test(char)?.28:/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Extended_Pictographic}]/u.test(char)?1:/^[ilIjt.,:;'!|]$/.test(char)?.27:/^[MW@%]$/.test(char)?.88:/^[A-Z]$/.test(char)?.66:.54),0);
function titleLines(value,budget=15.1){
 const lines=[];let line='';
 const add=token=>{if(!line&&/^\s+$/u.test(token))return;if(width(line+token)>budget&&line.trim()){
  // Keep closing punctuation with the preceding words.
  if(/^[，。！？、；：,.!?;:）)\]】》]+$/u.test(token)){line+=token;return;}
  lines.push(line.trim());line='';
 }line+=token;};
 for(const part of words.segment(value)){
  if(width(part.segment)>budget)for(const glyph of glyphs(part.segment))add(glyph);
  else add(part.segment);
 }
 if(line.trim())lines.push(line.trim());
 if(lines.length>3){const last=Array.from(words.segment(lines[2]),part=>part.segment);while(last.length&&width(last.join('').trim()+'…')>budget)last.pop();lines[2]=last.join('').trim()+'…';}
 return lines.slice(0,3);
}
export function catalogCover({kind='docs',title='IAVSE',category=''}={}){
 const label=glyphs(String(title).replace(/[\x00-\x1f]/g,' ').replace(/\s+/gu,' ').trim()).slice(0,120).join('')||'IAVSE',type=['docs','skills','resources'].includes(kind)?kind:'docs';
 const palettes={docs:['#173660','#2b5fa9','#f5f9ff','#b7d1f5'],skills:['#e2edfc','#f6f9ff','#16365d','#4777b6'],resources:['#edf3fc','#d6e6fa','#143a65','#477cb9']},[bg,end,ink,accent]=palettes[type];
 const lines=titleLines(label),font='Inter,Arial,PingFang SC,Microsoft YaHei,Noto Sans CJK SC,sans-serif';
 const motif=type==='docs'?'<path d="M680 48h62v72h-62zM693 68h35m-35 14h35m-35 14h24"/>':type==='skills'?'<path d="m685 55-22 29 22 29m44-58 22 29-22 29m-14-66-16 74"/>':'<path d="m704 46 41 23v47l-41 23-41-23V69zm-41 23 41 24 41-24m-41 24v46"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" role="img"><title>${xml(label)}</title><defs><linearGradient id="surface" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs><rect width="800" height="450" fill="url(#surface)"/><g fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".75">${motif}</g><text x="48" y="68" fill="${ink}" font-family="${font}" font-size="17" font-weight="600" letter-spacing="4">IAVSE</text><text x="48" y="105" fill="${accent}" font-family="${font}" font-size="12" font-weight="500" letter-spacing="2.4">${type.toUpperCase()}</text><g data-cover-title="true" fill="${ink}" font-family="${font}" font-size="44" font-weight="500" letter-spacing="-.8">${lines.map((line,i)=>`<text x="48" y="${210+i*55}">${xml(line)}</text>`).join('')}</g><path d="M48 369h704" stroke="${accent}" stroke-opacity=".32"/><text x="48" y="408" fill="${accent}" font-family="${font}" font-size="16">${xml(glyphs(String(category)).slice(0,42).join(''))}</text><path d="M724 399h24m-8-8 8 8-8 8" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
