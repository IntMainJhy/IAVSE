export function asciiWave(x,y,time,pointer=.5){
 const ridge=.54+Math.sin(x*.011+time*.35)*.13+Math.sin(x*.021-time*.22)*.055;
 const envelope=Math.exp(-Math.pow((y-ridge)/.23,2));
 const detail=.57+.43*Math.sin(x*.047+y*14-time*.7);
 return Math.max(0,Math.min(1,envelope*detail*(.55+Math.max(0,1-Math.abs(pointer-x/1800))*.45)));
}
