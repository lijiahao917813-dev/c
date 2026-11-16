'use strict';
const $=id=>document.getElementById(id);
try{
 const token=new URL(window.location.href).searchParams.get('return');
 const context=JSON.parse(sessionStorage.getItem('cReviewCompilerReturn')||'null');
 if(token&&context?.token===token){const link=$('backToStudy');link.href='../?resumeCompiler='+encodeURIComponent(token);link.textContent=context.view==='quiz'?'← 返回刚才的题目':context.view==='docs'?'← 返回刚才的文档':'← 返回错题本'}
}catch{}
const examples={
 hello:{code:'#include <stdio.h>\n\nint main(void) {\n    printf("Hello, C!\\n");\n    return 0;\n}\n',input:''},
 input:{code:'#include <stdio.h>\n\nint main(void) {\n    int a, b;\n    if (scanf("%d %d", &a, &b) != 2) {\n        printf("请输入两个整数\\n");\n        return 1;\n    }\n    printf("%d + %d = %d\\n", a, b, a + b);\n    return 0;\n}\n',input:'3 5\n'},
 array:{code:'#include <stdio.h>\n\nint main(void) {\n    int a[] = {2, 4, 6};\n    int *p = a;\n    int sum = 0;\n    for (int i = 0; i < 3; i++) {\n        sum += *(p + i);\n    }\n    printf("sum = %d\\n", sum);\n    return 0;\n}\n',input:''},
 recursion:{code:'#include <stdio.h>\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main(void) {\n    printf("5! = %d\\n", factorial(5));\n    return 0;\n}\n',input:''},
 memory:{code:'#include <stdio.h>\n#include <stdlib.h>\n\nstruct Student {\n    int score;\n};\n\nint main(void) {\n    struct Student *p = malloc(sizeof *p);\n    if (p == NULL) return 1;\n    p->score = 88;\n    printf("score = %d\\n", p->score);\n    free(p);\n    return 0;\n}\n',input:''}
};
let worker=null,timer=null,running=false,saveTimer;
function save(){try{localStorage.setItem('cReviewCompilerDraft',JSON.stringify({source:$('source').value,input:$('stdin').value}));$('saveStatus').textContent='已保存'}catch{$('saveStatus').textContent='当前浏览器无法保存草稿'}}
function setStatus(text,state=''){ $('status').textContent=text;$('status').dataset.state=state; }
function finish(){running=false;clearTimeout(timer);$('run').disabled=false;$('stop').disabled=true;$('example').disabled=false}
function terminate(message){if(worker){worker.terminate();worker=null}finish();setStatus(message,'error')}
function deadline(ms,message){clearTimeout(timer);timer=setTimeout(()=>terminate(message),ms)}
function getWorker(){
 if(worker)return worker;
 worker=new Worker('worker.js');
 worker.onmessage=event=>{
  const m=event.data;
  if(m.type==='status'){setStatus(m.text);if(m.stage==='run')deadline(3000,'运行超过 3 秒，已停止。请检查循环或递归的结束条件。');else if(m.stage==='compile')deadline(30000,'编译超时，已停止。可检查代码后重试。');return}
  if(m.type==='output'){ $('stdout').textContent=m.stdout;$('stderr').textContent=m.stderr;return }
  if(m.type==='done'){
   finish();$('stdout').textContent=m.stdout||(m.success?'（程序没有输出）':'');$('stderr').textContent=m.stderr||'';
   $('diagnostics').open=!!m.stderr||!m.success;
   if(m.success)setStatus('运行完成 · 退出码 0','success');
   else {setStatus(m.stage==='prepare'?'编译环境加载失败':m.stage==='run'?'程序运行异常':'编译失败','error');$('stderr').textContent+=(m.stderr?'\n':'')+(m.message||'未知错误');worker.terminate();worker=null}
  }
 };
 worker.onerror=event=>{terminate('编译工具未能启动，请刷新重试。');$('stderr').textContent=event.message||'浏览器未能加载编译资源。';$('diagnostics').open=true};
 return worker;
}
function run(){
 if(running)return;
 if(!window.WebAssembly||!window.Worker){setStatus('当前浏览器不支持在线编译，请使用新版浏览器。','error');return}
 if(!$('source').value.trim()){setStatus('先写一些 C 代码。','error');return}
 if($('source').value.length>100000||$('stdin').value.length>100000){setStatus('代码和输入分别不能超过 100 KB。','error');return}
 save();running=true;$('run').disabled=true;$('stop').disabled=false;$('example').disabled=true;$('stdout').textContent='';$('stderr').textContent='';$('diagnostics').open=false;setStatus('正在准备编译环境…');deadline(180000,'加载超时，已停止。请检查网络后重试。');
 try{getWorker().postMessage({type:'run',source:$('source').value,input:$('stdin').value})}catch(error){terminate('编译工具启动失败。');$('stderr').textContent=error.message;$('diagnostics').open=true}
}
try{const draft=JSON.parse(localStorage.getItem('cReviewCompilerDraft')||'null');$('source').value=typeof draft?.source==='string'?draft.source:examples.hello.code;$('stdin').value=typeof draft?.input==='string'?draft.input:''}catch{$('source').value=examples.hello.code}
for(const id of ['source','stdin'])$(id).addEventListener('input',()=>{clearTimeout(saveTimer);$('saveStatus').textContent='保存中…';saveTimer=setTimeout(save,300)});
window.addEventListener('pagehide',save);
$('source').addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const node=event.target,start=node.selectionStart,end=node.selectionEnd;node.setRangeText('    ',start,end,'end');save()}});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run()}});
$('run').addEventListener('click',run);$('stop').addEventListener('click',()=>terminate('已停止，可修改代码后重新运行。'));
$('example').addEventListener('change',()=>{const sample=examples[$('example').value];if(!sample)return;if($('source').value!==sample.code&&!confirm('载入示例会替换当前代码，是否继续？'))return;$('source').value=sample.code;$('stdin').value=sample.input;save()});
$('clear').addEventListener('click',()=>{if(running)return;$('stdout').textContent='';$('stderr').textContent='';setStatus('准备就绪')});
$('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([$('source').value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='main.c';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
