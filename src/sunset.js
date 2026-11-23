import * as T from 'three';

export function addSunset(scene) {
 const sunDirection = new T.Vector3(.38,.13,-1).normalize();
 const material = new T.ShaderMaterial({
  side:T.BackSide, depthWrite:false, fog:false, toneMapped:false,
  uniforms:{
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
   varying vec3 skyPosition;
   void main() {
    vec3 ray = normalize(skyPosition);
    vec3 sky = mix(horizon, rose, smoothstep(-0.06, 0.24, ray.y));
    sky = mix(sky, zenith, smoothstep(0.14, 0.56, ray.y));
    float facingSun = max(0.0, dot(ray, sunDirection));
    sky = mix(sky, sunColor, 0.33 * pow(facingSun, 18.0) + 0.28 * pow(facingSun, 110.0));
    sky = mix(sky, sunColor, smoothstep(0.99945, 0.99965, facingSun));
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
 return {setMobile(mobile){material.uniforms.sunDirection.value.copy(mobile?new T.Vector3(.07,.30,-1).normalize():sunDirection)}};
}
