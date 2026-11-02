// Screen composition is converted to a shared world. Size comes from perspective,
// not per-card scale; moving the camera changes occlusion between fixed homepages.
const desktop=[
 [-.31,.04,100,9,38,-4], [.32,-.15,-360,-8,-34,4],
 [-.10,-.28,-1100,12,28,-4], [.24,.25,30,-6,-40,5],
 [-.16,.33,-420,8,30,-5], [-.34,-.25,-440,-7,44,-5],
 [.23,-.31,-1300,14,-32,6], [-.43,.32,-920,-8,48,-4],
 [.08,.03,-780,10,-28,5], [.42,.39,-1080,8,-42,3],
 [.02,-.30,-660,-9,-32,-4], [.43,.07,-1050,12,-44,5],
];
const mobile=[
 [-.24,-.02,70,9,32,-5], [.25,-.21,-300,-7,-36,5],
 [-.05,-.31,-920,10,28,-4], [.23,.24,0,-6,-36,5],
 [-.23,.34,-330,8,32,-5], [-.30,-.29,-380,-6,38,-5],
 [.24,-.36,-1080,12,-32,5], [-.38,.18,-820,-7,40,-4],
 [.02,.10,-660,10,-26,4], [.35,.43,-900,8,-38,4],
 [.01,-.36,-560,-8,-30,-4], [.37,-.02,-880,11,-38,5],
];
export const galleryLimit=12;
export function gallerySceneMetrics(width){
 const compact=width<720,perspective=compact?760:1000,cardWidth=Math.min(width*(compact?.58:.31),compact?280:400),focusWidth=Math.min(width*(compact?.9:.68),800);
 return {compact,perspective,cardWidth,focusZ:perspective*(1-cardWidth/focusWidth)};
}
export function gallerySpacePose(index,count,width,height,focused=-1){
 const {compact,perspective}=gallerySceneMetrics(width),slots=compact?mobile:desktop;
 const [sx,sy,z,rx,ry,rz]=count===1?[0,0,-120,8,28,-3]:slots[index%slots.length];
 const projection=1-z/perspective;
 return {x:sx*width*projection,y:sy*height*projection,z,rx:index===focused?0:rx,ry:index===focused?0:-ry,rz:index===focused?0:rz};
}
export function galleryCameraPose(index,count,width,height,yaw=0,pitch=0){
 if(index<0)return {x:0,y:0,z:0,yaw,pitch};
 const pose=gallerySpacePose(index,count,width,height),{focusZ}=gallerySceneMetrics(width);
 return {x:-pose.x,y:-pose.y,z:focusZ-pose.z,yaw:0,pitch:0};
}
export function galleryViewDepth(pose,camera){
 const yaw=camera.yaw*Math.PI/180,pitch=camera.pitch*Math.PI/180;
 return pose.y*Math.sin(pitch)+(-pose.x*Math.sin(yaw)+pose.z*Math.cos(yaw))*Math.cos(pitch)+camera.z;
}
// Near pages arrive first; only two documents hydrate at once.
export function galleryLoadOrder(count,selected=-1){
 return [...new Set([selected,0,3,1,4,5,8,10,2,7,11,9,6])].filter(index=>index>=0&&index<count);
}

// Account for rotated corners before the near plane, not only a card's centre.
export function galleryDepthExtent(pose,camera,width){
 const rad=Math.PI/180,rx=pose.rx*rad,ry=pose.ry*rad,rz=pose.rz*rad,yaw=camera.yaw*rad,pitch=camera.pitch*rad;
 const depth=(x,y)=>{const z=-Math.sin(ry)*x,xx=Math.cos(ry)*x,yy=Math.cos(rx)*y-Math.sin(rx)*z,zz=Math.sin(rx)*y+Math.cos(rx)*z;return Math.sin(pitch)*yy+Math.cos(pitch)*(-Math.sin(yaw)*xx+Math.cos(yaw)*zz);};
 return Math.abs(depth(Math.cos(rz),Math.sin(rz)))*width/2+Math.abs(depth(-Math.sin(rz),Math.cos(rz)))*(width*820/1200+40)/2+18;
}
