import {defineConfig, loadEnv} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

export default defineConfig(({mode})=>{
  const env=loadEnv(mode,process.cwd(),'');
  const proxy={target:env.BACKEND_URL || 'http://127.0.0.1:8000',changeOrigin:true};
  // Optional Boomi listeners. The Boomi login is added here, on the dev server, so it never reaches the browser bundle.
  const login=env.BOOMI_USERNAME && env.BOOMI_TOKEN ? 'Basic '+Buffer.from(env.BOOMI_USERNAME+':'+env.BOOMI_TOKEN).toString('base64') : '';
  const boomi=env.BOOMI_BASE_URL ? {target:env.BOOMI_BASE_URL,changeOrigin:true,rewrite:p=>p.replace(/^\/boomi/,''),headers:login?{Authorization:login}:{}} : null;
  const proxies={'/api':proxy,'/health':proxy,...(boomi?{'/boomi':boomi}:{})};
  // viteSingleFile inlines all JS and CSS into dist/index.html at build time.
  return {plugins:[viteSingleFile()],server:{proxy:proxies},preview:{proxy:proxies}};
});
