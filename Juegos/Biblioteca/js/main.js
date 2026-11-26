(()=>{'use strict';
const stories=window.HISTORIAS||[],sections=window.SECCIONES||[],books=document.querySelector('#books'),dialog=document.querySelector('#detail'),back=document.querySelector('#backCategories');
let current=null,lastFocus=null;
function cover(item){const img=document.createElement('img');img.src=item.cover||sections.find(s=>s.id===item.category)?.cover;if(item.id==='olga')img.onerror=()=>{img.onerror=null;img.src='cuentos/olga-lock-sing/assets/portada.webp';};img.alt=item.title;img.draggable=false;return img;}
function close(){dialog.close();lastFocus?.focus();}
function detail(item){lastFocus=document.activeElement;document.querySelector('#modal-cover-holder').replaceChildren(cover(item));document.querySelector('#modal-title').textContent=item.title;document.querySelector('#modal-kicker').textContent=item.kicker||'Una historia para descubrir';document.querySelector('#modal-description').textContent=item.description;document.querySelector('#modal-status').textContent=item.href?'Historia disponible':'Próximamente';document.querySelector('#modal-action').textContent=item.href?'Comenzar historia →':'Entendido';dialog.dataset.book=item.id;dialog.showModal();}
function render(category=null){current=category;books.replaceChildren();books.classList.toggle('category-view',!category);const items=category?stories.filter(s=>s.category===category).sort((a,b)=>Number(!!b.href)-Number(!!a.href)):sections;for(const item of items){const button=document.createElement('button');button.type='button';button.className='collection-book';button.dataset.book=item.id;button.setAttribute('aria-label',item.title);button.append(cover(item));const label=document.createElement('span');label.textContent=category?(item.href?item.title:item.title+' · Próximamente'):item.title;button.append(label);button.onclick=()=>category?detail(item):LibraryTransition(()=>{render(item.id);back.focus();});books.append(button);}back.hidden=!category;document.querySelector('.header p').textContent=category?sections.find(s=>s.id===category).title:'Elige una sección y descubre sus historias';document.querySelector('#collectionCount').textContent=category?`${items.filter(s=>s.href).length} cuentos disponibles · ${items.filter(s=>!s.href).length} próximamente`:`3 secciones · ${stories.filter(s=>s.href).length} cuentos disponibles`;document.querySelector('#carouselStatus').textContent=category?'Elige un libro para conocer su aventura':'Fábulas · Cuentos · Mujeres que marcaron la historia';}
back.onclick=()=>LibraryTransition(()=>{render();books.querySelector('button')?.focus();});document.querySelector('.close').onclick=close;dialog.addEventListener('click',e=>{if(e.target===dialog)close();});document.querySelector('#modal-action').onclick=()=>{const item=stories.find(s=>s.id===dialog.dataset.book);if(!item?.href){close();return;}LibraryTransition(()=>{document.querySelector('#bgm')?.pause();window.BookSounds?.stop();location.assign(item.href);},true);};
// Fit the shelf into its grid row, including fullscreen and browser zoom.
const stage=document.querySelector('.carousel-stage'),shelf=document.querySelector('.bookcase');
function fitShelf(){
 if(matchMedia('(max-width:700px) and (orientation:portrait)').matches){shelf.style.removeProperty('--shelf-width');shelf.style.removeProperty('--shelf-y');return;}
 const r=stage.getBoundingClientRect();
 shelf.style.setProperty('--shelf-width',Math.max(1,Math.min(r.width,r.height*16/9))+'px');
 shelf.style.setProperty('--shelf-y','0px');
 const box=shelf.getBoundingClientRect(),room=document.querySelector('.library').getBoundingClientRect();
 // The room is a 1920×1080 background, positioned at center bottom.
 // Anchor the visible feet (96.2% of the transparent shelf image) to its floor.
 const scale=Math.max(room.width/1920,room.height/1080);
 const floor=room.bottom-105*scale;
 const footer=document.querySelector('.collection-footer').getBoundingClientRect();
 const contact=Math.min(floor,footer.top-10);
 shelf.style.setProperty('--shelf-y',(contact-(box.top+box.height*1039/1080))+'px');
}

if(window.ResizeObserver)new ResizeObserver(fitShelf).observe(stage);
window.addEventListener('resize',fitShelf);document.addEventListener('fullscreenchange',fitShelf);
render();fitShelf();
})();
