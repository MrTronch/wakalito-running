import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {cpSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
export function publicHTML(html){
 html=html.replace(/<div class="mode-picker"[\s\S]*?<\/div>/,'');
 const start=html.indexOf('<div id="camera-settings"'),end=html.indexOf('<button id="start"',start);
 if(start!==-1&&end!==-1)html=html.slice(0,start)+html.slice(end);
 return html.replace(/<aside id="body-preview"[\s\S]*?<\/aside>/,'').replace(/<button id="settings"[\s\S]*?<\/button>/,'<button id="settings" hidden aria-label="Opciones">Opciones</button>');
}
export default defineConfig(({mode,command})=>{
 const isPublic=mode!=='camera'||!existsSync(fileURLToPath(new URL('./src/body-controls.js',import.meta.url)));
 return {
  base:'./',
  resolve:{alias:{'#body-controls':fileURLToPath(new URL(isPublic?'./src/no-camera-controls.js':'./src/body-controls.js',import.meta.url))}},
  publicDir:isPublic&&command==='build'?false:'public',
  build:{outDir:isPublic?'dist-public':'dist'},
  plugins:isPublic?[{
   name:'public-without-camera',transformIndexHtml:publicHTML,
   closeBundle(){if(command==='build')cpSync('public',resolve('dist-public'),{recursive:true,filter:path=>!path.split(/[\\/]/).includes('mediapipe')&&!path.endsWith('eye-1.png')&&!path.endsWith('inti.glb')})}
  }]:[]
 };
});
