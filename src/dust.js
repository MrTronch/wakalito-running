import * as T from 'three';

export function createDust(scene) {
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=64;
 const context=canvas.getContext('2d');
 for(const [x,y,r] of [[32,33,26],[19,35,15],[41,25,16],[43,40,15],[26,22,13]]){
  const gradient=context.createRadialGradient(x,y,0,x,y,r);
  gradient.addColorStop(0,'rgba(255,255,255,.7)');
  gradient.addColorStop(.5,'rgba(255,255,255,.34)');
  gradient.addColorStop(1,'rgba(255,255,255,0)');
  context.fillStyle=gradient;context.fillRect(x-r,y-r,r*2,r*2);
 }
 const map=new T.CanvasTexture(canvas);
 const particles=Array.from({length:80},()=>{
  const sprite=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthWrite:false}));
  sprite.visible=false;scene.add(sprite);
  return {sprite,velocity:new T.Vector3(),age:0,life:0,size:0,opacity:0,gravity:0};
 });
 let next=0,stepTravel=0;
 function puff(x,y,z,vx,vy,vz,life,size,opacity,color,gravity){
  const p=particles[next++%particles.length];
  Object.assign(p,{age:0,life,size,opacity,gravity});
  p.velocity.set(vx,vy,vz);
  p.sprite.position.set(x,y,z);
  p.sprite.material.color.setHex(color);
  p.sprite.material.rotation=Math.random()*Math.PI*2;
  p.sprite.material.opacity=opacity;
  p.sprite.scale.set(size*1.25,size,1);
  p.sprite.visible=true;
 }
 return {
  clear(){stepTravel=0;for(const {sprite} of particles)sprite.visible=false},
  impact(x,y){
   for(let i=0;i<17;i++){
    const direction=i%3===0?1:-1;
    puff(x,y,.05,direction*(1+Math.random()*5),.4+Math.random()*3,(Math.random()-.5)*2,
     .24+Math.random()*.44,.12+Math.random()*.34,.9,i%3===0?0xffd095:0xb66a46,5.5);
   }
  },
  update(dt,grounded,x,speed,rage=false){
   if(grounded){
    stepTravel+=dt*speed;
    const spacing=rage?.24:.44;
    while(stepTravel>=spacing){
     stepTravel-=spacing;
     for(let i=0;i<(rage?4:3);i++)puff(x-.22-Math.random()*.4,.08+Math.random()*.09,(Math.random()-.5)*.5,
      -speed*(.46+Math.random()*.18),.15+Math.random()*.5,(Math.random()-.5)*.62,
      .31+Math.random()*.21,(.24+Math.random()*.19)*(rage?1.45:1),rage?.85:.69,rage?0xf1c77d:0xe2bb87,.45);
    }
   }else stepTravel=0;
   for(const p of particles){
    const {sprite}=p;
    if(!sprite.visible)continue;
    p.age+=dt;
    const progress=p.age/p.life;
    if(progress>=1){sprite.visible=false;continue}
    p.velocity.y-=dt*p.gravity;
    sprite.position.addScaledVector(p.velocity,dt);
    sprite.position.y=Math.max(.04,sprite.position.y);
    const size=p.size*(1+1.5*progress);
    sprite.scale.set(size*1.36,size,1);
    sprite.material.opacity=p.opacity*(1-progress)**1.6;
   }
  }
 };
}
