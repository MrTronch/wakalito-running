import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3,MathUtils} from 'three';
import {reserveMobileJumpSpace} from '../src/mobile-framing.js';
import {PLAYER_X,JUMP_SPEED,GRAVITY} from '../src/engine.js';

test('encuadre móvil reserva margen de salto en pantallas cortas y altas',()=>{
 for(const [w,h,bottom] of [[320,480,235],[360,640,239],[393,730,281],[412,924,315],[430,932,316]]){
  const camera=new PerspectiveCamera(38,w/h,.1,320),depth=(5.3/1.05)/(Math.tan(MathUtils.degToRad(19))*camera.aspect);
  camera.position.set(PLAYER_X+2.52,3.5,depth);camera.lookAt(PLAYER_X+2.52,2.37,0);
  reserveMobileJumpSpace(camera,w,h,bottom);
  const head=new Vector3(PLAYER_X,JUMP_SPEED**2/(2*GRAVITY)+2.5,0).project(camera);
  assert.ok((1-head.y)*h/2>=bottom+20,`${w}x${h}: salto separado del HUD`);
  const previous=camera.projectionMatrix.clone();reserveMobileJumpSpace(camera,w,h,bottom);
  assert.deepEqual(camera.projectionMatrix.elements,previous.elements,'el ajuste no se acumula');
 }
});
