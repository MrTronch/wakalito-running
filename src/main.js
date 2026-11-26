import './style.css';
import * as T from 'three';
import {RunnerState,PLAYER_X} from './engine.js';
import {KeyboardControls} from './controls.js';
import {SwipeControls} from './gestures.js';
import {ScoreRecords} from './score.js';
import {PowerHUD} from './power-hud.js';
import {loadCoinModel,createPowerVisuals,createCoinEnvironment} from './power-visuals.js';
import {BodyControls} from '#body-controls';
import {BodyControls as NoCameraControls} from './no-camera-controls.js';
import {RestartGuard} from './restart-guard.js';
import {GameAudio} from './audio.js';
import {createWorld} from './world.js';
import {loadWorldModels} from './world-models.js';
import {loadCharacter} from './character.js';
import {loadNazca,createNazca} from './night.js';
import {addSunset} from './sunset.js';
import {createMenuCharacter} from './menu-character.js';
import {createDust} from './dust.js';
import {reserveMobileJumpSpace} from './mobile-framing.js';
// Local QA fixture only: the production bundle never grants extra coins.
const qaMode=import.meta.env.DEV?new URLSearchParams(location.search).get('qa'):null;
const qaRage=qaMode==='rage',qaNight=qaMode==='night'||qaMode==='dusk';
const $=id=>document.getElementById(id),state=new RunnerState(),records=new ScoreRecords(qaRage||qaNight?{getItem(){return null},setItem(){}}:undefined),powerHUD=new PowerHUD(records);let best=records.distance;$('best').textContent=String(best).padStart(5,'0');
const mobileLayout=()=>innerWidth<=700||(innerWidth<=1024&&matchMedia('(pointer:coarse)').matches);
let touchMode=mobileLayout();
document.documentElement.classList.toggle('touch-game',touchMode);
if(touchMode){$('mode-body')?.setAttribute('hidden','');document.querySelector('.mode-picker')?.setAttribute('hidden','');$('settings').hidden=true;document.querySelector('.hint').textContent='Swipe up · Saltar / Swipe down · Rodar'}
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
 document.querySelector('.gesture-guide').hidden=!touchMode;
 document.querySelector('.hint').textContent=touchMode?'Swipe up · Saltar / Swipe down · Rodar':'ESPACIO / ↑ saltar · ↓ / S agacharse';
 renderer.setSize(innerWidth,innerHeight);
 camera.aspect=innerWidth/innerHeight;
 const depth=Math.max(8.5,(touchMode&&camera.aspect<1?(5.3/1.05):2.02)/(Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect));
 const x=PLAYER_X+(touchMode&&camera.aspect<1?.50:.36)*depth*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect;
 camera.position.set(x,touchMode&&camera.aspect<1?3.5:2.65,depth);
 camera.lookAt(x,touchMode&&camera.aspect<1?2.37:1.52,0);
 camera.clearViewOffset();
 camera.updateProjectionMatrix();
 if(touchMode&&camera.aspect<1){const hudBottom=document.querySelector('.power-hud').getBoundingClientRect().bottom;reserveMobileJumpSpace(camera,innerWidth,innerHeight,hudBottom)}
 atmosphere.setMobile(touchMode&&camera.aspect<1);
}
resize();window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);document.fonts.ready.then(resize);
const ambient=new T.HemisphereLight(0xffded9,0x76604e,1.25);scene.add(ambient);const sun=new T.DirectionalLight(0xffb16b,3.4);sun.position.set(14,8,-15);sun.target.position.set(-4,.8,0);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(touchMode?1024:2048,touchMode?1024:2048);Object.assign(sun.shadow.camera,{left:-21,right:25,top:19,bottom:-19,near:1,far:75});sun.shadow.normalBias=.012;sun.shadow.bias=-.00012;sun.shadow.camera.updateProjectionMatrix();
 atmosphere.setMobile(touchMode&&camera.aspect<1);scene.add(sun);const characterFill=new T.DirectionalLight(0xffecd9,1.75);characterFill.position.set(-10,4.2,6);scene.add(characterFill);
