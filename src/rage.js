export const RAGE_CONFIG=Object.freeze({coinsRequired:100,duration:10,speedMultiplier:1.25,incrementPerActivation:.10,transitionSeconds:.45,warningSeconds:3,recoverySeconds:3,recoveryDip:.85,recoveryDropSeconds:.18});
const smooth=t=>t*t*(3-2*t);
export class RageState {
 constructor(config=RAGE_CONFIG){this.config=config;this.reset()}
 reset(){this.mode='NORMAL';this.remaining=0;this.meter=0;this.multiplier=1;this.activations=0;this.entryElapsed=0;this.entryStart=1;this.recoveryRemaining=0;this.recoveryStart=1}
 get active(){return this.mode==='RAGE'}
 get targetMultiplier(){return this.config.speedMultiplier+Math.max(0,this.activations-1)*this.config.incrementPerActivation}
 addCoins(count=1){this.meter+=count;this.tryActivate()}
 tryActivate(){if(!this.active&&this.meter>=this.config.coinsRequired){this.meter-=this.config.coinsRequired;this.mode='RAGE';this.remaining=this.config.duration;this.activations++;this.entryStart=this.multiplier;this.entryElapsed=0;this.recoveryRemaining=0;return true}return false}
 update(dt){
  let left=Math.max(0,dt);
  while(left>1e-10){
   if(this.active){
    const step=Math.min(left,this.remaining);this.remaining-=step;left-=step;
    this.entryElapsed=Math.min(this.config.transitionSeconds,this.entryElapsed+step);
    this.multiplier=this.entryStart+(this.targetMultiplier-this.entryStart)*smooth(this.entryElapsed/this.config.transitionSeconds);
    if(this.remaining<1e-8){this.remaining=0;this.mode='NORMAL';if(!this.tryActivate()){this.recoveryRemaining=this.config.recoverySeconds;this.recoveryStart=this.multiplier}}
   }else if(this.recoveryRemaining>0){
    const step=Math.min(left,this.recoveryRemaining);this.recoveryRemaining=Math.max(0,this.recoveryRemaining-step);left-=step;
    const elapsed=this.config.recoverySeconds-this.recoveryRemaining,drop=this.config.recoveryDropSeconds;
    this.multiplier=elapsed<drop?this.recoveryStart+(this.config.recoveryDip-this.recoveryStart)*smooth(elapsed/drop):this.config.recoveryDip+(1-this.config.recoveryDip)*smooth((elapsed-drop)/(this.config.recoverySeconds-drop));
   }else{this.multiplier=1;break}
  }
 }
 get warning(){return this.active&&this.remaining<=this.config.warningSeconds}
}
