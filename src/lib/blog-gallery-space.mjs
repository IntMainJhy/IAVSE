// Positions belong to each homepage, not to a moving carousel track.
const desktop=[
 [-.28,.00,100,.46,7,17,-5],
 [.29,-.18,-260,.43,-6,-16,5],
 [-.035,-.29,-520,.39,9,-9,-4],
 [.24,.23,20,.47,5,-16,6],
 [-.065,.30,-180,.40,-6,12,-4],
 [-.40,-.31,-420,.34,8,20,-7],
 [.43,.04,-480,.34,-5,-20,5],
 [-.35,.31,-410,.34,5,15,-3],
 [.15,-.40,-620,.32,7,-9,4],
];
const mobile=[
 [-.22,-.06,60,.56,6,14,-5],
 [.29,-.19,-180,.53,-5,-14,6],
 [-.10,-.39,-320,.48,7,-8,-4],
 [.22,.25,15,.57,5,-15,5],
 [-.27,.33,-120,.52,-6,12,-5],
 [-.36,-.30,-270,.36,8,14,-4],
 [.40,.04,-300,.37,-4,-14,5],
 [-.36,.14,-300,.34,5,10,-4],
 [.21,-.43,-400,.34,6,-9,3],
];
export function gallerySpacePose(index,count,width,height,focused=-1){
 const compact=width<720,slots=compact?mobile:desktop;
 const [x,y,z,scale,rx,ry,rz]=count===1?[0,0,20,.55,6,-12,-3]:slots[index%slots.length];
 if(index===focused)return {x:0,y:compact?-10:-8,z:compact?25:70,scale:compact?.94:.94,rx:0,ry:0,rz:0,opacity:1};
 const retreat=focused>=0;
 return {x:x*width*(retreat?1.15:1),y:y*height*(retreat?1.1:1),z:z-(retreat?250:0),scale:scale*(retreat?.82:1),rx,ry,rz,opacity:retreat?.36:1};
}
