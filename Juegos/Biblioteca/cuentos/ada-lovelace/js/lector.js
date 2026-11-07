(()=>{'use strict';
const $=s=>document.querySelector(s),data=window.CUENTO_CONFIG;
const left=$('#leftPage'),right=$('#rightPage'),book=$('#book'),spread=$('#activitySpread'),modeDialog=$('#modes'),endDialog=$('#ending');
const narrator=$('#narrator'),bgm=$('#bgm'),winSound=$('#winSound'),loseSound=$('#loseSound');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs=t=>t.split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join('');
const activities=data.activities||[];
const definitions=data.cards||{};
let items=[],pos=0,readingMode='activities',narrationMode='page',started=false,busy=false,epoch=0;
let voiceRun=0;
let narrationId='',pendingNarration=0,activity=null,activityVoice='',activityWin=false,context;
const pageTimers=new Set();
function later(fn,ms){const id=setTimeout(()=>{pageTimers.delete(id);fn();},ms);pageTimers.add(id);return id;}
function clearPageTimers(){for(const id of pageTimers)clearTimeout(id);pageTimers.clear();pendingNarration=0;epoch++;}
function shuffle(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function tap(kind='tap'){
 try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;context??=new AC();context.resume().catch(()=>{});
 const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;oscillator.type='sine';oscillator.frequency.setValueAtTime(kind==='swap'?610:740,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.035,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+.09);oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(now+.1);oscillator.onended=()=>{gain.disconnect();oscillator.disconnect();};}catch{}
}
function pageRustle(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;context??=new AC();context.resume().catch(()=>{});const buffer=context.createBuffer(1,Math.round(context.sampleRate*.24),context.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/samples.length);const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=1100;gain.gain.value=.055;source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}catch{}}
function inner(content,cls=''){return `<div class="page-inner ${cls}">${content}</div>`;}
function buildItems(){items=[{id:'portada',type:'cover'}];for(const page of data.pages){items.push(page);if(readingMode==='activities')items.push(...activities.filter(a=>a.after===page.page));}}
function render(){
 const item=items[pos];activity=null;activityVoice='';activityWin=false;spread.hidden=true;spread.replaceChildren();book.dataset.view=item.type;
 left.className='paper left-paper';right.className='paper right-paper';
 if(item.type==='cover'){
  left.innerHTML=`<div class="cover-page"><img src="${data.cover}" alt="${esc(data.title)}"></div>`;
  right.innerHTML=inner(`<p class="page-kicker">Una historia para compartir</p><h1 class="page-title">${esc(data.title)}</h1><p class="subtitle">${esc(data.subtitle)}</p><p class="cover-intro">${esc(data.intro)}</p><button id="begin" type="button" class="continue">Abrir la historia →</button>`,'cover-introduction');
  $('#begin').onclick=()=>move(1);
 }else if(item.type==='story'||item.type==='moral'){
  left.innerHTML=`<div class="illustration-page"><img src="${item.image}" alt="Ilustración: ${esc(item.title)}"></div>`;
  right.innerHTML=inner(`<div class="reading-area"><h2 class="page-title">${esc(item.title)}</h2><div class="story-text">${paragraphs(item.text)}</div></div><span class="page-number">Página ${item.page}</span>`,'narrative');
 }else{left.innerHTML='';right.innerHTML='';renderActivity(item);}
 $('#progress').textContent=`${pos+1} / ${items.length} · ${item.type==='cover'?'Portada':item.type==='activity'?`${item.kind==='decision'?'Decisión':'Actividad'} ${item.id.split('-')[1]}`:`Página ${item.page}`}`;
 updateControls();fitText();
}
function updateControls(){
 book.dataset.busy=String(busy);$('#prev').disabled=busy||pos===0;$('#next').disabled=busy||items[pos].type==='activity';$('#changeMode').disabled=busy;
 $('#next').setAttribute('aria-label',pos===items.length-1?'Finalizar historia':'Página siguiente');
 const names={off:'Sin narrador',page:'Narrador · Por página',auto:'Narrador · Automático'};
 $('#narrate').innerHTML=names[narrationMode]+' <span aria-hidden="true">⌃</span>';
 document.querySelectorAll('[data-narration]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.narration===narrationMode)));
 $('#voicePlayback').disabled=narrationMode==='off'||!started||busy||items[pos].type==='cover'||activityWin;
 $('#voicePlayback').textContent=(!narrator.paused||window.speechSynthesis?.speaking)?'Pausar voz':'Volver a escuchar';
 const check=$('#check');if(check)check.disabled=busy||activityWin||activity?.locked;
}
function icon(key){return `<svg viewBox="0 0 100 100" aria-hidden="true">${(window.CUENTO_ICONOS||{})[key]||''}</svg>`;}
function makeCard(key,attrs='',cls='',badge=''){
 const c=definitions[key]||{label:key};
 return `<button type="button" class="picture-card ${c.image?'':c.icon?'icon-card':'text-card'} ${cls}" aria-label="${esc(c.label)}" aria-pressed="${String(cls.includes('selected'))}" ${attrs}>${c.image?`<img src="${c.image}" alt="${esc(c.label)}" draggable="false">`:`${c.icon?icon(c.icon):''}<span class="card-label">${esc(c.label)}</span>`}${badge?`<span class="pair-badge" aria-hidden="true">${badge}</span>`:''}</button>`;
}
function renderActivity(item){
 spread.hidden=false;activity={chosen:null,matches:Array(item.left?.length||0).fill(null),houseOrder:shuffle((item.right||[]).map((_,i)=>i)),selected:null,round:0,locked:false,submitted:false,program:[],robot:{x:0,y:2}};
 if(item.kind==='order'||item.kind==='sentence'){activity.order=shuffle(item.cards.map((_,i)=>i));if(activity.order.every((v,i)=>v===i))activity.order.reverse();}
 spread.className=`activity-spread kind-${item.kind}`;spread.dataset.story=data.id;
 spread.style.setProperty('--activity-left',`url("${new URL(data.activityPaperLeft,document.baseURI).href}")`);
 spread.style.setProperty('--activity-right',`url("${new URL(data.activityPaperRight,document.baseURI).href}")`);
 spread.innerHTML=`<header class="activity-heading"><p class="page-kicker">${item.kind==='decision'?'Decisión':'Actividad'} ${item.id.split('-')[1]}</p><h2 class="page-title">${esc(item.title)}</h2><p id="instruction" class="instructions">${esc(item.instruction)}</p></header><div id="game" class="spread-game"></div><footer class="activity-footer"><p id="feedback" role="status" aria-live="polite">${item.kind==='pairs'?'Une las parejas y comprueba.': 'Elige y comprueba cuando estés listo.'}</p><button id="check" type="button" class="check-button">Comprobar <span aria-hidden="true">✓</span></button></footer>`;
 drawActivity();$('#check').onclick=checkActivity;
}
function organizeActivity(item,game){
 const L=document.createElement('div'),R=document.createElement('div'),heading=document.createElement('h3');L.className='leaf-content leaf-left-content';R.className='leaf-content leaf-right-content';heading.className='activity-right-title';
 const grid=(nodes,cls='')=>{const el=document.createElement('div');el.className='leaf-card-grid '+cls;for(const n of nodes)el.append(n);return el;};
 const art=()=>{const img=document.createElement('img');img.className='leaf-illustration';img.src=item.illustration||data.pages.find(p=>p.page===item.after)?.image||data.cover;img.alt='Ilustración del cuento';return img;};
 if(item.kind==='pairs'){
  const rows=game.querySelectorAll('.pair-row');L.append(grid([...rows[0].children]));R.append(grid([...rows[1].children]));heading.textContent='Busca su pareja';
 }else if(item.kind==='order'){
  const cards=[...game.querySelectorAll('.sequence-slot')],split=Math.ceil(cards.length/2);L.append(grid(cards.slice(0,split),'sequence-half'));R.append(grid(cards.slice(split),'sequence-half '+(cards.length-split===1?'one-card':'')));heading.textContent='Continúa el orden';
 }else if(item.kind==='sentence'){
  const illustration=game.querySelector('.sentence-art');if(illustration)L.append(illustration);
  const line=document.createElement('p');line.className='sentence-preview';line.textContent=activity.order.map(i=>definitions[item.cards[i]].label).join(' ');L.append(line);R.append(grid([...game.querySelectorAll('.sequence-slot')],'word-grid'));heading.textContent='Ordena las palabras';
 }else if(item.kind==='robot'){
  L.append(game.querySelector('.robot-board'));R.append(game.querySelector('.robot-tools'));heading.textContent='Prepara tu programa';
 }else if(item.kind==='pattern'){
  L.append(game.querySelector('.pattern-line'));R.append(grid([...game.querySelectorAll('.pattern-answers button')]));heading.textContent='¿Qué figura sigue?';
 }else if(item.kind==='decision'){
  const selected=item.options[activity.selected];
  const img=document.createElement('img');img.className='decision-illustration';img.src=selected?.image||data.pages.find(p=>p.page===item.after)?.image;img.alt=selected?'Ada: resultado de la opción '+selected.letter:'Ada imagina distintos caminos';
  L.append(img,game.querySelector('.decision-result'));R.append(game.querySelector('.decision-options'));heading.textContent='Elige una opción';
 }else{
  L.append(art());R.append(grid([...game.querySelectorAll('[data-answer]')]));heading.textContent=item.kind==='who'?'Elige al personaje':item.kind==='invent'?'Imagina tu invento':'Elige una carta';
 }
 game.replaceChildren(heading,L,R);
}

function drawActivity(){
 const item=items[pos],a=activity,game=$('#game');if(!a||!game)return;
 if(item.kind==='pairs'){
  game.innerHTML=`<div class="pair-board pairs-${item.left.length}"><div class="pair-row">${item.left.map((k,i)=>makeCard(k,`data-pig="${i}"`,`${a.chosen===i?'selected':''} ${a.matches[i]!==null?'linked':''} ${a.submitted?(a.matches[i]===i?'answer-correct':'answer-incorrect'):''}`,String(i+1))).join('')}</div><div class="pair-row">${a.houseOrder.map(i=>{const pig=a.matches.indexOf(i);return makeCard(item.right[i],`data-house="${i}"`,`${pig>=0?'linked':''} ${a.submitted&&pig>=0?(pig===i?'answer-correct':'answer-incorrect'):''}`,pig>=0?String(pig+1):'');}).join('')}</div></div>`;
  game.querySelectorAll('[data-pig]').forEach(b=>b.onclick=()=>{if(!canInteract())return;a.chosen=+b.dataset.pig;a.submitted=false;tap();drawActivity();});
  game.querySelectorAll('[data-house]').forEach(b=>b.onclick=()=>{if(!canInteract())return;if(a.chosen===null){$('#feedback').textContent='Primero toca una carta.';tap();return;}const i=+b.dataset.house;const other=a.matches.indexOf(i);if(other>=0)a.matches[other]=null;a.matches[a.chosen]=i;a.chosen=null;a.submitted=false;tap('swap');drawActivity();$('#feedback').textContent='Los números muestran tus parejas. Puedes cambiarlas.';});
 }else if(item.kind==='order'||item.kind==='sentence'){
  game.innerHTML=`<div class="order-board count-${item.cards.length}">${a.order.map((n,i)=>`<div class="sequence-slot"><span class="sequence-number">${i+1}</span>${makeCard(item.cards[n],`data-slot="${i}"`,a.chosen===i?'selected':'')}</div>`).join('')}</div>`;
  game.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{if(!canInteract())return;const i=+b.dataset.slot;if(a.chosen===null){a.chosen=i;tap();}else{[a.order[i],a.order[a.chosen]]=[a.order[a.chosen],a.order[i]];a.chosen=null;tap('swap');}drawActivity();});
 }else if(['choice','who','invent'].includes(item.kind)){
  const keys=item.cards;
  if(item.kind==='who')$('#instruction').innerHTML=`<span class="round-label">Pista ${a.round+1} de 4</span>${esc(item.clues[a.round])}`;
  game.innerHTML=`<div class="selection-board ${keys.length===4?'four-cards':'three-cards'}">${keys.map((k,i)=>makeCard(k,`data-answer="${i}"`,a.selected===i?'selected':'')).join('')}</div>`;
  game.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(!canInteract())return;a.selected=+b.dataset.answer;tap();drawActivity();}); }else if(item.kind==='pattern'){
  const p=patterns[a.round];$('#instruction').innerHTML=`<span class="round-label">Patrón ${a.round+1} de ${patterns.length}</span>${esc(item.instruction)}`;
  game.innerHTML=`<div class="pattern-game"><div class="pattern-line">${p.sequence.map(k=>icon(k)).join('')}<strong>?</strong></div><div class="pattern-answers">${p.options.map((k,i)=>`<button type="button" class="picture-card icon-card ${a.selected===i?'selected':''}" data-pattern="${i}" aria-label="${patternNames[k]}" aria-pressed="${a.selected===i}">${icon(k)}</button>`).join('')}</div></div>`;
  game.querySelectorAll('[data-pattern]').forEach(b=>b.onclick=()=>{if(!canInteract())return;a.selected=+b.dataset.pattern;tap();drawActivity();});
 }else if(item.kind==='decision'){
  game.innerHTML=`<div class="decision-game"><div class="decision-options">${item.options.map((o,i)=>`<button type="button" class="decision-option ${a.selected===i?'selected':''}" data-choice="${i}" aria-pressed="${a.selected===i}"><span class="decision-letter">${o.letter}</span>${esc(o.label)}</button>`).join('')}</div><p class="decision-result" aria-live="polite">${a.selected===null?'Los dos caminos tienen algo que enseñarnos.':esc(item.options[a.selected].result)}</p></div>`;
  game.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(!canInteract())return;a.selected=+b.dataset.choice;tap();drawActivity();if(narrationMode!=='off')playVoice();});
 }else if(item.kind==='robot'){
  const names={U:'Arriba',D:'Abajo',L:'Izquierda',R:'Derecha'},arrows={U:'↑',D:'↓',L:'←',R:'→'};
  game.innerHTML=`<div class="robot-game"><div class="robot-board" role="group" aria-label="Tablero de cuatro columnas y tres filas">${Array.from({length:12},(_,i)=>{const x=i%4,y=Math.floor(i/4);return `<div class="robot-cell" aria-label="Fila ${y+1}, columna ${x+1}">${a.robot.x===x&&a.robot.y===y?icon('robot'):x===3&&y===0?icon('star'):''}</div>`;}).join('')}</div><div class="robot-tools"><p>Prepara tu camino</p><div class="robot-arrows">${Object.keys(arrows).map(k=>`<button type="button" data-command="${k}" aria-label="${names[k]}">${arrows[k]}</button>`).join('')}</div><div class="robot-program" aria-label="Tu programa">${a.program.length?a.program.map((k,i)=>`<button type="button" data-remove="${i}" aria-label="Quitar instrucción ${i+1}: ${names[k]}">${arrows[k]}</button>`).join(''):'<span>Elige las flechas. Toca una del programa para quitarla.</span>'}</div><small>Hasta 8 pasos · Inicio: abajo a la izquierda.</small></div></div>`;
  game.querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>{if(!canInteract())return;if(a.program.length===8){$('#feedback').textContent='Puedes usar hasta ocho pasos. Toca uno para quitarlo.';return;}a.program.push(b.dataset.command);a.robot={x:0,y:2};tap();drawActivity();});
  game.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(!canInteract())return;a.program.splice(+b.dataset.remove,1);a.robot={x:0,y:2};tap();drawActivity();});

 }
 if(item.kind==='sentence'&&item.illustration)game.insertAdjacentHTML('afterbegin',`<img class="sentence-art" src="${item.illustration}" alt="El zapatero ayuda a reparar los frenos">`);
 organizeActivity(item,game);
 activityVoice=item.kind==='who'?item.clues[a.round]:item.instruction;
 updateControls();
}
const patternNames={star:'Estrella',flower:'Flor',diamond:'Diamante',gear:'Engranaje',red:'Rojo',blue:'Azul',yellow:'Amarillo'};
const patterns=[{sequence:['star','flower','star','flower','star'],options:['star','flower','diamond'],answer:1},{sequence:['gear','gear','diamond','gear','gear'],options:['flower','gear','diamond'],answer:2},{sequence:['red','blue','yellow','red','blue'],options:['red','yellow','blue'],answer:1}];
function executeRobot(){
 stopVoice();
 const a=activity,token=epoch;a.locked=true;a.robot={x:0,y:2};drawActivity();let step=0;
 function fail(message){a.locked=false;$('#feedback').textContent=message;$('#feedback').className='is-wrong';playError();updateControls();}
 function tick(){if(epoch!==token||!activity)return;if(step===a.program.length){if(a.robot.x===3&&a.robot.y===0)winActivity();else fail('Revisa las flechas para llegar a la estrella.');return;}const k=a.program[step++];const x=a.robot.x+(k==='R'?1:k==='L'?-1:0),y=a.robot.y+(k==='D'?1:k==='U'?-1:0);if(x<0||x>3||y<0||y>2){fail('El robot llegó al borde. Cambia tu programa.');return;}a.robot={x,y};drawActivity();tap('swap');later(tick,350);}
 if(!a.program.length){fail('Primero añade unas flechas al programa.');return;}later(tick,250);
}
function canInteract(){return !busy&&!activityWin&&!activity?.locked&&!modeDialog.open;}
function checkActivity(){
 if(!canInteract())return;const item=items[pos],a=activity;let correct=false;
 if(item.kind==='pairs'){a.submitted=true;correct=a.matches.every((v,i)=>v===i);drawActivity();}
 else if(item.kind==='order'||item.kind==='sentence')correct=a.order.every((v,i)=>v===i);
 else if(item.kind==='choice')correct=a.selected===item.answer;
 else if(item.kind==='invent')correct=a.selected!==null;
 else if(item.kind==='decision')correct=a.selected!==null;
 else if(item.kind==='pattern')correct=a.selected===patterns[a.round].answer;
 else if(item.kind==='robot'){executeRobot();return;}
 else correct=a.selected===a.round;
 stopVoice();
 if(!correct){$('#feedback').textContent=item.kind==='pairs'?'Revisa las parejas y vuelve a comprobar.':item.kind==='order'?'Revisa qué va primero y prueba de nuevo.':'Prueba otra carta y vuelve a comprobar.';$('#feedback').className='is-wrong';const cards=spread.querySelectorAll('.selected,.answer-incorrect');(cards.length?cards:spread.querySelectorAll('.picture-card')).forEach(b=>{b.classList.remove('answer-wrong');void b.offsetWidth;b.classList.add('answer-wrong');});playError();return;}
 if((item.kind==='who'&&a.round<item.clues.length-1)||(item.kind==='pattern'&&a.round<patterns.length-1)){a.locked=true;$('#feedback').className='is-correct';$('#feedback').textContent='¡Acertaste! Vamos con otra pista.';tap('swap');updateControls();const token=epoch;later(()=>{if(token!==epoch||!activity)return;a.round++;a.selected=null;a.locked=false;drawActivity();$('#feedback').textContent='Elige y comprueba.';$('#feedback').className='';scheduleVoice();},650);return;}
 winActivity();
}
function playError(){loseSound.pause();loseSound.currentTime=0;loseSound.volume=.48;loseSound.onended=()=>musicVolume();loseSound.onerror=()=>musicVolume();loseSound.play().then(()=>musicVolume()).catch(()=>musicVolume());}
function winActivity(){
 activityWin=true;activity.locked=true;loseSound.pause();loseSound.currentTime=0;stopVoice();spread.classList.add('celebrating');$('#feedback').className='is-correct';$('#feedback').textContent='¡Muy bien!';spread.querySelectorAll('.picture-card').forEach(b=>b.disabled=true);updateControls();
 const token=epoch;winSound.pause();winSound.currentTime=0;winSound.volume=.65;
 const advance=()=>{if(epoch!==token||!activityWin||busy||modeDialog.open||endDialog.open)return;move(1,true);};
 const fallback=()=>{if(epoch!==token||!activityWin)return;$('#feedback').textContent='¡Muy bien! Toca Continuar.';const b=$('#check');b.disabled=false;b.textContent='Continuar →';b.onclick=advance;musicVolume();};
 winSound.onended=advance;winSound.onerror=fallback;winSound.play().then(()=>musicVolume()).catch(fallback);
}
function stopVoice(){
 if(pendingNarration){clearTimeout(pendingNarration);pageTimers.delete(pendingNarration);pendingNarration=0;}
 voiceRun++;narrationId='';narrator.onended=null;narrator.onerror=null;narrator.pause();narrator.currentTime=0;narrator.onended=null;window.speechSynthesis?.cancel();activeSpeech=null;$('#voiceStatus').textContent='';musicVolume();
}
function stopEffects(){winSound.onended=null;winSound.onerror=null;winSound.pause();winSound.currentTime=0;loseSound.pause();loseSound.currentTime=0;musicVolume();}
function scheduleVoice(){
 if(narrationMode==='off'||items[pos].type==='cover'||activityWin)return;
 const token=epoch;pendingNarration=later(()=>{pendingNarration=0;if(epoch===token&&!busy)playVoice();},1000);
}
let activeSpeech=null,speechOffset=0;
function playVoice(startAt=0){
 if(narrationMode==='off'||busy||!started||modeDialog.open||endDialog.open||activityWin)return;
 const item=items[pos],token=epoch;stopVoice();
 const src=item.kind==='decision'&&activity?.selected!==null?item.options[activity.selected]?.audio:item.audio;
 if(src){playRecordedAudio(item,src,token);return;}
 if(item.type!=='activity'){$('#voiceStatus').textContent='No hay grabación disponible para esta página.';return;}
 if(item.type==='activity'){
  const fullText=item.type==='activity'?activityVoice:item.text;
  if(!fullText||!window.speechSynthesis||!window.SpeechSynthesisUtterance){$('#voiceStatus').textContent='La voz no está disponible. Puedes leer el texto.';return;}
  const u=new SpeechSynthesisUtterance(fullText.slice(startAt));activeSpeech=u;speechOffset=startAt;u.lang='es-PE';u.rate=.86;u.volume=window.BibliotecaAudio.voice();
  u.onboundary=e=>{if(activeSpeech===u)speechOffset=startAt+e.charIndex;};
  u.onstart=()=>{if(epoch!==token||activeSpeech!==u)return;$('#voiceStatus').textContent=item.type==='activity'?'Escuchando la indicación':'Narrando esta página';musicVolume();updateControls();};
  u.onend=()=>{if(epoch!==token||activeSpeech!==u)return;activeSpeech=null;$('#voiceStatus').textContent='Narración terminada';musicVolume();updateControls();if(item.type!=='activity'&&narrationMode==='auto')move(1);};
  u.onerror=()=>{if(epoch!==token||activeSpeech!==u)return;activeSpeech=null;$('#voiceStatus').textContent='Puedes volver a escuchar.';musicVolume();updateControls();};
  speechSynthesis.speak(u);return;
 }
}
// Una página conserva sus partes en orden; solo la última permite avanzar.
function playRecordedAudio(item,source,token){
 const queue=Array.isArray(source)?source:[source],run=++voiceRun;let part=0;
 if(!queue.length)return;
 narrationId=item.id;
 const valid=()=>run===voiceRun&&epoch===token&&narrationId===item.id&&narrationMode!=='off'&&!busy&&!modeDialog.open&&!endDialog.open;
 function playPart(){
  if(!valid())return;
  narrator.onended=null;narrator.onerror=null;narrator.src=queue[part];narrator.volume=window.BibliotecaAudio.voice();
  const requested=narrator.src;
  narrator.onended=()=>{
   if(!valid())return;
   part++;
   if(part<queue.length){playPart();return;}
   narrator.onended=null;narrator.onerror=null;$('#voiceStatus').textContent='Narración terminada';musicVolume();updateControls();
   if(item.type!=='activity'&&narrationMode==='auto')move(1);
  };
  narrator.onerror=()=>{
   if(!valid())return;
   narrator.onended=null;narrator.onerror=null;
   $('#voiceStatus').textContent='No se pudo abrir '+queue[part].split('/').pop()+'. Puedes volver a escuchar.';
   musicVolume();updateControls();
  };
  narrator.play().then(()=>{
   if(!valid()||narrator.src!==requested)return;
   $('#voiceStatus').textContent=item.kind==='decision'?'Escuchando la opción elegida':`Narrando · parte ${part+1} de ${queue.length}`;
   musicVolume();updateControls();
  }).catch(error=>{
   if(!valid()||narrator.src!==requested)return;
   if(error.name!=='AbortError')$('#voiceStatus').textContent='Pulsa Volver a escuchar para iniciar la grabación.';
   musicVolume();updateControls();
  });
 }
 playPart();
}

