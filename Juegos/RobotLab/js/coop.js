// Collaborative teams share one assembly and one active-time budget.
// Named members solve one question, arrange the earned pieces, then hand over.
RL.coop = { ...RL.turns, match: null, timer: null,
  start(config, settings, mission) {
    this.stop(); RL.turns.stop(); this.config = config; this.settings = settings;
    const players = settings.entities.map((entity, id) => {
      const p = { id, name: entity.name, teamId: id, teamName: '', members: [...entity.members],
        memberCursor: 0, turns: 0, mode: 'competitivo', grade: config.grade, level: config.level,
        placed: [], layers: ['body'], history: [], selected: null, unlocked: [], itemChallenges: {},
        usedMs: 0, done: false, pending: null,
        memberStats: entity.members.map(name => ({ name, correct: 0, errors: 0, hints: 0, usedMs: 0, turns: 0 })) };
      // Existing exercise/piece modules can count a correct answer for the team,
      // while attributing its delta to the currently named member.
      ['correct', 'errors'].forEach(key => Object.defineProperty(p, key, {
        enumerable: true, get() { return this.memberStats.reduce((n, s) => n + s[key], 0); },
        set(value) { this.memberStats[this.memberCursor][key] += value - this[key]; }
      }));
      Object.defineProperty(p, 'hints', { enumerable: true,
        get() { return this.memberStats[this.memberCursor].hints; },
        set(value) { this.memberStats[this.memberCursor].hints = value; } });
      return p;
    });
    this.match = { ...settings, players, mission, current: 0, orderIndex: 0,
      order: players.map(p => p.id), active: false, revealed: false, mathOpen: false, phase: 'handoff', assignment: null };
    this.handoff();
  },
  prepareTurn(mission) { this.start(this.config, this.settings, mission); },
  pick() {
    this.stop();
    RL.turnSetup.open(this.config, (settings, mission) => { RL.turns.settings = settings; RL.turns.prepareTurn(mission); },
      { draft: RL.turnSetup.draft, step: 3 });
  },
  handoff() {
    const m = this.match, p = m.players[m.current], stats = p.memberStats[p.memberCursor];
    m.phase = 'handoff';
    this.config.render(`<section class="turn-handoff game-panel"><span class="eyebrow">ABEJA COMPARTIDA · CAMBIO DE INTEGRANTE · RELOJ PAUSADO</span><div class="participant-team-label" style="--entrant-color:${RL.turnSetup.color(p.id)}">${this.escape(p.name)}</div><h1>Ahora juega ${this.escape(stats.name)}</h1><p>Primero resuelve un problema. Después acomoda las piezas en la abeja del equipo y pulsa <b>Terminado</b>.</p><p>${m.variant === 'timed' ? 'Tiempo restante del equipo: ' + this.format(Math.max(0, m.durationSeconds - p.usedMs / 1000)) : 'Sigan rotando hasta completar la abeja y que todos hayan participado.'}<br>Pistas de ${this.escape(stats.name)}: ${3 - stats.hints} / 3</p><button class="btn primary big" id="begin-turn">Comenzar · ${this.escape(stats.name)}</button><button class="btn quiet" id="leave-turns">Elegir modo</button></section>`, 'turns-coop');
    document.querySelector('#begin-turn').onclick = () => this.begin();
    document.querySelector('#leave-turns').onclick = this.config.onMode;
  },
  begin() {
    const m = this.match, p = m.players[m.current];
    const requirement = m.mission.requirements.find(r => !p.unlocked.includes(r.id) || p.placed.filter(x => x.id === r.id).length < r.count)
      || m.mission.requirements[p.turns % m.mission.requirements.length];
    m.assignment = requirement; m.phase = 'problem';
    p.itemChallenges[requirement.id] = { question: RL.question(this.config.grade, this.config.level), solved: false, rejected: [], drawing: [] };
    // Render the shared assembly with the existing tools, then cover it with
    // the member's problem before the browser paints the screen.
    RL.turns.begin.call(this);
    this.allowance = m.variant === 'timed' ? Math.max(0, m.durationSeconds * 1000 - p.usedMs) : Infinity;
    if (!m.active) return;
    const equip = p.controller.equip.bind(p.controller);
    p.controller.equip = id => {
      const r = m.mission.requirements.find(r => r.id === id);
      if (m.phase === 'problem' && r && p.placed.filter(x => x.id === id).length >= r.count) return;
      equip(id);
    };
    document.querySelector('.turn-arena').classList.add('cooperative-arena');
    document.querySelector('.race-player-heading h2').innerHTML = this.escape(p.memberStats[p.memberCursor].name) + `<small class="turn-current-member">${this.escape(p.name)} · abeja compartida</small>`;
    document.querySelectorAll('.turn-roster>div').forEach((el, i) => {
      el.querySelector('span').textContent = m.players[i].done ? 'Equipo terminado' : i === p.id ? 'Juega ' + p.memberStats[p.memberCursor].name : 'En espera';
    });
    this.openMath(p.id, requirement.id); this.tick();
  },
  openMath(id, itemId) {
    const m = this.match;
    if (m.phase !== 'problem' || m.assignment?.id !== itemId || !this.canAct(id)) return;
    RL.turns.openMath.call(this, id, itemId);
    if (!m.active) return;
    const p = m.players[id], root = document.querySelector('#turn-math'), challenge = p.itemChallenges[itemId];
    root.classList.add('cooperative-problem');
    root.querySelector('.turn-math-header small').textContent = p.memberStats[p.memberCursor].name + ' · ' + p.name;
    root.querySelector('#turn-close-math').hidden = true;
    root.querySelector('#turn-continue').textContent = 'Acomodar piezas';
    root.querySelectorAll('[data-player-answer]').forEach(button => {
      const answer = button.onclick;
      button.onclick = () => {
        if (!this.canAct(id) || challenge.solved || button.disabled) return;
        answer(); if (!m.active || !challenge.solved) return;
        m.phase = 'arrange'; m.mathOpen = false;
        const r = m.assignment;
        while (p.placed.filter(x => x.id === r.id).length < r.count && this.canAct(id)) p.controller.equip(r.id);
        if (!m.active) return;
        m.mathOpen = true;
        root.querySelector('.turn-math-feedback').textContent = '¡Bien, ' + p.memberStats[p.memberCursor].name + '! Acomoda las piezas y pulsa Terminado para dar paso al siguiente integrante.';
        this.updateShared();
      };
    });
  },
  closeMath(id) {
    if (this.match.phase !== 'arrange') return;
    RL.turns.closeMath.call(this, id);
  },
  updateShared() {
    RL.turns.updateShared.call(this);
    const m = this.match, p = m.players[m.current], root = document.querySelector('#race-needed');
    if (!root) return;
    root.querySelectorAll('[data-turn-piece]').forEach(el => { if (!p.unlocked.includes(el.dataset.turnPiece)) el.disabled = true; });
    document.querySelector('#participant-progress').textContent = this.obtained(p) + ' / ' + this.total() + ' piezas del equipo';
    document.querySelector('#participant-hints').textContent = p.memberStats[p.memberCursor].name + ' · ' + (3 - p.hints) + ' pistas';
    const button = document.querySelector('#end-turn');
    button.textContent = this.readyToFinish(true) ? 'Terminado · finalizar equipo' : 'Terminado · siguiente integrante';
    button.disabled = m.phase !== 'arrange';
  },
  readyToFinish(includeCurrent = false) {
    const m = this.match, p = m.players[m.current];
    return this.obtained(p) === this.total() && p.memberStats.every((s, i) => s.turns > 0 || includeCurrent && i === p.memberCursor && m.phase === 'arrange');
  },
  settle() {
    const m = this.match, p = m.players[m.current], before = p.usedMs;
    RL.turns.settle.call(this);
    p.memberStats[p.memberCursor].usedMs += p.usedMs - before;
  },
  check(id) {
    const m = this.match;
    if (!this.canAct(id) || m.phase !== 'arrange') return;
    const p = m.players[id], r = m.assignment;
    if (p.placed.filter(x => x.id === r.id).length < r.count) { this.notice(id, 'Coloca las ' + r.count + ' piezas de este problema antes de pulsar Terminado.'); return; }
    this.settle(); p.memberStats[p.memberCursor].turns++; p.turns++;
    if (this.readyToFinish()) { this.saveResult(p); this.waitNext(false); return; }
    p.memberCursor = (p.memberCursor + 1) % p.members.length; this.handoff();
  },
  endTurn(expired = false) {
    const m = this.match; if (!m?.active) return;
    const p = m.players[m.current]; this.settle(); p.memberStats[p.memberCursor].turns++; p.turns++;
    this.saveResult(p); this.waitNext(expired);
  },
  waitNext(expired) {
    const m = this.match, p = m.players[m.current], last = m.current === m.players.length - 1;
    this.config.render(`<section class="turn-handoff game-panel"><span class="eyebrow">${expired ? 'TIEMPO DEL EQUIPO TERMINADO' : 'ABEJA DEL EQUIPO COMPLETA'}</span><h1>¡Gracias, ${this.escape(p.name)}!</h1><p>La abeja y los aportes de todos sus integrantes están guardados. Se revelarán al finalizar los equipos.</p><button class="btn primary big" id="next-player">${last ? 'Revelar clasificación' : 'Siguiente equipo'}</button></section>`, 'turns-coop');
    document.querySelector('#next-player').onclick = () => this.next();
  },
  saveResult(p) {
    const m = this.match, elapsed = this.elapsed(p), complete = this.readyToFinish();
    const scene = document.querySelector('#race-scene-' + p.id).cloneNode(true); scene.removeAttribute('id');
    scene.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
    const members = p.memberStats.map(s => {
      const noHintBonus = s.correct > 0 && s.hints === 0 ? 10 : 0;
      const score = 100 * s.correct - 20 * s.errors + noHintBonus;
      return { name: s.name, correct: s.correct, errors: s.errors, hints: s.hints,
        result: { ...s, elapsed: Math.round(s.usedMs / 1000), score, noHintBonus, timeBonus: 0, preview: scene.outerHTML } };
    });
    const timeBonus = complete ? Math.max(0, 30 - Math.floor(elapsed / 10)) : 0;
    const noHintBonus = members.reduce((n, s) => n + s.result.noHintBonus, 0);
    p.done = true;
    p.result = { name: p.name, teamId: p.id, members, score: Math.max(0, members.reduce((n, s) => n + s.result.score, 0) + timeBonus),
      correct: p.correct, errors: p.errors, hints: p.memberStats.reduce((n, s) => n + s.hints, 0),
      elapsed, complete, timeBonus, noHintBonus, preview: scene.outerHTML };
  },
  resolve() {
    const m = this.match; m.active = false; m.revealed = true; clearInterval(this.timer);
    m.ranking = RL.turnScoring.rank(m.players.map(p => p.result));
    RL.turnResults.show(this); RL.celebrate();
  }
};
document.addEventListener('visibilitychange', () => { if (!document.hidden) RL.coop.tick(); });
window.addEventListener('pageshow', () => RL.coop.tick());
