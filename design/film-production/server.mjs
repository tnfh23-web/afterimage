import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),output=path.resolve(root,'../../public/media'),vendor=path.resolve(root,'../../node_modules/three');await fs.mkdir(output,{recursive:true});
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:4181');
  if(req.method==='POST'&&['/save-film','/save-poster'].includes(url.pathname)){
   const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>50*1024*1024)throw new Error('Media exceeds 50 MB');chunks.push(chunk);}
   const ext=url.searchParams.get('ext')==='mp4'?'mp4':'webm',name=url.pathname==='/save-film'?'afterglow.'+ext:'afterglow-poster.jpg';const bytes=Buffer.concat(chunks);await fs.writeFile(path.join(output,name),bytes);res.end('saved');console.log(name,bytes.length);return;
  }
  let file;if(url.pathname.startsWith('/vendor/')){file=path.resolve(vendor,url.pathname.slice(8));if(!file.startsWith(vendor+path.sep))throw new Error('Invalid path');}else{const names={'/film.js':'film.js','/score.js':'score.js','/':'recorder.html'};if(!names[url.pathname]){res.statusCode=404;res.end('Not found');return;}file=path.join(root,names[url.pathname]);}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(await fs.readFile(file));
 }catch(error){res.statusCode=500;res.end(error.message);console.error(error.message);}
}).listen(4181,'127.0.0.1',()=>console.log('Film production http://127.0.0.1:4181'));
