import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export function createCoinEnvironment(renderer){const room=new RoomEnvironment(),generator=new T.PMREMGenerator(renderer);const texture=generator.fromScene(room,.04).texture;room.dispose();generator.dispose();return texture}
export async function loadCoinModel(file="coin.glb",environment=null){
 const gltf=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/${file}`);
 gltf.scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(gltf.scene,true),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
 gltf.scene.position.sub(center);const template=new T.Group();template.add(gltf.scene);template.scale.setScalar(.44/Math.max(size.x,size.y,size.z));
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.metalness=.88;m.roughness=.22;m.envMap=environment;m.envMapIntensity=1.35;m.emissive.set(0xffc125);m.emissiveIntensity=.035}}});return template;
}
export function createPowerVisuals(scene,coinTemplate,bonusTemplate=coinTemplate){
 const coins=new Map(),coinPool={1:[],5:[]},effects=[];let time=0,particleClock=0;
 const sparkGeometry=new T.PlaneGeometry(.32,.32),fragmentGeometry=new T.IcosahedronGeometry(.18,0),cactusGeometry=new T.CylinderGeometry(.055,.08,.28,5);
 const gold=new T.MeshBasicMaterial({color:0xffdb69,transparent:true,opacity:.85,depthWrite:false}),rock=new T.MeshStandardMaterial({color:0x9e956e,roughness:1,transparent:true});
 const sparks=Array.from({length:160},()=>{const mesh=new T.Mesh(sparkGeometry,gold.clone());mesh.visible=false;scene.add(mesh);return {mesh,life:0,age:0,velocity:new T.Vector3()}});let next=0;
 // Shared procedural textures: soft golden glow and four-point sparkles, no wireframe shell.
 function glowTexture(star){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1,r=Math.hypot(u,v),a=star?Math.max(Math.exp(-r*r*25),Math.exp(-Math.abs(u)*55-Math.abs(v)*5),Math.exp(-Math.abs(v)*55-Math.abs(u)*5)):Math.max(0,1-r)**2;const i=(y*size+x)*4;data[i]=255;data[i+1]=225;data[i+2]=145;data[i+3]=Math.round(Math.min(1,a)*255)}const texture=new T.DataTexture(data,size,size);texture.needsUpdate=true;return texture}
 const sparkleMap=glowTexture(true),haloMap=glowTexture(false);
 for(const p of sparks){p.mesh.material.map=sparkleMap;p.mesh.material.blending=T.AdditiveBlending;p.mesh.material.toneMapped=false;p.mesh.material.needsUpdate=true}
 const haloMaterial=new T.MeshBasicMaterial({map:haloMap,color:0xffcb43,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const rageLight=new T.PointLight(0xffc14b,0,3.5,2);scene.add(rageLight);
 const haloGeometry=new T.PlaneGeometry(.95,.95);
 function spark(x,y,count=8){for(let i=0;i<count;i++){const p=sparks[next++%sparks.length];p.mesh.visible=true;p.mesh.position.set(x,y,(Math.random()-.5)*.5);p.velocity.set((Math.random()-.5)*3,.4+Math.random()*2,(Math.random()-.5)*1.4);p.age=0;p.life=.35+Math.random()*.4;p.mesh.material.opacity=.85;p.mesh.scale.setScalar(.65+Math.random()*.9);p.mesh.rotation.z=Math.random()*Math.PI}}
 function disposeEffect(effect){scene.remove(effect.model);if(effect.ownedMaterial)effect.model.material.dispose()}
 return {
  pickup(coin){spark(coin.x,coin.y,9)},
  activate(x,y){spark(x,y+1,32)},
  destroy(obstacle,visual){
   const {x,type}=obstacle;spark(x,type==='dragon'?1.65:.5,18);
   if(type!=='dragon'&&visual)scene.remove(visual.model);
   if(type==='dragon'&&visual){const model=visual.model;scene.add(model);effects.push({model,age:0,life:1.2,velocity:new T.Vector3(9,6,0),spin:new T.Vector3(3,5,4),update:visual.update})}
   else for(let i=0;i<7;i++){const material=rock.clone();if(type==='cactus')material.color.set(0x63783e);const model=new T.Mesh(type==='cactus'?cactusGeometry:fragmentGeometry,material);model.position.set(x,.35,0);model.scale.setScalar(.5+Math.random());scene.add(model);effects.push({model,ownedMaterial:true,age:0,life:.65+Math.random()*.35,velocity:new T.Vector3((Math.random()-.5)*9,2+Math.random()*4,(Math.random()-.5)*4),spin:new T.Vector3(4,3,5)})}
  },
  clear(){for(const model of coins.values()){scene.remove(model);coinPool[model.userData.coinValue].push(model)}coins.clear();for(const p of sparks)p.mesh.visible=false;for(const effect of effects)disposeEffect(effect);effects.length=0;particleClock=0;rageLight.intensity=0},
  update(dt,state,player){
   time+=dt;const activeIds=new Set(state.coins.items.map(c=>c.id));
   for(const [id,model] of coins)if(!activeIds.has(id)){scene.remove(model);coinPool[model.userData.coinValue].push(model);coins.delete(id)}
   for(const coin of state.coins.items){let model=coins.get(coin.id);if(!model){const value=coin.value===5?5:1;model=coinPool[value].pop();if(!model){model=new T.Group();model.userData.coinValue=value;const shape=(value===5?bonusTemplate:coinTemplate).clone(true);shape.name='coin-shape';model.add(shape);if(value===5){const halo=new T.Mesh(haloGeometry,haloMaterial);halo.name='bonus-glow';halo.position.z=-.08;model.add(halo)}}coins.set(coin.id,model);scene.add(model)}model.position.set(coin.x,coin.y+.035*Math.sin(time*3+coin.phase),0);model.getObjectByName('coin-shape').rotation.y=time*1.6+coin.phase}
   const rage=state.rage,visible=state.mode==='running'&&rage.active;
   const blink=visible&&rage.warning?.08+.92*(.5+.5*Math.sin(time*(12+(3-rage.remaining)*8))):1;
   rageLight.position.set(player.x,player.y+1,1);rageLight.intensity=visible?2.4*blink:0;
   if(visible){particleClock+=dt;while(particleClock>.006){particleClock-=.006;spark(player.x+(Math.random()-.5)*2.1,player.y+.05+Math.random()*2.1,1)}}
   for(const p of sparks){if(!p.mesh.visible)continue;p.age+=dt;if(p.age>=p.life){p.mesh.visible=false;continue}p.velocity.y-=dt*3;p.mesh.position.addScaledVector(p.velocity,dt);p.mesh.material.opacity=.95*(1-p.age/p.life)*(.55+.45*Math.sin(Math.PI*p.age/p.life))*blink}
   for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.age+=dt;if(e.age>=e.life){disposeEffect(e);effects.splice(i,1);continue}e.velocity.y-=12*dt;e.model.position.addScaledVector(e.velocity,dt);e.model.rotation.x+=e.spin.x*dt;e.model.rotation.y+=e.spin.y*dt;e.model.rotation.z+=e.spin.z*dt;if(e.ownedMaterial)e.model.material.opacity=1-e.age/e.life;e.update?.(dt)}
  },
  get temporaryCount(){return effects.length+sparks.filter(p=>p.mesh.visible).length},
  get coinCount(){return coins.size}
 };
}
