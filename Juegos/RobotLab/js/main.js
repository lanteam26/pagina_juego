(()=>{
const app=document.querySelector('#app'),s={mode:'libre',grade:'inicial',level:0,category:'ojos',selected:null,placed:[],layers:['body'],history:[],required:[],unlocked:[],correct:0,errors:0,hints:0,start:0,done:false};
const missions=RL.missions;
const escapeText=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const timeLabel=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;


const buttonIcons={start:'play',help:'help',home:'home','sound-toggle':'sound',back:'backnav',return:'backnav',play:'play',choose:'book',undo:'undo',left:'left',rotate:'rotate',plus:'plus',minus:'minus',front:'front','back-layer':'back',remove:'remove',reset:'reset',finish:'check',again:'reset',levels:'book',next:'arrow','open-challenge-top':'puzzle','next-challenge':'play','open-category':'lock',modes:'backnav'};
const toolNames={undo:'Deshacer',left:'Giro −',rotate:'Giro +',plus:'Tamaño +',minus:'Tamaño −',front:'Capa +','back-layer':'Capa −',remove:'Quitar',reset:'Limpiar'};
const b=(label,id,cls='')=>`<button class="btn ${cls}" id="${id}" title="${label}">${RL.icon(buttonIcons[id]||'arrow')}<span>${cls==='tool'?toolNames[id]:label}</span></button>`;
const store=()=>{try{return JSON.parse(localStorage.getItem('robotlab-tiempo-errores-v6')||'{}')}catch{return {}}};
const persist=data=>{try{localStorage.setItem('robotlab-tiempo-errores-v6',JSON.stringify(data))}catch{}};
const unlocked=item=>s.mode==='libre'?s.unlockedCategories.includes(item.category):s.unlocked.includes(item.id);
const itemBy=id=>RL.itemBy(id),num=()=>Math.round((Date.now()-s.start)/1000);
const clock=()=>{const t=num();return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`};
function shell(content,view='menu'){
  RL.mathDialog.close();if(!view.startsWith('turns')){RL.turns.stop();RL.coop?.stop();}if(view!=='race'&&view!=='race-ready')RL.race.stop();app.dataset.view=view;
  app.innerHTML=`<div class="shell"><header class="nav"><button class="brand" id="brand-home" aria-label="RobotLab, ir al inicio"><span class="brand-mark">${RL.icon('robot')}</span><span class="brand-word">ROBOT<span>LAB</span><small>EL TALLER DE LAS IDEAS</small></span></button><div class="nav-center"><i></i> Aprende jugando. Crea a tu manera.</div><nav class="nav-actions" aria-label="Controles generales">${b('Sonido','sound-toggle','quiet')}${b('Inicio','home','quiet')}</nav></header><main class="screen screen-${view}">${content}</main></div>`;
  document.querySelector('#home').onclick=home;document.querySelector('#brand-home').onclick=home;
  const sound=document.querySelector('#sound-toggle');
  const soundLabel=()=>{const off=RL.soundPreference()==='off';sound.innerHTML=RL.icon(off?'soundoff':'sound')+'<span>Sonido</span>';sound.setAttribute('aria-pressed',String(!off));sound.title=off?'Activar sonido':'Silenciar sonido'};
  soundLabel();sound.onclick=()=>{const on=RL.soundPreference()==='off';RL.setSound(on);soundLabel();if(on)RL.beep(true)};

}
function heading(step,title,copy){return `<div class="screen-heading"><div><div class="eyebrow">${step?'PREPARA TU AVENTURA · PASO '+step+' / 4':'COLECCIÓN DE MISIONES'}</div><h1>${title}</h1><p>${copy}</p></div>${b('Volver','back','quiet')}</div>${step?`<div class="journey">${['Robot','Grado','Nivel','Modo'].map((l,i)=>`<span class="${i+1===step?'active':i+1<step?'passed':''}"><b>${i+1<step?RL.icon('check'):i+1}</b>${l}</span>`).join('')}</div>`:''}`}
function home(){
  s.duel=null;
  shell(`<section class="launch-hero"><div class="launch-copy"><div class="eyebrow"><span class="tiny-pill">JUEGA · APRENDE · CREA</span> TU LABORATORIO CREATIVO</div><h1>Pequeñas ideas.<br><em>Grandes</em><br>creaciones.</h1><p>Un robot, muchas posibilidades. Resuelve retos matemáticos y dale a tu Bee-Bot un estilo tan único como tú.</p><div class="launch-actions">${b('¡Vamos a jugar!','start','primary big')}${b('Cómo se juega','help','quiet big')}</div><div class="launch-proof"><span>${RL.icon('puzzle')} 6 secciones para crear</span><span>${RL.icon('pen')} Aprende a tu ritmo</span></div></div><div class="launch-art"><img class="lab-background" src="assets/ui/lab.svg" alt=""><span class="art-label">BEE-BOT EN SU HÁBITAT CREATIVO</span><img class="hero-bee" src="assets/references/198.png" alt="Bee-Bot con moño morado y ojos de estrella"><div class="art-sticker sticker-one">${RL.icon('star')} Hecho por ti.</div><div class="art-sticker sticker-two"><b>+50</b><span>piezas para<br>imaginar</span></div><div class="bee-shadow"></div></div></section><section class="launch-bottom"><div class="feature-mini"><span class="feature-icon">${RL.icon('puzzle')}</span><div><b>Diseña sin prisas</b><p>6 retos abren tu caja de piezas.</p></div></div><div class="feature-mini"><span class="feature-icon orange">${RL.icon('trophy')}</span><div><b>Acepta una misión</b><p>Construye uno de los 6 modelos.</p></div></div><div class="collection-mini"><div class="mini-bees">${['199','203','205'].map(id=>`<img src="assets/references/${id}.png" alt="">`).join('')}</div><span>¿Cuál será<br><b>tu próxima creación?</b></span></div></section>`,'home');
  document.querySelector('#start').onclick=characters;document.querySelector('#help').onclick=()=>instructions(home);
}
function instructions(back){
  shell(`<div class="screen-heading"><div><div class="eyebrow">MANUAL DEL PEQUEÑO CREADOR</div><h1>Todo listo para imaginar.</h1><p>Elige un modo y dale vida a tu robot.</p></div>${b('Volver','return','quiet')}</div><div class="guide-grid">${[['puzzle','Abre tu caja de piezas','En libre, 6 problemas desbloquean 6 secciones completas. En competitivo, cada pieza se desbloquea con una operación.'],['pen','Piensa y dibuja','Las matemáticas aparecen en un panel con una pizarra para hacer tus cuentas. Elige la respuesta correcta con los botones.'],['layers','Construye capa por capa','En solo y libre puedes añadir hasta 5 copias por pieza. En duelo, las copias son ilimitadas. Muévelas, gíralas y avanza o retrocede una capa por pulsación. El cuerpo también es una capa.'],['trophy','Comparte el desafío','En competitivo puedes jugar solo, en duelo simultáneo o por turnos de 2 a 12 jugadores individuales o hasta 25 integrantes en equipos. Dos jugadores comparten dispositivo y referencia, con operaciones distintas y piezas ilimitadas.']].map(([i,t,d],n)=>`<article><span class="guide-icon">${RL.icon(i)}</span><small>0${n+1}</small><h3>${t}</h3><p>${d}</p></article>`).join('')}</div><div class="menu-actions">${b('¡Entendido, jugar!','play','primary')}</div>`);
  document.querySelector('#return').onclick=back;document.querySelector('#play').onclick=characters;
}
function characters(){
  shell(`${heading(1,'Conoce a tu compañero.','Una gran aventura empieza con un pequeño robot.')}<div class="selection-cards robot-cards"><button class="selection-card available" id="bee"><span class="card-chip">DISPONIBLE</span><div class="card-art peach"><img src="assets/references/198.png" alt="Bee-Bot"></div><div class="card-copy"><span class="eyebrow">LA CURIOSA DEL TALLER</span><h2>Bee-Bot</h2><p>Pequeña, creativa y lista para transformarse contigo.</p><span class="card-cta">Elegir compañero ${RL.icon('arrow')}</span></div></button>${[['Rugged','El explorador de la ciudad','robot'],['Ludio','El viajero de las estrellas','star']].map(([name,desc,icon])=>`<button class="selection-card coming-soon" disabled><span class="card-chip">EN CONSTRUCCIÓN</span><div class="card-art blueprint">${RL.icon(icon)}<span class="blueprint-orbit"></span></div><div class="card-copy"><span class="eyebrow">PRÓXIMAMENTE</span><h2>${name}</h2><p>${desc}. Su aventura llegará más adelante.</p><span class="card-cta">${RL.icon('lock')} Todavía en el laboratorio</span></div></button>`).join('')}</div>`);
  document.querySelector('#back').onclick=home;document.querySelector('#bee').onclick=grades;
}
function grades(){
  shell(`${heading(2,'Cada mente tiene su ritmo.','Elige el grupo de matemáticas con el que quieres jugar.')}<div class="selection-cards grade-cards"><button class="selection-card" data-grade="inicial"><div class="grade-art mint"><span class="number-tile">1</span><span class="number-tile">2</span><span class="number-tile">3</span></div><div class="card-copy"><span class="eyebrow">LOS PRIMEROS DESCUBRIMIENTOS</span><h2>Inicial</h2><p>Números pequeños, sumas y restas para empezar.</p><div class="card-meta">3 niveles <i>·</i> Paso a paso</div><span class="card-cta">¡Por aquí! ${RL.icon('arrow')}</span></div></button><button class="selection-card" data-grade="primaria"><div class="grade-art apricot"><span class="math-tile">+</span><span class="math-tile">×</span><span class="math-tile">÷</span></div><div class="card-copy"><span class="eyebrow">IDEAS CADA VEZ MÁS GRANDES</span><h2>Primaria</h2><p>Multiplica tus ideas con operaciones y nuevos desafíos.</p><div class="card-meta">5 niveles <i>·</i> Nuevos retos</div><span class="card-cta">¡Voy por más! ${RL.icon('arrow')}</span></div></button><button class="selection-card" data-grade="secundaria"><div class="grade-art lilac"><span class="formula-art">x² + y</span></div><div class="card-copy"><span class="eyebrow">EXPLORA NUEVAS SOLUCIONES</span><h2>Secundaria</h2><p>Enteros, fracciones, potencias y álgebra para seguir creando.</p><div class="card-meta">10 niveles <i>·</i> Retos progresivos</div><span class="card-cta">Entrar al laboratorio ${RL.icon('arrow')}</span></div></button></div>`);
  document.querySelector('#back').onclick=characters;document.querySelectorAll('[data-grade]').forEach(el=>el.onclick=()=>{s.grade=el.dataset.grade;levels()});
}
function levels(){
  const bees=['198','199','200','203','205'];
  shell(`${heading(3,'Un pequeño reto. Un gran comienzo.','Elige un nivel de '+s.grade+' para tu aventura.')}<div class="level-grid ${s.grade==='secundaria'?'secondary-levels':''}">${RL.groups[s.grade].map((level,i)=>`<button class="level-card" data-level="${i}"><span class="level-index">${String(i+1).padStart(2,'0')}</span><div class="level-portrait"><img src="assets/references/${bees[i%bees.length]}.png" alt=""></div><span class="eyebrow">NIVEL ${i+1}</span><h2>${level[0]}</h2><p>${store()[s.grade+'-'+i+'-competitivo']!==undefined?'Récord: '+store()[s.grade+'-'+i+'-competitivo']+' puntos':'Una nueva oportunidad para crear.'}</p><span class="card-cta">Explorar ${RL.icon('arrow')}</span></button>`).join('')}</div>`);
  document.querySelector('#back').onclick=grades;document.querySelectorAll('[data-level]').forEach(el=>el.onclick=()=>{s.level=+el.dataset.level;mode()});
}
function turnsCard(id){return `<button class="mode-card turns-choice" id="${id}"><div class="mode-art"><img src="assets/references/198.png" alt="Bee-Bot"></div><div class="mode-copy"><span class="eyebrow">UNA PANTALLA PARA TODOS</span><h2>Por turnos</h2><p>Hasta 12 jugadores individuales o 25 integrantes por equipos. Cada niño juega su tiempo completo.</p><div class="mode-badges"><span>Individual: hasta 12</span><span>Equipos: hasta 25</span></div><span class="card-cta">Preparar turnos</span></div></button>`;}
function openTurns(onMode){
  s.duel=null;
  RL.turns.setup({grade:s.grade,level:s.level,render:(html,view)=>shell(html,view),onMode});
}
function mode(){
  s.duel=null;
  shell(`${heading(4,'¿Qué aventura te apetece hoy?','Diseña, compite o comparte una partida por turnos.')}<div class="mode-cards"><button class="mode-card free-mode" id="free"><div class="mode-art"><span class="mode-art-ring"></span><img src="assets/references/200.png" alt="Bee-Bot con flores"><span class="floating-piece">${RL.sprite('res_162')}</span><span class="floating-piece second">${RL.sprite('res_183')}</span></div><div class="mode-copy"><span class="eyebrow">TU MUNDO, TU ESTILO</span><h2>Diseño libre</h2><p>Resuelve seis problemas, abre toda la caja de piezas y construye algo que solo tú podrías imaginar.</p><div class="mode-badges"><span>6 retos</span><span>Sin cronómetro</span><span>Máximo 5 copias</span></div><span class="card-cta">Entrar al taller ${RL.icon('arrow')}</span></div></button><button class="mode-card competitive-mode" id="competitive"><div class="mode-art"><span class="mode-art-ring"></span><img src="assets/references/202.png" alt="Bee-Bot pirata"><span class="medal-art">${RL.icon('trophy')}</span></div><div class="mode-copy"><span class="eyebrow">PON A PRUEBA TUS IDEAS</span><h2>Competitivo</h2><p>Elige una referencia y consigue todas sus piezas. El tiempo y los errores deciden tu resultado.</p><div class="mode-badges"><span>6 modelos</span><span>Con cronómetro</span><span>Tu mejor récord</span></div><span class="card-cta">Elegir misión ${RL.icon('arrow')}</span></div></button></div>`);
  const cards=document.querySelector('.mode-cards');cards.classList.add('match-cards');cards.insertAdjacentHTML('beforeend',turnsCard('turns-direct'));
  document.querySelector('#turns-direct').onclick=()=>openTurns(mode);
  document.querySelector('#back').onclick=levels;document.querySelector('#free').onclick=()=>start('libre');document.querySelector('#competitive').onclick=competitionType;
}
function competitionType(){
  s.duel=null;s.competition='solo';
  shell(`${heading(0,'¿Cómo quieres competir?','Solo, al mismo tiempo o por turnos.')}<div class="mode-cards match-cards"><button class="mode-card" id="solo-match"><div class="mode-art solo-art"><img src="assets/references/205.png" alt="Bee-Bot vaquero"><span class="match-symbol">${RL.icon('solo')}</span></div><div class="mode-copy"><span class="eyebrow">TU PROPIO DESAFÍO</span><h2>En solitario</h2><p>Elige una misión y supera tu mejor puntuación. Tú marcas el ritmo de tu próximo récord.</p><div class="mode-badges"><span>1 jugador</span><span>Récord personal</span></div><span class="card-cta">Jugar solo ${RL.icon('arrow')}</span></div></button><button class="mode-card duel-choice" id="duel-match"><div class="mode-art duel-art"><img class="duel-bee one" src="assets/references/202.png" alt="Bee-Bot pirata"><span class="versus-symbol">VS</span><img class="duel-bee two" src="assets/references/203.png" alt="Bee-Bot bombero"></div><div class="mode-copy"><span class="eyebrow">UN RETO PARA COMPARTIR</span><h2>Contra un compañero</h2><p>Dos abejas al mismo tiempo, una caja compartida y operaciones distintas. Elijan contra reloj o hasta completar y configuren sus reglas.</p><div class="mode-badges"><span>2 jugadores</span><span>Mismo dispositivo</span><span>Al mismo tiempo</span></div><span class="card-cta">Preparar duelo ${RL.icon('arrow')}</span></div></button></div>`);
  document.querySelector('.match-cards').insertAdjacentHTML('beforeend',turnsCard('turns-match'));
  document.querySelector('#turns-match').onclick=()=>openTurns(competitionType);
  document.querySelector('#back').onclick=mode;
  document.querySelector('#solo-match').onclick=()=>{s.competition='solo';missionPicker()};
  document.querySelector('#duel-match').onclick=duelSetup;
}
function duelSetup(){
  s.competition='duel';s.duel=null;const settings=s.duelOptions||{variant:'timed',durationSeconds:300};
  shell(`${heading(0,'Configuren su próximo desafío.','Dos jugadores a la vez. Elijan cómo se decide la partida.')}<form id="duel-setup" class="duel-setup configurable-duel"><div class="duel-name-panel"><div class="player-name-field player-one"><span class="player-avatar">${RL.icon('solo')}</span><label for="player-one">Jugador 1</label><input id="player-one" name="playerOne" maxlength="18" placeholder="Jugador 1" autocomplete="off"><small>Abeja del lado izquierdo.</small></div><span class="setup-versus">VS</span><div class="player-name-field player-two"><span class="player-avatar">${RL.icon('solo')}</span><label for="player-two">Jugador 2</label><input id="player-two" name="playerTwo" maxlength="18" placeholder="Jugador 2" autocomplete="off"><small>Abeja del lado derecho.</small></div></div><section class="duel-rules match-config"><span class="eyebrow">CONFIGURACIÓN DE LA PARTIDA</span><h2>¿Cómo quieren competir?</h2><fieldset class="duel-variants"><legend class="sr-only">Modalidad de dos jugadores</legend><label class="variant-option"><input type="radio" name="duelVariant" value="timed" ${settings.variant==='timed'?'checked':''}><span>${RL.icon('timer')}<b>Contra reloj</b><small>Cuenta regresiva compartida; se comparan los desbloqueos y errores.</small></span></label><label class="variant-option"><input type="radio" name="duelVariant" value="finish" ${settings.variant==='finish'?'checked':''}><span>${RL.icon('check')}<b>Hasta completar</b><small>Cada uno comprueba al terminar; los resultados se revelan juntos.</small></span></label></fieldset><div class="duel-clock-settings" id="duel-clock-settings"><div class="duration-inputs"><label>Minutos<input type="number" id="duel-minutes" min="0" max="60" step="1" inputmode="numeric" value="${Math.floor(settings.durationSeconds/60)}" required></label><span>:</span><label>Segundos<input type="number" id="duel-seconds" min="0" max="59" step="1" inputmode="numeric" value="${settings.durationSeconds%60}" required></label></div><div class="duration-presets"><button type="button" data-duration="120">2 min</button><button type="button" data-duration="300">5 min</button><button type="button" data-duration="600">10 min</button></div></div><div class="duel-rules-summary" id="duel-rules-summary" aria-live="polite"></div><p class="duel-config-error" id="duel-config-error" role="alert"></p><button class="btn primary" id="duel-pick" type="submit">${RL.icon('arrow')}<span>Elegir la misión</span></button></section></form>`);
  document.querySelector('#back').onclick=competitionType;
  if(s.playerNames){document.querySelector('#player-one').value=s.playerNames[0];document.querySelector('#player-two').value=s.playerNames[1]}
  const refresh=()=>{const timed=document.querySelector('[name="duelVariant"]:checked').value==='timed';document.querySelector('#duel-clock-settings').hidden=!timed;document.querySelectorAll('#duel-clock-settings input').forEach(el=>el.disabled=!timed);document.querySelector('#duel-rules-summary').textContent=timed?'100 puntos por tipo de pieza de la referencia desbloqueado; −20 por error. Las copias no suman puntos. Al llegar a cero se muestran ambos resultados. Empate: más tipos, luego menos errores.':'Cada error suma 15 segundos al tiempo realizado. Gana el menor tiempo ajustado; si empatan, menos errores. El primero espera sin ver resultados hasta que termine el segundo.';document.querySelector('#duel-config-error').textContent=''};
  document.querySelectorAll('[name="duelVariant"]').forEach(el=>el.onchange=refresh);
  document.querySelectorAll('[data-duration]').forEach(el=>el.onclick=()=>{const n=+el.dataset.duration;document.querySelector('#duel-minutes').value=Math.floor(n/60);document.querySelector('#duel-seconds').value=n%60;document.querySelector('#duel-config-error').textContent=''});refresh();
  document.querySelector('#duel-setup').onsubmit=ev=>{ev.preventDefault();const variant=document.querySelector('[name="duelVariant"]:checked').value,minutes=Number(document.querySelector('#duel-minutes').value),seconds=Number(document.querySelector('#duel-seconds').value),durationSeconds=minutes*60+seconds;
    if(variant==='timed'&&(!Number.isInteger(minutes)||!Number.isInteger(seconds)||minutes<0||seconds<0||seconds>59||durationSeconds<1||durationSeconds>3600)){document.querySelector('#duel-config-error').textContent='Elijan un límite de 1 segundo a 60 minutos.';return}
    const names=[document.querySelector('#player-one').value.trim()||'Jugador 1',document.querySelector('#player-two').value.trim()||'Jugador 2'];if(names[0].toLowerCase()===names[1].toLowerCase())names[1]+=' · 2';s.playerNames=names;s.duelOptions={variant,durationSeconds:variant==='timed'?durationSeconds:300};missionPicker();
  };
}
function prepareDuel(){
  s.duel={active:true,simultaneous:true};
  RL.race.prepare({names:s.playerNames||['Jugador 1','Jugador 2'],mission:missions[s.missionIndex??0],options:s.duelOptions||{variant:'timed',durationSeconds:300},grade:s.grade,level:s.level,render:(markup,view)=>shell(markup,view),onMode:()=>{s.duel=null;mode()},onMission:()=>{s.duel=null;missionPicker()}});
}
function missionPicker(){
  shell(`${heading(0,'Seis robots. Seis personalidades.','Elige tu referencia y construye su equipo, pieza por pieza.')}<div class="mission-grid">${missions.map((m,i)=>`<button class="mission-card" data-mission="${i}"><div class="mission-art"><img src="assets/references/${m.image}.png" alt="${m.name}"></div><div class="mission-copy"><span class="eyebrow">MISIÓN 0${i+1}</span><h2>${m.name}</h2><p>${m.requirements.reduce((n,r)=>n+r.count,0)} piezas <i>·</i> Modelo ${m.image}</p><span class="card-cta">Construir ${RL.icon('arrow')}</span></div></button>`).join('')}</div>`);
  document.querySelector('#back').onclick=s.competition==='duel'?duelSetup:competitionType;document.querySelectorAll('[data-mission]').forEach(el=>el.onclick=()=>{s.missionIndex=+el.dataset.mission;if(s.competition==='duel')prepareDuel();else start('competitivo')});
}
function makeChallenge(){return {question:RL.question(s.grade,s.level),solved:false,drawing:[],rejected:[]}}
function start(mode){
  if(mode==='libre')s.duel=null;
  Object.assign(s,{mode,category:'ojos',selected:null,placed:[],layers:['body'],history:[],unlocked:[],unlockedCategories:[],freeStep:0,freeChallenges:[],itemChallenges:{},question:null,pending:null,correct:0,errors:0,hints:0,start:Date.now(),done:false});
  if(mode==='competitivo'){s.mission=missions[s.missionIndex??0];s.required=s.mission.requirements.map(r=>({...r}))}
  else{s.required=[];s.freeChallenges=RL.categories.map(()=>makeChallenge())}
  game();
}
function game(){
  const task=s.mode==='competitivo'?`<div class="mission-heading"><span class="eyebrow">TU REFERENCIA</span><h3>${s.mission.name}</h3></div><div class="reference mission-reference"><img src="assets/references/${s.mission.image}.png" alt="${s.mission.name}"></div><div id="mission-meter" class="meter"><div></div></div><div class="mission-subheading"><b>Piezas necesarias</b><span id="mission-progress"></span></div><div id="mission-checklist" class="mission-checklist scroll-area"></div>`:`<div class="mission-heading"><span class="eyebrow">ABRE TU CAJA CREATIVA</span><h3>Solo 6 problemas.</h3><p>Cada acierto abre una sección completa.</p></div><div class="route-illustration">${RL.icon('puzzle')}<span>Piensa.<br><b>Desbloquea.</b><br>Imagina.</span></div><div class="unlock-track" id="unlock-track"></div><div id="free-progress" class="free-progress"></div>${b('Resolver reto 1 / 6','next-challenge','primary full')}`;
  shell(`<div class="game-top"><div><span class="eyebrow">${s.mode==='libre'?'DISEÑO LIBRE':'COMPETITIVO · EN SOLITARIO'}</span><h1>El taller de Bee-Bot <span>${RL.groups[s.grade][s.level][0]}</span></h1></div><div class="game-top-actions">${s.mode==='competitivo'?`<span class="timer-chip">${RL.icon('timer')}<b id="timer">00:00</b></span>`:b('Retos 0 / 6','open-challenge-top','quiet')}${b('Niveles','choose','quiet')}</div></div><div class="game-grid"><aside class="inventory-panel game-panel"><div class="panel-heading"><span>${RL.icon('puzzle')} Caja de piezas</span><small>Hasta 5 copias</small></div><div id="categories" class="categories"></div><div id="inventory-title" class="inventory-title"></div><div id="inventory" class="inventory scroll-area"></div></aside><section class="workarea"><div class="board-head"><span><i></i> MESA DE CREACIÓN</span><button class="text-button" id="show-layers">${RL.icon('layers')} Capas <span id="placed-count"></span></button></div><div class="board" id="board" tabindex="-1"><div class="board-corner corner-tl"></div><div class="board-corner corner-br"></div><div class="robot-scene" id="robot-scene">${RL.sprite('body_154','base-piece')}</div></div><div class="toolbar" aria-label="Herramientas de la pieza seleccionada">${b('Deshacer','undo','tool')}${b('Girar izquierda','left','tool')}${b('Girar derecha','rotate','tool')}${b('Agrandar','plus','tool')}${b('Reducir','minus','tool')}<i class="tool-divider"></i>${b('Subir una capa','front','tool')}${b('Bajar una capa','back-layer','tool')}${b('Quitar copia','remove','tool')}${b('Limpiar mesa','reset','tool')}</div></section><aside class="side-panel game-panel"><div class="side-tabs" role="tablist" aria-label="Panel del taller"><button role="tab" aria-selected="true" data-side="mission" class="active">${RL.icon(s.mode==='libre'?'puzzle':'trophy')}${s.mode==='libre'?'Tu progreso':'Tu misión'}</button><button role="tab" aria-selected="false" data-side="layers">${RL.icon('layers')}Capas</button></div><section id="side-mission" class="side-content">${task}</section><section id="side-layers" class="side-content" hidden><div class="mission-heading"><span class="eyebrow">DEL FRENTE HACIA EL FONDO</span><h3>Pieza por pieza.</h3><p>Cada pulsación sube o baja una sola capa. El cuerpo también ocupa una posición.</p></div><div id="placed-list" class="placed-list scroll-area"></div></section><div class="side-action">${b(s.mode==='libre'?'Terminar diseño':'Comprobar misión','finish','primary full')}</div></aside></div>`,'game');
  document.querySelector('#choose').onclick=()=>{s.duel=null;levels()};
  ['undo','left','rotate','plus','minus','front','reset'].forEach(id=>document.querySelector('#'+id).onclick=()=>RL.assembly.tool(id));
  document.querySelector('#back-layer').onclick=()=>RL.assembly.tool('back');document.querySelector('#remove').onclick=()=>RL.assembly.remove();
  document.querySelector('#finish').onclick=()=>{if(s.mode==='competitivo')checkWin();else if(s.freeStep===6)finish();else openFreeChallenge()};
  const switchSide=name=>{document.querySelectorAll('[data-side]').forEach(el=>{el.classList.toggle('active',el.dataset.side===name);el.setAttribute('aria-selected',String(el.dataset.side===name))});document.querySelector('#side-mission').hidden=name!=='mission';document.querySelector('#side-layers').hidden=name!=='layers'};
  document.querySelectorAll('[data-side]').forEach(el=>el.onclick=()=>switchSide(el.dataset.side));document.querySelector('#show-layers').onclick=()=>switchSide('layers');
  const next=document.querySelector('#next-challenge');if(next)next.onclick=openFreeChallenge;const top=document.querySelector('#open-challenge-top');if(top)top.onclick=openFreeChallenge;
  drawCategories();drawInventory();RL.drawBoard();updateFreeProgress();stats();updateSelection();
}
function message(text){const box=document.querySelector('#feedback');if(box){box.textContent=text;return}let toast=document.querySelector('#nav-toast');if(!toast){toast=document.createElement('div');toast.id='nav-toast';toast.className='nav-toast';toast.setAttribute('role','status');document.body.appendChild(toast)}toast.textContent=text;clearTimeout(RL.toastTimeout);RL.toastTimeout=setTimeout(()=>toast.remove(),4500)}
function drawCategories(){
  const box=document.querySelector('#categories');if(!box)return;
  box.innerHTML=RL.categories.map(c=>`<button class="category ${s.category===c.id?'selected':''}" data-cat="${c.id}" aria-pressed="${s.category===c.id}"><span>${c.icon}</span><small>${c.label}${s.mode==='libre'?(s.unlockedCategories.includes(c.id)?' ':' '):''}</small></button>`).join('');
  box.querySelectorAll('[data-cat]').forEach(el=>el.onclick=()=>{s.category=el.dataset.cat;drawCategories();drawInventory()});
}
function drawInventory(){
  const box=document.querySelector('#inventory');if(!box)return;
  const cat=RL.categories.find(c=>c.id===s.category),items=RL.items.filter(i=>i.category===s.category);
  document.querySelector('#inventory-title').innerHTML=`<strong>${cat.icon} ${cat.label}</strong><span>${items.filter(unlocked).length}/${items.length}</span>`;
  if(s.mode==='libre'&&!s.unlockedCategories.includes(cat.id)){
    const next=RL.categories[s.freeStep];box.innerHTML=`<div class="category-locked"><span class="locked-art">${RL.icon('lock')}</span><h4>${cat.label}</h4><p>El reto ${RL.categories.indexOf(cat)+1} desbloquea todas las piezas de esta sección.</p><p>Ahora toca: <b>${next.label}</b>.</p>${b('Resolver reto '+(s.freeStep+1)+' / 6 →','open-category','gold')}</div>`;
    box.querySelector('#open-category').onclick=openFreeChallenge;return;
  }
  box.innerHTML=items.map(item=>{const n=s.placed.filter(p=>p.id===item.id).length;return `<button class="piece-btn ${unlocked(item)?'':'locked'} ${n?'onboard':''}" data-id="${item.id}" ${n>=5?'disabled':''}><div class="piece-preview">${RL.sprite(item.id)}${unlocked(item)?'':'<span class="lock">'+RL.icon('lock')+'</span>'}</div><span>${item.name}</span><small>${unlocked(item)?(n>=5?'Máximo · 5/5':'Añadir · '+n+'/5'):'Desbloquear '}</small></button>`}).join('');
  box.querySelectorAll('[data-id]').forEach(el=>el.onclick=()=>{const item=RL.itemBy(el.dataset.id);if(unlocked(item))RL.assembly.equip(item.id);else openItemChallenge(item.id)});
}
function updateFreeProgress(){
  if(s.mode!=='libre')return;const track=document.querySelector('#unlock-track');if(!track)return;
  track.innerHTML=RL.categories.map((cat,i)=>`<div class="unlock-stop ${i<s.freeStep?'complete':i===s.freeStep?'current':''}"><span>${i<s.freeStep?RL.icon('check'):i+1}</span><b>${cat.icon} ${cat.label}</b><small>${i<s.freeStep?'Abierto':i===s.freeStep?'Tu siguiente reto':'Por abrir'}</small></div>`).join('');
  document.querySelector('#free-progress').textContent=s.freeStep+' de 6 problemas resueltos';const next=document.querySelector('#next-challenge');next.disabled=s.freeStep===6;next.innerHTML=RL.icon(s.freeStep===6?'check':'play')+'<span>'+(s.freeStep===6?'Todas las secciones abiertas':'Resolver reto '+(s.freeStep+1)+' / 6')+'</span>';
  document.querySelector('#finish').disabled=s.freeStep<6;const top=document.querySelector('#open-challenge-top');top.innerHTML=RL.icon('puzzle')+'<span>Retos '+s.freeStep+' / 6</span>';top.disabled=s.freeStep===6;
}
function openFreeChallenge(){
  if(s.freeStep>=6){message(' Ya desbloqueaste todas las secciones. ¡Disfruta creando!');return}
  const index=s.freeStep,cat=RL.categories[index],challenge=s.freeChallenges[index];s.question=challenge.question;s.pending=cat.id;
  RL.mathDialog.open({challenge,title:'Reto '+(index+1)+' de 6 · '+cat.label,reward:'Toda la sección de '+cat.label,
    onSolve(){s.correct++;s.freeStep=index+1;s.unlockedCategories.push(cat.id);s.category=cat.id;s.pending=null;drawCategories();drawInventory();updateFreeProgress();stats();message(' '+cat.label+' desbloqueado: puedes usar todas sus piezas.');},
    onWrong(){s.errors++;stats()},onHint(){s.hints++;stats()}});
}
function openItemChallenge(id){
  const item=RL.itemBy(id);if(!s.itemChallenges[id])s.itemChallenges[id]=makeChallenge();const challenge=s.itemChallenges[id];s.pending=id;s.question=challenge.question;
  RL.mathDialog.open({challenge,title:'Desbloquea tu pieza',reward:item.name,
    onSolve(){s.correct++;s.unlocked.push(id);s.pending=null;s.category=item.category;drawCategories();RL.assembly.equip(id);message(' '+item.name+' desbloqueado. Puedes añadir hasta 5 copias.');},
    onWrong(){s.errors++;stats()},onHint(){s.hints++;stats()}});
}
function drawReference(){
  const list=document.querySelector('#mission-checklist');if(!list)return;
  let obtained=0,total=0;
  list.innerHTML=s.required.map(req=>{const item=RL.itemBy(req.id),count=s.placed.filter(p=>p.id===req.id).length;obtained+=Math.min(count,req.count);total+=req.count;return `<button class="check-piece ${count>=req.count?'complete':''}" data-target="${req.id}" aria-label="${item.name}: ${Math.min(count,req.count)} de ${req.count}">${RL.sprite(req.id)}<span>${item.name}</span><b>${Math.min(count,req.count)}/${req.count} ${count>=req.count?'':'+'}</b></button>`}).join('');
  list.querySelectorAll('[data-target]').forEach(el=>el.onclick=()=>{
    const item=RL.itemBy(el.dataset.target);s.category=item.category;drawCategories();drawInventory();document.querySelector('#inventory').scrollTop=0;
  });
  document.querySelector('#mission-meter>div').style.width=(obtained/total*100)+'%';document.querySelector('#mission-progress').textContent=obtained+' / '+total+' piezas colocadas';
}
function updateSelection(){
  const current=s.placed.find(p=>p.uid===s.selected),note=document.querySelector('#selection-note');if(!document.querySelector('#board'))return;
  const i=current?s.layers.indexOf(current.uid):-1;
  if(note)note.textContent=current?RL.itemBy(current.id).name+' · Capa '+(i+1)+' / '+s.layers.length+' · '+(current.layer==='back'?'detrás del cuerpo':'delante del cuerpo'):'Selecciona una copia para editarla.';
  ['left','rotate','plus','minus','remove'].forEach(id=>document.querySelector('#'+id).disabled=!current);
  document.querySelector('#front').disabled=!current||i===s.layers.length-1;document.querySelector('#back-layer').disabled=!current||i===0;
  document.querySelector('#undo').disabled=!s.history.length;document.querySelector('#reset').disabled=!s.placed.length;
  document.querySelector('#placed-count').textContent='('+s.placed.length+')';const list=document.querySelector('#placed-list');
  list.innerHTML=[...s.layers].reverse().map(uid=>{
    if(uid==='body')return `<div class="body-layer"><span class="layer-number">${s.layers.indexOf(uid)+1}</span>${RL.sprite('body_154')}<span><b>Cuerpo de Bee-Bot</b><small>Capa de referencia</small></span>${RL.icon('lock')}</div>`;
    const p=s.placed.find(p=>p.uid===uid),n=s.placed.filter(q=>q.id===p.id).indexOf(p)+1;
    return `<button class="placed-row ${p.uid===s.selected?'selected':''}" data-select="${p.uid}" aria-pressed="${p.uid===s.selected}"><span class="layer-number">${s.layers.indexOf(uid)+1}</span>${RL.sprite(p.id)}<span><b>${RL.itemBy(p.id).name}</b><small>Copia ${n} · ${p.layer==='back'?'detrás':'delante'}</small></span></button>`;
  }).join('');
  list.querySelectorAll('[data-select]').forEach(el=>el.onclick=()=>RL.assembly.select(el.dataset.select));
}
function stats(){
  drawReference();const box=document.querySelector('#stats');if(box)box.textContent=`${s.correct} aciertos ·  ${s.errors} errores ·  ${s.placed.length} piezas`;
  const timer=document.querySelector('#timer');if(timer&&!s.done)timer.textContent=clock();
}
function checkWin(){
  if(s.done)return;const missing=s.required.reduce((n,r)=>n+Math.max(0,r.count-s.placed.filter(p=>p.id===r.id).length),0);
  if(!missing)finish();else{message(' Todavía faltan '+missing+' copias. Mira las cantidades de tu misión.');RL.beep(false)}
}
function finish(){
  if(s.done)return;s.done=true;const elapsed=num(),metrics=RL.scoring.completion(elapsed,s.errors),score=s.mode==='competitivo'?metrics.score:0;
  const stars=s.mode==='libre'?3:score>=900?3:score>=550?2:1;
  const preview=document.querySelector('#robot-scene').cloneNode(true);preview.removeAttribute('id');preview.querySelectorAll('.active').forEach(el=>el.classList.remove('active'));s.preview=preview.outerHTML;
  RL.celebrate();const data=store(),key=s.grade+'-'+s.level+'-'+s.mode;data[key]=Math.max(data[key]||0,score);persist(data);
  shell(`<section class="panel summary"><div class="summary-icon">${RL.icon('trophy')}</div><h2>${s.mode==='competitivo'?'¡Misión cumplida!':'¡Qué bonita creación!'}</h2><div class="stars">${Array.from({length:3},(_,i)=>`<span class="${i<stars?'earned':''}">${RL.icon('star')}</span>`).join('')}</div><div class="creation-preview">${s.preview}</div><p>${s.mode==='competitivo'?'¡Completaste todas las cantidades de la referencia!':'¡Resolviste los 6 retos y tu Bee-Bot tiene un estilo único!'}</p><p class="muted">${s.mode==='competitivo'?timeLabel(elapsed)+' · ':''}${s.correct} aciertos ·  ${s.errors} errores</p>${s.mode==='competitivo'?`<div class="score">${score} puntos</div><p class="small muted">Tiempo ajustado: ${timeLabel(metrics.adjustedSeconds)}. Cada error suma 15 segundos. La posición y las pistas no se califican.</p>`:''}<div class="row" style="justify-content:center">${b(' Repetir','again','alt')}${b(' Niveles','levels','alt')}${b('Siguiente nivel →','next','gold')}</div></section>`);
  document.querySelector('#again').onclick=()=>start(s.mode);document.querySelector('#levels').onclick=levels;document.querySelector('#next').onclick=()=>{s.level=(s.level+1)%RL.groups[s.grade].length;mode()};
}
RL.state=s;RL.message=message;RL.isUnlocked=unlocked;RL.drawInventory=drawInventory;RL.updateStats=stats;
RL.onAssemblyChanged=()=>{drawInventory();stats();updateSelection()};RL.onSelectionChanged=updateSelection;
document.body.addEventListener('click',e=>{const button=e.target.closest('button');if(button&&!button.disabled&&button.id!=='sound-toggle'&&!button.classList.contains('answer'))RL.beep(true)});
document.addEventListener('keydown',e=>{if(document.querySelector('#math-dialog')||!document.querySelector('#board')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(delta&&s.selected){e.preventDefault();RL.assembly.moveSelected(...delta)}});

home();setInterval(()=>{if(document.querySelector('#timer')){const el=document.querySelector('#timer');if(!s.done)el.textContent=clock()}},1000);
})();
