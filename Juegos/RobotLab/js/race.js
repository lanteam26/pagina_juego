RL.race={
  match:null,timer:null,deadlineTimer:null,
  stop(){clearInterval(this.timer);clearTimeout(this.deadlineTimer);this.timer=this.deadlineTimer=null;if(this.match){this.match.active=false;this.match.players.forEach(p=>clearTimeout(p.noticeTimer))}},
  prepare(config){
    this.stop();this.config=config;const players=config.names.map((name,id)=>({name,id,mode:'competitivo',grade:config.grade,level:config.level,placed:[],layers:['body'],history:[],selected:null,unlocked:[],itemChallenges:{},correct:0,errors:0,hints:0,start:0,done:false,pending:null,finishedAt:null}));
    // Disjoint printed-question pools keep the sides different even when they
    // choose different pieces; each saved problem still survives closing/reopening.
    const owner=q=>{let h=2166136261;for(const c of q)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>13)&1};
    RL.items.forEach(item=>players.forEach(p=>{let question=RL.question(config.grade,config.level),tries=0;while(owner(question.q)!==p.id&&tries++<300)question=RL.question(config.grade,config.level);if(owner(question.q)!==p.id){outer:for(let a=2;a<30;a++)for(let b=0;b<a;b++){const q=a+' − '+b;if(owner(q)===p.id){question={q,answer:a-b,options:[a-b,a-b+1,a-b+2]};break outer}}}p.itemChallenges[item.id]={question,solved:false,drawing:[],rejected:[]}}));

    this.match={active:false,players,mission:config.mission,variant:config.options?.variant||'timed',durationSeconds:config.options?.durationSeconds||300,winner:null,started:false,selectedItem:null,revealed:false,deadline:null};
    const names=players.map(p=>this.escape(p.name));
    config.render(`<section class="race-ready"><div class="race-ready-art"><img src="assets/references/${config.mission.image}.png" alt="${config.mission.name}"><span class="versus-symbol">VS</span></div><div class="race-ready-copy"><span class="eyebrow">DUELO SIMULTÁNEO · ${this.match.variant==='timed'?'CONTRA RELOJ':'HASTA COMPLETAR'}</span><h1>Dos abejas.<br>Dos formas de ganar.</h1><div class="race-name-pills"><span>1 · ${names[0]}</span><span>2 · ${names[1]}</span></div><p>La referencia y las piezas necesarias estarán en el centro. Toca una pieza y elige su flecha 1 o 2. Cada jugador tendrá su abeja, sus propias operaciones y su pizarra.</p><ul><li>Las operaciones serán diferentes para cada jugador.</li><li>Las copias de piezas no tienen límite en este duelo.</li>${this.match.variant==='timed'?`<li>Límite compartido: <b>${this.format(this.match.durationSeconds)}</b>. Ambos terminan al llegar a cero.</li><li>100 puntos por tipo desbloqueado de la referencia; −20 por error. Las copias no suman.</li>`:'<li>Cada uno pulsa Comprobar cuando completa la referencia.</li><li>Cada error suma 15 segundos. Menor tiempo ajustado gana; se revela al terminar los dos.</li>'}</ul><div class="race-ready-actions"><button class="btn primary big" id="start-race">${RL.icon('play')}<span>¡Empezar los dos!</span></button><button class="btn quiet" id="back-race">Volver</button></div></div></section>`,'race-ready');
    document.querySelector('#start-race').onclick=()=>this.start();document.querySelector('#back-race').onclick=config.onMission;
  },
  escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
  elapsed(p){return Math.max(0,Math.round(((p.finishedAt||Date.now())-p.start)/1000))},
  format(t){t=Math.max(0,Math.floor(t));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')},
  time(p){return this.format(this.elapsed(p))},
  remaining(){return Math.max(0,Math.ceil((this.match.deadline-Date.now())/1000))},
  piecesUnlocked(p){const ids=new Set(this.match.mission.requirements.map(r=>r.id));return new Set(p.unlocked.filter(id=>ids.has(id))).size},
  canAct(id){const m=this.match;if(!m?.active||m.players[id].done)return false;if(m.variant==='timed'&&Date.now()>=m.deadline){this.finishTimed();return false}return true},
  total(){return this.match.mission.requirements.reduce((n,r)=>n+r.count,0)},
  obtained(p){return this.match.mission.requirements.reduce((n,r)=>n+Math.min(r.count,p.placed.filter(x=>x.id===r.id).length),0)},
  playerMarkup(p){
    const tools=[['undo','undo','Deshacer'],['left','left','Giro −'],['rotate','rotate','Giro +'],['plus','plus','Tamaño +'],['minus','minus','Tamaño −'],['front','front','Capa +'],['back','back','Capa −'],['remove','remove','Quitar'],['reset','reset','Limpiar']];
    return `<section class="race-player player-${p.id+1}" data-player="${p.id}" aria-label="Tablero de ${this.escape(p.name)}"><header class="race-player-heading"><div><span class="race-player-number">${p.id+1}</span><h2>${this.escape(p.name)}</h2></div><span class="race-player-timer" data-timer="${p.id}">${RL.icon('timer')}<b>00:00</b></span><button class="race-layers-toggle" data-layers-toggle="${p.id}" title="Ver capas">${RL.icon('layers')}<span>Capas</span></button></header><div class="race-workspace"><div class="board race-board" id="race-board-${p.id}" tabindex="0" aria-label="Mesa de ${this.escape(p.name)}"><div class="robot-scene" id="race-scene-${p.id}">${RL.sprite('body_154','base-piece')}</div></div><div class="race-player-notice" data-notice="${p.id}" role="status" hidden></div><section class="race-player-math" data-math="${p.id}" aria-label="Operación de ${this.escape(p.name)}" hidden></section><section class="race-layer-panel" data-layer-panel="${p.id}" hidden><div class="race-layer-heading"><h3>Capas de ${this.escape(p.name)}</h3><button class="btn quiet" data-close-layers="${p.id}">Cerrar</button></div><div class="race-layer-list scroll-area" data-layer-list="${p.id}"></div></section><section class="race-player-win" data-win="${p.id}" aria-live="polite" hidden></section></div><div class="race-player-tools" aria-label="Herramientas de ${this.escape(p.name)}">${tools.map(([a,i,l])=>`<button class="btn tool" data-tool="${a}" data-owner="${p.id}" aria-label="${l}, ${this.escape(p.name)}" title="${l}">${RL.icon(i)}<span>${l}</span></button>`).join('')}</div><button class="btn primary race-check" data-check="${p.id}" ${this.match.variant==='timed'?'hidden':''}>${RL.icon('check')}<span>Comprobar · ${this.escape(p.name)}</span></button></section>`;
  },
  start(){
    const m=this.match;m.started=true;m.active=true;const now=Date.now();m.players.forEach(p=>p.start=now);m.deadline=m.variant==='timed'?now+m.durationSeconds*1000:null;
    this.config.render(`<div class="race-title"><h1>Duelo de creadores <span>${m.variant==='timed'?'Contra reloj · Desbloqueos y errores':'Hasta completar · Tiempo y errores'}</span></h1>${m.variant==='timed'?`<div class="race-countdown" id="race-countdown" role="timer" aria-label="Tiempo compartido restante">${RL.icon('timer')}<b>${this.format(m.durationSeconds)}</b></div>`:''}<button class="btn quiet" id="race-exit">Elegir modo</button></div><div class="race-grid">${this.playerMarkup(m.players[0])}<aside class="race-shared game-panel"><header class="race-shared-title">${RL.icon('users')}<span>Piezas compartidas</span></header><div class="race-shared-reference"><img src="assets/references/${m.mission.image}.png" alt="${m.mission.name}"><div><h2>${m.mission.name}</h2><span class="race-progress-one" data-race-progress="0"></span><span class="race-progress-two" data-race-progress="1"></span></div></div><div class="race-verdict" id="race-verdict" role="status" hidden></div><p class="race-live-rule">${m.variant==='timed'?'100 puntos por tipo desbloqueado; −20 por error. Las copias no suman.':'Cada error suma 15 segundos. Resultados ocultos hasta que terminen ambos.'}</p><div class="race-needed-heading">Piezas necesarias <small>Toca una y elige 1 o 2</small></div><div class="race-needed direct-pieces scroll-area" id="race-needed"></div><div class="race-end-actions" id="race-end-actions" hidden><button class="btn primary" id="race-rematch">Revancha</button><button class="btn quiet" id="race-new-mission">Otra misión</button></div></aside>${this.playerMarkup(m.players[1])}</div>`,'race');
    m.players.forEach(p=>{
      p.controller=RL.createAssembly({state:p,scene:()=>document.querySelector('#race-scene-'+p.id),prefix:'p'+p.id,limit:Infinity,canMutate:()=>this.canAct(p.id),isUnlocked:item=>p.unlocked.includes(item.id),message:text=>this.notice(p.id,text),onChange:()=>{this.updateShared();this.updatePlayer(p.id)},onSelection:()=>this.updatePlayer(p.id)});p.controller.draw();
      const pane=document.querySelector(`[data-player="${p.id}"]`);pane.querySelectorAll('[data-tool]').forEach(el=>el.onclick=()=>{if(!this.canAct(p.id))return;el.dataset.tool==='remove'?p.controller.remove():p.controller.tool(el.dataset.tool)});
      pane.querySelector('[data-check]').onclick=()=>this.check(p.id);
      pane.querySelector('[data-layers-toggle]').onclick=()=>{if(p.done)return;this.closeMath(p.id);const layer=pane.querySelector('[data-layer-panel]');layer.hidden=!layer.hidden;this.updatePlayer(p.id)};
      pane.querySelector('[data-close-layers]').onclick=()=>pane.querySelector('[data-layer-panel]').hidden=true;
      pane.querySelector('.board').addEventListener('keydown',ev=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[ev.key];if(d&&p.selected){ev.preventDefault();p.controller.moveSelected(...d)}});
      this.updatePlayer(p.id);
    });
    document.querySelector('#race-exit').onclick=this.config.onMode;
    document.querySelector('#race-rematch').onclick=()=>this.prepare(this.config);
    document.querySelector('#race-new-mission').onclick=this.config.onMission;
    this.updateShared();this.tick();if(m.active){this.timer=setInterval(()=>this.tick(),100);if(m.variant==='timed')this.deadlineTimer=setTimeout(()=>this.finishTimed(),Math.max(0,m.deadline-Date.now()))}
  },
  tick(){const m=this.match;if(!m?.active)return;if(m.variant==='timed'&&Date.now()>=m.deadline){this.finishTimed();return}m.players.forEach(p=>{const el=document.querySelector(`[data-timer="${p.id}"] b`);if(el)el.textContent=p.done?'Listo':m.variant==='timed'?this.format(this.remaining()):this.time(p)});const clock=document.querySelector('#race-countdown');if(clock){clock.querySelector('b').textContent=this.format(this.remaining());clock.classList.toggle('last-seconds',this.remaining()<=30)}},
  notice(id,text){const el=document.querySelector(`[data-notice="${id}"]`);if(!el)return;el.textContent=text;el.hidden=false;clearTimeout(this.match.players[id].noticeTimer);this.match.players[id].noticeTimer=setTimeout(()=>{if(el.isConnected)el.hidden=true},3500)},
  updateShared(){
    const m=this.match,root=document.querySelector('#race-needed');if(!root)return;
    m.players.forEach(p=>{document.querySelector(`[data-race-progress="${p.id}"]`).textContent=(p.id+1)+' · '+(m.variant==='timed'?this.piecesUnlocked(p)+' / '+m.mission.requirements.length+' tipos desbloqueados':this.obtained(p)+' / '+this.total()+' piezas')});
    const scroll=root.scrollTop;
    root.innerHTML=m.mission.requirements.map(r=>{const item=RL.itemBy(r.id),selected=m.selectedItem===r.id;return `<article class="race-direct-piece ${selected?'is-picked':''}"><button class="race-needed-item" data-pick-piece="${r.id}" aria-expanded="${selected}" aria-label="Elegir ${item.name}">${RL.sprite(r.id)}<span>${item.name}</span>${m.players.map(p=>`<b class="player-count-${p.id}">${RL.icon(p.unlocked.includes(r.id)?'check':'lock')}${p.id+1}: ${Math.min(r.count,p.placed.filter(x=>x.id===r.id).length)}/${r.count}</b>`).join('')}</button>${selected?`<div class="race-direct-actions">${m.players.map(p=>`<button class="race-add player-${p.id+1}" data-add-player="${p.id}" data-piece="${r.id}" aria-label="${this.escape(p.name)}: ${p.unlocked.includes(r.id)?'añadir':'desbloquear'} ${item.name}" ${p.done||m.revealed?'disabled':''}>${RL.icon(p.unlocked.includes(r.id)?'plus':'lock')}<span>${p.id===0?'← 1':'2 →'}</span><small>${p.unlocked.includes(r.id)?'Añadir copia':'Resolver'}</small></button>`).join('')}</div>`:''}</article>`}).join('');
    root.scrollTop=scroll;root.querySelectorAll('[data-pick-piece]').forEach(el=>el.onclick=()=>{m.selectedItem=m.selectedItem===el.dataset.pickPiece?null:el.dataset.pickPiece;this.updateShared();root.querySelector(`[data-pick-piece="${el.dataset.pickPiece}"]`).closest('article').scrollIntoView({block:'nearest'})});
    root.querySelectorAll('[data-add-player]').forEach(el=>el.onclick=()=>this.choosePiece(+el.dataset.addPlayer,el.dataset.piece));
  },
  choosePiece(id,itemId){const p=this.match.players[id];if(!this.canAct(id))return;if(p.unlocked.includes(itemId))p.controller.equip(itemId);else this.openMath(id,itemId)},
  openMath(id,itemId){
    const p=this.match.players[id],challenge=p.itemChallenges[itemId],item=RL.itemBy(itemId),pane=document.querySelector(`[data-player="${id}"]`),root=pane.querySelector('[data-math]');if(!this.canAct(id))return;
    pane.querySelector('[data-layer-panel]').hidden=true;p.pending=itemId;root.hidden=false;this.updatePlayer(id);
    root.innerHTML=`<header class="race-math-heading"><div><small>OPERACIÓN DE ${this.escape(p.name)}</small><b>${item.name}</b><span class="race-problem" aria-label="Operación">${challenge.question.q}${challenge.question.q.includes('=')?'':' = ?'}</span></div><button class="btn quiet" data-close-math="${id}" aria-label="Cerrar operación de ${this.escape(p.name)}">${RL.icon('backnav')}<span>Volver</span></button></header><div class="race-scratch-host"></div><div class="race-math-answers">${challenge.question.options.map(v=>`<button class="answer" data-player-answer="${v}" ${challenge.rejected.includes(v)?'disabled':''}>${v}</button>`).join('')}</div><div class="race-math-bottom"><div class="race-math-feedback" role="status"></div><button class="btn quiet" data-player-hint>Una pista</button><button class="btn primary" data-player-continue hidden>Continuar</button></div>`;
    RL.scratch.mount(root.querySelector('.race-scratch-host'),challenge,{compact:true,canDraw:()=>this.canAct(id)});root.querySelector('[data-close-math]').onclick=()=>this.closeMath(id);root.querySelector('[data-player-continue]').onclick=()=>this.closeMath(id);
    root.querySelectorAll('[data-player-answer]').forEach(button=>button.onclick=()=>{
      if(!this.canAct(id)||challenge.solved||button.disabled)return;
      if(+button.dataset.playerAnswer===challenge.question.answer){challenge.solved=true;p.correct++;p.unlocked.push(itemId);p.pending=null;root.querySelectorAll('[data-player-answer]').forEach(el=>el.disabled=true);button.classList.add('correct');root.querySelector('.race-math-feedback').textContent='¡Pieza desbloqueada!';root.querySelector('[data-player-hint]').hidden=true;root.querySelector('[data-player-continue]').hidden=false;RL.beep(true);p.controller.equip(itemId)}
      else{p.errors++;challenge.rejected.push(+button.dataset.playerAnswer);button.disabled=true;button.classList.add('wrong');root.querySelector('.race-math-feedback').textContent='Inténtalo otra vez. Puedes hacer tus cuentas arriba.';RL.beep(false)}
    });
    root.querySelector('[data-player-hint]').onclick=()=>{if(!this.canAct(id))return;const wrong=[...root.querySelectorAll('[data-player-answer]')].find(el=>!el.disabled&&+el.dataset.playerAnswer!==challenge.question.answer);if(wrong){wrong.disabled=true;challenge.rejected.push(+wrong.dataset.playerAnswer);p.hints++;root.querySelector('.race-math-feedback').textContent='Descartamos una opción.'}};
  },
  closeMath(id){const root=document.querySelector(`[data-math="${id}"]`);if(root){root.hidden=true;this.updatePlayer(id)}},
  updatePlayer(id){
    const p=this.match.players[id],pane=document.querySelector(`[data-player="${id}"]`);if(!pane)return;const index=p.selected?p.layers.indexOf(p.selected):-1;
    pane.querySelectorAll('[data-tool]').forEach(el=>{const a=el.dataset.tool;el.disabled=p.done||!pane.querySelector('[data-math]').hidden||(a==='undo'?!p.history.length:a==='reset'?!p.placed.length:!p.selected)||(a==='front'&&index===p.layers.length-1)||(a==='back'&&index===0)});
    const list=pane.querySelector('[data-layer-list]'),scroll=list.scrollTop;
    list.innerHTML=[...p.layers].reverse().map(uid=>uid==='body'?`<div class="body-layer">${RL.sprite('body_154')}<span>Cuerpo de Bee-Bot</span>${RL.icon('lock')}</div>`:(()=>{const piece=p.placed.find(x=>x.uid===uid);return `<button class="placed-row ${p.selected===uid?'selected':''}" data-select-copy="${uid}">${RL.sprite(piece.id)}<span>${RL.itemBy(piece.id).name}</span><small>${piece.layer==='back'?'Detrás':'Delante'}</small></button>`})()).join('');list.scrollTop=scroll;list.querySelectorAll('[data-select-copy]').forEach(el=>el.onclick=()=>p.controller.select(el.dataset.selectCopy));
  },
  capture(id,finishedAt=Date.now()){
    const m=this.match,p=m.players[id];if(p.done)return;p.finishedAt=finishedAt;p.done=true;p.pending=null;this.closeMath(id);document.querySelector(`[data-layer-panel="${id}"]`).hidden=true;document.querySelector(`[data-notice="${id}"]`).hidden=true;clearTimeout(p.noticeTimer);
    const elapsed=this.elapsed(p),metrics=RL.scoring.completion(elapsed,p.errors),piecesUnlocked=this.piecesUnlocked(p),obtained=this.obtained(p),total=this.total(),scene=document.querySelector('#race-scene-'+id).cloneNode(true);scene.removeAttribute('id');scene.querySelectorAll('.active').forEach(el=>el.classList.remove('active'));
    p.result={...metrics,score:m.variant==='timed'?RL.scoring.timed(piecesUnlocked,p.errors):metrics.score,piecesUnlocked,typesTotal:m.mission.requirements.length,hints:p.hints,correct:p.correct,obtained,total,complete:obtained===total,preview:scene.outerHTML};
    const button=document.querySelector(`[data-check="${id}"]`);button.disabled=true;button.querySelector('span').textContent='Listo · '+p.name;this.updatePlayer(id);
  },
  showWaiting(id){const p=this.match.players[id],other=this.match.players[1-id],root=document.querySelector(`[data-win="${id}"]`);root.hidden=false;root.innerHTML=`<div class="race-wait-icon">${RL.icon('timer')}</div><span class="eyebrow">PARTICIPACIÓN GUARDADA</span><h2>¡Listo, ${this.escape(p.name)}!</h2><p>Esperando a ${this.escape(other.name)}.</p><small>Los resultados y el ganador se revelarán cuando terminen los dos.</small>`;root.classList.add('waiting-result');document.querySelector(`[data-timer="${id}"] b`).textContent='Listo'},
  check(id){
    const m=this.match,p=m.players[id];if(!this.canAct(id))return;
    if(m.variant==='timed'){this.notice(id,'La partida termina para ambos cuando el reloj llega a cero.');return}
    const missing=this.total()-this.obtained(p);if(missing){this.notice(id,'Faltan '+missing+' piezas de la referencia.');RL.beep(false);return}
    this.capture(id);this.showWaiting(id);this.updateShared();RL.beep(true);if(m.players.every(p=>p.done))this.resolve();
  },
  finishTimed(){
    const m=this.match;if(!m?.active||m.variant!=='timed')return;
    const remaining=m.deadline-Date.now();if(remaining>0){clearTimeout(this.deadlineTimer);this.deadlineTimer=setTimeout(()=>this.finishTimed(),remaining);return}
    m.active=false;clearInterval(this.timer);clearTimeout(this.deadlineTimer);this.timer=this.deadlineTimer=null;
    m.players.forEach(p=>this.capture(p.id,m.deadline));this.resolve();
  },
  resolve(){
    const m=this.match;if(m.revealed||!m.players.every(p=>p.done))return;m.active=false;m.revealed=true;clearInterval(this.timer);clearTimeout(this.deadlineTimer);this.timer=this.deadlineTimer=null;
    const [a,b]=m.players.map(p=>p.result),comparison=RL.scoring.compare(a,b,m.variant);m.winner=comparison===0?null:comparison>0?0:1;m.draw=comparison===0;
    let reason=m.draw?'Mismo resultado. Comparten la victoria.':m.variant==='timed'?(a.score!==b.score?'Más puntos por desbloqueos y errores.':a.piecesUnlocked!==b.piecesUnlocked?'Desempate por más tipos desbloqueados.':'Desempate por menos errores.'):(a.adjustedSeconds!==b.adjustedSeconds?'Menor tiempo ajustado (tiempo + 15 s por error).':'Desempate por menos errores.');
    const verdict=document.querySelector('#race-verdict');verdict.hidden=false;verdict.innerHTML=`<b>${m.draw?'¡Empate!':'Ganador: '+this.escape(m.players[m.winner].name)}</b><span>${reason}</span>`;
    m.players.forEach(p=>{
      const r=p.result,winner=m.winner===p.id,root=document.querySelector(`[data-win="${p.id}"]`);root.classList.remove('waiting-result');root.hidden=false;
      root.innerHTML=`<div class="race-win-heading"><span class="eyebrow">${m.variant==='timed'?'TIEMPO TERMINADO':'RESULTADOS REVELADOS'}</span><h2>${m.draw?'¡Empate!':winner?'¡Ganaste!':'¡Buen trabajo!'}</h2><b>${this.escape(p.name)}</b></div><div class="race-win-preview">${r.preview}</div><div class="race-win-score">${r.score}<small>puntos</small></div><div class="race-win-metrics"><span>${RL.icon('timer')} ${this.format(r.elapsed)}</span><span>${r.errors} errores</span><span>${r.piecesUnlocked} / ${r.typesTotal} tipos</span><span>${m.variant==='timed'?r.correct+' aciertos':'Ajustado '+this.format(r.adjustedSeconds)}</span></div><p>${m.variant==='timed'?'100 por tipo desbloqueado − 20 por error':r.obtained+' / '+r.total+' piezas · +15 s por error'}</p>`;
      const label=document.querySelector(`[data-check="${p.id}"] span`);label.textContent=m.draw?'Empate':winner?'Ganador · '+p.name:'Resultado final';document.querySelector(`[data-timer="${p.id}"] b`).textContent=m.variant==='timed'?'00:00':this.format(r.elapsed);this.updatePlayer(p.id);
    });
    const clock=document.querySelector('#race-countdown');if(clock){clock.querySelector('b').textContent='00:00';clock.classList.add('time-over')}
    this.updateShared();document.querySelector('#race-end-actions').hidden=false;RL.celebrate();
  }
};
// A suspended tab must enforce its deadline immediately when shown again.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)RL.race.tick()});
window.addEventListener('pageshow',()=>RL.race.tick());
