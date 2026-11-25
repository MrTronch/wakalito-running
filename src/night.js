import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export const NIGHT_CONFIG=Object.freeze({startMeters:900,endMeters:1000,nazcaDuration:12,firstDelay:8,repeatMin:80,repeatRange:60});
export function nightProgress(distance){const t=Math.max(0,Math.min(1,(distance-NIGHT_CONFIG.startMeters)/(NIGHT_CONFIG.endMeters-NIGHT_CONFIG.startMeters)));return t*t*(3-2*t)}

export class NazcaSchedule{
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.active=false;this.elapsed=0;this.wait=NIGHT_CONFIG.firstDelay+this.random()*8}
 update(dt,night){if(night<1){this.reset();return}if(this.active){this.elapsed+=dt;if(this.elapsed>=NIGHT_CONFIG.nazcaDuration){this.active=false;this.elapsed=0;this.wait=NIGHT_CONFIG.repeatMin+this.random()*NIGHT_CONFIG.repeatRange}}else{this.wait-=dt;if(this.wait<=0){this.active=true;this.elapsed=0}}}
 get opacity(){return this.active?Math.min(1,this.elapsed/1.5,(NIGHT_CONFIG.nazcaDuration-this.elapsed)/2):0}
}

export async function loadNazca(){return new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/ave-nazca.glb`)}

export function createNazca(scene,gltf,random=Math.random){
 const schedule=new NazcaSchedule(random),facing=new T.Group(),model=gltf.scene,materials=[];
 facing.add(model);model.updateMatrixWorld(true);
 const initial=new T.Box3().setFromObject(model),size=initial.getSize(new T.Vector3());
 if(size.y<Math.min(size.x,size.z))model.rotation.x+=Math.PI/2;
 else if(size.x<Math.min(size.y,size.z))model.rotation.y+=Math.PI/2;
 model.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),center=bounds.getCenter(new T.Vector3());model.position.sub(center);
 const diameter=Math.max(...bounds.getSize(new T.Vector3()).toArray());facing.scale.setScalar(12.0/diameter);
 const meshes=[];model.traverse(o=>{if(o.isMesh)meshes.push(o)});
 for(const mesh of meshes){const original=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;const color=original.emissive?.clone()??new T.Color(0x398aff);if(color.getHex()===0)color.set(0x398aff);
  mesh.material=new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:0,toneMapped:false,fog:false});materials.push({material:mesh.material,strength:1});mesh.castShadow=mesh.receiveShadow=false;
  for(const [scale,opacity] of [[1.025,.18],[1.07,.09]]){const material=new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false}),glow=new T.Mesh(mesh.geometry,material);glow.scale.setScalar(scale);mesh.add(glow);materials.push({material,strength:opacity})}
 }
 facing.visible=false;facing.userData.kind='nazca-sky-decoration';scene.add(facing);
 const point=new T.Vector3(),direction=new T.Vector3();
 return {schedule,model:facing,reset(){schedule.reset();facing.visible=false},update(dt,distance,camera){schedule.update(dt,nightProgress(distance));facing.visible=schedule.active;if(!facing.visible)return;const progress=schedule.elapsed/NIGHT_CONFIG.nazcaDuration;
  point.set(.65-progress*.55,(camera.aspect<1?.62:.72)+Math.sin(progress*Math.PI)*.025,.8).unproject(camera);direction.copy(point).sub(camera.position);const t=(-90-camera.position.z)/direction.z;facing.position.copy(camera.position).addScaledVector(direction,t);facing.rotation.z=.04*Math.sin(progress*Math.PI*2);
  for(const entry of materials)entry.material.opacity=schedule.opacity*entry.strength;
 }};
}
