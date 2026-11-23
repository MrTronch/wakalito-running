import * as T from 'three';
import {applyCharacterMaterials,loadCharacterTextures} from './materials.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export function inPlaceClip(source, removeHipMotion = false){
 const clip=source.clone();
 clip.tracks=clip.tracks.filter(t=>!/^root\.(position|quaternion|scale)$/.test(t.name)&&!/^dark_wakalito\./.test(t.name));
 for(const t of clip.tracks)if(removeHipMotion && /Hips\.position$/.test(t.name))for(let i=3;i<t.values.length;i++)t.values[i]=t.values[i%3];
 return clip;
}
export async function loadCharacter(scene){
 const gltf=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/wakalito.glb`);
 const textures=await loadCharacterTextures(`${import.meta.env.BASE_URL}texturas/`);applyCharacterMaterials(gltf,textures);
 return createCharacter(gltf,scene);
}
export function createCharacter(gltf,scene){
 applyCharacterMaterials(gltf);
 const pivot=new T.Group(),facing=new T.Group(),normalizer=new T.Group(),anchor=new T.Group();
 scene.add(pivot);pivot.add(facing);facing.add(normalizer);normalizer.add(anchor);anchor.add(gltf.scene);
 const mixer=new T.AnimationMixer(gltf.scene),actions={};
 const clips = {run:'running final', duck:'roll', jump:'jump', death:'death', idle:'idle 1'};
 for(const [name, clipName] of Object.entries(clips)){
  const source=gltf.animations.find(a=>a.name.toLowerCase()===clipName);
  if(!source)throw new Error(`Animación ausente: ${clipName}`);
  actions[name]=mixer.clipAction(inPlaceClip(source, name==='jump'));
  if(name==='jump'||name==='death'){actions[name].setLoop(T.LoopOnce,1);actions[name].clampWhenFinished=true}
 }
 // Bind-pose bounds extend far below the animated soles. Measure the actual run pose.
 actions.run.play();mixer.update(1/120);gltf.scene.updateMatrixWorld(true);
 const meshes=[];gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;meshes.push(o);if(o.isSkinnedMesh)o.skeleton.update()}});
 const bounds=new T.Box3().setFromObject(gltf.scene,true),size=bounds.getSize(new T.Vector3());
 normalizer.scale.setScalar(1.8/size.y);anchor.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
 // Sample points across the whole mesh so rolls and falls can touch the ground.
 const point=new T.Vector3();
 const groundSamples=meshes.map(mesh=>{
  const count=mesh.geometry.attributes.position.count;
  const stride=Math.max(1,Math.floor(count/1400));
  return {mesh,count,stride};
 });
 actions.run.stop();let current;
 function play(name,responsive=false){
  if(current===name)return;
  const fade=responsive&&(name==='jump'||name==='duck')?.03:(name==='death'||name==='duck')?.065:.12;
  actions[name].reset().setEffectiveWeight(1).fadeIn(fade).play();
  if(name==='jump'){actions.jump.timeScale=1;actions.jump.time=0}
  if(current)actions[current].fadeOut(fade);
  current=name;
 }
 facing.rotation.y=Math.PI/2;play('idle');
 return {pivot,play,actions,update(dt,speed,responsive=false){
  actions.run.timeScale=speed/7;
  actions.duck.timeScale=responsive?1:1.55*speed/7;
  mixer.update(dt);
  anchor.position.y=0;pivot.updateMatrixWorld(true);
  let min=Infinity;
  const fullBounds=current==='duck'||current==='death';
  for(const {mesh,count,stride} of groundSamples){
   if(mesh.isSkinnedMesh)mesh.skeleton.update();
   for(let index=0;index<count;index+=fullBounds?1:stride){
    mesh.getVertexPosition(index,point);point.applyMatrix4(mesh.matrixWorld);
    min=Math.min(min,point.y);
   }
  }
  if(!Number.isFinite(min))return;
  // The engine supplies jump height. Align the animated model to that height.
  anchor.position.y=(pivot.position.y+.012-min)/normalizer.scale.y;
 }};
}





