import * as T from 'three';

export const PATH_TILE_LENGTH=36;

export function pathGeometry(){
 const rows=[-1,-.86,-.72,0,.72,.86,1];
 const opacity=[0,.48,1,1,1,.48,0];
 const segments=144,positions=[],colors=[],uv=[],indices=[];
 for(let i=0;i<=segments;i++){
  const x=i/segments*PATH_TILE_LENGTH;
  const angle=i/segments*2*Math.PI;
  const center=.16*Math.sin(3*angle)+.055*Math.sin(11*angle);
  const left=1.55+.22*Math.sin(5*angle+.7)+.09*Math.sin(17*angle);
  const right=1.63+.24*Math.sin(4*angle+1)+.11*Math.sin(13*angle);
  for(let j=0;j<rows.length;j++){
   const row=rows[j];
   const z=center+row*(row<0?left:right);
   positions.push(x,.003,z);
   colors.push(1,1,1,opacity[j]);
   uv.push(x/PATH_TILE_LENGTH,.5-z/4);
   if(i===segments||j===rows.length-1)continue;
   const a=i*rows.length+j,b=a+rows.length;
   indices.push(a,a+1,b,a+1,b+1,b);
  }
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 geometry.setAttribute('color',new T.Float32BufferAttribute(colors,4));
 geometry.setIndex(indices);
 geometry.computeVertexNormals();
 return geometry;
}
