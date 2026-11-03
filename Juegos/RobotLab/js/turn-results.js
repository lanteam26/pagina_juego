// One large bee at a time, starting with the winner. Used by both team formats.
RL.turnResults = {
  show(engine, index = 0, memberIndex = null) {
    const m = engine.match, rows = m.ranking;
    index = Math.max(0, Math.min(rows.length - 1, index));
    const row = rows[index], members = row.members || [];
    const shared = m.teamStyle === 'shared';
    const representative = members.length ? members.reduce((best,p,i)=>p.result.score>members[best].result.score?i:best,0) : 0;
    if (memberIndex === null) memberIndex = -1;
    const member = members.length && memberIndex >= 0 ? members[memberIndex] : null;
    const beeMember = member || members[representative];
    const preview = shared ? row.preview : beeMember ? beeMember.result.preview : row.preview;
    const detail = member ? member.result : row;
    const isTeam = m.format === 'teams';
    engine.config.render(`<header class="result-gallery-heading"><div><span class="eyebrow">RESULTADOS FINALES · ${index + 1} DE ${rows.length}</span><h1>${isTeam ? 'Las abejas de los equipos' : 'Las abejas de los creadores'}</h1></div><button class="btn quiet" id="leave-turns">Elegir modo</button></header><div class="result-gallery"><section class="result-hero place-${Math.min(row.rank, 4)}"><header><div class="result-crown">${RL.turnScoring.crown(row.rank)}<span>${row.rank}º puesto</span></div><div class="result-identity"><h2>${engine.escape(row.name)}</h2><p>${shared ? 'Una abeja creada entre todos' : beeMember ? 'Abeja de ' + engine.escape(beeMember.name) : 'Tu creación final'}</p></div><div class="result-hero-score">${row.score}<small>puntos${isTeam ? ' del equipo' : ''}</small></div></header><div class="result-bee-stage" aria-label="Abeja de ${engine.escape(shared ? row.name : beeMember?.name || row.name)}">${preview || ''}</div><div class="result-gallery-controls"><button class="btn quiet" id="result-previous" ${index === 0 ? 'disabled' : ''}>${RL.icon('backnav')}Anterior</button><span>${index + 1} / ${rows.length} · ${row.rank}º puesto</span><button class="btn primary" id="result-next" ${index === rows.length - 1 ? 'disabled' : ''}>Siguiente${RL.icon('arrow')}</button></div></section><aside class="result-stat-panel"><div class="result-stat-title"><span class="eyebrow">${member ? 'APORTE DEL INTEGRANTE' : isTeam ? 'ESTADÍSTICAS DEL EQUIPO' : 'ESTADÍSTICAS'}</span><h2>${engine.escape(member?.name || row.name)}</h2>${member ? `<button class="result-small-link" id="result-team-total">Ver totales del equipo</button>` : ''}</div><div class="result-stat-grid"><div><small>${member && shared ? 'Aporte' : 'Puntos'}</small><b>${detail.score}</b></div><div><small>Problemas</small><b>${detail.correct}</b></div><div><small>Errores</small><b>${detail.errors}</b></div><div><small>Pistas usadas</small><b>${detail.hints}</b></div><div><small>Tiempo${isTeam && !member && !shared ? ' acumulado' : ''}</small><b>${engine.format(detail.elapsed)}</b></div><div><small>Bono sin pistas</small><b>+${detail.noHintBonus || 0}</b></div></div><div class="result-time-bonus">Rapidez ${member && shared ? 'del equipo' : ''}: +${member && shared ? row.timeBonus : detail.timeBonus || 0}</div>${members.length ? `<section class="result-members"><h3>${members.length} integrantes</h3><p>${shared ? 'Misma abeja para todo el equipo. Toca un nombre para ver su aporte.' : 'Toca un integrante para ver su abeja y sus estadísticas.'}</p><div class="result-member-list">${members.map((p, i) => `<button data-result-member="${i}" class="${memberIndex === i ? 'selected' : ''}" aria-pressed="${memberIndex === i}"><span>${engine.escape(p.name)}<small>${p.result.correct} problemas · ${p.result.errors} errores${p.result.turns !== undefined ? ' · ' + p.result.turns + ' turnos' : ''}</small></span><b>${p.result.score}<small>${shared ? 'aporte' : 'puntos'}</small></b></button>`).join('')}</div></section>` : ''}<p class="result-ranking-rule">Mismo puntaje, mismo puesto. ${shared ? 'Puntos del equipo: aportes de sus integrantes más el bono de rapidez; mínimo 0.' : isTeam ? 'El equipo suma los puntajes de sus integrantes.' : 'No se evalúa el parecido visual de la abeja.'}</p></aside></div><footer class="result-gallery-footer"><button class="btn primary" id="turn-rematch">Revancha</button><button class="btn quiet" id="turn-new">Configurar otra partida</button></footer>`, 'turns-results');
    document.querySelector('#leave-turns').onclick = engine.config.onMode;
    document.querySelector('#turn-rematch').onclick = () => engine.prepareTurn(m.mission);
    document.querySelector('#turn-new').onclick = () => engine.pick();
    document.querySelector('#result-previous').onclick = () => this.show(engine, index - 1);
    document.querySelector('#result-next').onclick = () => this.show(engine, index + 1);
    document.querySelectorAll('[data-result-member]').forEach(el => el.onclick = () => this.show(engine, index, +el.dataset.resultMember));
    const total = document.querySelector('#result-team-total');
    if (total) total.onclick = () => this.showTeamTotal(engine, index);
    m.resultIndex = index;
  },
  showTeamTotal(engine, index) {
    // -1 selects totals while retaining a representative independent bee.
    this.show(engine, index, -1);
  }
};
