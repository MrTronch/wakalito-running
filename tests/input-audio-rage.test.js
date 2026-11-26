import test from 'node:test';
import assert from 'node:assert/strict';
import {SwipeControls} from '../src/gestures.js';
import {GameAudio} from '../src/audio.js';

test('salto baja dos tonos completos y reduce ligeramente su volumen',()=>{const audio=new GameAudio(),events=[];audio.sample=(name,options)=>events.push({name,options});audio.jump();assert.equal(events[0].name,'jump');assert.equal(events[0].options.pitch,2**(-4/12));assert.equal(events[0].options.volume,.65);assert.equal(audio.wasGrounded,false);assert.equal(audio.stepTime,0)});

test('mezcla de monedas reduce la normal, duplica x5 y usa rock sólo para piedra',()=>{const audio=new GameAudio(),events=[];audio.sample=(name,options)=>events.push({name,options});audio.coin();audio.coin(5);audio.impact('stone');audio.tone=()=>events.push({name:'impact-tone'});audio.impact('dragon');assert.equal(events[0].options.volume,.4);assert.equal(events[1].options.volume,1.6);assert.equal(events[1].options.pitch,2**(.5));assert.equal(events[2].name,'rock');assert.equal(events[3].name,'impact-tone')});

test('moneda x5 sube seis semitonos y Begin Rage duplica ganancia sin afectar End',()=>{const audio=new GameAudio(),sources=[],gains=[];audio.context={state:'running',createBufferSource(){const source={playbackRate:{value:1},connect(){},start(){},disconnect(){}};sources.push(source);return source},createGain(){const gain={gain:{value:0},connect(){},disconnect(){}};gains.push(gain);return gain}};audio.master={};audio.buffers={coin:{},beginRage:{},endRage:{}};audio.coin();audio.coin(5);audio.transform();audio.endRage();assert.equal(sources[0].playbackRate.value,1);assert.equal(sources[1].playbackRate.value,2**(6/12));assert.equal(gains[2].gain.value,1.6);assert.equal(gains[3].gain.value,.8)});

test('Rage usa los efectos de entrada y salida sin esperar a que terminen para la música',()=>{const audio=new GameAudio(),effects=[];audio.sample=name=>effects.push(name);audio.transform();audio.endRage();assert.deepEqual(effects,['beginRage','endRage']);assert.equal(audio.rageActive,false)});

test('cada recogida reproduce el WAV coin, también para la moneda por cinco',()=>{
 const audio=new GameAudio(),played=[];audio.sample=name=>played.push(name);audio.coin();audio.coin();assert.deepEqual(played,['coin','coin']);
});

test('el adaptador dispara una vez por gesto y respeta cancelación y pausa',()=>{
 const previous=globalThis.window,handlers={},actions=[];let enabled=true;
 globalThis.window={addEventListener(){}};
 try{
  const surface={addEventListener(name,fn){handlers[name]=fn},setPointerCapture(){}};
  new SwipeControls(surface,{jump:()=>actions.push('jump'),roll:()=>actions.push('roll')},{enabled:()=>enabled});
  const event=(x,y,t,id=1)=>({clientX:x,clientY:y,timeStamp:t,pointerId:id,isPrimary:true,preventDefault(){}});
  handlers.pointerdown(event(100,300,0));handlers.pointermove(event(103,285,10));assert.equal(actions.length,0);
  handlers.pointermove(event(103,260,20));handlers.pointermove(event(104,220,30));handlers.pointerup(event(104,220,40));assert.deepEqual(actions,['jump']);
  handlers.pointerdown(event(100,300,100));handlers.pointerup(event(100,300,110,2));handlers.pointermove(event(100,350,120));handlers.pointerup(event(100,350,130));assert.deepEqual(actions,['jump','roll']);
  handlers.pointerdown(event(100,300,200));handlers.pointercancel();handlers.pointermove(event(100,250,220));assert.equal(actions.length,2);
  enabled=false;handlers.pointerdown(event(100,300,300));handlers.pointerup(event(100,250,320));assert.equal(actions.length,2);
 }finally{globalThis.window=previous}
});

test('Rage cruza música sin reiniciar el ambiente; pausa conserva ambas posiciones',()=>{
 const audio=new GameAudio(),sources=[],fades=[];
 audio.context={state:'running',currentTime:0,createBufferSource(){const s={connect(){},disconnect(){},start(...args){this.started=args},stop(){this.stopped=true}};sources.push(s);return s},createGain(){return {gain:{value:0,setTargetAtTime(value,time){fades.push({value,time})}},connect(){},disconnect(){}}}};
 audio.master={};audio.buffers={ambience:{duration:32},rage:{duration:21.333}};
 audio.setRunning(true);const normal=audio.music,rage=audio.rageMusic;
 audio.setRage(true);assert.equal(audio.music,normal);assert.notEqual(audio.rageMusic,rage);assert.equal(sources.length,3);assert.equal(audio.rageMusic.started[1],0);assert.deepEqual(fades.map(f=>f.value),[.025,.65]);
 audio.setRage(true);assert.equal(fades.length,2);audio.setRage(false);assert.deepEqual(fades.slice(-2).map(f=>f.value),[.9,0]);assert.equal(normal.stopped,undefined);
 audio.context.currentTime=8;audio.setRunning(false);assert.ok(normal.stopped&&rage.stopped);audio.context.currentTime=18;audio.setRunning(true);assert.equal(audio.music.started[1],8);assert.equal(audio.rageMusic.started[1],8);assert.equal(sources.length,5);
});

test('roll usa el doble de ganancia sin cambiar su tono',()=>{const a=new GameAudio(),events=[];a.sample=(name,options)=>events.push({name,options});a.roll();assert.equal(events[0].name,'roll');assert.equal(events[0].options.volume,1.6);assert.equal(events[0].options.pitch,undefined)});