function musicVolume(){window.BibliotecaAudio.duck(!narrator.paused||window.speechSynthesis?.speaking||!winSound.paused||!loseSound.paused);}
function ensureMusic(){return window.BibliotecaAudio.ensure();}
function snapshot(side){if(items[pos].type!=='activity')return (side==='right'?right:left).innerHTML;return `<div class="activity-spread activity-snapshot ${side}" data-story="${data.id}" style="${esc(spread.getAttribute('style')||'')}">${spread.innerHTML}</div>`;}
function move(direction,fromWin=false){
 if(busy||!started||modeDialog.open||endDialog.open||(direction>0&&items[pos].type==='activity'&&!fromWin))return;
 if(direction>0&&pos===items.length-1){showEnd();return;}
 const dest=pos+direction;if(dest<0||dest>=items.length)return;
 const oldSnapshot=snapshot(direction>0?'right':'left');busy=true;clearPageTimers();stopVoice();stopEffects();updateControls();
 $('#narrationMenu').open=false;$('#musicMenu').open=false;
 const turn=$('#turn'),front=turn.querySelector('.turn-front'),back=turn.querySelector('.turn-back');front.innerHTML=oldSnapshot;front.inert=true;back.replaceChildren();turn.classList.toggle('reverse',direction<0);turn.style.left=direction>0?'50%':'0';turn.style.transformOrigin=direction>0?'left center':'right center';
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?100:1400;turn.style.setProperty('--duration',duration+'ms');turn.style.display='block';pageRustle();requestAnimationFrame(()=>requestAnimationFrame(()=>turn.classList.add('active')));
 setTimeout(()=>{pos=dest;render();back.innerHTML=snapshot(direction>0?'left':'right');back.inert=true;},duration/2);
 setTimeout(()=>{turn.classList.remove('active','reverse');turn.style.display='none';front.replaceChildren();back.replaceChildren();busy=false;pageReady();},duration+60);
}
function pageReady(){fitText();updateControls();scheduleVoice();}
function start(selectedMode){
 clearPageTimers();stopVoice();stopEffects();readingMode=selectedMode;pos=0;started=true;busy=false;buildItems();if(modeDialog.open)modeDialog.close();if(endDialog.open)endDialog.close();render();pageReady();ensureMusic();
}
function showEnd(){clearPageTimers();stopVoice();stopEffects();endDialog.showModal();}
function closeMenus(except){for(const el of document.querySelectorAll('.toolbar-menu'))if(el!==except)el.open=false;}
for(const el of document.querySelectorAll('.toolbar-menu'))el.addEventListener('toggle',()=>{if(el.open)closeMenus(el);});
for(const b of document.querySelectorAll('[data-narration]'))b.onclick=()=>{
 narrationMode=b.dataset.narration;stopVoice();$('#narrationMenu').open=false;updateControls();if(narrationMode!=='off')scheduleVoice();
};
$('#voicePlayback').onclick=()=>{if(!narrator.paused||window.speechSynthesis?.speaking){stopVoice();updateControls();}else playVoice();};
$('#voiceVolume').value=Math.round(window.BibliotecaAudio.voice()*100);
$('#voiceVolumeValue').textContent=$('#voiceVolume').value+'%';narrator.volume=window.BibliotecaAudio.voice();
$('#voiceVolume').oninput=e=>{window.BibliotecaAudio.setVoice(+e.target.value);narrator.volume=+e.target.value/100;$('#voiceVolumeValue').textContent=e.target.value+'%';if(activeSpeech)activeSpeech.volume=narrator.volume;};
$('#voiceVolume').onchange=()=>{if(window.speechSynthesis?.speaking&&activeSpeech)playVoice(speechOffset);};
$('#prev').onclick=()=>move(-1);$('#next').onclick=()=>move(1);
modeDialog.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));
$('#changeMode').onclick=()=>{if(busy)return;clearPageTimers();stopVoice();const wasWin=activityWin;stopEffects();if(activity)activity.locked=false;if(wasWin){activityWin=false;activity.locked=false;spread.classList.remove('celebrating');spread.querySelectorAll('.picture-card').forEach(b=>b.disabled=false);$('#check').onclick=checkActivity;$('#check').textContent='Comprobar ✓';}$('#resume').hidden=!started;modeDialog.showModal();};
$('#resume').onclick=()=>{modeDialog.close();updateControls();scheduleVoice();ensureMusic();};
modeDialog.addEventListener('cancel',e=>{e.preventDefault();if(started)$('#resume').click();});
$('#restart').onclick=()=>start(readingMode);$('#returnMoral').onclick=()=>endDialog.close();
$('#returnLibrary').onclick=()=>{stopVoice();stopEffects();bgm.pause();};
document.addEventListener('click',e=>{const target=e.target.closest('button,summary');if(!target)return;if(!target.closest('#activitySpread'))tap();if(started)ensureMusic();});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.toolbar-menu'))closeMenus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();return;}if(modeDialog.open||endDialog.open||e.target.closest('button,input,summary,.toolbar-menu'))return;if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}});
window.addEventListener('pagehide',()=>{clearPageTimers();stopVoice();stopEffects();bgm.pause();});
function fitText(){
 const area=right.querySelector('.reading-area');if(!area)return;const text=area.querySelector('.story-text');text.style.fontSize='';
 const base=parseFloat(getComputedStyle(text).fontSize);let font=base;const heading=area.querySelector('.page-title');const needed=()=>heading.offsetHeight+text.scrollHeight+parseFloat(getComputedStyle(area).gap);while(needed()>area.clientHeight+1&&font>base*.7){font-=.2;text.style.fontSize=font+'px';}area.classList.toggle('needs-scroll',needed()>area.clientHeight+1);
}
function fit(){const r=$('#stage').getBoundingClientRect();book.style.width=Math.max(1,Math.min(r.width,r.height*1.6))+'px';fitText();}
if(window.ResizeObserver)new ResizeObserver(fit).observe($('#stage'));window.addEventListener('resize',fit);document.fonts?.ready.then(fitText);
buildItems();render();fit();modeDialog.showModal();ensureMusic();
})();
