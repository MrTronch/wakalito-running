// User-supplied effects and ambience; original synthesized footsteps.
export const STEP_PITCH=2**(-4/12);
export const AUDIO_FILES={jump:'jump.wav',roll:'roll.wav',damage:'damage.wav',ambience:'loop wakalito running.wav'};
export class GameAudio {
 constructor(){this.enabled=true;this.context=null;this.stepTime=0;this.wasGrounded=false;this.buffers={};this.running=false;this.musicOffset=0}
 load(base){this.loading=Promise.all(Object.entries(AUDIO_FILES).map(async([name,file])=>{const response=await fetch(base+encodeURIComponent(file));if(!response.ok)throw new Error(`Audio: ${file}`);return [name,await response.arrayBuffer()]})).then(entries=>this.bytes=entries);return this.loading}
 prepare(){if(this.decoding||!this.loading||!this.context)return;this.decoding=this.loading.then(entries=>Promise.all(entries.map(async([name,data])=>{this.buffers[name]=await this.context.decodeAudioData(data.slice(0))}))).then(()=>this.setRunning(this.running)).catch(error=>console.error('No se pudieron decodificar los sonidos',error))}
 unlock(){
  if(!this.enabled)return;
  try{const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;
   if(!this.context){this.context=new Context();this.master=this.context.createGain();this.master.gain.value=.45;this.master.connect(this.context.destination);const count=Math.floor(this.context.sampleRate*.13);this.noise=this.context.createBuffer(1,count,this.context.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<count;i++)data[i]=(Math.random()*2-1)*(1-i/count)}
   if(this.context.state!=='running')this.context.resume().catch(()=>{});this.prepare();
  }catch{/* Audio is optional; blocked audio must never interrupt a run. */}
 }
 setEnabled(enabled){this.enabled=enabled;if(this.master)this.master.gain.setValueAtTime(enabled?.45:0,this.context.currentTime);if(enabled)this.unlock()}
 tone(start,end,duration,volume,type='sine'){
  const c=this.context;if(!this.enabled||c?.state!=='running')return;
  const t=c.currentTime,osc=c.createOscillator(),gain=c.createGain();osc.type=type;osc.frequency.setValueAtTime(start,t);osc.frequency.exponentialRampToValueAtTime(end,t+duration);gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain);gain.connect(this.master);osc.start(t);osc.stop(t+duration);osc.onended=()=>{osc.disconnect();gain.disconnect()};
 }
 step(landing=false){
  const c=this.context;if(!this.enabled||c?.state!=='running')return;
  this.tone((landing?140:180+Math.random()*30)*STEP_PITCH,65*STEP_PITCH,.075,landing?.32:.18);
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=this.noise;source.playbackRate.value=STEP_PITCH;filter.type='lowpass';filter.frequency.value=(landing?1400:950)*STEP_PITCH;gain.gain.setValueAtTime(landing?.16:.09,c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+.09);source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
 }
 sample(name){const c=this.context;if(!this.enabled||c?.state!=='running'||!this.buffers[name])return;const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.buffers[name];gain.gain.value=.8;source.connect(gain);gain.connect(this.master);source.start();source.onended=()=>{source.disconnect();gain.disconnect()}}
 setRunning(running){this.running=running;const c=this.context;if(!running&&this.music){this.musicOffset=(this.musicOffset+c.currentTime-this.musicStarted)%this.buffers.ambience.duration;this.music.stop();this.music=null}if(running&&!this.music&&this.buffers.ambience&&c?.state==='running'){const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.buffers.ambience;source.loop=true;gain.gain.value=.65;source.connect(gain);gain.connect(this.master);source.start(0,this.musicOffset);this.musicStarted=c.currentTime;this.music=source;source.onended=()=>{source.disconnect();gain.disconnect()}}}
 jump(){this.sample('jump');this.wasGrounded=false;this.stepTime=0}
 roll(){this.sample('roll')}
 hit(){this.sample('damage');this.setRunning(false);this.reset()}
 reset(){this.stepTime=0;this.wasGrounded=false}
 update(dt,{running,grounded,duck,speed}){
  this.setRunning(running);
  if(!running){this.reset();return}
  if(grounded&&!duck){if(!this.wasGrounded)this.step(true);this.stepTime+=dt;const interval=.29*7/Math.max(7,speed);if(this.stepTime>=interval){this.stepTime%=interval;this.step()}}
  else this.stepTime=0;
  this.wasGrounded=grounded;
 }
}
