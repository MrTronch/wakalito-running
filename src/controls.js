// Input adapter: a future MediaPipe adapter can call the same actions.
export class KeyboardControls {
 constructor(actions){this.actions=actions;this.held=new Set();window.addEventListener('keydown',e=>{if(e.target.closest?.('input,select,textarea')||(['Space','Enter'].includes(e.code)&&e.target.closest?.('button')))return;if(['Space','ArrowUp','ArrowDown','KeyS','KeyP','Enter'].includes(e.code)){e.preventDefault();if(e.repeat)return;this.held.add(e.code);if(['Space','ArrowUp'].includes(e.code))actions.jump();if(['ArrowDown','KeyS'].includes(e.code))actions.duck(true);if(e.code==='KeyP')actions.pause();if(e.code==='Enter')actions.start()}});window.addEventListener('keyup',e=>{this.held.delete(e.code);if(['ArrowDown','KeyS'].includes(e.code))actions.duck(this.held.has('ArrowDown')||this.held.has('KeyS'))});window.addEventListener('blur',()=>{this.held.clear();actions.duck(false);actions.blur()});this.bind('jump',()=>actions.jump());this.bind('duck',()=>actions.duck(true),()=>actions.duck(false))}
 bind(id,down,up=()=>{}){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);if(id==='duck'&&this.actions.roll&&document.documentElement.classList.contains('touch-game'))this.actions.roll();else down()});el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
}


