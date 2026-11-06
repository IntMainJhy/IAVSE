'use client';
import {createContext,useCallback,useContext,useMemo,useState} from 'react';
const Context=createContext({dark:false,toggle:()=>{}});
export const useAdminAppearance=()=>useContext(Context);
export function AdminAppearance({initialDark=false,children}:{initialDark?:boolean;children:React.ReactNode}){
 const [dark,setDark]=useState(initialDark);
 const toggle=useCallback(()=>{const mode=dark?'light':'dark';setDark(!dark);document.documentElement.dataset.colorMode=mode;document.documentElement.dataset.colorPreference=mode;document.cookie='site-color-mode='+mode+'; Path=/; Max-Age=31536000; SameSite=Lax'},[dark]);
 return <Context.Provider value={useMemo(()=>({dark,toggle}),[dark,toggle])}>{children}</Context.Provider>;
}
