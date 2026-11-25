import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';

// Reuses the loaded character's meshes, textures and idle clip; no second download.
export function createMenuCharacter(character,canvas){
 const scene=new T.Scene(),model=clone(character.pivot);
 model.position.set(0,0,0);model.rotation.y=-Math.PI/2+.25;model.visible=true;scene.add(model);
 const mixer=new T.AnimationMixer(model);mixer.clipAction(character.actions.idle.getClip()).play();
 const camera=new T.PerspectiveCamera(34,1,.1,20);camera.position.set(0,1.05,3.5);camera.lookAt(0,.94,0);
 scene.add(new T.HemisphereLight(0xfff0d0,0x354c48,2.1));
 const key=new T.DirectionalLight(0xffdc99,3.2);key.position.set(-3,4,5);scene.add(key);
 const fill=new T.DirectionalLight(0xffffff,1.7);fill.position.set(3,2,3);scene.add(fill);
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 let width=0,height=0;
 return {update(dt){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;if(width!==w||height!==h){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}mixer.update(dt);renderer.render(scene,camera)}};
}
