import * as T from 'three';
export function applyCharacterMaterials(gltf,textures={}){
 gltf.scene.traverse(o=>{if(!o.isMesh)return;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){
 if(o.name==='lunas'||/luna/i.test(m.name)){m.color.set(0x030405);m.map=null;m.metalness=.12;m.roughness=.28;m.transparent=false;m.opacity=1;if('transmission' in m)m.transmission=0;}
 else if(/PIEL/i.test(m.name)){if(textures.skin)m.map=textures.skin;if(textures.normal)m.normalMap=textures.normal;m.normalScale.set(1.3,1.3)}
 else if(/METAL/i.test(m.name)){if(textures.metal)m.map=textures.metal;}
 else if(/Iris/i.test(m.name)){if(textures.eye)m.map=textures.eye;}
 m.needsUpdate=true;
 }});
}
export async function loadCharacterTextures(base){const loader=new T.TextureLoader();const names={skin:'piel.png',normal:'normal map huaco baja.png',metal:'metal texture.png',eye:'ojo.png'};const result={};await Promise.all(Object.entries(names).map(async([key,file])=>{const t=await loader.loadAsync(base+encodeURIComponent(file));t.flipY=false;t.colorSpace=key==='normal'?T.NoColorSpace:T.SRGBColorSpace;t.anisotropy=4;result[key]=t}));return result}
