function escapeCodeText(text){return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function highlightCCode(source){
 const keywords=new Set(('auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while _Alignas _Alignof _Atomic _Bool _Complex _Generic _Imaginary _Noreturn _Static_assert _Thread_local bool true false NULL').split(' '));
 const tokens=/\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\r\n]*|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|#[ \t]*[A-Za-z_]\w*|\b0[xX][\da-fA-F]+(?:\.[\da-fA-F]*)?(?:[pP][+-]?\d+)?[uUlLfF]*\b|(?:\b\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[uUlLfF]*\b|\b[A-Za-z_]\w*\b/g;
 const code=String(source);let html='',cursor=0;
 for(const match of code.matchAll(tokens)){
  html+=escapeCodeText(code.slice(cursor,match.index));const token=match[0];let kind='';
  if(token.startsWith('//')||token.startsWith('/*'))kind='comment';
  else if(token[0]==='"'||token[0]==="'")kind='string';
  else if(token[0]==='#')kind='directive';
  else if(/^(?:\d|\.\d)/.test(token))kind='number';
  else if(keywords.has(token))kind='keyword';
  else if(/^\s*\(/.test(code.slice(match.index+token.length)))kind='function';
  html+=kind?'<span class="c-token-'+kind+'">'+escapeCodeText(token)+'</span>':escapeCodeText(token);
  cursor=match.index+token.length;
 }
 return html+escapeCodeText(code.slice(cursor));
}
function renderCodeBlock(source,label='C 示例'){
 return '<div class="codebox"><div class="codebar"><span class="codedots" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-label">'+escapeCodeText(label)+'</span><button type="button" class="code-copy" onclick="copyCodeBlock(this)" aria-label="复制代码" aria-live="polite"><span aria-hidden="true">▢</span> 复制</button></div><pre><code>'+highlightCCode(source)+'</code></pre></div>';
}
async function copyCodeBlock(button){
 if(button.disabled)return;
 const code=button.closest('.codebox')?.querySelector('pre code');if(!code)return;
 const text=code.textContent;button.disabled=true;let copied=false;
 try{if(typeof navigator.clipboard?.writeText==='function'){await navigator.clipboard.writeText(text);copied=true}}catch{}
 if(!copied){
  const previous=document.activeElement,input=document.createElement('textarea');
  input.value=text;input.setAttribute('readonly','');input.setAttribute('aria-hidden','true');input.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';document.body.appendChild(input);
  try{input.focus();input.select();copied=!!document.execCommand('copy')}catch{}finally{input.remove();previous?.focus?.({preventScroll:true})}
 }
 button.innerHTML=copied?'✓ 已复制':'复制失败，请手动选择';button.setAttribute('aria-label',copied?'代码已复制':'复制失败，请手动选择代码');
 button.classList.toggle('copied',copied);
 setTimeout(()=>{button.innerHTML='<span aria-hidden="true">▢</span> 复制';button.setAttribute('aria-label','复制代码');button.classList.remove('copied');button.disabled=false},1700);
}
