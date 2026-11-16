/* C compiler worker. Third-party runtime: vendor/SOURCE.txt and vendor/LICENSE. */
importScripts('vendor/shared.js');
let api,phase='prepare',stdout='',stderr='',sentOut=0,sentErr=0;
const LIMIT=65536,encoder=new TextEncoder();
const status=(stage,text)=>{phase=stage;postMessage({type:'status',stage,text})};
async function resource(name){
 const url=new URL('vendor/'+name+'.gz',self.location.href).href;
 let cache=null,response=null;
 try{cache=await caches.open('c-study-compiler-v1');response=await cache.match(url)}catch{}
 if(!response){
  response=await fetch(url);
  if(!response.ok)throw Error('编译资源加载失败（'+response.status+'），请稍后重试。');
  if(cache){try{await cache.put(url,response.clone())}catch{}}
 }
 if(typeof DecompressionStream==='undefined')throw Error('当前浏览器版本不支持编译工具，请更新 Chrome、Edge 或 Safari 后重试。');
 return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}
function write(text,fd=2){
 text=text.replace(/\x1b\[[0-9;]*m/g,'');
 if(phase==='run'&&fd===1)stdout+=text;else stderr+=text;
 if(stdout.length+stderr.length>LIMIT)throw Error('输出超过 64 KB，程序已停止。请检查是否反复输出。');
 if(stdout.length-sentOut>=1024||stderr.length-sentErr>=1024){postMessage({type:'output',stdout,stderr});sentOut=stdout.length;sentErr=stderr.length}
}
async function initialize(){
 if(api)return;
 status('prepare','首次准备编译环境，请稍候…');
 const modules=new Map();
 const options={clang:'clang',lld:'lld',memfs:'memfs',sysroot:'sysroot-c.tar',readBuffer:resource,compileStreaming:async name=>{
  if(!modules.has(name))modules.set(name,resource(name).then(bytes=>WebAssembly.compile(bytes)));
  return modules.get(name);
 },hostWrite:write};
 api=new API(options);api.hostLog=()=>{};api.hostLogAsync=(_,promise)=>promise;
 await Promise.all([api.ready,api.getModule('clang'),api.getModule('lld')]);
}
self.onmessage=async event=>{
 if(event.data.type!=='run')return;
 stdout='';stderr='';sentOut=0;sentErr=0;
 try{
  const {source,input}=event.data;
  if(typeof source!=='string'||encoder.encode(source).length>100000)throw Error('代码长度不能超过 100 KB。');
  if(typeof input!=='string'||encoder.encode(input).length>100000)throw Error('输入长度不能超过 100 KB。');
  await initialize();
  status('compile','正在编译 C 程序…');
  api.memfs.setStdinStr('');
  api.memfs.addFile('main.c',encoder.encode(source));
  const compiler=await api.getModule('clang');
  await api.run(compiler,'clang','-cc1','-emit-obj','-triple','wasm32-unknown-wasi','-isysroot','/','-internal-isystem','/include','-internal-isystem','/lib/clang/8.0.1/include','-std=c11','-O0','-Wall','-ferror-limit','8','-fmessage-length','0','-o','main.o','-x','c','main.c');
  const linker=await api.getModule('lld');
  await api.run(linker,'wasm-ld','--no-threads','-z','stack-size=1048576','--max-memory=134217728','-Llib/wasm32-wasi','lib/wasm32-wasi/crt1.o','main.o','-lc','-o','main.wasm');
  const program=await WebAssembly.compile(api.memfs.getFileContents('main.wasm'));
  const bytes=encoder.encode(input);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  api.memfs.setStdinStr(binary);
  status('run','程序运行中…');
  await api.runProgram(program,'main.wasm');
  postMessage({type:'done',success:true,exitCode:0,stdout,stderr:stderr.trim()});
 }catch(error){
  // Nonzero exit codes and traps are displayed separately from compiler diagnostics.
  const stoppedPhase=phase;
  postMessage({type:'done',success:false,stage:stoppedPhase,exitCode:Number.isInteger(error.code)?error.code:null,stdout,stderr,message:error.message||String(error)});
 }
};
