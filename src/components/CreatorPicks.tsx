import {creatorPicks,websitePicks} from '@/lib/creator-picks.mjs';
import {FeaturedPicks} from './FeaturedPicks';

export function CreatorPicks(){
 return <FeaturedPicks groups={[{id:'skills',label:'正在用的 Skills',items:creatorPicks},{id:'websites',label:'常逛的网站',items:websitePicks()}]}/>;
}
