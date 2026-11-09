export function spatialChapterAt(scroll,start,travel,count){
 if(!Number.isFinite(scroll)||!Number.isFinite(start)||!Number.isFinite(travel)||travel<=0||count<=1)return 0;
 const progress=Math.max(0,Math.min(1,(scroll-start)/travel));
 return Math.min(count-1,Math.round(progress*(count-1)));
}
