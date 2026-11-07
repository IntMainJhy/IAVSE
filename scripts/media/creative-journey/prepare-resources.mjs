import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const target=path.join(here,'.generated/resources');
let source=await readFile(path.join(here,'index.html'),'utf8');
const replacements=[
 ['03 / MAKE IT YOURS','03 / KEEP EXPLORING'],
 ['Your work.<br>In its own space.','Useful tools.<br>Within reach.'],
 ['YOUR PERSONAL SPACE','SITES &amp; TOOLS'],
 ['Your name.<br>Your story.','A useful<br>discovery.'],
 ['Design. Build.<br>Share what matters.','Explore. Save.<br>Find your next tool.'],
 ['Ideas, brought into focus.','Good tools. Shared openly.'],
 ['A place for the things you make.','Find the right tool for your next idea.'],
 ['Your space.','Your toolkit.'],
 ['Ready for the world.','Worth keeping close.'],
 ['From inspiration to expression. All in IAVSE.','Designs, documents, skills and useful sites. Together.']
];
for(const [from,to] of replacements){if(!source.includes(from))throw new Error(`Missing film source phrase: ${from}`);source=source.replace(from,to);}
await mkdir(path.join(target,'assets'),{recursive:true});
await Promise.all([writeFile(path.join(target,'index.html'),source),copyFile(path.join(here,'assets/DM-Sans.woff2'),path.join(target,'assets/DM-Sans.woff2')),copyFile(path.join(here,'hyperframes.json'),path.join(target,'hyperframes.json'))]);
console.log(target);
