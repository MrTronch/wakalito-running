import test from 'node:test';
import assert from 'node:assert/strict';
import {RunnerState} from '../src/engine.js';
import {GameAudio} from '../src/audio.js';
import {BodyControls} from '../src/no-camera-controls.js';

test('un toque móvil termina el roll y no repite ni se corta al soltar',()=>{
 const state=new RunnerState();state.start('touch');state.untilSpawn=999;state.bodyRollDuration=1.2;
 assert.equal(state.roll(),true);assert.equal(state.roll(),false);state.setDuck(false);
 state.update(.15);assert.equal(state.duck,true);assert.equal(state.jump(),false);
 for(let i=0;i<90;i++)state.update(1/120);
 assert.equal(state.duck,false);assert.equal(state.jump(),true);state.update(.01);assert.equal(state.roll(),false);
});
test('roll móvil protege ante dragón, pero no atraviesa las piedras',()=>{
 for(const type of ['dragon','stone']){const state=new RunnerState();state.start('touch');state.roll();state.obstacles=[{id:0,x:-4,type}];state.update(.01);assert.equal(state.mode,type==='dragon'?'running':'over')}
});
test('salto móvil conserva la trayectoria del teclado',()=>{
 const a=new RunnerState(),b=new RunnerState();a.start('keyboard');b.start('touch');a.jump();b.jump();
 for(let i=0;i<110;i++){a.update(1/120);b.update(1/120);assert.equal(a.y,b.y);assert.equal(a.distance,b.distance)}
});
test('pisadas se detienen en el aire, agachado y fuera de partida',()=>{
 const audio=new GameAudio(),events=[];audio.step=landing=>events.push(landing);audio.tone=()=>{};
 const frame={running:true,grounded:true,duck:false,speed:7};
 for(let i=0;i<60;i++)audio.update(1/60,frame);
 assert.ok(events.length>=4&&events.length<=5);
 const before=events.length;audio.jump();for(let i=0;i<60;i++)audio.update(1/60,{...frame,grounded:false});assert.equal(events.length,before);
 audio.update(.01,frame);assert.equal(events.length,before+1);assert.equal(events.at(-1),true);
 for(const patch of [{duck:true},{running:false}]){const count=events.length;for(let i=0;i<60;i++)audio.update(1/60,{...frame,...patch});assert.equal(events.length,count)}
});
test('audio sin soporte ni activación no bloquea el juego',()=>{
 const audio=new GameAudio();assert.equal(audio.context,null);assert.doesNotThrow(()=>{audio.unlock();audio.jump();audio.roll();audio.hit();audio.setEnabled(false);audio.step()});
});
test('adaptador público está listo sin pedir ni enumerar cámaras',()=>{
 const adapter=new BodyControls();assert.equal(adapter.ready,true);assert.equal(adapter.mode,'keyboard');assert.equal(adapter.connect,undefined);
});
test('efectos usan sus WAV y el ambiente conserva posición al pausar',()=>{
 const audio=new GameAudio(),sources=[];
 audio.context={state:'running',currentTime:0,createBufferSource(){const s={connect(){},disconnect(){},start(...args){this.started=args},stop(){this.stopped=true}};sources.push(s);return s},createGain(){return {gain:{value:0},connect(){},disconnect(){}}}};
 audio.master={};audio.buffers={jump:{name:'jump'},roll:{name:'roll'},damage:{name:'damage'},ambience:{duration:32}};
 audio.jump();audio.roll();assert.equal(sources[0].buffer.name,'jump');assert.equal(sources[1].buffer.name,'roll');
 audio.setRunning(true);const music=sources.at(-1);assert.equal(music.loop,true);audio.context.currentTime=7;audio.setRunning(false);assert.equal(music.stopped,true);
 audio.setRunning(true);assert.equal(sources.at(-1).started[1],7);audio.hit();assert.equal(sources.at(-1).buffer.name,'damage');assert.equal(audio.music,null);
});
