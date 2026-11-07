'use client';
import {useState} from 'react';
export function DesignImage({slug,title,layout,src,eager=false}:{slug:string;title:string;layout:string;src?:string;eager?:boolean}){const[failed,setFailed]=useState(false);return <img src={failed?'/media/designs/preview-'+layout+'.webp':src||'/media/designs/'+slug+'.webp'} alt={title} width={1200} height={800} loading={eager?'eager':'lazy'} decoding="async" onError={()=>{if(!failed)setFailed(true)}}/>}
