/** Display units only: none of these dimensions are field measurements. */
export const HALF_WIDTH=2.15;
export const WATER_Y=1.3;
/** Deepest point of the illustrative channel (bedHeight at its center line). */
export const BED_FLOOR=.1;
export const unit=(value:number)=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;
export const riverCenter=(x:number)=>.035*x;
export function bedHeight(x:number,z:number){
 const d=Math.abs(z-riverCenter(x)),u=d/HALF_WIDTH;
 if(u<=1)return BED_FLOOR+1.2*u*u+.06*(1-u*u)**2*Math.sin(4*x+6*z);
 const bank=1-Math.exp(-(d-HALF_WIDTH)*2);
 return WATER_Y+bank*(.65+.035*Math.sin(x*1.8));
}
export function sampleLayers(value:number){
 const s=unit(value);
 return {water:2.4*s,bed:1.2*s,sediment:0,substrate:s===0?0:-1.2*s};
}
export type DisplayState={water:number;separation:number};
export function interpolateView(from:DisplayState,to:DisplayState,progress:number):DisplayState{
 const p=unit(progress),t=p*p*(3-2*p);
 return {water:unit(from.water)+(unit(to.water)-unit(from.water))*t,separation:unit(from.separation)+(unit(to.separation)-unit(from.separation))*t};
}
export function advanceTransition(progress:number,seconds:number,visible:boolean){
 if(!visible)return unit(progress);
 const dt=Number.isFinite(seconds)?Math.max(0,Math.min(.1,seconds)):0;
 return Math.min(1,unit(progress)+dt/1.2);
}
