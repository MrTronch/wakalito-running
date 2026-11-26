import {Vector3} from 'three';
import {PLAYER_X,JUMP_SPEED,GRAVITY} from './engine.js';

// Reserve the complete jump silhouette, including helmet and a small Rage zoom.
export function reserveMobileJumpSpace(camera,width,height,hudBottom){
 camera.clearViewOffset();
 camera.updateMatrixWorld(true);
 const head=new Vector3(PLAYER_X,JUMP_SPEED**2/(2*GRAVITY)+2.5,0).project(camera);
 const headPixels=(1-head.y*1.025)*height/2;
 const shift=Math.max(height*.055,hudBottom+24-headPixels);
 camera.setViewOffset(width,height,0,-shift,width,height);
 return shift;
}
