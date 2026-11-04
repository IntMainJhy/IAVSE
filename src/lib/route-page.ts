import Page,{generateMetadata} from '@/components/AppPage';

type Props={params?:Promise<{path?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
/** Keep filesystem route CSS separate while reusing the existing request/auth flow. */
export function routePage(prefix:string[]){
 const adapt=async(props:Props)=>({params:Promise.resolve({path:[...prefix,...((await props.params)?.path||[])]}),searchParams:props.searchParams});
 return {Page:async(props:Props)=>Page(await adapt(props)),generateMetadata:async(props:Props)=>generateMetadata(await adapt(props))};
}
