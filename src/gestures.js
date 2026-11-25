export const SWIPE_CONFIG={threshold:32,dominance:1.25,maxDuration:750};
export function swipeDirection(dx,dy,elapsed,config=SWIPE_CONFIG){if(elapsed>config.maxDuration||Math.abs(dy)<config.threshold||Math.abs(dy)<Math.abs(dx)*config.dominance)return null;return dy<0?'jump':'roll'}
export class SwipeControls {
 constructor(surface,actions,{enabled=()=>true,config=SWIPE_CONFIG}={}){
  this.pointer=null;const clear=()=>{this.pointer=null};
  surface.addEventListener('pointerdown',event=>{if(!enabled()||!event.isPrimary||this.pointer)return;event.preventDefault();surface.setPointerCapture(event.pointerId);this.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,time:event.timeStamp,fired:false}});
  const recognize=event=>{const p=this.pointer;if(!p||p.id!==event.pointerId||p.fired)return;if(!enabled()){clear();return}const action=swipeDirection(event.clientX-p.x,event.clientY-p.y,event.timeStamp-p.time,config);if(action){p.fired=true;actions[action]()}};
  surface.addEventListener('pointermove',recognize);surface.addEventListener('pointerup',event=>{if(this.pointer?.id!==event.pointerId)return;recognize(event);clear()});surface.addEventListener('pointercancel',clear);surface.addEventListener('lostpointercapture',clear);window.addEventListener('blur',clear);
 }
}
