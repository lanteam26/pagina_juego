// Turn competitions use one complete participation per child. Equal scores tie.
RL.turnScoring = {
  maxHints: 3,
  rules: '100 por problema resuelto − 20 por error. Al completar: hasta 30 por rapidez (−1 cada 10 segundos). +10 sin pistas si resolviste al menos un problema. Máximo 3 pistas por participante. Igual puntaje, mismo puesto.',
  calculate({ correct = 0, errors = 0, hints = 0, elapsed = 0, complete = false }) {
    const problemPoints = correct * 100;
    const errorPenalty = errors * 20;
    const timeBonus = complete ? Math.max(0, 30 - Math.floor(elapsed / 10)) : 0;
    const noHintBonus = correct > 0 && hints === 0 ? 10 : 0;
    return { problemPoints, errorPenalty, timeBonus, noHintBonus,
      score: Math.max(0, problemPoints - errorPenalty + timeBonus + noHintBonus) };
  },
  rank(rows) {
    const sorted = [...rows].sort((a, b) => b.score - a.score);
    return sorted.map((row, i) => ({ ...row, rank: i === 0 ? 1 :
      row.score === sorted[i - 1].score ? 0 : i + 1 })).map((row, i, all) => {
      if (!row.rank) row.rank = all[i - 1].rank;
      return row;
    });
  },
  teams(entities, players) {
    return entities.map((team, teamId) => {
      const members = players.filter(p => p.teamId === teamId);
      const sum = key => members.reduce((n, p) => n + (p.result[key] || 0), 0);
      return { name: team.name, teamId, members,
        score: sum('score'), correct: sum('correct'), errors: sum('errors'),
        hints: sum('hints'), elapsed: sum('elapsed'),
        timeBonus: sum('timeBonus'), noHintBonus: sum('noHintBonus') };
    });
  },
  crown(rank) {
    if (rank > 3) return `<span class="podium-number">${rank}º</span>`;
    return `<svg class="podium-crown crown-${rank}" viewBox="0 0 100 80" role="img" aria-label="Corona del puesto ${rank}"><path d="M12 21 32 37 50 10 68 37 88 21 79 63H21Z" fill="currentColor" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M23 72H77" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="12" cy="15" r="6" fill="currentColor"/><circle cx="50" cy="7" r="6" fill="currentColor"/><circle cx="88" cy="15" r="6" fill="currentColor"/><path d="m50 35 8 11-8 11-8-11Z" fill="#16243b"/></svg>`;
  }
};
