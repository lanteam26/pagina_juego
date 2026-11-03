// Four setup panels, sharing one draft. Rendering never starts a match timer.
RL.turnSetup = {
  open(config, onStart, { draft, step = 0 } = {}) {
    this.config = config; this.onStart = onStart;
    this.draft = draft || RL.turnModel.draft(); this.step = step; this.activeTeam = 0;
    this.error = ''; this.render();
  },
  esc(value) { return RL.race.escape(value); },
  options(from, to, selected) {
    return Array.from({ length: to - from + 1 }, (_, i) => `<option value="${from + i}" ${from + i === selected ? 'selected' : ''}>${from + i}</option>`).join('');
  },
  field(label, id, value, placeholder = '') {
    return `<label class="setup-name" for="${id}"><span>${label}</span><input id="${id}" value="${this.esc(value)}" placeholder="${this.esc(placeholder)}" maxlength="24" autocomplete="off"></label>`;
  },
  formatPanel() {
    const d = this.draft;
    return `<div class="setup-intro"><span class="eyebrow">UNA PANTALLA, MUCHAS IDEAS</span><h2>¿Cómo van a competir?</h2><p>Una persona utiliza la pantalla en cada turno.</p></div><div class="setup-format-grid">${[
      ['individual', 'solo', 'Individual', 'De 2 a 12 jugadores', 'Cada participante conserva su robot, sus piezas y su reloj.'],
      ['teams', 'users', 'Por equipos', 'De 2 a 5 equipos · hasta 12 niños', 'Un robot y un reloj por equipo. Sus integrantes se van alternando.']
    ].map(([value, icon, title, subtitle, text]) => `<button type="button" class="setup-format ${d.format === value ? 'selected' : ''}" data-format="${value}" aria-pressed="${d.format === value}"><span class="setup-choice-icon">${RL.icon(icon)}</span><h3>${title}</h3><b>${subtitle}</b><p>${text}</p><span class="setup-choice-status">${d.format === value ? 'Seleccionado' : 'Elegir formato'}</span></button>`).join('')}</div><div class="setup-tip">${RL.icon('timer')} Los relojes se pausan al cambiar de jugador o equipo.</div>`;
  },
  participantsPanel() {
    const d = this.draft;
    if (d.format === 'individual') return `<div class="setup-panel-title"><div><span class="eyebrow">CADA ROBOT TIENE SU CREADOR</span><h2>Los participantes</h2></div><label class="setup-number">Jugadores<select id="setup-count">${this.options(2, 12, d.count)}</select></label></div><p class="setup-help">Puedes dejar los nombres vacíos: usaremos Jugador 1, Jugador 2…</p><div class="setup-names-grid">${d.names.slice(0, d.count).map((name, i) => this.field(String(i + 1).padStart(2, '0') + ' · Nombre', 'setup-name-' + i, name, 'Jugador ' + (i + 1))).join('')}</div>`;
    const team = d.teams[this.activeTeam];
    return `<div class="setup-panel-title"><div><span class="eyebrow">CREAR, PENSAR Y TURNARSE</span><h2>Organiza los equipos</h2></div><label class="setup-number">Equipos<select id="setup-team-count">${this.options(2, 5, d.teams.length)}</select></label></div><div class="setup-distribution"><span>Distribución rápida</span><button type="button" data-distribution="6,6">6 contra 6</button><button type="button" data-distribution="5,5">5 contra 5</button><button type="button" data-distribution="4,4,4">3 equipos de 4</button></div><div class="setup-team-editor"><nav class="setup-team-tabs" aria-label="Elegir equipo">${d.teams.map((t, i) => `<button type="button" data-edit-team="${i}" class="${i === this.activeTeam ? 'selected' : ''}" aria-pressed="${i === this.activeTeam}"><span class="team-color" style="--team-color:${this.color(i)}">${i + 1}</span><span><b>${this.esc(t.name || 'Equipo ' + (i + 1))}</b><small>${t.members.length} integrantes</small></span></button>`).join('')}</nav><div class="setup-team-fields"><div class="setup-team-header">${this.field('Nombre del equipo', 'setup-team-name', team.name, 'Equipo ' + (this.activeTeam + 1))}<label class="setup-number">Integrantes<select id="setup-member-count">${this.options(1, 11, team.members.length)}</select></label></div><div class="setup-names-grid">${team.members.map((name, i) => this.field('Integrante ' + (i + 1), 'setup-member-' + i, name, 'Integrante ' + (i + 1))).join('')}</div></div></div><p class="setup-help">Cada equipo tendrá un turno por ronda, aunque sus tamaños sean diferentes. Dentro de cada equipo, el orden de esta lista decide quién sigue.</p>`;
  },
  rulesPanel() {
    const d = this.draft, team = d.format === 'teams';
    return `<div class="setup-intro"><span class="eyebrow">MISMAS REGLAS PARA TODOS</span><h2>El ritmo de la partida</h2></div><div class="setup-rule-options">${[
      ['timed', 'timer', 'Contra reloj', '100 puntos por tipo de pieza desbloqueado − 20 por error. Las copias no dan puntos.'],
      ['finish', 'check', 'Hasta completar', 'Cada error añade 15 segundos al tiempo utilizado. Gana el menor tiempo ajustado.']
    ].map(([value, icon, title, text]) => `<button type="button" data-variant="${value}" class="setup-rule ${d.variant === value ? 'selected' : ''}" aria-pressed="${d.variant === value}">${RL.icon(icon)}<span><b>${title}</b><small>${text}</small></span></button>`).join('')}</div><div class="setup-clock-grid">${d.variant === 'timed' ? `<section class="setup-clock"><h3>Tiempo propio por ${team ? 'equipo' : 'jugador'}</h3><p>Se consume únicamente durante sus turnos.</p><label><input id="setup-minutes" type="number" min="1" max="60" step="1" value="${d.minutes}" required><span>minutos</span></label><div class="setup-presets">${[2, 5, 10].map(n => `<button type="button" data-minutes="${n}">${n} min</button>`).join('')}</div></section>` : `<section class="setup-clock"><h3>Tiempo que cuenta</h3><p>Solo se suma el tiempo de los turnos activos. Al completar todas las piezas, pulsa Comprobar. Los resultados permanecen ocultos hasta que terminen todos.</p><div class="setup-clock-note">${RL.icon('timer')} Esperar no consume tiempo.</div></section>`}<section class="setup-clock"><h3>Límite de cada turno</h3><p>Al llegar a cero, pasa al siguiente ${team ? 'equipo' : 'jugador'}.</p><label><input id="setup-seconds" type="number" min="10" max="300" step="1" value="${d.turnSeconds}" required><span>segundos</span></label><div class="setup-presets">${[30, 60, 90].map(n => `<button type="button" data-seconds="${n}">${n} s</button>`).join('')}</div></section></div><div class="setup-tip">${RL.icon('puzzle')} Un problema por turno. Si fallas, podrás reintentarlo en tu próximo turno.</div>`;
  },
  reviewPanel() {
    const d = this.draft, settings = RL.turnModel.settings(d), m = RL.missions[d.missionIndex];
    return `<div class="setup-panel-title"><div><span class="eyebrow">TODO LISTO ANTES DE EMPEZAR</span><h2>Elige la referencia</h2></div><span class="setup-review-count">${settings.participantCount} participantes</span></div><div class="setup-mission-grid">${RL.missions.map((mission, i) => `<button type="button" data-setup-mission="${i}" class="setup-mission ${i === d.missionIndex ? 'selected' : ''}" aria-pressed="${i === d.missionIndex}"><img src="assets/references/${mission.image}.png" alt=""><b>${this.esc(mission.name)}</b></button>`).join('')}</div><div class="setup-review"><h3>Orden de la primera ronda</h3><div class="setup-order">${settings.entities.map((entity, i) => `<span><i style="--team-color:${this.color(i)}">${i + 1}</i><b>${this.esc(entity.name)}</b>${entity.members.length ? `<small>Empieza ${this.esc(entity.members[0])} · ${entity.members.length} integrantes</small>` : ''}</span>`).join('')}</div><p>Referencia común: <b>${this.esc(m.name)}</b>. ${d.format === 'teams' ? 'Cada equipo comparte su robot, sus piezas y sus errores. En la siguiente ronda participa su siguiente integrante.' : 'Cada jugador conserva su propio diseño y sus problemas.'}</p></div>`;
  },
  color(i) { return ['#67ddea', '#bc99ff', '#ffc978', '#84e2b1', '#ff9cba'][i % 5]; },
  render() {
    const d = this.draft, total = RL.turnModel.participants(d), steps = ['Formato', 'Participantes', 'Reglas', 'Referencia'];
    const panels = [() => this.formatPanel(), () => this.participantsPanel(), () => this.rulesPanel(), () => this.reviewPanel()];
    this.config.render(`<header class="setup-heading"><div><span class="eyebrow">COMPETITIVO POR TURNOS</span><h1>Prepara una partida a su medida.</h1></div><button type="button" class="btn quiet" id="setup-exit">Elegir modo</button></header><nav class="setup-steps" aria-label="Pasos de configuración">${steps.map((label, i) => `<button type="button" data-setup-step="${i}" ${i > this.step ? 'disabled' : ''} ${i === this.step ? 'aria-current="step"' : ''}><span>${i < this.step ? '✓' : String(i + 1).padStart(2, '0')}</span><b>${label}</b></button>`).join('')}</nav><div class="setup-layout"><form id="turn-setup" class="setup-card"><div class="setup-scroll" id="setup-panel">${panels[this.step]()}</div><div class="setup-footer"><p id="setup-error" role="alert">${this.esc(this.error)}</p><div><button type="button" class="btn quiet" id="setup-previous">${this.step ? 'Anterior' : 'Volver'}</button><button type="submit" class="btn primary" id="setup-next">${this.step === 3 ? 'Confirmar partida' : 'Continuar'} ${RL.icon('arrow')}</button></div></div></form><aside class="setup-summary"><div class="setup-summary-art"><img src="assets/references/${RL.missions[d.missionIndex].image}.png" alt=""></div><span class="eyebrow">TU PARTIDA</span><h2>${d.format === 'teams' ? 'Juntos, por equipos.' : 'Cada uno, su creación.'}</h2><dl><div><dt>Participantes</dt><dd id="setup-summary-total" class="${total > 12 ? 'over-limit' : ''}">${total} / 12</dd></div><div><dt>Formato</dt><dd>${d.format === 'teams' ? d.teams.length + ' equipos' : 'Individual'}</dd></div><div><dt>Modalidad</dt><dd>${d.variant === 'timed' ? 'Contra reloj' : 'Hasta completar'}</dd></div><div><dt>Tiempo propio</dt><dd id="setup-summary-budget">${d.variant === 'timed' ? d.minutes + ' min' : 'Sin cuenta atrás'}</dd></div><div><dt>Por turno</dt><dd id="setup-summary-turn">${d.turnSeconds} s</dd></div></dl><p>${d.format === 'teams' ? 'Un robot por equipo. Sus integrantes se alternan automáticamente.' : 'Un robot por participante. Solo uno juega en cada turno.'}</p><div class="setup-summary-bottom">${RL.icon('layers')} Piezas, trazos y capas se guardan entre turnos.</div></aside></div>`, 'turns-setup');
    this.bind();
  },
  updateSummary() {
    const d = this.draft, total = RL.turnModel.participants(d);
    const el = document.querySelector('#setup-summary-total');
    el.textContent = total + ' / 12'; el.classList.toggle('over-limit', total > 12);
    document.querySelector('#setup-summary-budget').textContent = d.variant === 'timed' ? d.minutes + ' min' : 'Sin cuenta atrás';
    document.querySelector('#setup-summary-turn').textContent = d.turnSeconds + ' s';
  },
  go(step) { this.step = step; this.error = ''; this.render(); document.querySelector('#setup-panel').scrollTop = 0; },
  bind() {
    const d = this.draft, on = (selector, action) => document.querySelectorAll(selector).forEach(el => action(el));
    document.querySelector('#setup-exit').onclick = this.config.onMode;
    document.querySelector('#setup-previous').onclick = () => this.step ? this.go(this.step - 1) : this.config.onMode();
    on('[data-setup-step]', el => el.onclick = () => this.go(+el.dataset.setupStep));
    on('[data-format]', el => el.onclick = () => { d.format = el.dataset.format; this.render(); });
    on('#setup-count', el => el.onchange = () => { d.count = +el.value; this.render(); });
    on('[id^="setup-name-"]', el => el.oninput = () => { d.names[+el.id.split('-').pop()] = el.value; });
    on('#setup-team-count', el => el.onchange = () => { RL.turnModel.resizeTeams(d, +el.value); this.activeTeam = Math.min(this.activeTeam, d.teams.length - 1); this.render(); });
    on('[data-edit-team]', el => el.onclick = () => { this.activeTeam = +el.dataset.editTeam; this.render(); });
    on('[data-distribution]', el => el.onclick = () => { const counts = el.dataset.distribution.split(',').map(Number); const old = d.teams; d.teams = counts.map((count, i) => ({ name: old[i]?.name || '', members: Array.from({ length: count }, (_, j) => old[i]?.members[j] || '') })); this.activeTeam = 0; this.render(); });
    on('#setup-team-name', el => el.oninput = () => { d.teams[this.activeTeam].name = el.value; document.querySelector(`[data-edit-team="${this.activeTeam}"] b`).textContent = el.value || 'Equipo ' + (this.activeTeam + 1); });
    on('#setup-member-count', el => el.onchange = () => { const t = d.teams[this.activeTeam]; t.members = Array.from({ length: +el.value }, (_, j) => t.members[j] || ''); this.render(); });
    on('input[id^="setup-member-"]', el => el.oninput = () => { d.teams[this.activeTeam].members[+el.id.split('-').pop()] = el.value; });
    on('[data-variant]', el => el.onclick = () => { d.variant = el.dataset.variant; this.render(); });
    on('#setup-minutes', el => el.oninput = () => { d.minutes = Number(el.value); this.updateSummary(); });
    on('#setup-seconds', el => el.oninput = () => { d.turnSeconds = Number(el.value); this.updateSummary(); });
    on('[data-minutes]', el => el.onclick = () => { d.minutes = +el.dataset.minutes; this.render(); });
    on('[data-seconds]', el => el.onclick = () => { d.turnSeconds = +el.dataset.seconds; this.render(); });
    on('[data-setup-mission]', el => el.onclick = () => { d.missionIndex = +el.dataset.setupMission; this.render(); });
    document.querySelector('#turn-setup').onsubmit = event => {
      event.preventDefault(); const errors = RL.turnModel.errors(d, this.step);
      if (errors.length) { document.querySelector('#setup-error').textContent = errors[0]; return; }
      if (this.step < 3) { this.go(this.step + 1); return; }
      this.onStart(RL.turnModel.settings(d), RL.missions[d.missionIndex]);
    };
  }
};