const restartGuard=new RestartGuard();
const visuals=new Map();let world,character,menuCharacter,powerVisuals,nazca,lastDuck=false,paused=false,gameOverShown=false;
let countdown=null;
function cancelCountdown(){if(countdown)clearInterval(countdown);countdown=null;$('countdown').hidden=true}
function start(){
 if(!character||countdown||(state.mode==='over'&&!restartGuard.ready))return;
 if(!body.ready){$('message').textContent='Activa la cámara, calibra de pie y vuelve al encuadre antes de comenzar.';return}
 if(body.mode==='body'){
  let count=3;$('countdown').textContent=count;$('countdown').hidden=false;
  countdown=setInterval(()=>{if(!body.ready){cancelCountdown();$('message').textContent='Vuelve al encuadre y pulsa Comenzar.';return}count--;if(count>0)$('countdown').textContent=count;else{cancelCountdown();beginRun()}},1000);
 }else beginRun();
}
function beginRun(){if(!character)return;restartGuard.reset();audio.unlock();if(paused){pause();return}if(state.mode==='running')return;for(const {model} of visuals.values())scene.remove(model);visuals.clear();dust.clear();powerVisuals?.clear();audio.reset();audio.setRage(false);camera.zoom=1;camera.updateProjectionMatrix();state.start(touchMode?'touch':body.mode);if(qaRage){state.collectedCoins=99;state.coinPoints=990;state.rage.meter=99}if(qaNight){state.distance=qaMode==='dusk'?900:1000;state.untilSpawn=1e9}nazca?.reset();if(qaNight&&nazca)nazca.schedule.wait=2;gameOverShown=false;character.pivot.position.set(PLAYER_X,0,0);character.play('run');$('overlay').classList.remove('intro');$('overlay').classList.add('hidden')}
function pause(){if(state.mode!=='running')return;if(paused&&!body.ready){$('message').textContent='Vuelve al encuadre o cambia a teclado para continuar.';return}cancelCountdown();paused=!paused;document.documentElement.classList.toggle('game-paused',paused);audio.setRunning(!paused);$('overlay').classList.toggle('hidden',!paused);if(paused){$('overlay').classList.remove('intro');$('message').textContent='Tu camino te espera.';$('start').textContent='Continuar';document.querySelector('h1').innerHTML='Una pequeña<br><em>pausa.</em>'}$('pause').textContent=paused?'▶':'Ⅱ'}
function hold(){cancelCountdown();state.setDuck(false);if(state.mode==='running'&&!paused)pause()}
const body=new (touchMode?NoCameraControls:BodyControls)({hold,canConfirm(){return !countdown&&(state.mode!=='running'||paused)},confirm:start,duck(v){if(!paused&&!countdown&&state.mode==='running'){state.setDuck(v);if(state.duck)character.play('duck',true)}else state.setDuck(false)},jump(){if(state.mode==='running'&&!paused&&!countdown&&state.jump()){character.play('jump',true);audio.jump()}},modeChanged(mode){state.setControlMode(mode);$('message').textContent=mode==='body'?'Activa tu cámara, encuadra el cuerpo y calibra de pie.':'Espacio para saltar. Flecha abajo o S para agacharte.';}});
const inputActions={jump(){if(body.mode==='body')return;if(state.mode==='ready'||state.mode==='over')start();else if(!paused&&state.jump()){character.play('jump');audio.jump()}},roll(){if(body.mode==='keyboard'&&!paused&&state.roll()){character.play('duck')}},duck(v){if(body.mode==='keyboard'&&!paused)state.setDuck(v)},pause(){if(paused)start();else pause()},start,blur:hold};
new KeyboardControls(inputActions);
new SwipeControls($('world'),{jump:inputActions.jump,roll:inputActions.roll},{enabled:()=>touchMode&&state.mode==='running'&&!paused&&!countdown});
$('start').onclick=start;$('pause').onclick=()=>{if(paused)start();else pause()};$('settings').onclick=()=>{hold();$('overlay').classList.remove('hidden')};
document.addEventListener('visibilitychange',()=>{if(document.hidden)hold()});
const coinEnvironment=createCoinEnvironment(renderer);
Promise.all([loadCharacter(scene),loadWorldModels(),audioReady,loadCoinModel("coin.glb",coinEnvironment),loadCoinModel("coinx5.glb",coinEnvironment),loadNazca()]).then(([c,models,_,coinTemplate,bonusTemplate,nazcaAsset])=>{powerVisuals=createPowerVisuals(scene,coinTemplate,bonusTemplate);nazca=createNazca(scene,nazcaAsset);world=createWorld(scene,models);character=c;menuCharacter=createMenuCharacter(c,$('menu-character'));state.bodyRollDuration=c.actions.duck.getClip().duration;c.pivot.position.set(PLAYER_X,0,0);$('start').disabled=false;$('start').textContent='Comenzar aventura →'}).catch(e=>{console.error(e);$('message').textContent='No se pudieron cargar los modelos del juego. Recarga la página o revisa la consola.';$('start').textContent='Error de carga'});
// Development-only counters exposed on the canvas for repeatable browser QA.
const renderStats=import.meta.env.DEV?{frames:0,start:performance.now()}:null;
const clock=new T.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(paused){renderer.render(scene,camera);return}const before=state.mode,distanceBefore=state.distance;
 // Fixed substeps keep physics and collisions consistent across refresh rates.
 let remaining=dt;while(remaining>0){const step=Math.min(remaining,1/120);state.update(step);remaining-=step}
 world?.update(dt,(state.distance-distanceBefore)/Math.max(dt,.000001));
 for(const event of state.drainEvents()){
  if(event.type==='coin'){powerVisuals?.pickup(event.coin);audio.coin(event.coin.value)}
  if(event.type==='rage-end')audio.endRage();
  if(event.type==='rage-start'){powerVisuals?.activate(PLAYER_X,state.y);audio.transform();$('rage-flash').classList.remove('active');void $('rage-flash').offsetWidth;$('rage-flash').classList.add('active')}
  if(event.type==='destroy'){const o=event.obstacle,visual=visuals.get(o.id)??world.obstacle(o.type);visual.model.position.set(o.x,o.type==='dragon'?1.22:0,0);visuals.delete(o.id);if(o.type!=='dragon')scene.remove(visual.model);powerVisuals?.destroy(o,visual);dust.impact(o.x,.5);audio.impact(o.type)}
 }
 const night=atmosphere.update(state.mode==='running'?dt:0,state.distance);ambient.intensity=T.MathUtils.lerp(1.25,.55,night);ambient.color.setRGB(1-.55*night,.73-.10*night,.69+.30*night);ambient.groundColor.setRGB(.18-.15*night,.117-.067*night,.076+.014*night);sun.intensity=T.MathUtils.lerp(3.4,.5,night);sun.color.setRGB(1-.4*night,.435+.20*night,.145+.85*night);characterFill.intensity=T.MathUtils.lerp(1.75,1.25,night);document.documentElement.classList.toggle('night-scene',night>.5);nazca?.update(state.mode==='running'?dt:0,state.distance,camera);
 audio.setRage(state.rage.active);
 camera.zoom=T.MathUtils.damp(camera.zoom,state.rage.active?.975:1,5,dt);camera.updateProjectionMatrix();
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
  character.pivot.visible=state.mode!=='ready';
  if(state.mode==='ready')menuCharacter?.update(dt);
  const position=character.pivot.position;
  position.y=state.y;
  if(crashed){
   restartGuard.lock();$('start').disabled=true;
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
 dust.update(dt,state.mode==='running'&&state.y===0&&state.vy<=0,PLAYER_X,state.speed,state.rage.active);
 audio.update(dt,{running:state.mode==='running',grounded:state.y===0&&state.vy<=0,duck:state.duck,speed:state.speed});
 if(crashed){records.save(state.distance,state.collectedCoins,state.coinPoints);best=records.distance;$('best').textContent=String(best).padStart(5,'0')}
 if(state.mode==='over'){state.hitTime+=dt;if(state.hitTime>1.15&&!gameOverShown){gameOverShown=true;restartGuard.show();$('overlay').classList.remove('hidden');document.querySelector('h1').innerHTML='Vuelve al<br><em>camino.</em>';$('message').textContent=powerHUD.summary(state);$('start').textContent='Volver a correr →'}if(gameOverShown)$('start').disabled=!restartGuard.ready}
 powerVisuals?.update(dt,state,character?.pivot.position??new T.Vector3(PLAYER_X,0,0));powerHUD.update(state);
 $('score').textContent=String(Math.floor(state.distance)).padStart(5,'0');$('speed').textContent=(state.speed/7).toFixed(1)+'×';renderer.render(scene,camera);
 if(renderStats){renderStats.frames++;const elapsed=performance.now()-renderStats.start;if(elapsed>=1000){const canvas=$('world');canvas.dataset.playerY=state.y.toFixed(3);canvas.dataset.duck=String(state.duck);canvas.dataset.mode=state.mode;canvas.dataset.audioState=audio.context?.state||'not-started';canvas.dataset.fps=(renderStats.frames*1000/elapsed).toFixed(1);canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);renderStats.frames=0;renderStats.start=performance.now()}}
}frame();















