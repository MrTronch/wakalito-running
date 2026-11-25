import * as T from 'three';
import {nightProgress} from './night.js';

export function addSunset(scene) {
 const sunDirection = new T.Vector3(.38,.13,-1).normalize();
 const material = new T.ShaderMaterial({
  side:T.BackSide, depthWrite:false, fog:false, toneMapped:false,
  uniforms:{
   night:{value:0},time:{value:0},
   sunDirection:{value:sunDirection.clone()},
   horizon:{value:new T.Color(0xf6a565)},
   rose:{value:new T.Color(0xc96e89)},
   zenith:{value:new T.Color(0x514d85)},
   sunColor:{value:new T.Color(0xffedba)}
  },
  vertexShader:`
   varying vec3 skyPosition;
   void main() {
    skyPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
  `,
  fragmentShader:`
   uniform vec3 sunDirection, horizon, rose, zenith, sunColor;
   uniform float night,time;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   varying vec3 skyPosition;
   void main() {
    vec3 ray = normalize(skyPosition);
    vec3 sky = mix(horizon, rose, smoothstep(-0.06, 0.24, ray.y));
    sky = mix(sky, zenith, smoothstep(0.14, 0.56, ray.y));
    float facingSun = max(0.0, dot(ray, sunDirection));
    sky = mix(sky, sunColor, 0.33 * pow(facingSun, 18.0) + 0.28 * pow(facingSun, 110.0));
    sky = mix(sky, sunColor, smoothstep(0.99945, 0.99965, facingSun));
    vec3 nightSky=mix(vec3(.008,.012,.035),vec3(.0015,.003,.012),smoothstep(0.0,.65,ray.y));
    sky=mix(sky,nightSky,night);
    vec2 grid=vec2(atan(ray.x,-ray.z)*70.0,asin(ray.y)*95.0),cell=floor(grid);
    float seed=hash(cell),stars=0.0;
    if(seed>.95&&ray.y>.025){vec2 offset=vec2(hash(cell+11.0),hash(cell+23.0))*.6+.2;float radius=length(fract(grid)-offset);stars=pow(max(0.0,1.0-radius*6.0),2.0)*(.025+1.8*pow(.5+.5*sin(time*(2.2+seed*1.8)+seed*70.0),2.0));}
    sky+=vec3(.7,.8,1.0)*stars*night*night;
    gl_FragColor = vec4(sky, 1.0);
    #include <colorspace_fragment>
   }
  `
 });
 const sky = new T.Mesh(new T.SphereGeometry(145,32,16),material);
 sky.position.set(-1.8,2.5,10);
 sky.renderOrder=-10;
 scene.add(sky);
 scene.fog=new T.Fog(0xe1a487,35,140);
 const dayFog=new T.Color(0xe1a487),nightFog=new T.Color(0x141d35);
 return {update(dt,distance){const value=nightProgress(distance);material.uniforms.night.value=value;material.uniforms.time.value+=dt;scene.fog.color.lerpColors(dayFog,nightFog,value);return value},setMobile(mobile){material.uniforms.sunDirection.value.copy(mobile?new T.Vector3(.07,.30,-1).normalize():sunDirection)}};
}
