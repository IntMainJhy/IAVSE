import {mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url);
mkdirSync(new URL('public/skills/',root),{recursive:true});
execFileSync('tar',['-czf',fileURLToPath(new URL('public/skills/iavse-post.tar.gz',root)),'-C',fileURLToPath(new URL('integrations/',root)),
 'iavse-post/SKILL.md','iavse-post/references/api.md','iavse-post/scripts/client.mjs','iavse-post/scripts/request.mjs'
],{env:{...process.env,COPYFILE_DISABLE:'1'}});
