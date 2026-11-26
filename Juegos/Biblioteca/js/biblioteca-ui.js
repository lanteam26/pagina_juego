(()=>{'use strict';
const root=new URL('../',document.currentScript.src);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Fade through a dark overlay; keep the document itself opaque.
const reveal=()=>{delete document.documentElement.dataset.leaving;delete document.documentElement.dataset.entering;};
document.documentElement.dataset.entering='true';
requestAnimationFrame(()=>requestAnimationFrame(reveal));
window.LibraryTransition=async function(action,navigation=false){
 if(document.documentElement.dataset.leaving)return;
 document.documentElement.dataset.leaving='true';
 if(!reduce)await new Promise(r=>setTimeout(r,680));
 try{await action();if(!navigation){await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));reveal();}}
 catch(error){reveal();throw error;}
};
window.addEventListener('pageshow',reveal);
// Prevent long-press menus and image dragging on interactive classroom displays.
document.addEventListener('contextmenu',e=>{if(!e.target.closest?.('input,textarea,[contenteditable="true"]'))e.preventDefault();});
document.addEventListener('dragstart',e=>{if(e.target.closest?.('img,.picture-card,.book'))e.preventDefault();});
document.addEventListener('selectstart',e=>{if(e.target.closest?.('button,.paper,.books'))e.preventDefault();});
document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||a.target==='_blank')return;const u=new URL(a.href);if(u.origin!==location.origin)return;e.preventDefault();LibraryTransition(()=>location.assign(u.href),true);});
function credit(){if(location.pathname.includes('/bertha-benz/')){const image=document.querySelector('.cover-page img');const cover=new URL('cuentos/bertha-benz/assets/portada-nueva.png',root).href;if(window.CUENTO_CONFIG)window.CUENTO_CONFIG.cover=cover;if(image&&image.src!==cover)image.src=cover;}const p=document.querySelector('#rightPage .cover-introduction');if(!p||p.querySelector('.story-credits'))return;p.querySelector('.cover-credits')?.remove();const section=document.createElement('section');section.className='story-credits';section.setAttribute('aria-label','Creación y colaboración');for(const [label,file,alt] of [['Creado por Team LAN','lan.png','LAN Studio'],['En colaboración con','cid.png','CID Pujllay']]){const item=document.createElement('div'),t=document.createElement('span'),img=document.createElement('img');t.textContent=label;img.src=new URL('assets/creditos/'+file,root);img.alt=alt;item.append(t,img);section.append(item);}p.append(section);}
const page=document.querySelector('#rightPage');if(page){new MutationObserver(credit).observe(page,{childList:true,subtree:true});credit();}
})();
