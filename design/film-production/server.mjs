import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const output=path.resolve(root,'../../public/media');await fs.mkdir(output,{recursive:true});
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:4181');
  if(req.method==='POST'&&['/save-film','/save-poster'].includes(url.pathname)){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const ext=url.searchParams.get('ext')==='mp4'?'mp4':'webm',name=url.pathname==='/save-film'?'afterglow.'+ext:'afterglow-poster.jpg';
   const bytes=Buffer.concat(chunks);await fs.writeFile(path.join(output,name),bytes);res.end('saved');console.log(name,bytes.length);return;
  }
  const name=url.pathname==='/film.js'?'film.js':'recorder.html';res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/html');res.end(await fs.readFile(path.join(root,name)));
 }catch(error){res.statusCode=500;res.end(error.message);}
}).listen(4181,'127.0.0.1',()=>console.log('Film production http://127.0.0.1:4181'));
