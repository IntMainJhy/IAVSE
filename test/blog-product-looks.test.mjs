import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseDocument} from 'htmlparser2';
import ts from 'typescript';

const source=ts.transpileModule(readFileSync(new URL('../src/components/BlogProductLooks.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const props={looks:[{file:'portfolio',handle:'maya-lab',name:'Maya Zhou'},{file:'resume',handle:'anika-observes',name:'Anika Rao'},{file:'editorial',handle:'kei-sound',name:'Kei Tanaka'}],labels:['Portfolio','Résumé','Writing'],details:['Projects and context','Introduction and experience','Articles and notes'],open:'Open example homepage'};
const children=node=>[node?.props?.children||[]].flat(Infinity),walk=node=>!node||typeof node!=='object'?[]:[node,...children(node).flatMap(walk)],domWalk=node=>[node,...(node.children||[]).flatMap(domWalk)];
const text=node=>typeof node==='string'?node:typeof node==='number'?String(node):Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children||''):'';
function load(react,jsx,globals={}){
 const exports={};vm.runInNewContext(source,{exports,...globals,require:name=>{
  if(name==='react')return react;if(name==='react/jsx-runtime')return jsx;
  if(name==='next/link')return{default:'a'};if(name==='./Icons')return{Icon:()=>null};throw Error('Unexpected dependency '+name);
 }});return exports.BlogProductLooks;
}
function fixture(){
 const hooks=[];let cursor=0,tree,focus=-1,requests=0,listeners=0;
 const buttons=props.looks.map((_,index)=>({focus:()=>{focus=index;}})),host={querySelectorAll:selector=>{assert.equal(selector,'[role=tab]');return buttons;}};
 const react={useState:initial=>{const index=cursor++;hooks[index]??={value:initial};return[hooks[index].value,value=>{hooks[index].value=typeof value==='function'?value(hooks[index].value):value;}];},useId:()=>{const index=cursor++;return(hooks[index]??={value:'product-looks-'+index}).value;},useRef:value=>{const index=cursor++;return hooks[index]??(hooks[index]={current:value});}};
 const jsx=(type,value,key)=>{if(value.ref&&value.role==='tablist')value.ref.current=host;return{type,props:value,key};};
 const component=load(react,{jsx,jsxs:jsx},{fetch:()=>{requests++;throw Error('Selecting a look must not fetch another document');},window:{addEventListener:()=>{listeners++;}}});
 const render=()=>{cursor=0;tree=component(props);return tree;};render();
 const nodes=type=>walk(tree).filter(node=>node.type===type),tabs=()=>nodes('button').filter(node=>node.props.role==='tab'),panels=()=>nodes('div').filter(node=>node.props.role==='tabpanel');
 const images=()=>panels().map(node=>({key:node.key,id:node.props.id,...Object.fromEntries(['src','width','height','loading','decoding'].map(key=>[key,walk(node).find(child=>child.type==='img').props[key]]))}));
 const state=()=>({look:tree.props['data-look'],selected:tabs().map(tab=>tab.props['aria-selected']),tabIndexes:tabs().map(tab=>tab.props.tabIndex),hidden:panels().map(panel=>panel.props['aria-hidden']),inert:panels().map(panel=>panel.props.inert),href:nodes('a')[0].props.href,detail:text(nodes('p').find(node=>node.props['aria-live']==='polite'))});
 return{render,tabs,panels,images,state,nodes,get tree(){return tree;},get focused(){return focus;},get requests(){return requests;},get listeners(){return listeners;},key:key=>{let prevented=false;nodes('div').find(node=>node.props.role==='tablist').props.onKeyDown({key,preventDefault(){prevented=true;}});render();return prevented;}};
}

function assertSelection(s,index){
 const state=s.state();assert.equal(state.look,props.looks[index].file);assert.equal(state.href,'/blogs/showcase/'+props.looks[index].handle);assert.equal(state.detail,props.details[index]);
 for(let i=0;i<3;i++){assert.equal(state.selected[i],i===index);assert.equal(state.tabIndexes[i],i===index?0:-1);assert.equal(state.hidden[i],i!==index);assert.equal(state.inert[i],i!==index);}
}

test('server output selects one look and keeps every tab and reserved image panel correctly associated',()=>{
 const component=load(React,runtime),nodes=domWalk(parseDocument(renderToStaticMarkup(React.createElement(component,props))));
 const tabs=nodes.filter(node=>node.attribs?.role==='tab'),panels=nodes.filter(node=>node.attribs?.role==='tabpanel');assert.equal(tabs.length,3);assert.equal(panels.length,3);
 for(let index=0;index<3;index++){assert.equal(tabs[index].attribs['aria-controls'],panels[index].attribs.id);assert.equal(panels[index].attribs['aria-labelledby'],tabs[index].attribs.id);assert.equal(tabs[index].attribs['aria-selected'],String(index===0));assert.equal(tabs[index].attribs.tabindex,index===0?'0':'-1');assert.equal(panels[index].attribs['aria-hidden'],String(index!==0));assert.equal(Object.hasOwn(panels[index].attribs,'inert'),index!==0);const image=domWalk(panels[index]).find(node=>node.name==='img');assert.equal(image.attribs.width,'900');assert.equal(image.attribs.height,'1015');assert.equal(image.attribs.loading,'lazy');}
 assert.equal(nodes.filter(node=>node.name==='a').length,1);assert.equal(nodes.find(node=>node.name==='a').attribs.href,'/blogs/showcase/maya-lab');
});

test('keyboard navigation wraps and moves the single tab stop while leaving normal Tab navigation alone',()=>{
 const s=fixture();assertSelection(s,0);
 for(const[key,index]of[['ArrowRight',1],['ArrowDown',2],['ArrowRight',0],['ArrowLeft',2],['Home',0],['End',2],['ArrowUp',1]]){assert.equal(s.key(key),true);assertSelection(s,index);assert.equal(s.focused,index);}
 assert.equal(s.key('Tab'),false);assertSelection(s,1);assert.equal(s.focused,1,'the tab list cannot trap normal keyboard navigation');
});

test('rapid choices retain the same image sources and geometry without adding script requests or moving controls into a camera',()=>{
 const s=fixture(),initial=s.images(),buttons=s.tabs();
 buttons[1].props.onClick();buttons[0].props.onClick();buttons[2].props.onClick();s.render();assertSelection(s,2);
 for(const index of[0,1,2,0,2,1]){s.tabs()[index].props.onClick();s.render();assertSelection(s,index);assert.deepEqual(s.images(),initial,'look changes only switch visibility, never replace the reserved images');}
 assert.equal(s.requests,0);assert.equal(s.listeners,0);
 const camera=walk(s.tree).find(node=>node.props['data-film-camera']==='look');assert.ok(camera);assert.equal(walk(camera).some(node=>node.type==='button'||node.type==='a'||node.props['aria-live']),false,'tabs and the active caption stay outside scroll transforms');
});
