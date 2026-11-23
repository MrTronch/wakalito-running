import * as T from 'three';
export const GROUND_TILE_SIZE=4;
export function groundTextureOffset(distance){return ((distance/GROUND_TILE_SIZE)%1+1)%1}
export function createSurfaceTextures(){
 const loader=new T.TextureLoader(),animated=[];
 function pair(name,repeatX,repeatY,scroll=false){const result={};for(const [key,suffix] of [['map','color'],['normalMap','normal']]){const t=loader.load(`${import.meta.env.BASE_URL}texturas/${name}_${suffix}.png`);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeatX,repeatY);t.colorSpace=key==='map'?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=8;if(scroll)animated.push(t);result[key]=t}return result}
 const grass=pair('pasto',60,27.5,true),path=pair('tierra_roca',9,1);
 let distance=0;return {grass,path,update(travel){distance+=travel;for(const t of animated)t.offset.x=groundTextureOffset(distance)}};
}
