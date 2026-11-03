// Full, sequential participations. Teams alternate children and sum their scores.
RL.turns = { ...RL.race, match: null, timer: null, deadlineTimer: null,
  setup(config) {
    this.stop(); this.config = config;
    RL.turnSetup.open(config, (settings, mission) => { this.settings = settings; this.prepareTurn(mission); });
  },
  pick() {
    this.stop();
    RL.turnSetup.open(this.config, (settings, mission) => { this.settings = settings; this.prepareTurn(mission); },
      { draft: RL.turnSetup.draft, step: 3 });
  },
  prepareTurn(mission) {
    this.stop();
    const players = RL.turnModel.schedule(this.settings).map((entry,id)=>({
      ...entry,id,mode:'competitivo',grade:this.config.grade,level:this.config.level,
      placed:[],layers:['body'],history:[],selected:null,unlocked:[],itemChallenges:{},
      correct:0,errors:0,hints:0,usedMs:0,done:false,pending:null
    }));
    const order = players.map(p=>p.id);
    RL.items.forEach(item => {
      const used = new Set();
      players.forEach(p => {
        let question;
        for (let n = 0; n < 500; n++) { question = RL.question(this.config.grade, this.config.level); if (!used.has(question.q)) break; }
        used.add(question.q);
        p.itemChallenges[item.id] = { question, solved: false, rejected: [], drawing: [] };
      });
    });
    this.match = { ...this.settings, players, mission, order, orderIndex: 0,
      current: order[0], active: false, revealed: false, turnStart: null, mathOpen: false };
    this.handoff();
  },
  elapsed(p) {
    const m = this.match;
    const running = m.active && m.current === p.id ? Math.min(Date.now() - m.turnStart, this.allowance) : 0;
    return Math.max(0, Math.round((p.usedMs + running) / 1000));
  },
  canAct(id) {
    const m = this.match;
    if (!m?.active || m.current !== id || m.players[id].done) return false;
    if (m.variant === 'timed' && Date.now() - m.turnStart >= this.allowance) { this.endTurn(true); return false; }
    return true;
  },
  handoff() {
    const m = this.match, p = m.players[m.current];
    this.config.render(`<section class="turn-handoff game-panel"><span class="eyebrow">PARTICIPACIÓN ${m.orderIndex + 1} DE ${m.players.length} · RELOJ EN PAUSA</span>${p.teamName ? `<div class="participant-team-label" style="--entrant-color:${RL.turnSetup.color(p.teamId)}">${this.escape(p.teamName)}</div>` : ''}<h1>Ahora juega ${this.escape(p.name)}</h1><img src="assets/references/${m.mission.image}.png" alt="Referencia"><p>${m.variant === 'timed' ? `Tienes ${this.format(m.durationSeconds)} seguidos para resolver problemas y construir tu abeja.` : 'Resuelve los problemas y completa tu abeja. Se registrará el tiempo que utilices.'}</p><p>Hasta 3 pistas. Resuelve varios problemas durante tu participación.<br>${p.teamName ? 'Tus puntos se sumarán a los de tu equipo.' : 'Tu resultado permanecerá oculto hasta que terminen todos.'}</p><button class="btn primary big" id="begin-turn">Comenzar mi participación</button><button class="btn quiet" id="leave-turns">Elegir modo</button></section>`, 'turns');
    document.querySelector('#begin-turn').onclick = () => this.begin();
    document.querySelector('#leave-turns').onclick = this.config.onMode;
  },
  begin() {
    const m = this.match, p = m.players[m.current];
    m.turnStart = Date.now(); m.active = true; m.mathOpen = false;
    this.allowance = m.variant === 'timed' ? m.durationSeconds * 1000 : Infinity;
    this.config.render(`<div class="turn-roster" aria-label="Orden de participación">${m.order.map(id => {
      const x = m.players[id];
      return `<div class="${id === p.id ? 'current' : ''}" style="--entrant-color:${RL.turnSetup.color(x.teamId ?? id)}"><b>${this.escape(x.name)}</b><span>${x.done ? 'Participación guardada' : id === p.id ? 'Jugando ahora' : 'En espera'}${x.teamName ? ' · ' + this.escape(x.teamName) : ''}</span></div>`;
    }).join('')}</div><div class="turn-arena full-participation">${this.playerMarkup(p)}<aside class="race-shared game-panel"><button class="turn-reference-large" id="turn-reference" aria-label="Ampliar referencia ${this.escape(m.mission.name)}">${this.referenceMarkup(m.mission)}<span>${this.escape(m.mission.name)} <small>Ampliar referencia</small></span></button><div class="participant-live"><b data-participant-clock role="timer"></b><span id="participant-progress"></span><span id="participant-hints"></span></div><div id="race-needed" class="race-needed scroll-area"></div><button class="btn primary" id="end-turn">Comprobar y finalizar</button><button class="btn quiet" id="leave-turns">Elegir modo</button></aside><section class="turn-math" id="turn-math" aria-label="Resolver problema" hidden></section></div>`, 'turns');
    p.controller = RL.createAssembly({ state: p, scene: () => document.querySelector('#race-scene-' + p.id),
      prefix: 'turn' + p.id, limit: Infinity, canMutate: () => this.canAct(p.id) && !m.mathOpen,
      isUnlocked: item => p.unlocked.includes(item.id), message: text => this.notice(p.id, text),
      onChange: () => { this.updateShared(); this.updatePlayer(p.id); }, onSelection: () => this.updatePlayer(p.id) });
    p.controller.draw();
    const pane = document.querySelector('[data-player]');
    if (p.teamName) pane.querySelector('.race-player-heading h2').innerHTML = this.escape(p.name) + `<small class="turn-current-member">${this.escape(p.teamName)}</small>`;
    pane.querySelectorAll('[data-tool]').forEach(el => el.onclick = () => {
      if (!this.canAct(p.id) || m.mathOpen) return;
      el.dataset.tool === 'remove' ? p.controller.remove() : p.controller.tool(el.dataset.tool);
    });
    const check = pane.querySelector('[data-check]'); check.hidden = true;
    pane.querySelector('[data-layers-toggle]').onclick = () => {
      if (!this.canAct(p.id)) return;
      const layers = pane.querySelector('[data-layer-panel]'); layers.hidden = !layers.hidden; this.updatePlayer(p.id);
    };
    pane.querySelector('[data-close-layers]').onclick = () => pane.querySelector('[data-layer-panel]').hidden = true;
    document.querySelector('#end-turn').onclick = () => this.check(p.id);
    document.querySelector('#leave-turns').onclick = this.config.onMode;
    document.querySelector('#turn-reference').onclick = () => this.showReference();
    document.querySelector('.turn-roster .current')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    this.updateShared(); this.updatePlayer(p.id); this.tick();
    clearInterval(this.timer); this.timer = setInterval(() => this.tick(), 100);
  },
  referenceMarkup(mission) {
    const bounds={198:[0,66,720,542],199:[0,104,720,528],200:[0,77,706,547],202:[0,26,720,623],203:[0,0,720,649],205:[0,63,693,506]};
    const view=bounds[mission.image]||[0,0,720,720];
    return `<svg class="participant-reference-art" viewBox="${view.join(' ')}" role="img" aria-label="${this.escape(mission.name)}"><image href="assets/references/${mission.image}.png" width="720" height="720"/></svg>`;
  },
  showReference() {
    if (!this.match?.active || !this.canAct(this.match.current)) return;
    document.querySelector('#turn-reference-dialog')?.remove();
    const m = this.match, dialog = document.createElement('dialog'); dialog.id = 'turn-reference-dialog';
    dialog.className = 'turn-reference-dialog';
    dialog.innerHTML = `<header><h2>${this.escape(m.mission.name)}</h2><button class="btn quiet">Volver al juego</button></header><img src="assets/references/${m.mission.image}.png" alt="Referencia ampliada"><p>El reloj continúa mientras miras la referencia.</p>`;
    document.body.appendChild(dialog); dialog.querySelector('button').onclick = () => dialog.close();
    dialog.addEventListener('close', () => dialog.remove(), { once: true }); dialog.showModal();
  },
  updateShared() {
    const m = this.match, p = m.players[m.current], root = document.querySelector('#race-needed');
    if (!root) return;
    const scroll = root.scrollTop;
    root.innerHTML = m.mission.requirements.map(r => {
      const item = RL.itemBy(r.id), unlocked = p.unlocked.includes(r.id);
      return `<button class="race-needed-item" data-turn-piece="${r.id}">${RL.sprite(r.id)}<span>${item.name}<small>${unlocked ? 'Añadir copia' : 'Resolver problema'}</small></span><b>${Math.min(r.count, p.placed.filter(x => x.id === r.id).length)}/${r.count}</b></button>`;
    }).join('');
    root.scrollTop = scroll;
    root.querySelectorAll('[data-turn-piece]').forEach(el => el.onclick = () => {
      if (!this.canAct(p.id)) return;
      const id = el.dataset.turnPiece;
      if (p.unlocked.includes(id)) p.controller.equip(id); else this.openMath(p.id, id);
    });
    document.querySelector('#participant-progress').textContent = p.correct + ' / ' + m.mission.requirements.length + ' problemas resueltos';
    document.querySelector('#participant-hints').textContent = 'Pistas disponibles: ' + (RL.turnScoring.maxHints - p.hints) + ' / 3';
  },
  openMath(id, itemId) {
    if (!this.canAct(id)) return;
    const m = this.match, p = m.players[id], challenge = p.itemChallenges[itemId], item = RL.itemBy(itemId);
    if (challenge.solved) return;
    m.mathOpen = true; p.pending = itemId;
    document.querySelector(`[data-layer-panel="${id}"]`).hidden = true;
    const root = document.querySelector('#turn-math'); root.hidden = false;
    root.innerHTML = `<header class="turn-math-header"><div><small>${this.escape(p.name)}${p.teamName ? ' · ' + this.escape(p.teamName) : ''}</small><h2>${item.name}</h2></div><b data-participant-clock></b><button class="btn quiet" id="turn-close-math">Volver al taller</button></header><div class="turn-math-layout"><section class="turn-exercise"><span class="eyebrow">RESUELVE Y ELIGE</span><div class="turn-equation">${challenge.question.q}${challenge.question.q.includes('=') ? '' : ' = ?'}</div><div class="turn-answer-options">${challenge.question.options.map(value => `<button class="answer" data-player-answer="${value}" ${challenge.rejected.includes(value) ? 'disabled' : ''}>${value}</button>`).join('')}</div><p class="turn-math-feedback" role="status"></p><button class="btn quiet" id="turn-hint"></button><button class="btn primary" id="turn-continue" hidden>Seguir creando</button><button class="turn-math-reference" id="math-reference">${this.referenceMarkup(m.mission)}<span>Ampliar referencia</span></button></section><section class="turn-scratch-panel"><div class="scratch-heading"><h3>Mi pizarra</h3><span>Espacio libre para tus cuentas</span></div><div id="turn-scratch-host" class="scratch-host"></div></section></div>`;
    RL.scratch.mount(root.querySelector('#turn-scratch-host'), challenge, { canDraw: () => this.canAct(id) && m.mathOpen });
    root.querySelector('#turn-close-math').onclick = () => this.closeMath(id);
    root.querySelector('#math-reference').onclick = () => this.showReference();
    root.querySelector('#turn-continue').onclick = () => this.closeMath(id);
    root.querySelectorAll('[data-player-answer]').forEach(button => button.onclick = () => {
      if (!this.canAct(id) || challenge.solved || button.disabled) return;
      if (+button.dataset.playerAnswer === challenge.question.answer) {
        challenge.solved = true; p.correct++; p.unlocked.push(itemId);
        root.querySelectorAll('[data-player-answer]').forEach(el => el.disabled = true);
        button.classList.add('correct'); root.querySelector('.turn-math-feedback').textContent = '¡Muy bien! Pieza desbloqueada. Puedes resolver otro problema.';
        root.querySelector('#turn-hint').hidden = true; root.querySelector('#turn-continue').hidden = false;
        // Let the controller add the earned piece before returning to the drawing view.
        m.mathOpen = false; p.controller.equip(itemId); if(!m.active)return; m.mathOpen = true; RL.beep(true);
      } else {
        p.errors++; challenge.rejected.push(+button.dataset.playerAnswer); button.disabled = true;
        button.classList.add('wrong'); root.querySelector('.turn-math-feedback').textContent = 'Esa no es. Puedes volver a intentarlo y usar tu pizarra.'; RL.beep(false);
      }
      this.updateShared(); this.updateHintButton();
    });
    root.querySelector('#turn-hint').onclick = () => {
      if (!this.canAct(id) || challenge.solved || p.hints >= RL.turnScoring.maxHints) return;
      const wrong = [...root.querySelectorAll('[data-player-answer]')].find(el => !el.disabled && +el.dataset.playerAnswer !== challenge.question.answer);
      if (!wrong) { root.querySelector('.turn-math-feedback').textContent = 'Solo queda la respuesta correcta. No gastamos una pista.'; return; }
      p.hints++; challenge.rejected.push(+wrong.dataset.playerAnswer); wrong.disabled = true;
      root.querySelector('.turn-math-feedback').textContent = 'Descartamos una opción. Te quedan ' + (3 - p.hints) + ' pistas.';
      this.updateShared(); this.updateHintButton();
    };
    this.updateHintButton(); this.updatePlayer(id); this.tick();
  },
  updateHintButton() {
    const p = this.match.players[this.match.current], button = document.querySelector('#turn-hint');
    if (!button) return;
    button.disabled = p.hints >= 3;
    button.textContent = p.hints >= 3 ? 'Sin pistas disponibles · 0 / 3' : 'Usar pista · ' + (3 - p.hints) + ' / 3';
  },
  closeMath(id) {
    const root = document.querySelector('#turn-math'); if (root) root.hidden = true;
    if (this.match) this.match.mathOpen = false;
    this.updatePlayer(id);
  },
  updatePlayer(id) {
    RL.race.updatePlayer.call(this, id);
    if (this.match.mathOpen) document.querySelectorAll(`[data-player="${id}"] [data-tool]`).forEach(el => el.disabled = true);
  },
  tick() {
    const m = this.match; if (!m?.active) return;
    if (m.variant === 'timed' && Date.now() - m.turnStart >= this.allowance) { this.endTurn(true); return; }
    const p = m.players[m.current], text = m.variant === 'timed' ? this.format(Math.ceil((this.allowance - (Date.now() - m.turnStart)) / 1000)) : this.time(p);
    document.querySelectorAll('[data-participant-clock]').forEach(el => el.textContent = text);
    const boardClock = document.querySelector(`[data-timer="${p.id}"] b`); if (boardClock) boardClock.textContent = text;
  },
  settle() {
    const m = this.match;
    if (m.active) { m.players[m.current].usedMs += Math.max(0, Math.min(Date.now() - m.turnStart, this.allowance)); m.active = false; }
    m.mathOpen = false; clearInterval(this.timer); this.timer = null;
    document.querySelector('#turn-reference-dialog')?.remove();
  },
  saveResult(p) {
    const m = this.match, complete = this.obtained(p) === this.total(), elapsed = this.elapsed(p);
    const scene = document.querySelector('#race-scene-' + p.id).cloneNode(true); scene.removeAttribute('id');
    scene.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
    p.done = true;
    p.result = { ...RL.turnScoring.calculate({ correct: p.correct, errors: p.errors, hints: p.hints, elapsed, complete }),
      correct: p.correct, errors: p.errors, hints: p.hints, elapsed, complete, preview: scene.outerHTML };
  },
  endTurn(expired = false) {
    const m = this.match; if (!m?.active) return;
    this.settle(); this.saveResult(m.players[m.current]); this.waitNext(expired);
  },
  waitNext(expired) {
    const m = this.match, p = m.players[m.current], last = m.orderIndex === m.order.length - 1;
    this.config.render(`<section class="turn-handoff game-panel"><span class="eyebrow">${expired ? 'TIEMPO TERMINADO' : 'PARTICIPACIÓN TERMINADA'}</span><h1>¡Gracias, ${this.escape(p.name)}!</h1><p>Tu resultado está guardado y permanece oculto hasta que terminen todos.</p><button class="btn primary big" id="next-player">${last ? 'Revelar clasificación' : 'Siguiente jugador'}</button></section>`, 'turns');
    document.querySelector('#next-player').onclick = () => this.next();
  },
  next() {
    const m = this.match;
    if (m.players.every(p => p.done)) { this.resolve(); return; }
    m.orderIndex++; m.current = m.order[m.orderIndex]; this.handoff();
  },
  check(id) {
    if (!this.canAct(id)) return;
    const p = this.match.players[id], missing = this.total() - this.obtained(p);
    if (missing) { this.notice(id, 'Faltan ' + missing + ' piezas. '+(this.match.variant==='timed'?'Sigue resolviendo o espera a que termine tu tiempo.':'Sigue resolviendo y colocando tus piezas.')); return; }
    this.endTurn(false);
  },
  resultCard(row, team = false) {
    const details = team ? `<details class="turn-member-results"><summary>${row.members.length} participantes · ver suma del equipo</summary>${row.members.map(p => `<div><b>${this.escape(p.name)} · ${p.result.score} puntos</b><span>${p.correct} problemas · ${p.errors} errores · ${p.hints} pistas · ${this.format(p.result.elapsed)}</span><span>Rapidez +${p.result.timeBonus} · Sin pistas +${p.result.noHintBonus}</span></div>`).join('')}</details>` : `<div class="race-win-preview">${row.preview}</div>`;
    return `<article class="game-panel turn-result podium-place place-${Math.min(row.rank, 4)}"><div class="podium-emblem">${RL.turnScoring.crown(row.rank)}<span>${row.rank}º puesto</span></div><h2>${this.escape(row.name)}</h2><div class="podium-score">${row.score}<small>puntos${team ? ' del equipo' : ''}</small></div><p>${row.correct} problemas resueltos · ${row.errors} errores</p><p>${row.hints} / ${team ? row.members.length * 3 : 3} pistas · Tiempo ${this.format(row.elapsed)}</p><div class="podium-bonuses"><span>Rapidez +${row.timeBonus}</span><span>Sin ayuda +${row.noHintBonus}</span></div>${details}</article>`;
  },
  resolve() {
    const m = this.match; m.active = false; m.revealed = true; clearInterval(this.timer);
    const rows = m.format === 'teams' ? RL.turnScoring.teams(m.entities, m.players) : m.players.map(p => ({ name: p.name, ...p.result }));
    m.ranking = RL.turnScoring.rank(rows);
    this.config.render(`<div class="screen-heading"><div><span class="eyebrow">TODAS LAS PARTICIPACIONES TERMINARON</span><h1>${m.format === 'teams' ? 'Clasificación de equipos' : 'Clasificación de jugadores'}</h1></div><button class="btn quiet" id="leave-turns">Elegir modo</button></div><p class="podium-explanation">${m.format === 'teams' ? 'El puntaje de cada equipo es la suma de sus integrantes. ' : ''}Igual puntaje, mismo puesto. No se evalúa el parecido visual de la abeja.</p><div class="turn-results podium-results">${m.ranking.map(row => this.resultCard(row, m.format === 'teams')).join('')}</div><div class="menu-actions"><button class="btn primary" id="turn-rematch">Revancha</button><button class="btn quiet" id="turn-new">Configurar otra partida</button></div>`, 'turns-results');
    document.querySelector('#leave-turns').onclick = this.config.onMode;
    document.querySelector('#turn-rematch').onclick = () => this.prepareTurn(m.mission);
    document.querySelector('#turn-new').onclick = () => this.pick(); RL.celebrate();
  },
  stop() {
    clearInterval(this.timer); this.timer = null;
    if (this.match) { this.match.active = false; this.match.players.forEach(p => clearTimeout(p.noticeTimer)); }
    document.querySelector('#turn-reference-dialog')?.remove();
  }
};
document.addEventListener('visibilitychange', () => { if (!document.hidden) RL.turns.tick(); });
window.addEventListener('pageshow', () => RL.turns.tick());
