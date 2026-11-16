(function(){
 const back=document.getElementById('backToReview');
 let context=null;try{const token=new URL(location.href).searchParams.get('return');const saved=JSON.parse(sessionStorage.getItem('cReviewCompilerReturn')||'null');if(token&&saved?.token===token)context=saved}catch{}
 if(context){back.href='../?resumeCompiler='+encodeURIComponent(context.token);back.textContent=context.view==='quiz'?'← 返回刚才的题目':context.view==='docs'?'← 返回刚才的文档':'← 返回错题本'}
 else back.addEventListener('click',function(event){if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;try{const previous=new URL(document.referrer);if(previous.origin===location.origin&&previous.pathname.replace(/index\.html$/,'')===new URL('../',location.href).pathname){event.preventDefault();history.back()}}catch{}});
 // Carry the existing study return token across C / Python graph switches.
 if(context&&typeof cSwitchTarget==='function'){const original=cSwitchTarget;cSwitchTarget=function(kind){return original(kind)+'?return='+encodeURIComponent(context.token)}}
 if(typeof enterGraph==='function')enterGraph();
})();
