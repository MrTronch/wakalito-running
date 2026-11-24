export class RestartGuard {
 constructor(now=()=>performance.now()){this.now=now;this.until=0}
 lock(){this.until=Infinity}
 show(){this.until=this.now()+500}
 reset(){this.until=0}
 get ready(){return this.now()>=this.until}
}
