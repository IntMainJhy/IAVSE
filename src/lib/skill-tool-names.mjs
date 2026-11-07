import {skillAiTools} from './skill-installations.mjs';
const aliases={claude:'claude-code','claude code':'claude-code','codex app':'codex','codex cli':'codex','codex-app':'codex','codex-cli':'codex',gemini:'gemini-cli','gemini cli':'gemini-cli','open code':'opencode'};
export function normalizeSkillToolNames(values=[]){
 const ids=new Set(values.map(value=>{const text=String(typeof value==='string'?value:value?.id||'').trim().toLowerCase();return aliases[text]||text}));
 return skillAiTools.filter(tool=>ids.has(tool.id));
}
