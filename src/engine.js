export const GRAVITY=24, JUMP_SPEED=9.2, PLAYER_X=-4;
export const OBSTACLE_BOUNDS={stone:{halfWidth:.55,bottom:0,top:.76},dragon:{halfWidth:.55,bottom:1.12,top:2.24}};
export class RunnerState {
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.mode='ready';this.controlMode='keyboard';this.y=0;this.vy=0;this.duck=false;this.duckHeld=false;this.rollRemaining=0;this.bodyRollDuration=this.bodyRollDuration??1.2;this.distance=0;this.speed=7;this.untilSpawn=30;this.obstacles=[];this.nextId=0;this.hitTime=0}
 start(controlMode='keyboard'){this.reset();this.setControlMode(controlMode);this.mode='running'}
 setControlMode(mode){this.controlMode=['body','touch'].includes(mode)?mode:'keyboard';if(this.controlMode==='keyboard'){this.rollRemaining=0;this.duckHeld=false;this.duck=false}this.speed=Math.min(15,7+this.distance/220)*(this.controlMode==='body'?.8:1)}
 jump(){if(this.mode==='running'&&this.y===0&&(!this.duck||this.controlMode==='body')){if(this.controlMode==='body'){this.duck=false;this.duckHeld=false;this.rollRemaining=0}this.vy=this.controlMode==='body'?11.2:JUMP_SPEED;return true}return false}
 roll(){if(this.controlMode!=='touch'||this.mode!=='running'||this.y!==0||this.rollRemaining>0)return false;this.rollRemaining=this.bodyRollDuration/(1.55*this.speed/7);this.duck=true;return true}
 setDuck(value){
  if(this.controlMode==='touch'){if(value)this.roll();return}
  if(this.controlMode!=='body'){this.duck=value&&this.y===0;return}
  const held=!!value&&this.y===0;
  if(held&&!this.duckHeld&&this.rollRemaining<=0)this.rollRemaining=this.bodyRollDuration;
  this.duckHeld=held;this.duck=this.y===0&&(held||this.rollRemaining>0);
 }
 update(dt){if(this.mode!=='running')return;if(this.controlMode==='touch'){this.rollRemaining=Math.max(0,this.rollRemaining-dt);this.duck=this.y===0&&this.rollRemaining>0}if(this.controlMode==='body'){if(this.rollRemaining>0){this.rollRemaining-=dt;if(this.rollRemaining<=1e-8)this.rollRemaining=this.duckHeld?this.bodyRollDuration+Math.min(0,this.rollRemaining):0}this.duck=this.y===0&&(this.duckHeld||this.rollRemaining>0)}const pace=Math.min(15,7+this.distance/220);this.speed=pace*(this.controlMode==='body'?.8:1);const travel=this.speed*dt;this.distance+=travel;const gravity=this.controlMode==='body'?(this.vy>0?28:14):GRAVITY;this.vy-=gravity*dt;this.y=Math.max(0,this.y+this.vy*dt);if(this.y===0)this.vy=0;this.untilSpawn-=travel;if(this.untilSpawn<=0){this.obstacles.push({id:this.nextId++,x:28,type:this.random()<.38?'dragon':'stone'});this.untilSpawn=pace*(1.65+this.random()*.65)+2.5}for(const o of this.obstacles){const old=o.x;const {halfWidth,bottom,top}=OBSTACLE_BOUNDS[o.type];o.x-=travel;if(old+halfWidth>PLAYER_X-.32&&o.x-halfWidth<PLAYER_X+.32){const height=this.duck?.83:1.8;if(this.y+.08<top&&this.y+height>bottom){this.mode='over';this.hitTime=0;break}}}this.obstacles=this.obstacles.filter(o=>o.x>-14)}
}






