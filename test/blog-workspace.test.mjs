import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as runtime from 'react/jsx-runtime';
import * as canvas from '../src/lib/blog-canvas.mjs';
import * as design from '../src/lib/blog-design.mjs';
import * as appearances from '../src/lib/blog-appearances.mjs';
import {blogTemplates} from '../src/lib/blog-templates.mjs';
import {stickerPresets} from '../src/lib/blog-stickers.mjs';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/BlogCanvas.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const walk=node=>!node||typeof node!=='object'?[]:[node,...(Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flatMap(value=>Array.isArray(value)?value.flatMap(walk):walk(value))];
function fixture(width=1440){
 const cells=[],writes=[],exports={};let cursor=0,tree,scale=1;
 const noop=()=>null,ReactFlow=()=>null,react={memo:fn=>fn,useEffect(){},useLayoutEffect(){},useMemo:(fn,deps)=>{const key=cursor++,old=cells[key];if(!old||deps.some((value,i)=>value!==old.deps[i]))cells[key]={deps,value:fn()};return cells[key].value;},useId:()=>':library:',useRef:initial=>{const key=cursor++;return cells[key]??=( {current:initial});},useState:initial=>{const key=cursor++;if(!(key in cells))cells[key]=typeof initial==='function'?initial():initial;return[cells[key],value=>{cells[key]=typeof value==='function'?value(cells[key]):value}];}};
 const modules={react,'react/jsx-runtime':runtime,'@xyflow/react':{ReactFlow,Background:noop,BackgroundVariant:{Dots:'dots'},NodeResizeControl:noop,useStore:selector=>selector({transform:[100,-200,scale]})},'./Icons':{Icon:noop},gsap:{gsap:{}},
  './BlogDesignedPage':{BlogDesignBlock:noop,designBlockStyle:()=>({})},'./BlogSticker':{BlogSticker:noop,stickerPresets},'./BlogStickerLibrary':{BlogStickerLibrary:noop},
  '@/lib/blog-appearances.mjs':appearances,'@/lib/blog-templates.mjs':{blogTemplates},'./BlogTemplateLibrary':{BlogTemplateLibrary:noop,ResumeStyleChoices:noop},
  './BlogDesignFields':{BlogDesignEditing:{Provider:noop},BlogInlineContext:{Provider:noop},DesignText:noop},'@/lib/blog-canvas.mjs':canvas,'@/lib/blog-design.mjs':design,'@/lib/blog-inline-text.mjs':{inlineKey:JSON.stringify}};
 vm.runInNewContext(source,{exports,structuredClone,window:{innerWidth:width,matchMedia:()=>({matches:false})},requestAnimationFrame:fn=>{fn();return 1},require:name=>{if(!(name in modules))throw Error(name);return modules[name]}});
 const props={profile:{name:'Existing author',skills:[],resume:{sections:[],metrics:[],certificates:[],gallery:[]}},layout:{blog:{design:{version:1,width:940,background:'#ffffff',nodes:[{id:'intro',kind:'text',text:'Existing authored content',frame:{x:20,y:100,w:400,h:100},style:{fontSize:20,padding:24}}]}}},language:'',onProfile:value=>writes.push(value),onLayout:value=>writes.push(value),say:(zh,en)=>en,media:noop,importControl:null,data:{content:[]}};
 const render=()=>{cursor=0;tree=exports.BlogCanvas(props);return tree};render();
 const find=predicate=>{const result=walk(tree).find(predicate);assert.ok(result,'control exists');return result};
 return{render,writes,find,ReactFlow,setScale:value=>{scale=value},get root(){return tree.props},click:predicate=>{find(predicate).props.onClick();render();}};
}
const panel=id=>node=>node.type==='button'&&node.props['data-panel']===id;
test('the canvas opens with compact chrome; content tools toggle without editing the authored page',()=>{
 const f=fixture();assert.equal(f.root['data-library-open'],false);assert.equal(f.root['data-properties'],false);
 f.click(panel('layers'));assert.equal(f.root['data-library-open'],true);assert.equal(f.find(node=>node.props?.className==='bd-library-panel').props.hidden,false);
 f.click(panel('layers'));assert.equal(f.root['data-library-open'],false);
 f.click(panel('templates'));assert.equal(f.root['data-library-open'],true);assert.equal(f.find(panel('templates')).props['aria-expanded'],true);
 f.click(node=>node.type==='button'&&node.props['aria-label']==='Close content panel');assert.equal(f.root['data-library-open'],false);assert.deepEqual(f.writes,[]);
});
test('selecting canvas text keeps the workspace stable; properties remain an explicit operation',()=>{
 const f=fixture();f.find(node=>node.type===f.ReactFlow).props.onNodeClick(null,{id:'intro'});f.render();assert.equal(f.root['data-properties'],false);
 f.click(node=>node.props?.className==='bd-properties-trigger');assert.equal(f.root['data-properties'],true);
 f.click(node=>node.props?.className==='bd-properties-trigger');assert.equal(f.root['data-properties'],false);assert.deepEqual(f.writes,[]);
});
test('phone content panels and inspector are mutually exclusive and preserve the existing draft',()=>{
 const f=fixture(390);f.click(panel('insert'));assert.equal(f.root['data-library-open'],true);
 f.click(node=>node.props?.className==='bd-properties-trigger');assert.equal(f.root['data-properties'],true);assert.equal(f.root['data-library-open'],false);
 f.click(panel('stickers'));assert.equal(f.root['data-properties'],false);assert.equal(f.root['data-library-open'],true);assert.deepEqual(f.writes,[]);
});

test('opening and switching tool panels reuses the current page nodes',()=>{
 const f=fixture(),nodes=f.find(node=>node.type===f.ReactFlow).props.nodes;
 for(const id of ['layers','templates','insert','stickers']){f.click(panel(id));assert.equal(f.find(node=>node.type===f.ReactFlow).props.nodes,nodes)}
 f.click(node=>node.props?.className==='bd-properties-trigger');assert.equal(f.find(node=>node.type===f.ReactFlow).props.nodes,nodes);assert.deepEqual(f.writes,[]);
});
test('zoom updates are confined to viewport controls and retain a constant screen-space grid',()=>{
 const f=fixture(),flow=f.find(node=>node.type===f.ReactFlow),tools=f.find(node=>node.type?.name==='CanvasViewportTools');
 assert.equal(flow.props.onMove,undefined);
 for(const scale of [.25,.75,1.5]){
  f.setScale(scale);const content=walk(tools.type(tools.props)),select=content.find(node=>node.type==='select'),grid=content.find(node=>node.props?.id==='blog-dot-grid');
  assert.equal(select.props.value,Math.round(scale*100));assert.equal(grid.props.gap*scale,24);assert.equal(grid.props.size*scale,1.2);
  select.props.onChange({target:{value:'75'}});assert.equal(f.find(node=>node.type===f.ReactFlow).props.nodes,flow.props.nodes);
 }
 assert.deepEqual(f.writes,[]);
});
