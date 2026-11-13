import {defineConfig, loadEnv} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

export default defineConfig(({mode})=>{
  const env=loadEnv(mode,process.cwd(),'');
  const proxy={target:env.BACKEND_URL || 'http://127.0.0.1:8000',changeOrigin:true};
  const proxies={'/api':proxy,'/health':proxy};
  // viteSingleFile inlines all JS and CSS into dist/index.html at build time.
  return {plugins:[viteSingleFile()],server:{proxy:proxies},preview:{proxy:proxies}};
});
