export const COIN_CONFIG=Object.freeze({value:10,radius:.24,spacing:1.05,obstacleClearance:4.2,bonusEvery:10,bonusValue:5,densityMultiplier:1.25});
export class CoinSystem {
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.items=[];this.nextId=0;this.bonusSlot=-1;this.densityCarry=0;this.group(12,5,false)}
 group(center,count,arc){count=Math.max(3,count);for(let i=0;i<count;i++){const slot=this.nextId%COIN_CONFIG.bonusEvery;if(slot===0)this.bonusSlot=Math.floor(this.random()*COIN_CONFIG.bonusEvery);this.items.push({value:slot===this.bonusSlot?COIN_CONFIG.bonusValue:1,id:this.nextId++,x:center+(i-(count-1)/2)*COIN_CONFIG.spacing,y:arc?1+1.65*Math.sin(Math.PI*i/(count-1)):1,phase:i*.7})}}
 reserveGap(obstacleX,gap){const base=3+Math.floor(this.random()*3);this.densityCarry+=base*(COIN_CONFIG.densityMultiplier-1);const extra=Math.floor(this.densityCarry+1e-9);let count=base+extra;const fits=n=>gap/2-(n-1)*COIN_CONFIG.spacing/2>=COIN_CONFIG.obstacleClearance;if(!fits(count))count=base;if(!fits(count))return;this.densityCarry-=count-base;this.group(obstacleX+gap/2,count,this.random()<.4)}
 update(travel,playerX,playerY,height){
  const collected=[];this.items=this.items.filter(coin=>{const old=coin.x;coin.x-=travel;const crosses=old+COIN_CONFIG.radius>=playerX-.35&&coin.x-COIN_CONFIG.radius<=playerX+.35;const reaches=coin.y+COIN_CONFIG.radius>=playerY+.08&&coin.y-COIN_CONFIG.radius<=playerY+height;
   if(crosses&&reaches){collected.push(coin);return false}return coin.x>-16});return collected;
 }
}
