/* ============================================================
   AVENTURA EDUCATIVA — SCRIPT PRINCIPAL
   Versión 5.0 — Arquitectura de JavaScript Profesional
   ------------------------------------------------------------
   - Control de navegación activa para BeeBot, Rayet y Ludio
   - Motor de audio sintetizado (Web Audio API, sin archivos)
   - Observer de intersección multinivel para animación Reveal
   - Partículas cyber + parallax decorativo
   - Verificación de imágenes PNG de robots con diagnóstico
   - Respeta prefers-reduced-motion
   ============================================================ */

'use strict';

/* ============================================================
   0. UTILIDADES Y ALMACENAMIENTO LOCAL
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const store = {
    get(key, fallback = null) {
        try {
            const val = localStorage.getItem(key);
            return val === null ? fallback : JSON.parse(val);
        } catch (e) {
            console.warn('[Aventura Educativa] Error leyendo localStorage:', e);
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('[Aventura Educativa] Error escribiendo localStorage:', e);
        }
    }
};

/* Detecta si el usuario prefiere menos animaciones */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ============================================================
   1. AÑO DINÁMICO EN EL FOOTER
   ============================================================ */
(function setYear() {
    const yearEl = $('#year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
})();


/* ============================================================
   2. SISTEMA DE AUDIO SINTETIZADO (Web Audio API)
   ------------------------------------------------------------
   No requiere archivos .mp3/.wav. Genera tonos puros con
   osciladores. Ideal para feedback de UI y entradas a mundos.
   ============================================================ */
const Sound = (() => {
    let enabled = store.get('ae_sound_enabled', true);
    let audioCtx = null;

    function getContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTone(freq = 440, duration = 0.12, type = 'sine', volume = 0.14) {
        if (!enabled) return;
        const ctx = getContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (err) {
            console.error('[Aventura Educativa] Error sintetizando audio:', err);
        }
    }

    /* Arpegio ascendente Do-Mi-Sol al entrar a un mundo */
    function playWorldEntrance() {
        playTone(523.25, 0.10, 'triangle', 0.15); // C5
        setTimeout(() => playTone(659.25, 0.10, 'triangle', 0.15), 90);  // E5
        setTimeout(() => playTone(783.99, 0.18, 'triangle', 0.15), 180); // G5
    }

    /* Click corto y seco para feedback de UI */
    function playClick() {
        playTone(660, 0.05, 'square', 0.08);
    }

    return {
        isEnabled: () => enabled,
        toggle() {
            enabled = !enabled;
            store.set('ae_sound_enabled', enabled);
            return enabled;
        },
        click: playClick,
        enterWorld: playWorldEntrance,
        tone: playTone
    };
})();


/* ============================================================
   3. BOTÓN FLOTANTE DE SONIDO
   ============================================================ */
(function initSoundToggle() {
    const btn = $('#soundToggle');
    if (!btn) return;

    btn.classList.toggle('is-muted', !Sound.isEnabled());
    btn.setAttribute('aria-pressed', String(Sound.isEnabled()));
    btn.setAttribute('aria-label', Sound.isEnabled() ? 'Silenciar sonido' : 'Activar sonido');

    btn.addEventListener('click', () => {
        const isNowOn = Sound.toggle();
        btn.classList.toggle('is-muted', !isNowOn);
        btn.setAttribute('aria-pressed', String(isNowOn));
        btn.setAttribute('aria-label', isNowOn ? 'Silenciar sonido' : 'Activar sonido');
        if (isNowOn) {
            Sound.tone(880, 0.12, 'sine', 0.12);
        }
    });
})();


/* ============================================================
   4. HEADER SCROLL: SOMBRA, PROGRESO Y AUTO-OCULTADO
   ------------------------------------------------------------
   - Añade .is-scrolled después de 40px
   - Actualiza la barra de progreso
   - Oculta el header al bajar rápido, lo muestra al subir
   ============================================================ */
(function initHeaderScroll() {
    const header = $('#siteHeader');
    const progress = $('#scrollProgress');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let isTicking = false;

    function handleScrollUpdate() {
        const currentY = window.scrollY;

        // Estado comprimido / scrolled
        header.classList.toggle('is-scrolled', currentY > 40);

        // Barra superior de progreso
        if (progress) {
            const totalScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percentage = totalScrollableHeight > 0 ? (currentY / totalScrollableHeight) * 100 : 0;
            progress.style.width = percentage + '%';
        }

        header.style.transform = 'none';

        lastScrollY = currentY;
        isTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(handleScrollUpdate);
            isTicking = true;
        }
    }, { passive: true });

    header.style.transition = 'transform .35s cubic-bezier(.22,.61,.36,1), background .35s, box-shadow .35s, border-color .35s';
    handleScrollUpdate();
})();


