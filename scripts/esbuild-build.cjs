#!/usr/bin/env node
const esbuild = require('esbuild');
const path = require('path');

(async function build(){
  try{
    await esbuild.build({
      entryPoints: [path.join(process.cwd(), 'server', 'index.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outdir: path.join(process.cwd(), 'dist'),
      external: [],
      logLevel: 'info',
    });
    console.log('esbuild: server bundle created.');
  }catch(err){
    console.error('esbuild error:', err);
    process.exit(1);
  }
})();
