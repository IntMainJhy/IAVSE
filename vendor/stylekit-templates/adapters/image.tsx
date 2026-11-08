import React from 'react';
export default function Image({src,fill,unoptimized:_unoptimized,priority:_priority,style,...props}:any){return <img {...props} src={typeof src==='string'?src:src?.src} style={{...(fill?{position:'absolute',inset:0,width:'100%',height:'100%'}:{}),...style}}/>}
