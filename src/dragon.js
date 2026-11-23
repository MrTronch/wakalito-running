import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';

export function createDragonFactory(gltf) {
 const clip=gltf.animations.find(animation=>animation.name==='ArmatureAction');
 if(!clip)throw new Error('Animación ausente: ArmatureAction');

 function rig() {
  const model=clone(gltf.scene);
  const facing=new T.Group();
  facing.rotation.y=-Math.PI*.43;
  facing.add(model);
  const mixer=new T.AnimationMixer(model);
  mixer.clipAction(clip).play();
  return {facing,mixer};
 }

 // Fit the complete animated silhouette, including the fully open mouth.
 const sample=rig();
 const bounds=new T.Box3();
 for(let frame=0;frame<=30;frame++){
  sample.mixer.setTime(clip.duration*frame/30);
  sample.facing.updateMatrixWorld(true);
  bounds.union(new T.Box3().setFromObject(sample.facing,true));
 }
 const center=bounds.getCenter(new T.Vector3());
 const size=bounds.getSize(new T.Vector3());
 const scale=Math.min(1.1/size.x,.94/size.y);
 return function createDragon({shadow=true,phase=0}={}) {
  const {facing,mixer}=rig();
  const model=new T.Group(),fit=new T.Group();
  model.name='Cabeza de dragón para agacharse';model.userData.kind='dragon';
  model.add(fit);fit.add(facing);fit.scale.setScalar(scale);
  facing.position.set(-center.x,-bounds.min.y,-center.z);
  facing.traverse(object=>{
   if(!object.isMesh)return;
   object.castShadow=shadow;
   object.receiveShadow=true;
   object.frustumCulled=false;
  });
  mixer.setTime(clip.duration*phase);

  let hover=phase*2*Math.PI;
  return {model,update(dt){
   mixer.update(dt);

   hover=(hover+dt*2.7)%(2*Math.PI);
   fit.position.y=.075*Math.sin(hover);
  }};
 };
}



