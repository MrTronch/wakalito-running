import * as T from 'three';
// V silhouettes in the camera-facing XY plane, with a gentle, always-open wing beat.
const material=new T.MeshBasicMaterial({color:0x292b29,side:T.DoubleSide});
const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.66,.28,0,-.58,.18,0,-.12,-.035,0],3));geometry.setIndex([0,1,2,0,2,3]);
export function createBird({phase=0}={}){
 const model=new T.Group();model.name='Ave ambiental en V';model.userData.kind='bird';
 const wings=[];for(const side of [1,-1]){const wing=new T.Mesh(geometry,material);wing.scale.x=side;model.add(wing);wings.push(wing)}
 let time=phase*Math.PI*2;
 const update=dt=>{time+=dt*2.6;const opening=.88+.18*Math.sin(time);for(const wing of wings)wing.scale.y=opening};update(0);
 return {model,update};
}
