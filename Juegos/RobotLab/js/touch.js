// Touch controls stay local to the game. Forms retain native editing/scrolling.
(() => {
  const game = '#app, .math-dialog, #turn-reference-dialog';
  const editable = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]';
  const inGame = target => target instanceof Element && target.closest(game);
  const isEditable = target => target instanceof Element && target.closest(editable);
  const taps = new Map(), activations = [];
  let sendingClick = false;
  const remember = tap => {
    const now = performance.now();
    activations.push({ id: tap.id, x: tap.x, y: tap.y, at: now });
    while (activations.length && now - activations[0].at > 900) activations.shift();
  };

  document.addEventListener('contextmenu', event => {
    if (inGame(event.target) && !isEditable(event.target)) event.preventDefault();
  }, true);
  document.addEventListener('selectstart', event => {
    if (inGame(event.target) && !isEditable(event.target)) event.preventDefault();
  });
  document.addEventListener('dragstart', event => {
    if (inGame(event.target) && !isEditable(event.target)) event.preventDefault();
  });
  // Safari's gesture events and legacy touch zoom must not steal a drawing/drag.
  ['gesturestart', 'gesturechange'].forEach(type => document.addEventListener(type, event => {
    if (inGame(event.target) && !isEditable(event.target)) event.preventDefault();
  }, { capture: true, passive: false }));
  document.addEventListener('touchmove', event => {
    if (event.touches.length > 1 && [...event.touches].every(touch => inGame(touch.target) && !isEditable(touch.target))) {
      event.preventDefault();
    }
  }, { capture: true, passive: false });

  // Native compatibility clicks may belong only to the primary finger.
  // Give each completed button tap its own click, then discard its native echo.
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !inGame(event.target)) return;
    const button = event.target.closest('button');
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    taps.set(event.pointerId, { id: event.pointerId, button, scope: button.closest('dialog, .shell') || button.closest(game), rect: button.getBoundingClientRect(), x: event.clientX, y: event.clientY });
  }, true);
  document.addEventListener('pointermove', event => {
    const tap = taps.get(event.pointerId);
    if (tap && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 12) taps.delete(event.pointerId);
  }, true);
  document.addEventListener('pointercancel', event => taps.delete(event.pointerId), true);
  document.addEventListener('pointerup', event => {
    const tap = taps.get(event.pointerId); taps.delete(event.pointerId);
    if (!tap || !tap.scope?.isConnected || tap.button.disabled) return;
    const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest('button');
    if (tap.button.isConnected) { if (hit !== tap.button) return; }
    else if (event.clientX < tap.rect.left || event.clientX > tap.rect.right || event.clientY < tap.rect.top || event.clientY > tap.rect.bottom) return;
    event.preventDefault(); remember(tap);
    sendingClick = true;
    try { tap.button.click(); } finally { sendingClick = false; }
  }, { capture: true, passive: false });
  document.addEventListener('click', event => {
    if (sendingClick || !event.isTrusted) return;
    const touchClick = event.pointerType === 'touch' || event.sourceCapabilities?.firesTouchEvents;
    if (!touchClick) return;
    const now = performance.now();
    if (activations.some(tap => now - tap.at < 900 &&
        (event.pointerId === tap.id || Math.hypot(event.clientX - tap.x, event.clientY - tap.y) < 20))) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener('blur', () => taps.clear());
  document.addEventListener('visibilitychange', () => { if (document.hidden) taps.clear(); });
})();
