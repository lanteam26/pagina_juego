// Shared rules for the setup panels and the turn engine. No DOM dependencies.
RL.turnModel = {
  maxParticipants: 12,
  maxTeams: 5,
  label(i, team = false) { return team ? ['Equipo Azul','Equipo Rojo','Equipo Dorado','Equipo Verde','Equipo Violeta'][i] : 'Jugador ' + (i + 1); },
  draft() {
    return {
      format: 'individual', count: 2, names: Array(12).fill(''),
      teams: [{ name: '', members: Array(6).fill('') }, { name: '', members: Array(6).fill('') }],
      variant: 'timed', minutes: 2, missionIndex: 0
    };
  },
  resizeTeams(draft, count) {
    const total = Math.min(12, Math.max(count, draft.teams.reduce((n, t) => n + t.members.length, 0)));
    draft.teams = Array.from({ length: count }, (_, i) => {
      const size = Math.floor(total / count) + (i < total % count ? 1 : 0);
      const old = draft.teams[i];
      return { name: old?.name || '', members: Array.from({ length: size }, (_, j) => old?.members[j] || '') };
    });
  },
  participants(draft) {
    return draft.format === 'teams' ? draft.teams.reduce((n, t) => n + t.members.length, 0) : draft.count;
  },
  errors(draft, step = 3) {
    const errors = [];
    if (!['individual', 'teams'].includes(draft.format)) errors.push('Elige cómo van a jugar.');
    if (step >= 1) {
      if (draft.format === 'individual' && (!Number.isInteger(draft.count) || draft.count < 2 || draft.count > 12)) errors.push('Elige entre 2 y 12 jugadores.');
      if (draft.format === 'teams') {
        if (draft.teams.length < 2 || draft.teams.length > 5) errors.push('Elige entre 2 y 5 equipos.');
        if (draft.teams.some(t => t.members.length < 1 || t.members.length > 11)) errors.push('Cada equipo necesita al menos un integrante.');
        if (this.participants(draft) > 12) errors.push('La partida admite un máximo de 12 participantes en total. Reduce algún equipo.');
      }
    }
    if (step >= 2) {
      if (!['timed', 'finish'].includes(draft.variant)) errors.push('Elige una modalidad.');
      if (draft.variant === 'timed' && (!Number.isInteger(draft.minutes) || draft.minutes < 1 || draft.minutes > 60)) errors.push('El tiempo propio debe ser de 1 a 60 minutos.');
    }
    if (step >= 3 && !RL.missions[draft.missionIndex]) errors.push('Elige una referencia.');
    return errors;
  },
  schedule(settings) {
    if (settings.format !== 'teams') return settings.entities.map((entity, i) => ({name:entity.name, teamId:null, teamName:'', memberIndex:0}));
    const order = [];
    const rounds = Math.max(...settings.entities.map(entity => entity.members.length));
    for (let memberIndex = 0; memberIndex < rounds; memberIndex++) {
      settings.entities.forEach((entity, teamId) => {
        if (entity.members[memberIndex] !== undefined) order.push({name:entity.members[memberIndex], teamId, teamName:entity.name, memberIndex});
      });
    }
    return order;
  },
  settings(draft) {
    const errors = this.errors(draft);
    if (errors.length) throw Error(errors[0]);
    const teams = draft.format === 'teams';
    const source = teams ? draft.teams : draft.names.slice(0, draft.count).map(name => ({ name, members: [] }));
    const used = new Set();
    const entities = source.map((entry, i) => {
      const base = entry.name.trim() || this.label(i, teams);
      let name = base, suffix = 2;
      while (used.has(name.toLocaleLowerCase())) name = base + ' · ' + suffix++;
      used.add(name.toLocaleLowerCase());
      const members = teams ? entry.members.map((n, j) => n.trim() || 'Integrante ' + (j + 1)) : [];
      return { name, members };
    });
    return {
      format: draft.format, names: entities.map(e => e.name), entities,
      participantCount: this.participants(draft), variant: draft.variant,
      durationSeconds: draft.variant === 'timed' ? draft.minutes * 60 : 300,
      maxHints: 3
    };
  }
};