/* ============================================================
   5. MENÚ MÓVIL DESPLEGABLE
   ============================================================ */
(function initMobileMenu() {
    const toggleBtn = $('#menuToggle');
    const mainNav = $('.main-nav');
    if (!toggleBtn || !mainNav) return;
    function closeMenu(restoreFocus = false) {
        mainNav.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-label', 'Abrir menú');
        if (restoreFocus) toggleBtn.focus();
    }
    toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        const open = mainNav.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', String(open));
        toggleBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        Sound.click();
    });
    $$('.nav-btn', mainNav).forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-open')) closeMenu(true);
        });
    });
    document.addEventListener('click', e => {
        if (!mainNav.contains(e.target) && !toggleBtn.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mainNav.classList.contains('is-open')) closeMenu(true);
    });
    window.matchMedia('(max-width: 1200px)').addEventListener('change', () => closeMenu());
})();


/* ============================================================
   6. SCROLL SUAVE Y NAVEGACIÓN POR ANCLAS
   ------------------------------------------------------------
   - Botón "COMENZAR AVENTURA" → #inicial (BeeBot)
   - Enlaces internos con offset del header
   - Respeta enlaces con target="_blank" (Temporizador / Tabla)
   ============================================================ */
(function initSmoothScroll() {
    const header = $('#siteHeader');

    function performScrollTo(target) {
        const element = typeof target === 'string' ? $(target) : target;
        if (!element) return;

        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Botón hero "COMENZAR AVENTURA"
    const btnStart = $('#btnStart');
    if (btnStart) {
        btnStart.addEventListener('click', (e) => {
            e.preventDefault();
            Sound.enterWorld();
            const targetSelector = btnStart.dataset.target || '#inicial';
            performScrollTo(targetSelector);
        });
    }

    // Todos los enlaces ancla internos
    $$('a[href^="#"]').forEach(anchor => {
        if (anchor.target === '_blank') return;

        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;

            const targetElement = $(href);
            if (!targetElement) return;

            e.preventDefault();
            Sound.click();
            performScrollTo(targetElement);
        });
    });
})();


/* ============================================================
   7. EFECTOS RIPPLE (ONDAS) EN BOTONES
   ============================================================ */
(function initButtonEffects() {
    function createRippleEffect(button, event) {
        // No crear ripple si el usuario prefiere menos movimiento
        if (prefersReducedMotion) return;

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.3;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        Object.assign(ripple.style, {
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.45)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%) scale(0)',
            transition: 'transform 0.6s cubic-bezier(0, 0, 0.2, 1), opacity 0.6s ease',
            opacity: '1'
        });

        const clickX = (event.clientX ?? (rect.left + rect.width / 2)) - rect.left;
        const clickY = (event.clientY ?? (rect.top + rect.height / 2)) - rect.top;

        ripple.style.left = `${clickX}px`;
        ripple.style.top  = `${clickY}px`;

        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        requestAnimationFrame(() => {
            ripple.style.transform = 'translate(-50%, -50%) scale(1)';
            ripple.style.opacity   = '0';
        });

        setTimeout(() => ripple.remove(), 650);
    }

    // Aplicar a botones y elementos interactivos
    $$('.btn, .nav-btn, .sound-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            createRippleEffect(btn, e);
        });
    });

    // Sonido al entrar a mundos / recursos
    $$('[data-sound="enter"]').forEach(trigger => {
        trigger.addEventListener('click', () => Sound.enterWorld());
    });
})();


/* ============================================================
   8. CAMPO DE ESTRELLAS DINÁMICO EN HERO
   ============================================================ */
