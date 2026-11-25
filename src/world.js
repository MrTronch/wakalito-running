import * as T from 'three';
import {createSurfaceTextures} from './surface-textures.js';
import {pathGeometry,PATH_TILE_LENGTH} from './path.js';
import {createBird} from './birds.js';
// Broad, overlapping ridges built from heightfields, with rounded summits and eroded folds.
export function ridgeGeometry(seed=1){
 const nx=80,nz=30,width=112,depth=28,g=new T.PlaneGeometry(width,depth,nx,nz);g.rotateX(-Math.PI/2);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),u=(x+width/2)/width*Math.PI*2;let height=0;
  for(let k=0;k<8;k++){
   const center=-56+k*14+Math.sin(k*3+seed)*3,spread=8+2*Math.sin(k+seed),peak=6+5*(.5+.5*Math.sin(k*2.7+seed));
   const dx=((x-center+width*1.5)%width)-width/2;
   const shift=Math.sin(u+seed)*3;
   height+=peak*Math.exp(-((dx/spread)**2)-((z+shift)/10)**2);
  }
  const edge=Math.max(0,1-(z/14)**2)**.75;
  const folds=(Math.sin(u*9+z*.26+seed)+.45*Math.sin(u*21-z*.45+seed))*.65;
  p.setY(i,Math.max(0,(height+folds)*edge));
 }
 g.computeVertexNormals();
 // Shared border positions, colors and normals make the recycled tiles a continuous surface.
 const normals=g.attributes.normal;
 for(let row=0;row<=nz;row++){const a=row*(nx+1),b=a+nx;const n=new T.Vector3().fromBufferAttribute(normals,a).add(new T.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z)}
 const colors=[],low=new T.Color(0xa39d86),high=new T.Color(0xd5cec0);
 for(let i=0;i<p.count;i++){const u=(p.getX(i)+56)/112*Math.PI*2,c=low.clone().lerp(high,T.MathUtils.clamp(p.getY(i)/13,0,1));c.multiplyScalar(1+.045*Math.sin(u*31+p.getZ(i)));colors.push(c.r,c.g,c.b)}
 g.setAttribute('color',new T.Float32BufferAttribute(colors,3));return g;
}
export function createWorld(scene,models){
 const surfaces=createSurfaceTextures();
 const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:1,...extra});
 const mats={sand:material(0x648348),path:material(0xffffff,{...surfaces.path,vertexColors:true,transparent:true,depthWrite:false,normalScale:new T.Vector2(.35,.35)})};
 const box=new T.BoxGeometry(1,1,1);
 function mesh(g,m,x,y,z,sx=1,sy=1,sz=1,parent=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 mesh(box,mats.sand,0,-.32,0,250,.58,160);
 const trail=pathGeometry(),pathTiles=[];
 let pathTravel=0;
 for(let i=-3;i<=3;i++){
  const piece=mesh(trail,mats.path,i*PATH_TILE_LENGTH,0,0);
  piece.castShadow=false;pathTiles.push(piece);
 }
 // Fine mineral variation gives terrain texture without external assets.
 const terrain=new T.PlaneGeometry(240,110,180,80);terrain.rotateX(-Math.PI/2);const positions=terrain.attributes.position,colors=[];
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);const verge=T.MathUtils.smoothstep(Math.abs(z),2.12,2.7);positions.setY(i,T.MathUtils.lerp(-.018,.025+.008*Math.sin(x*1.8+z*2.1)*Math.sin(z*3-x*.75),verge));const c=new T.Color(0x688a43);c.multiplyScalar(.9+.15*(.5+.5*Math.sin(x*4.3+z*9)*Math.cos(z*4.1-x)));colors.push(c.r,c.g,c.b)}terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const ground=mesh(terrain,material(0xffffff,{...surfaces.grass,normalScale:new T.Vector2(.22,.22)}),0,0,0);ground.castShadow=false;
 const layers=[];
 for(const config of [{z:-64,y:-1.5,scale:1.65,speed:.065,color:0xa4b7b0,seed:3},{z:-43,y:-1,scale:1.22,speed:.15,color:0x869487,seed:9},{z:-25,y:-.5,scale:.85,speed:.28,color:0x9b9c7b,seed:16}]){
  const geometry=ridgeGeometry(config.seed),mat=material(config.color,{vertexColors:true});const span=112*config.scale;
  for(let tile=-1;tile<=1;tile++){const r=mesh(geometry,mat,tile*span,config.y,config.z,config.scale,config.scale*.62,config.scale);r.castShadow=false;r.userData={speed:config.speed,span};layers.push(r)}
 }
 const clavas=[];
 const moving=[];function register(g,speed){scene.add(g);g.userData.speed=speed;moving.push(g);return g}
 function placeModel(template,parent,x,z,scale,yaw,shadow=true){
  const model=template.clone();
  model.position.set(x,0,z);model.scale.multiplyScalar(scale);model.rotation.y=yaw;
  model.traverse(object=>{if(object.isMesh){object.castShadow=shadow;object.receiveShadow=true}});
  parent.add(model);
  return model;
 }
 function cactus(parent,x,z,height){placeModel(models.cactus,parent,x,z,height,Math.random()*Math.PI*2)}
 function grass(parent,x,z,scale){placeModel(models.grass,parent,x,z,.5*scale,Math.random()*Math.PI*2,false)}
 // Sparse landmark clusters behind the path; foreground stays low to keep obstacles readable.
 for(let i=0;i<22;i++){
  const g=register(new T.Group(),1);g.position.set(i*6.75-45,0,-5.7-Math.random()*4.5);
  const yaw=(Math.random()-.5)*.65;
  if(i%5===0)placeModel(models.chakana,g,0,0,2.0+Math.random()*.7,yaw);
  else if(i%5===1)cactus(g,0,0,1.3+Math.random()*.9);
  else if(i%5===2){placeModel(models.ruins,g,0,0,2.65+(Math.random()-.5)*.2,(Math.random()-.5)*.28);placeModel(models.mushroom,g,1.1,.25,.6+Math.random()*.35,yaw)}
  else if(i%5===3)placeModel(models.mushroom,g,0,0,.75+Math.random()*.6,yaw);
  else {placeModel(models.rock,g,0,0,.4+Math.random()*.35,i);grass(g,.65,.2,.8)}
 }
 // Three animated background landmarks, always outside the playable path.
 for(let i=0;i<3;i++){const clava=models.createClava(),g=register(new T.Group(),1);g.position.set(i*49.5+10.5,0,-9.5-i%2*2);clava.model.scale.multiplyScalar(2.4+i*.2);clava.model.rotation.y=(i-1)*.15;clava.model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});g.add(clava.model);clava.parent=g;clavas.push(clava)}
 for(let i=0;i<55;i++){
  const g=register(new T.Group(),1);g.position.set(Math.random()*148.5-45,0,(i%2?1:-1)*(2.8+Math.random()*3.5));
  grass(g,0,0,.6+Math.random()*.6);
  if(i%6===0)placeModel(models.rock,g,.3,.1,.22+Math.random()*.2,i);
  if(i%11===0)placeModel(models.mushroom,g,.4,.15,.35+Math.random()*.3,(Math.random()-.5)*.9);
 }
 for(let i=0;i<10;i++){
  const g=register(new T.Group(),1);g.position.set(i*14.85-45,0,7.5+Math.random()*2);
  grass(g,0,0,1.5);grass(g,.5,.2,1.2);
  if(i%3===0)placeModel(models.mushroom,g,.6,0,.4+Math.random()*.3,(Math.random()-.5)*.7);
 }
 // Recycled strips share one instance batch per grass material.
 const grassParts=[];
 models.grass.updateMatrixWorld(true);
 models.grass.traverse(object=>{if(object.isMesh)grassParts.push(object)});
 const grassCount=560,dummy=new T.Object3D(),matrix=new T.Matrix4();
 for(let tile=0;tile<7;tile++){
  const strip=register(new T.Group(),1);
  strip.position.x=tile*22-45;strip.userData.span=154;
  const batches=grassParts.map(part=>{
   const batch=new T.InstancedMesh(part.geometry,part.material,grassCount);
   batch.receiveShadow=true;strip.add(batch);
   return batch;
  });
  for(let i=0;i<grassCount;i++){
   const z=(i%2?1:-1)*(1.9+Math.random()*11);
   dummy.position.set(Math.random()*22,0,z);
   dummy.rotation.y=Math.random()*Math.PI*2;
   dummy.scale.setScalar(.14+Math.random()*.24);
   dummy.updateMatrix();
   batches.forEach((batch,j)=>batch.setMatrixAt(i,matrix.multiplyMatrices(dummy.matrix,grassParts[j].matrixWorld)));
  }
 }
 // The imported shrub is dense, so space copies along both verges.
 for(let i=0;i<4;i++){
  const shrub=register(new T.Group(),1);
  shrub.position.set(i*37.125-45,0,(i%2?1:-1)*(2.8+Math.random()*3.6));
  placeModel(models.shrub,shrub,0,0,.55+Math.random()*.3,Math.random()*Math.PI*2,false);
 }
 const skyBirds=[];
 for(let i=0;i<7;i++){
  const bird=createBird({shadow:false,phase:i/7});
  bird.model.position.set(i*17-38,6+Math.random()*3,-17-Math.random()*13);
  bird.model.scale.setScalar(.65+Math.random()*.3);scene.add(bird.model);skyBirds.push(bird);
 }
 function obstacle(type){if(type==='dragon')return models.createDragon();if(type==='cactus'){const model=models.cactus.clone();model.scale.multiplyScalar(1.2);return {model}}return {model:models.rockObstacle.clone()}}
 return {obstacle,update(dt,speed){for(const clava of clavas)if(clava.parent.position.x>-20&&clava.parent.position.x<28)clava.update(dt);surfaces.update(speed*dt);pathTravel=(pathTravel+speed*dt)%PATH_TILE_LENGTH;for(let i=0;i<pathTiles.length;i++)pathTiles[i].position.x=(i-3)*PATH_TILE_LENGTH-pathTravel;for(const r of layers){r.position.x-=speed*dt*r.userData.speed;if(r.position.x<-r.userData.span*1.5)r.position.x+=r.userData.span*3}for(const g of moving){g.position.x-=speed*dt*g.userData.speed;if(g.position.x<-45)g.position.x+=g.userData.span||148.5}for(const bird of skyBirds){const {position}=bird.model;position.x-=dt*(1+speed*.18);if(position.x<-50)position.x=90;bird.update(dt)}}};
}






