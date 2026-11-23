import './style.css';
import * as T from 'three';
import {RunnerState,PLAYER_X} from './engine.js';
import {KeyboardControls} from './controls.js';
import {BodyControls} from '#body-controls';
import {BodyControls as NoCameraControls} from './no-camera-controls.js';
import {GameAudio} from './audio.js';
import {createWorld} from './world.js';
import {loadWorldModels} from './world-models.js';
import {loadCharacter} from './character.js';
import {addSunset} from './sunset.js';
import {createDust} from './dust.js';
const $=id=>document.getElementById(id),state=new RunnerState();let best=0;try{best=Number(localStorage.getItem('wakalito-best'))||0}catch{}$('best').textContent=String(best).padStart(5,'0');
const mobileLayout=()=>innerWidth<=700||(innerWidth<=1024&&matchMedia('(pointer:coarse)').matches);
let touchMode=mobileLayout();
document.documentElement.classList.toggle('touch-game',touchMode);
if(touchMode){$('mode-body')?.setAttribute('hidden','');document.querySelector('.mode-picker')?.setAttribute('hidden','');$('settings').hidden=true;document.querySelector('.hint').textContent='Toca RODAR o SALTAR para esquivar los obstáculos.'}
const audio=new GameAudio();const audioReady=audio.load(`${import.meta.env.BASE_URL}audio/`);try{audio.enabled=localStorage.getItem('wakalito-sound')!=='off'}catch{}
function updateSound(){const button=$('sound');button.setAttribute('aria-pressed',String(audio.enabled));button.setAttribute('aria-label',audio.enabled?'Silenciar efectos':'Activar efectos');button.textContent=audio.enabled?'♪':'♪̸'}
updateSound();$('sound').onclick=()=>{audio.setEnabled(!audio.enabled);try{localStorage.setItem('wakalito-sound',audio.enabled?'on':'off')}catch{}updateSound()};
for(const event of ['pointerdown','keydown'])window.addEventListener(event,()=>audio.unlock(),{passive:true});
const scene=new T.Scene();const atmosphere=addSunset(scene);
const dust=createDust(scene);
const renderer=new T.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,touchMode?1.35:1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,320);
function resize(){
 const nextTouchMode=mobileLayout();
 if(nextTouchMode!==touchMode){touchMode=nextTouchMode;document.documentElement.classList.toggle('touch-game',touchMode);if(state.controlMode!=='body')state.setControlMode(touchMode?'touch':'keyboard')}
 document.querySelector('.hint').textContent=touchMode?'Toca RODAR o SALTAR para esquivar los obstáculos.':'ESPACIO / ↑ saltar · ↓ / S agacharse';
 renderer.setSize(innerWidth,innerHeight);
 camera.aspect=innerWidth/innerHeight;
 const depth=Math.max(8.5,(touchMode&&camera.aspect<1?4.6:2.02)/(Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect));
 const x=PLAYER_X+.36*depth*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect;
 camera.position.set(x,touchMode&&camera.aspect<1?5.0:2.65,depth);
 camera.lookAt(x,touchMode&&camera.aspect<1?3.87:1.52,0);
 camera.updateProjectionMatrix();
 atmosphere.setMobile(touchMode&&camera.aspect<1);
}
resize();window.addEventListener('resize',resize);
scene.add(new T.HemisphereLight(0xffded9,0x76604e,1.25));const sun=new T.DirectionalLight(0xffb16b,3.4);sun.position.set(14,8,-15);sun.target.position.set(-4,.8,0);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(touchMode?1024:2048,touchMode?1024:2048);Object.assign(sun.shadow.camera,{left:-21,right:25,top:19,bottom:-19,near:1,far:75});sun.shadow.normalBias=.012;sun.shadow.bias=-.00012;sun.shadow.camera.updateProjectionMatrix();
 atmosphere.setMobile(touchMode&&camera.aspect<1);scene.add(sun);const characterFill=new T.DirectionalLight(0xffecd9,1.75);characterFill.position.set(-10,4.2,6);scene.add(characterFill);