(function initStarField() {
    const starFieldContainer = $('#starField');
    if (!starFieldContainer) return;

    const totalStars = window.innerWidth < 700 ? 30 : 65;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < totalStars; i++) {
        const star = document.createElement('span');
        star.className = 'star';

        const size = (1.5 + Math.random() * 3).toFixed(1);
        Object.assign(star.style, {
            left: `${(Math.random() * 100).toFixed(2)}%`,
            top: `${(Math.random() * 100).toFixed(2)}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${(Math.random() * 4).toFixed(2)}s`,
            animationDuration: `${(2 + Math.random() * 3).toFixed(2)}s`
        });

        fragment.appendChild(star);
    }

    starFieldContainer.appendChild(fragment);
})();


/* ============================================================
   9. PARTÍCULAS CIBERNÉTICAS (Mundo Ludio)
   ============================================================ */
(function initCyberParticles() {
    const particlesContainer = $('#cyberParticles');
    if (!particlesContainer) return;

    // Inyectar keyframes solo una vez
    if (!document.getElementById('cyberFloatKeyframes')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'cyberFloatKeyframes';
        styleSheet.textContent = `
            @keyframes cyberParticleMoveA {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                50% { transform: translate(35px, -45px) scale(1.6); opacity: 0.95; }
            }
            @keyframes cyberParticleMoveB {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                50% { transform: translate(-40px, 30px) scale(1.4); opacity: 0.95; }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    const totalParticles = window.innerWidth < 700 ? 18 : 45;

    for (let i = 0; i < totalParticles; i++) {
        const particle = document.createElement('span');
        particle.className = 'cyber-particle';

        const size = (2 + Math.random() * 4).toFixed(1);
        const particleColor = Math.random() > 0.5 ? '#00e5ff' : '#b14aed';
        const animationName = Math.random() > 0.5 ? 'cyberParticleMoveA' : 'cyberParticleMoveB';
        const duration = (6 + Math.random() * 8).toFixed(1);
        const delay = (Math.random() * 5).toFixed(1);

        Object.assign(particle.style, {
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: particleColor,
            boxShadow: `0 0 ${size * 3}px ${particleColor}`,
            opacity: (0.3 + Math.random() * 0.7).toFixed(2),
            animation: `${animationName} ${duration}s ease-in-out ${delay}s infinite`
        });

        particlesContainer.appendChild(particle);
    }
})();


/* ============================================================
   10. REVEAL ESCALONADO DE ELEMENTOS AL HACER SCROLL
   ------------------------------------------------------------
   Los hijos con [data-reveal] aparecen progresivamente cuando
   su tarjeta/módulo entra al viewport (hasta 5 niveles).
   ============================================================ */
(function initRevealOnScroll() {
    const revealElements = $$('.reveal-child');
    if (!revealElements.length) return;

    // Si el usuario prefiere menos movimiento, mostrar todo ya
    if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
})();


/* ============================================================
   11. INDICADOR DINÁMICO DE SECCIÓN ACTIVA EN NAVBAR
   ------------------------------------------------------------
   6 secciones monitoreadas:
   #hero · #inicial (BeeBot) · #primaria (Rayet) ·
   #secundaria (Ludio) · #recursos · #sobre-nosotros
   ============================================================ */
(function initActiveNav() {
    const header = $('#siteHeader');
    const links = $$('.main-nav .nav-btn[data-nav]');
    const items = links
        .map(link => ({link, section: document.getElementById(link.dataset.nav)}))
        .filter(item => item.section);
    if (!header || !items.length) return;

    let current;
    let frame;
    function updateActiveSection() {
        frame = undefined;
        const activationLine = header.getBoundingClientRect().bottom + 24;
        let active = items[0];
        for (const item of items) {
            if (item.section.getBoundingClientRect().top <= activationLine) active = item;
        }
        if (active === current) return;
        current?.link.classList.remove('is-active');
        current?.link.removeAttribute('aria-current');
        active.link.classList.add('is-active');
        active.link.setAttribute('aria-current', 'location');
        current = active;
    }

    function scheduleUpdate() {
        if (frame === undefined) frame = requestAnimationFrame(updateActiveSection);
    }

    window.addEventListener('scroll', scheduleUpdate, {passive: true});
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    updateActiveSection();
})();


/* ============================================================
   12. PARALLAX SUAVE PARA ICONOS DEL HERO
   ============================================================ */
(function initParallax() {
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    if (prefersReducedMotion) return;

    const floatIcons = $$('.float-icon');
    if (!floatIcons.length) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            // Solo aplicar cuando el hero está visible
            if (scrollY < window.innerHeight) {
                floatIcons.forEach((icon, index) => {
                    const speed = 0.02 + (index % 3) * 0.015;
                    icon.style.transform = `translateY(${scrollY * speed}px)`;
                });
            }
            ticking = false;
        });
    }, { passive: true });
})();


/* ============================================================
   13. VERIFICACIÓN Y DIAGNÓSTICO DE IMÁGENES DE ROBOTS
   ------------------------------------------------------------
   Asegura que las imágenes PNG de BeeBot, Rayet y Ludio se
   carguen. Si alguna falla, avisa por consola con la ruta
   esperada. NO duplica ni reemplaza imágenes.
   ============================================================ */
(function verifyRobotImages() {
    const displays = $$('.robot-display[data-robot]');
    if (!displays.length) return;

    displays.forEach(display => {
        const img = display.querySelector('.robot-img');
        if (!img) return;

        const robotName = display.dataset.robot;

        // Si la imagen ya estaba en caché antes del listener
        if (img.complete && img.naturalWidth !== 0) {
            display.classList.add('has-image');
            return;
        }

        img.addEventListener('load', () => {
            display.classList.add('has-image');
        });

        img.addEventListener('error', () => {
            console.warn(
                `[Aventura Educativa] No se pudo cargar la imagen del robot "${robotName}". ` +
                `Verifica la existencia del archivo en la ruta: assets/robots/${robotName}.png`
            );
        });
    });
})();


/* ============================================================
   14. ACCESIBILIDAD POR TECLADO
   ------------------------------------------------------------
   Permite activar botones con Enter o Espacio cuando reciben
   el foco, incluso si son elementos no nativos (div, span…).
   ============================================================ */
(function initKeyboardA11y() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const activeElement = document.activeElement;
        if (!activeElement) return;

        // Si es botón o enlace nativo, dejar que el navegador lo maneje
        if (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'A') return;

        if (activeElement.classList.contains('btn') ||
            activeElement.classList.contains('sound-toggle')) {
            e.preventDefault();
            activeElement.click();
        }
    });
})();


/* ============================================================
   15. API GLOBAL (por si se necesita desde otras páginas)
   ============================================================ */
window.AventuraEducativa = {
    sound: Sound,

    /* Desplazamiento suave a una sección */
    scrollToSection(selector) {
        const targetEl = typeof selector === 'string' ? $(selector) : selector;
        if (!targetEl) return;

        const headerHeight = $('#siteHeader')?.offsetHeight || 0;
        window.scrollTo({
            top: targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 12,
            behavior: 'smooth'
        });
    },

    /* Saber si el sonido está activo */
    isSoundEnabled() {
        return Sound.isEnabled();
    }
};


/* ============================================================
   16. LOG DE INICIALIZACIÓN
   ============================================================ */
console.log(
    '%c AVENTURA EDUCATIVA %c Plataforma profesional interactiva — v5.0 (BeeBot · Rayet · Ludio)',
    'background: linear-gradient(90deg, #7ed957, #ff8c42, #00e5ff, #b14aed); color: #fff; padding: 6px 12px; border-radius: 6px; font-weight: 900;',
    'color: #00e5ff; font-weight: 700; padding: 4px;'
);
/* Música ambiental principal: los navegadores requieren una interacción para reproducirla. */
(function initMainMusic(){
 const music=document.getElementById('mainMusic');
 const toggle=document.getElementById('soundToggle');
 if(!music)return;
 music.volume=0.30;
 let userStarted=false;
 const enabled=()=>Sound.isEnabled();
 async function start(){
  if(!enabled()||document.hidden||document.body.classList.contains('teacher-resource-open'))return;
  try{
   await music.play();
   if(!enabled()||document.hidden||document.body.classList.contains('teacher-resource-open')){music.pause();return;}
   userStarted=true;
  }catch(e){
   // Chrome/Brave y otros navegadores pueden bloquear audio con sonido
   // hasta la primera interacción real del usuario.
  }
 }
 // Intentar reproducir desde el primer instante. Si el navegador lo bloquea,
 // el primer clic/toque/tecla lo inicia automáticamente.
 start();
 window.addEventListener('load', start, {once:true});
 document.addEventListener('pointerdown',function firstGesture(event){
  if(event.target.closest('#soundToggle'))return;
  if(!userStarted)start();
 },{passive:true});
 document.addEventListener('keydown',function firstKey(event){if(!userStarted&&event.key!=='Escape')start()});
 if(toggle)toggle.addEventListener('click',()=>{if(enabled())start();else music.pause()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)music.pause();else if(userStarted&&enabled())start()});
 window.addEventListener('pagehide',()=>music.pause());
})();


/* ============================================================
   RECURSOS DOCENTES · visor con pestaña lateral desplazable
   La página del recurso conserva sus archivos y su URL originales.
   ============================================================ */
(function initTeacherViewer() {
    const viewer = $('#teacherViewer');
    const frame = $('#teacherFrame');
    const tab = $('#teacherExitTab');
    const panel = $('#teacherExitPanel');
    const resume = $('#teacherContinue');
    const fullscreen = $('#teacherFullscreen');
    const closeButton = $('#teacherClose');
    const title = $('#teacherResourceTitle');
    const music = $('#mainMusic');
    if (!viewer || !frame || !tab || !panel || !resume || !fullscreen || !closeButton) return;
    let launchLink = null;
    let resumeMusic = false;
    let siblings = [];
    let moving = false;
    let dragged = false;
    let pointerY = 0;
    let initialTop = 0;
    function currentFullscreen() {
        return document.fullscreenElement || document.webkitFullscreenElement;
    }
    function syncFullscreen() {
        fullscreen.textContent = currentFullscreen() ? '⛶ Salir de pantalla completa' : '⛶ Pantalla completa';
    }
    function showPanel(show) {
        panel.hidden = !show;
        frame.inert = show;
        tab.setAttribute('aria-expanded', String(show));
        syncFullscreen();
        if (show) resume.focus();
        else tab.focus();
    }
    function setBackgroundInactive(inactive) {
        if (inactive) {
            siblings = Array.from(document.body.children)
                .filter(el => el !== viewer && !['SCRIPT', 'STYLE', 'AUDIO'].includes(el.tagName))
                .map(el => ({el, inert: el.inert}));
            siblings.forEach(({el}) => { el.inert = true; });
        } else {
            siblings.forEach(({el, inert}) => { el.inert = inert; });
            siblings = [];
        }
    }
    function enterFullscreen() {
        try {
            const request = viewer.requestFullscreen || viewer.webkitRequestFullscreen;
            if (request) Promise.resolve(request.call(viewer)).catch(() => {});
        } catch (_) { /* El visor sigue ocupando la ventana si el navegador lo bloquea. */ }
    }
    function leaveFullscreen() {
        try {
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (currentFullscreen() && exit) Promise.resolve(exit.call(document)).catch(() => {});
        } catch (_) {}
    }
    function close() {
        if (viewer.hidden) return;
        leaveFullscreen();
        viewer.hidden = true;
        panel.hidden = true;
        frame.inert = false;
        frame.src = '';
        tab.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('teacher-resource-open');
        setBackgroundInactive(false);
        launchLink?.focus({preventScroll:true});
        if (resumeMusic && music && Sound.isEnabled() && !document.hidden) {
            Promise.resolve(music.play()).catch(() => {});
        }
        resumeMusic = false;
    }
    // Incluye las tarjetas y los accesos equivalentes del pie.
    $$('a[href^="Recursos_profesores/"]').forEach(link => {
        link.addEventListener('click', event => {
            // Ctrl/Cmd/clic central conserva la posibilidad de abrir una pestaña aparte.
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
            event.preventDefault();
            if (!viewer.hidden) return;
            launchLink = link;
            const label = link.closest('.resource-card')?.querySelector('.resource-title')?.textContent.trim()
                || link.textContent.trim();
            if (title) title.textContent = label;
            frame.title = label;
            resumeMusic = Boolean(music && !music.paused);
            document.body.classList.add('teacher-resource-open');
            if (music) music.pause();
            setBackgroundInactive(true);
            viewer.hidden = false;
            panel.hidden = true;
            frame.inert = false;
            tab.setAttribute('aria-expanded', 'false');
            tab.style.top = '50%';
            frame.src = link.getAttribute('href');
            enterFullscreen();
            tab.focus();
            syncFullscreen();
        });
    });
    tab.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        moving = true;
        dragged = false;
        pointerY = event.clientY;
        initialTop = tab.getBoundingClientRect().top - viewer.getBoundingClientRect().top;
        tab.setPointerCapture(event.pointerId);
    });
    tab.addEventListener('pointermove', event => {
        if (!moving) return;
        const distance = event.clientY - pointerY;
        if (Math.abs(distance) > 7) dragged = true;
        if (dragged) tab.style.top = Math.max(0, Math.min(viewer.clientHeight - tab.offsetHeight, initialTop + distance)) + 'px';
    });
    tab.addEventListener('pointerup', () => { moving = false; });
    tab.addEventListener('pointercancel', () => { moving = false; dragged = false; });
    tab.addEventListener('click', event => {
        if (dragged) { event.preventDefault(); dragged = false; return; }
        Sound.click();
        showPanel(panel.hidden);
    });
    resume.addEventListener('click', () => { Sound.click(); showPanel(false); });
    closeButton.addEventListener('click', () => { Sound.click(); close(); });
    fullscreen.addEventListener('click', () => {
        Sound.click();
        if (currentFullscreen()) leaveFullscreen();
        else enterFullscreen();
        showPanel(false);
    });
    function keyboard(event) {
        if (viewer.hidden) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            showPanel(panel.hidden);
        }
        if (event.key === 'Tab' && !panel.hidden) {
            const controls = [resume, fullscreen, closeButton];
            const active = document.activeElement;
            if (event.shiftKey && active === controls[0]) {
                event.preventDefault(); controls[2].focus();
            } else if (!event.shiftKey && active === controls[2]) {
                event.preventDefault(); controls[0].focus();
            }
        }
    }
    document.addEventListener('keydown', keyboard);
    frame.addEventListener('load', () => {
        try { frame.contentDocument?.addEventListener('keydown', keyboard); }
        catch (_) { /* El control lateral continúa disponible. */ }
    });
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    // Salir del fullscreen conserva el recurso; solo Volver descarga su contenido.
    window.addEventListener('resize', () => {
        if (!viewer.hidden && tab.style.top.endsWith('px')) {
            tab.style.top = Math.max(0, Math.min(viewer.clientHeight - tab.offsetHeight, parseFloat(tab.style.top))) + 'px';
        }
    });
})();


/* Saludos de los robots y respuesta sonora discreta de los botones. */
(function initHomeRobotGreetings() {
    $$('.home-portal .robot-stage').forEach(stage => {
        const name = stage.dataset.robotName || 'tu robot';
        stage.setAttribute('role', 'button');
        stage.setAttribute('tabindex', '0');
        stage.setAttribute('aria-label', `Saludar a ${name}`);
        let busy = false;
        function greet() {
            if (busy) return;
            busy = true;
            const base = name === 'BeeBot' ? 660 : name === 'Rugged' ? 330 : 880;
            Sound.tone(base, .12, 'sine', .10);
            setTimeout(() => Sound.tone(base * 1.25, .12, 'sine', .08), 110);
            stage.classList.add('is-greeting');
            setTimeout(() => { stage.classList.remove('is-greeting'); busy = false; }, 650);
        }
        stage.addEventListener('click', greet);
        stage.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); greet();
            }
        });
    });
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    let lastHover = 0;
    $$('.home-portal .btn, .home-portal .world-preview, .home-portal .nav-btn').forEach(button => {
        button.addEventListener('pointerenter', () => {
            const now = Date.now();
            if (now - lastHover < 250) return;
            lastHover = now;
            Sound.tone(740, .045, 'sine', .025);
        });
    });
})();
