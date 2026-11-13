import {readFileSync,existsSync} from 'node:fs';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=[
 'README.md','README.en.md','README.zh-CN.md','CONTRIBUTING.md','SECURITY.md','SUPPORT.md','CODE_OF_CONDUCT.md','CHANGELOG.md',
 'docs/README.md','docs/getting-started.md','docs/architecture.md','docs/troubleshooting.md','docs/brand.md','docs/screenshots/README.md',
 'AGENTS.md','docs/main-integration-2026-11-13.md','PRODUCT.md','DESIGN.md','docs/development-status.zh-CN.md','docs/acceptance-2026-11-13.md',
 'docs/purple-landing-background.zh-CN.md','docs/platform-ui.zh-CN.md','docs/portfolio-frontend.md','docs/skill-directory-layout.md',
 'docs/管理中心说明.md','docs/administration.en.md','docs/blog-editor.md','docs/blog-editor.zh-CN.md',
 'docs/dual-ui-task-board.md','docs/dual-ui-development-plan.zh-CN.md','docs/resource-discovery.md',
 '.github/pull_request_template.md'
];
const errors=[];let checked=0;
function checkLink(file,target){
 const raw=target.trim().replace(/^<|>$/g,'');
 if(!raw||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(raw))return;
 const path=raw.split(/[?#]/,1)[0];if(!path)return;
 let decoded;try{decoded=decodeURIComponent(path);}catch{errors.push(`${file}: invalid encoded path ${path}`);return;}
 const absolute=resolve(root,dirname(file),decoded);
 if(!existsSync(absolute))errors.push(`${file}: missing ${relative(root,absolute)}`);
 checked++;
}
for(const file of files){
 const path=resolve(root,file);if(!existsSync(path)){errors.push(`Missing documentation entry point: ${file}`);continue;}
 const source=readFileSync(path,'utf8').replace(/```[\s\S]*?```/g,'');
 for(const match of source.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g))checkLink(file,match[1]);
 for(const match of source.matchAll(/\b(?:src|srcset|href)="([^"]+)"/g))checkLink(file,match[1]);
}
if(readFileSync(resolve(root,'README.md'),'utf8')!==readFileSync(resolve(root,'README.zh-CN.md'),'utf8'))errors.push('README.zh-CN.md must match the Chinese default README.md.');
for(const file of ['docs/brand/wordmark-light.svg','docs/brand/wordmark-dark.svg']){
 const path=resolve(root,file);if(!existsSync(path)){errors.push(`Missing wordmark: ${file}`);continue;}
 const source=readFileSync(path,'utf8');
 if(!/<title[^>]*>IAVSE<\/title>/.test(source)||!source.includes('<path '))errors.push(`${file}: missing accessible title or outlined lettering`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Documentation check passed: ${files.length} entry points, ${checked} local links/assets, bilingual README and wordmarks.`);
