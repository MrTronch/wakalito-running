import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import {createDragonFactory} from './dragon.js';

export const WORLD_MODEL_FILES={clava:'cabeza-clava.glb',rock:'rock.glb',cactus:'cactus.glb',grass:'grass.glb',ruins:'rock-groups.glb',shrub:'arbusto.glb',chakana:'chakana-roca.glb',mushroom:'hongo.glb',dragon:'cabeza-dragon.glb'};
export function normalizeModel(model,height=1,dimensions){
 model.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(model,true),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 if(!Number.isFinite(size.y)||size.y<=0)throw new Error(`Modelo sin volumen: ${model.name}`);
 center.y=bounds.min.y;model.position.sub(center);
 const group=new T.Group();group.add(model);
 if(dimensions)group.scale.copy(dimensions).divide(size);else group.scale.setScalar(height/size.y);
 group.userData.normalizedHeight=dimensions?.y??height;
 return group;
}
export async function loadWorldModels(){
 const loader=new GLTFLoader(),base=`${import.meta.env.BASE_URL}models/`;
 const loaded=await Promise.all(Object.entries(WORLD_MODEL_FILES).map(async([name,file])=>[name,await loader.loadAsync(base+file+(name==='mushroom'?'?v=earth-20261123':''))]));
 const sources=Object.fromEntries(loaded),models={};
 for(const [name,gltf] of loaded){if(name==='dragon'||name==='clava')continue;
  gltf.scene.traverse(object=>{if(!object.isMesh)return;const materials=Array.isArray(object.material)?object.material:[object.material];for(const m of materials){if(name==='mushroom'){if(m.color.r>m.color.g*3)m.color.set(0x8c8057);m.roughness=.9;m.metalness=0}if(name==='grass'){m.transparent=false;m.alphaTest=.45;m.depthWrite=true}for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(m[key])m[key].anisotropy=4}});
  models[name]=normalizeModel(gltf.scene);
 }
 models.rockObstacle=normalizeModel(models.rock.clone(),1,new T.Vector3(1.1,.76,.86));
 models.createClava=createClavaFactory(sources.clava);
 models.createDragon=createDragonFactory(sources.dragon);
 return models;
}


export function createClavaFactory(source){return ()=>{const rig=cloneSkeleton(source.scene),mixer=new T.AnimationMixer(rig),clip=source.animations.find(a=>a.name==='idle')??source.animations[0];if(clip)mixer.clipAction(clip).play();mixer.update(0);const model=normalizeModel(rig);model.userData.kind='clava-decoration';return {model,update:dt=>mixer.update(dt*.75)}}}