const visuals=new Map();let world,character,lastDuck=false,paused=false,gameOverShown=false;
let countdown=null;
function cancelCountdown(){if(countdown)clearInterval(countdown);countdown=null;$('countdown').hidden=true}
function start(){
 if(!character||countdown)return;
 if(!body.ready){$('message').textContent='Activa la cámara, calibra de pie y vuelve al encuadre antes de comenzar.';return}
 if(body.mode==='body'){
  let count=3;$('countdown').textContent=count;$('countdown').hidden=false;
  countdown=setInterval(()=>{if(!body.ready){cancelCountdown();$('message').textContent='Vuelve al encuadre y pulsa Comenzar.';return}count--;if(count>0)$('countdown').textContent=count;else{cancelCountdown();beginRun()}},1000);
 }else beginRun();
}
function beginRun(){if(!character)return;audio.unlock();if(paused){pause();return}if(state.mode==='running')return;for(const {model} of visuals.values())scene.remove(model);visuals.clear();dust.clear();audio.reset();state.start(touchMode?'touch':body.mode);gameOverShown=false;character.pivot.position.set(PLAYER_X,0,0);character.play('run');$('overlay').classList.add('hidden')}
function pause(){if(state.mode!=='running')return;if(paused&&!body.ready){$('message').textContent='Vuelve al encuadre o cambia a teclado para continuar.';return}cancelCountdown();paused=!paused;audio.setRunning(!paused);$('overlay').classList.toggle('hidden',!paused);if(paused){$('message').textContent='Tu camino te espera.';$('start').textContent='Continuar';document.querySelector('h1').innerHTML='Una pequeña<br><em>pausa.</em>'}$('pause').textContent=paused?'▶':'Ⅱ'}
function hold(){cancelCountdown();state.setDuck(false);if(state.mode==='running'&&!paused)pause()}
const body=new (touchMode?NoCameraControls:BodyControls)({hold,canConfirm(){return !countdown&&(state.mode!=='running'||paused)},confirm:start,duck(v){if(!paused&&!countdown&&state.mode==='running'){state.setDuck(v);if(state.duck)character.play('duck',true)}else state.setDuck(false)},jump(){if(state.mode==='running'&&!paused&&!countdown&&state.jump()){character.play('jump',true);audio.jump()}},modeChanged(mode){state.setControlMode(mode);$('message').textContent=mode==='body'?'Activa tu cámara, encuadra el cuerpo y calibra de pie.':'Espacio para saltar. Flecha abajo o S para agacharte.';}});
new KeyboardControls({jump(){if(body.mode==='body')return;if(state.mode==='ready'||state.mode==='over')start();else if(!paused&&state.jump()){character.play('jump');audio.jump()}},roll(){if(body.mode==='keyboard'&&!paused&&state.roll()){character.play('duck')}},duck(v){if(body.mode==='keyboard'&&!paused)state.setDuck(v)},pause(){if(paused)start();else pause()},start,blur:hold});
$('start').onclick=start;$('pause').onclick=()=>{if(paused)start();else pause()};$('settings').onclick=()=>{hold();$('overlay').classList.remove('hidden')};
document.addEventListener('visibilitychange',()=>{if(document.hidden)hold()});
Promise.all([loadCharacter(scene),loadWorldModels(),audioReady]).then(([c,models])=>{world=createWorld(scene,models);character=c;state.bodyRollDuration=c.actions.duck.getClip().duration;c.pivot.position.set(PLAYER_X,0,0);$('start').disabled=false;$('start').textContent='Comenzar aventura →'}).catch(e=>{console.error(e);$('message').textContent='No se pudieron cargar los modelos del juego. Recarga la página o revisa la consola.';$('start').textContent='Error de carga'});
// Development-only counters exposed on the canvas for repeatable browser QA.
const renderStats=import.meta.env.DEV?{frames:0,start:performance.now()}:null;
const clock=new T.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(paused){renderer.render(scene,camera);return}const before=state.mode;
 // Fixed substeps keep physics and collisions consistent across refresh rates.
 let remaining=dt;while(remaining>0){const step=Math.min(remaining,1/120);state.update(step);remaining-=step}
 world?.update(dt,state.mode==='running'?state.speed:0);
 if(state.duck&&!lastDuck&&state.mode==='running')audio.roll();lastDuck=state.duck;
 for(const obstacle of state.obstacles){
  let visual=visuals.get(obstacle.id);
  if(!visual){
   visual=world.obstacle(obstacle.type);
   scene.add(visual.model);visuals.set(obstacle.id,visual);
  }
  visual.model.position.set(obstacle.x,obstacle.type==='dragon'?1.22:0,0);
  visual.update?.(dt);
 }
 for(const [id,{model}] of visuals){
  if(!state.obstacles.some(obstacle=>obstacle.id===id)){scene.remove(model);visuals.delete(id)}
 }
 const crashed=before==='running'&&state.mode==='over';
 if(character){
  const position=character.pivot.position;
  position.y=state.y;
  if(crashed){
   audio.hit();
   character.play('death');
   dust.impact(position.x+.46,position.y+.54);
  }
  if(state.mode==='over'){
   const progress=Math.min(1,state.hitTime/.55);
   position.x=PLAYER_X-1.28*(1-(1-progress)**3);
   position.y=state.y*(1-progress)**2+.22*Math.sin(Math.PI*progress);
  }else if(state.mode==='running'&&state.y===0&&state.vy<=0){
   character.play(state.duck?'duck':'run',state.controlMode==='body');
  }
  character.update(dt,state.speed,state.controlMode==='body');
 }
 dust.update(dt,state.mode==='running'&&state.y===0&&state.vy<=0,PLAYER_X,state.speed);
 audio.update(dt,{running:state.mode==='running',grounded:state.y===0&&state.vy<=0,duck:state.duck,speed:state.speed});
 if(crashed){best=Math.max(best,Math.floor(state.distance));try{localStorage.setItem('wakalito-best',String(best))}catch{}$('best').textContent=String(best).padStart(5,'0')}
 if(state.mode==='over'){state.hitTime+=dt;if(state.hitTime>1.15&&!gameOverShown){gameOverShown=true;$('overlay').classList.remove('hidden');document.querySelector('h1').innerHTML='Vuelve al<br><em>camino.</em>';$('message').textContent=`Recorriste ${Math.floor(state.distance)} metros. Cada intento abre un nuevo camino.`;$('start').textContent='Volver a correr →'}}
 $('score').textContent=String(Math.floor(state.distance)).padStart(5,'0');$('speed').textContent=(state.speed/7).toFixed(1)+'×';renderer.render(scene,camera);
 if(renderStats){renderStats.frames++;const elapsed=performance.now()-renderStats.start;if(elapsed>=1000){const canvas=$('world');canvas.dataset.playerY=state.y.toFixed(3);canvas.dataset.duck=String(state.duck);canvas.dataset.mode=state.mode;canvas.dataset.audioState=audio.context?.state||'not-started';canvas.dataset.fps=(renderStats.frames*1000/elapsed).toFixed(1);canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);renderStats.frames=0;renderStats.start=performance.now()}}
}frame();













