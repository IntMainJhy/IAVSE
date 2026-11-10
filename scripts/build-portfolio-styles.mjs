import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import postcss from 'postcss';

// Compile the upstream utility classes unchanged, then isolate their reset and
// utilities from IAVSE's editors and user-authored themes. No visual tokens change.
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'iavse-rbp-css-'));
try {
  const output=path.join(scratch,'compiled.css');
  execFileSync(process.execPath,['node_modules/@tailwindcss/cli/dist/index.mjs','-i','src/styles/rbp-template.input.css','-o',output],{stdio:'pipe'});
  const css=postcss.parse(fs.readFileSync(output,'utf8'));
  css.walkAtRules('layer',rule=>rule.nodes?rule.replaceWith(...rule.nodes):rule.remove());
  const properties=[];
  const rootEffects=[];
  css.walkRules(rule=>{
    if(!rule.selector.includes('view-transition'))return;
    const effect=rule.clone();
    effect.selector=effect.selector.split(',').map(selector=>selector.trim().startsWith('html')?selector.trim().replace(/^html/,'html[data-frontend=portfolio]'):'html[data-frontend=portfolio]'+selector.trim()).join(',');
    if(rule.parent.type==='atrule' && rule.parent.name==='media'){const media=postcss.atRule({name:'media',params:rule.parent.params});media.append(effect);rootEffects.push(media);}else rootEffects.push(effect);
    rule.remove();
  });
  css.walkAtRules('keyframes',rule=>{rootEffects.push(rule.clone());rule.remove();});
  css.walkAtRules('property',rule=>{properties.push(rule.clone());rule.remove();});
  css.walkRules(rule=>{
    // The host body already paints the template ground. A second opaque page
    // wrapper would hide the original negative-z-index ShaderFlow backdrop.
    if(rule.selector==='body')rule.walkDecls('background-color',decl=>decl.remove());
    rule.selector=rule.selector.replace(/:root|:host/g,':scope').replace(/^body$/,':scope');
  });
  const result=postcss.root();
  result.append(postcss.comment({text:'Generated from RBP Portfolio classes. Edit rbp-template.input.css and components/rbp, then npm run portfolio:styles.'}));
  result.append(...properties,...rootEffects);
  const scope=postcss.atRule({name:'scope',params:'(.rbp-surface) to (.rbp-native)'});
  scope.append(...css.nodes);result.append(scope);
  fs.writeFileSync('src/app/rbp-template.css',result.toString()+'\n');
} finally {fs.rmSync(scratch,{recursive:true,force:true});}
