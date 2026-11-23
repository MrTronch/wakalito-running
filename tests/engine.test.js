import test from 'node:test';import assert from 'node:assert/strict';import {RunnerState} from '../src/engine.js';
function running(){const s=new RunnerState(()=>.5);s.mode='running';s.untilSpawn=999;return s}
test('salto aterriza sin permitir doble salto',()=>{const s=running();assert.equal(s.jump(),true);s.update(.01);assert.equal(s.jump(),false);let peak=0;for(let i=0;i<150;i++){s.update(1/120);peak=Math.max(peak,s.y)}assert.ok(peak>1.7);assert.equal(s.y,0)});
test('piedra colisiona y detiene puntuación',()=>{const s=running();s.obstacles=[{id:0,x:-4,type:'stone'}];s.update(.01);assert.equal(s.mode,'over');const d=s.distance;s.update(1);assert.equal(s.distance,d)});
test('agacharse permite pasar cabeza de dragón pero no piedra',()=>{for(const type of ['dragon','stone']){const s=running();s.setDuck(true);s.obstacles=[{id:0,x:-4,type}];s.update(.01);assert.equal(s.mode,type==='dragon'?'running':'over')}});
test('saltar permite pasar piedra',()=>{const s=running();s.y=1.2;s.obstacles=[{id:0,x:-4,type:'stone'}];s.update(.01);assert.equal(s.mode,'running')});
test('velocidad limitada y separación procedural deja tiempo de reacción',()=>{const s=running();s.distance=100000;s.untilSpawn=0;s.update(.001);assert.equal(s.speed,15);assert.ok(s.untilSpawn>=15*1.65+2.5);assert.ok(s.obstacles[0].x>27)});
test('simulación equivalente a 30 y 120 Hz con subpasos',()=>{function sim(fps){const s=running();s.jump();for(let f=0;f<fps;f++)for(let i=0;i<120/fps;i++)s.update(1/120);return s}assert.equal(sim(30).distance,sim(120).distance)});

test('modo cuerpo corre un 20 por ciento más lento y conserva separación física',()=>{const a=new RunnerState(()=>.5),b=new RunnerState(()=>.5);a.start('keyboard');b.start('body');a.untilSpawn=b.untilSpawn=0;a.update(1/120);b.update(1/120);assert.ok(Math.abs(b.speed-a.speed*.8)<1e-10);assert.equal(b.untilSpawn,a.untilSpawn);b.distance=a.distance=10000;a.update(1/120);b.update(1/120);assert.equal(a.speed,15);assert.equal(b.speed,12)});
test('cambiar controles conserva partida y actualiza ritmo al reanudar',()=>{const s=running();s.distance=220;s.y=1;s.setControlMode('body');assert.equal(s.speed,6.4);assert.equal(s.distance,220);assert.equal(s.y,1);s.setControlMode('keyboard');assert.equal(s.speed,8)});


test('solo rocas y dragones se generan como obstáculos, nunca aves ambientales',()=>{for(const random of [()=>0,()=>.99]){const s=new RunnerState(random);s.start();s.untilSpawn=0;s.update(.01);assert.equal(s.obstacles[0].type,random()===0?'dragon':'stone')}});

test('salto corporal despega más rápido y permite más tiempo de cruce',()=>{function sample(mode){const s=new RunnerState();s.start(mode);s.untilSpawn=9999;assert.equal(s.jump(),true);let t=0,clear=0,early=0;while(t<2){s.update(1/240);t+=1/240;if(t<.085)early=s.y;if(s.y>.76)clear+=1/240;if(t>.1&&s.y===0)break}return {early,clear,duration:t}}const keyboard=sample('keyboard'),body=sample('body');assert.ok(body.early>keyboard.early);assert.ok(body.clear>keyboard.clear*1.2);assert.ok(body.duration>keyboard.duration*1.2);assert.ok(body.duration<1.15)});

test('trayectoria de teclado mantiene exactamente sus alturas previas',()=>{const s=running();s.jump();for(let n=1;n<=92;n++){s.update(1/120);if(n===24)assert.ok(Math.abs(s.y-1.34)<1e-9);if(n===48)assert.ok(Math.abs(s.y-1.72)<1e-9);if(n===72)assert.ok(Math.abs(s.y-1.14)<1e-9)}assert.equal(s.y,0)});

test('roll corporal termina el clip aunque el usuario se levante rápido',()=>{const s=running();s.setControlMode('body');s.bodyRollDuration=1.2;s.setDuck(true);s.update(.08);s.setDuck(false);assert.equal(s.duck,true);for(let i=0;i<100;i++)s.update(.01);assert.equal(s.duck,true);for(let i=0;i<20;i++)s.update(.01);assert.equal(s.duck,false)});
test('roll de teclado se libera inmediatamente como antes',()=>{const s=running();s.setDuck(true);s.setDuck(false);assert.equal(s.duck,false);assert.equal(s.rollRemaining,0)});
test('salto deliberado corporal puede interrumpir roll sin bloquear control',()=>{const s=running();s.setControlMode('body');s.setDuck(true);assert.equal(s.jump(),true);assert.equal(s.rollRemaining,0);assert.equal(s.duck,false)});
test('roll conservado mantiene protección contra dragón al levantarse',()=>{const s=running();s.setControlMode('body');s.setDuck(true);s.setDuck(false);s.obstacles=[{id:0,x:-4,type:'dragon'}];s.update(.01);assert.equal(s.mode,'running');assert.equal(s.duck,true)});
