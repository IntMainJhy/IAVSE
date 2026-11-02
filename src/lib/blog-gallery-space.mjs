// Screen composition is converted to a shared world. Size comes from perspective,
// not per-card scale; moving the camera changes occlusion between fixed homepages.
// Final three values are small pitch/yaw/roll offsets from the viewing ray.
const desktop=[
 [-.31,.04,100,1,-10,-1], [.32,-.15,-360,-1,9,.8],
 [-.10,-.28,-1100,1.5,-7,-.6], [.24,.25,30,-1,11,1],
 [-.16,.33,-420,.5,-8,-.8], [-.34,-.25,-440,-1,-9,-1],
 [.23,-.31,-1300,1,8,.7], [-.43,.32,-920,-1,-10,-.6],
 [.08,.03,-780,.5,7,.6], [.42,.39,-1080,1,10,.8],
 [.02,-.30,-660,-1,-6,-.7], [.43,.07,-1050,.5,9,.7],
];
const mobile=[
 [-.24,-.02,70,.5,-7,-.7], [.25,-.21,-300,-.5,7,.6],
 [-.05,-.31,-920,1,-5,-.5], [.23,.24,0,-.5,8,.7],
 [-.23,.34,-330,.5,-6,-.6], [-.30,-.29,-380,-.5,-7,-.7],
 [.24,-.36,-1080,.5,6,.5], [-.38,.18,-820,-.5,-7,-.5],
 [.02,.10,-660,.5,5,.5], [.35,.43,-900,.5,7,.6],
 [.01,-.36,-560,-.5,-4,-.5], [.37,-.02,-880,.5,6,.5],
];
export const galleryLimit=12;
export function gallerySceneMetrics(width){
 const compact=width<720,perspective=compact?760:1000,cardWidth=Math.min(width*(compact?.58:.31),compact?280:400),focusWidth=Math.min(width*(compact?.9:.68),800);
 return {compact,perspective,cardWidth,focusZ:perspective*(1-cardWidth/focusWidth)};
}
export function gallerySpacePose(index,count,width,height,focused=-1){
 const {compact,perspective,cardWidth}=gallerySceneMetrics(width),slots=compact?mobile:desktop;
 const [sx,sy,z,pitch,yaw,roll]=count===1?[0,0,-120,1,-8,-.7]:slots[index%slots.length];
 const projection=1-z/perspective,d=perspective-z,degrees=180/Math.PI;
 // Facing the viewer reveals more of the page; preserve a small edge gutter.
 const horizontalLimit=Math.max(0,width/2-cardWidth/projection*.56-12);
 const x=Math.max(-horizontalLimit,Math.min(horizontalLimit,sx*width))*projection,y=sy*height*projection;
 // CSS uses Rx · Ry · Rz: face the viewer before adding a restrained tilt.
 const rx=Math.atan2(y,d)*degrees+pitch,ry=Math.atan2(-x,Math.hypot(y,d))*degrees+yaw;
 return {x,y,z,rx:index===focused?0:rx,ry:index===focused?0:ry,rz:index===focused?0:roll};
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
