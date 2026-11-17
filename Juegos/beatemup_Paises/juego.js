/* ============================================================
   DUELO DE NACIONES 3D — v17 "CONTACT HITS + DEFEAT"
   - Los golpes SÍ se tocan (fix de posiciones absolutas)
   - Al morir: monstruo queda DERROTADO en el suelo
   ============================================================ */

/* ============================ BANDERAS SVG ============================ */
const BANDERAS_SVG = {
  "Perú": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#D91023"/><rect x="1" width="1" height="2" fill="#FFFFFF"/></svg>`,
  "Argentina": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#74ACDF"/><rect y="0.667" width="3" height="0.667" fill="#FFFFFF"/><circle cx="1.5" cy="1" r="0.15" fill="#F6B40E"/></svg>`,
  "Colombia": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#FCD116"/><rect y="1" width="3" height="0.5" fill="#003893"/><rect y="1.5" width="3" height="0.5" fill="#CE1126"/></svg>`,
  "Chile": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFFFFF"/><rect y="1" width="3" height="1" fill="#D52B1E"/><rect width="1" height="1" fill="#0039A6"/><polygon points="0.5,0.2 0.56,0.4 0.75,0.4 0.6,0.52 0.65,0.72 0.5,0.6 0.35,0.72 0.4,0.52 0.25,0.4 0.44,0.4" fill="#FFFFFF"/></svg>`,
  "México": `<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#006847"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#CE1126"/><circle cx="1.5" cy="1" r="0.15" fill="none" stroke="#8B5A2B" stroke-width="0.04"/></svg>`,
  "Brasil": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#009C3B"/><polygon points="1.5,0.15 2.7,1 1.5,1.85 0.3,1" fill="#FFDF00"/><circle cx="1.5" cy="1" r="0.35" fill="#002776"/></svg>`,
  "Ecuador": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFDD00"/><rect y="1" width="3" height="0.5" fill="#034EA2"/><rect y="1.5" width="3" height="0.5" fill="#ED1C24"/><circle cx="1.5" cy="1" r="0.2" fill="#FFD700" stroke="#8B5A2B" stroke-width="0.04"/></svg>`,
  "Bolivia": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#D52B1E"/><rect y="0.667" width="3" height="0.667" fill="#F9E300"/><rect y="1.333" width="3" height="0.667" fill="#007934"/></svg>`,
  "Venezuela": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#FFCC00"/><rect y="0.667" width="3" height="0.667" fill="#00247D"/><rect y="1.333" width="3" height="0.667" fill="#CF142B"/><g fill="#FFFFFF"><circle cx="1.5" cy="1" r="0.04"/><circle cx="1.3" cy="0.95" r="0.04"/><circle cx="1.1" cy="1" r="0.04"/><circle cx="1.7" cy="0.95" r="0.04"/><circle cx="1.9" cy="1" r="0.04"/></g></svg>`,
  "Uruguay": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFFFFF"/><rect y="0.222" width="3" height="0.222" fill="#0038A8"/><rect y="0.667" width="3" height="0.222" fill="#0038A8"/><rect y="1.111" width="3" height="0.222" fill="#0038A8"/><rect y="1.556" width="3" height="0.222" fill="#0038A8"/><rect width="1" height="0.889" fill="#FFFFFF"/><circle cx="0.5" cy="0.444" r="0.15" fill="#FCD116"/></svg>`,
  "España": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#AA151B"/><rect y="0.5" width="3" height="1" fill="#F1BF00"/><rect x="0.7" y="0.85" width="0.2" height="0.3" fill="#AA151B"/></svg>`,
  "Francia": `<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>`,
  "Italia": `<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#CE2B37"/></svg>`,
  "Alemania": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#000000"/><rect y="0.667" width="3" height="0.667" fill="#DD0000"/><rect y="1.333" width="3" height="0.667" fill="#FFCE00"/></svg>`,
  "Portugal": `<svg viewBox="0 0 3 2"><rect width="1.2" height="2" fill="#006600"/><rect x="1.2" width="1.8" height="2" fill="#FF0000"/><circle cx="1.2" cy="1" r="0.35" fill="#FFCC00" stroke="#FF0000" stroke-width="0.03"/><circle cx="1.2" cy="1" r="0.2" fill="#FF0000"/><circle cx="1.2" cy="1" r="0.1" fill="#FFFFFF"/></svg>`,
  "Reino Unido": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#012169"/><path d="M0,0 L3,2 M3,0 L0,2" stroke="#FFFFFF" stroke-width="0.3"/><path d="M0,0 L3,2 M3,0 L0,2" stroke="#C8102E" stroke-width="0.15"/><path d="M1.5,0 V2 M0,1 H3" stroke="#FFFFFF" stroke-width="0.4"/><path d="M1.5,0 V2 M0,1 H3" stroke="#C8102E" stroke-width="0.2"/></svg>`,
  "Grecia": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#0D5EAF"/><rect y="0.222" width="3" height="0.222" fill="#FFFFFF"/><rect y="0.667" width="3" height="0.222" fill="#FFFFFF"/><rect y="1.111" width="3" height="0.222" fill="#FFFFFF"/><rect y="1.556" width="3" height="0.222" fill="#FFFFFF"/><rect width="1.111" height="1.111" fill="#0D5EAF"/><path d="M0.555,0 V1.111 M0,0.555 H1.111" stroke="#FFFFFF" stroke-width="0.15"/></svg>`,
  "Suecia": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#006AA7"/><rect x="0.9" width="0.4" height="2" fill="#FECC00"/><rect y="0.8" width="3" height="0.4" fill="#FECC00"/></svg>`,
  "Noruega": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#BA0C2F"/><rect x="0.8" width="0.5" height="2" fill="#FFFFFF"/><rect y="0.75" width="3" height="0.5" fill="#FFFFFF"/><rect x="0.9" width="0.3" height="2" fill="#00205B"/><rect y="0.85" width="3" height="0.3" fill="#00205B"/></svg>`,
  "Irlanda": `<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#169B62"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#FF883E"/></svg>`,
  "Japón": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFFFFF"/><circle cx="1.5" cy="1" r="0.6" fill="#BC002D"/></svg>`,
  "China": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#DE2910"/><g fill="#FFDE00"><polygon points="0.5,0.3 0.55,0.45 0.7,0.45 0.58,0.55 0.62,0.7 0.5,0.6 0.38,0.7 0.42,0.55 0.3,0.45 0.45,0.45"/><circle cx="0.9" cy="0.4" r="0.06"/><circle cx="1.05" cy="0.55" r="0.06"/><circle cx="1.05" cy="0.75" r="0.06"/><circle cx="0.9" cy="0.9" r="0.06"/></g></svg>`,
  "Corea del Sur": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFFFFF"/><path d="M1.5,0.4 A0.6,0.6 0 0,1 1.5,1.6 A0.3,0.3 0 0,0 1.5,1 A0.3,0.3 0 0,1 1.5,0.4 Z" fill="#CD2E3A"/><path d="M1.5,0.4 A0.6,0.6 0 0,0 1.5,1.6 A0.3,0.3 0 0,1 1.5,1 A0.3,0.3 0 0,0 1.5,0.4 Z" fill="#0047A0"/></svg>`,
  "India": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#FF9933"/><rect y="0.667" width="3" height="0.667" fill="#FFFFFF"/><rect y="1.333" width="3" height="0.667" fill="#138808"/><circle cx="1.5" cy="1" r="0.2" fill="none" stroke="#000080" stroke-width="0.03"/></svg>`,
  "Tailandia": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#A51931"/><rect y="0.333" width="3" height="1.333" fill="#F4F5F8"/><rect y="0.667" width="3" height="0.667" fill="#2D2A4A"/></svg>`,
  "Vietnam": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#DA251D"/><polygon points="1.5,0.5 1.65,0.95 2.1,0.95 1.75,1.2 1.85,1.65 1.5,1.4 1.15,1.65 1.25,1.2 0.9,0.95 1.35,0.95" fill="#FFFF00"/></svg>`,
  "Indonesia": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#FFFFFF"/><rect width="3" height="1" fill="#CE1126"/></svg>`,
  "Filipinas": `<svg viewBox="0 0 3 2"><rect width="3" height="1" fill="#0038A8"/><rect y="1" width="3" height="1" fill="#CE1126"/><polygon points="0,0 1,1 0,2" fill="#FFFFFF"/><circle cx="0.35" cy="1" r="0.15" fill="#FCD116"/></svg>`,
  "Turquía": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#E30A17"/><circle cx="1.1" cy="1" r="0.5" fill="#FFFFFF"/><circle cx="1.2" cy="1" r="0.4" fill="#E30A17"/><polygon points="1.65,0.8 1.72,0.95 1.88,0.95 1.75,1.05 1.8,1.2 1.65,1.1 1.5,1.2 1.55,1.05 1.42,0.95 1.58,0.95" fill="#FFFFFF"/></svg>`,
  "Arabia Saudita": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#006C35"/><rect x="0.6" y="0.8" width="1.8" height="0.1" fill="#FFFFFF"/><path d="M0.6,1.3 Q1.5,1.4 2.4,1.3" stroke="#FFFFFF" stroke-width="0.08" fill="none"/></svg>`,
  "Egipto": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#CE1126"/><rect y="0.667" width="3" height="0.667" fill="#FFFFFF"/><rect y="1.333" width="3" height="0.667" fill="#000000"/><circle cx="1.5" cy="1" r="0.15" fill="#C09300"/></svg>`,
  "Sudáfrica": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#007A4D"/><path d="M0,0 L1.5,1 L0,2 Z" fill="#FFB612"/><path d="M1.5,1 L3,0 L3,0.667 L1.5,1 Z" fill="#DE3831"/><path d="M1.5,1 L3,2 L3,1.333 L1.5,1 Z" fill="#002395"/><path d="M0,0.667 L1.5,1 L0,1.333" stroke="#007A4D" stroke-width="0.3" fill="none"/></svg>`,
  "Kenia": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#000000"/><rect y="0.667" width="3" height="0.667" fill="#BB0000"/><rect y="1.333" width="3" height="0.667" fill="#006600"/><ellipse cx="1.5" cy="1" rx="0.15" ry="0.4" fill="#FFFFFF"/></svg>`,
  "Nigeria": `<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#008751"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#008751"/></svg>`,
  "Marruecos": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#C1272D"/><polygon points="1.5,0.6 1.6,0.9 1.9,0.9 1.65,1.1 1.75,1.4 1.5,1.2 1.25,1.4 1.35,1.1 1.1,0.9 1.4,0.9" fill="#006233"/></svg>`,
  "Etiopía": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#078930"/><rect y="0.667" width="3" height="0.667" fill="#FCDD09"/><rect y="1.333" width="3" height="0.667" fill="#DA121A"/><circle cx="1.5" cy="1" r="0.3" fill="#078930"/><polygon points="1.5,0.8 1.53,0.9 1.63,0.9 1.55,0.97 1.58,1.07 1.5,1.01 1.42,1.07 1.45,0.97 1.37,0.9 1.47,0.9" fill="#FCDD09"/></svg>`,
  "Ghana": `<svg viewBox="0 0 3 2"><rect width="3" height="0.667" fill="#CE1126"/><rect y="0.667" width="3" height="0.667" fill="#FCD116"/><rect y="1.333" width="3" height="0.667" fill="#006B3F"/><polygon points="1.5,0.8 1.6,1.1 1.9,1.1 1.65,1.3 1.75,1.6 1.5,1.4 1.25,1.6 1.35,1.3 1.1,1.1 1.4,1.1" fill="#000000"/></svg>`,
  "Argelia": `<svg viewBox="0 0 3 2"><rect width="1.5" height="2" fill="#006233"/><rect x="1.5" width="1.5" height="2" fill="#D21034"/><circle cx="1.5" cy="1" r="0.3" fill="#D21034" stroke="#FFFFFF" stroke-width="0.05"/><circle cx="1.5" cy="1" r="0.15" fill="#D21034"/><polygon points="1.6,0.8 1.7,1 1.9,1 1.75,1.1 1.85,1.3 1.6,1.2 1.35,1.3 1.45,1.1 1.3,1 1.5,1 1.4,0.8 1.6,0.8" fill="#FFFFFF"/></svg>`,
  "Túnez": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#E70013"/><circle cx="1.5" cy="1" r="0.5" fill="#FFFFFF"/><circle cx="1.6" cy="1" r="0.4" fill="#E70013"/><circle cx="1.65" cy="1" r="0.15" fill="#E70013"/><polygon points="1.55,0.8 1.6,0.9 1.7,0.9 1.63,0.97 1.65,1.07 1.55,1.02 1.45,1.07 1.47,0.97 1.4,0.9 1.5,0.9" fill="#E70013"/></svg>`,
  "Senegal": `<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#00853F"/><rect x="1" width="1" height="2" fill="#FDEF42"/><rect x="2" width="1" height="2" fill="#E31B23"/><polygon points="1.5,0.6 1.6,0.9 1.9,0.9 1.65,1.1 1.75,1.4 1.5,1.2 1.25,1.4 1.35,1.1 1.1,0.9 1.4,0.9" fill="#00853F"/></svg>`,
  "Australia": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#00008B"/><g fill="#FFFFFF"><circle cx="0.5" cy="0.5" r="0.04"/><circle cx="0.6" cy="0.6" r="0.04"/><circle cx="2.3" cy="0.5" r="0.08"/><circle cx="2.5" cy="0.8" r="0.06"/><circle cx="2.7" cy="1.2" r="0.06"/><circle cx="2.3" cy="1.5" r="0.06"/><circle cx="2.0" cy="1.3" r="0.06"/><circle cx="1.9" cy="0.8" r="0.04"/></g></svg>`,
  "Nueva Zelanda": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#00247D"/><path d="M0,0 L1.5,1 M1.5,0 L0,1" stroke="#FFFFFF" stroke-width="0.2"/><g fill="#CC142B"><circle cx="2.3" cy="0.5" r="0.06"/><circle cx="2.5" cy="0.9" r="0.06"/><circle cx="2.7" cy="1.3" r="0.06"/><circle cx="2.1" cy="1.4" r="0.06"/></g></svg>`,
  "Fiyi": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#002868"/><rect x="1.5" width="1.5" height="2" fill="#B8D8E8"/><rect x="1.5" y="0.2" width="1.5" height="1.6" fill="#FFFFFF"/></svg>`,
  "Papúa Nueva Guinea": `<svg viewBox="0 0 3 2"><polygon points="0,0 3,0 0,2" fill="#CE1126"/><polygon points="3,0 3,2 0,2" fill="#000000"/><polygon points="1.3,0.4 1.4,0.6 1.6,0.6 1.45,0.7 1.5,0.9 1.3,0.8 1.1,0.9 1.15,0.7 1.0,0.6 1.2,0.6" fill="#FFD700"/></svg>`,
  "Samoa": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#CE1126"/><rect width="1.2" height="1" fill="#002B7F"/><g fill="#FFFFFF"><circle cx="0.4" cy="0.3" r="0.06"/><circle cx="0.7" cy="0.5" r="0.06"/><circle cx="0.9" cy="0.25" r="0.06"/><circle cx="0.5" cy="0.7" r="0.06"/><circle cx="0.85" cy="0.75" r="0.06"/></g></svg>`,
  "Tonga": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#C10000"/><rect width="1.2" height="1" fill="#FFFFFF"/><path d="M0.6,0.15 V0.85 M0.2,0.4 H1.0" stroke="#C10000" stroke-width="0.12"/></svg>`,
  "Vanuatu": `<svg viewBox="0 0 3 2"><rect width="3" height="1.4" fill="#D21034"/><rect y="1.4" width="3" height="0.6" fill="#009543"/><polygon points="0,0 1.2,1 0,2" fill="#000000"/><polygon points="0,0 1.2,1 1.2,0" fill="#FCD116"/><rect x="1.2" width="1.8" height="0.4" fill="#000000"/><circle cx="0.6" cy="0.9" r="0.1" fill="#FCD116"/></svg>`,
  "Islas Salomón": `<svg viewBox="0 0 3 2"><rect width="3" height="1.1" fill="#0051BA"/><rect y="1.1" width="3" height="0.9" fill="#215B33"/><polygon points="0,0 3,1.1 3,2" fill="#FCD116" opacity="0.8"/><g fill="#FFFFFF"><circle cx="1.2" cy="0.35" r="0.05"/><circle cx="1.5" cy="0.5" r="0.05"/><circle cx="1.8" cy="0.35" r="0.05"/><circle cx="2.1" cy="0.5" r="0.05"/><circle cx="2.4" cy="0.35" r="0.05"/></g></svg>`,
  "Palaos": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#4AADD6"/><circle cx="1.2" cy="1" r="0.55" fill="#FFDE00"/></svg>`,
  "Nauru": `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#002170"/><rect y="0.9" width="3" height="0.2" fill="#FFD700"/><polygon points="0.5,1.5 0.7,1.7 0.9,1.5 0.7,1.3" fill="#FFFFFF"/></svg>`
};

/* ============================ CONTINENTES ============================ */
const CONTINENTES = [
  { nombre:"AMÉRICA", emoji:"🌎", color:0x00f0ff,
    rival:{ nombre:"BESTIA DE AMÉRICA", vida:80, dano:10 },
    monstruo:"bestia",
    camaraFinal:"lateral",
    paises:[
      { nombre:"Perú"},{ nombre:"Argentina"},{ nombre:"Colombia"},{ nombre:"Chile"},
      { nombre:"México"},{ nombre:"Brasil"},{ nombre:"Ecuador"},{ nombre:"Bolivia"},
      { nombre:"Venezuela"},{ nombre:"Uruguay"}
    ]
  },
  { nombre:"EUROPA", emoji:"🏰", color:0xff2e88,
    rival:{ nombre:"GÓLEM DE EUROPA", vida:110, dano:14 },
    monstruo:"golem",
    camaraFinal:"contrapicada",
    paises:[
      { nombre:"España"},{ nombre:"Francia"},{ nombre:"Italia"},{ nombre:"Alemania"},
      { nombre:"Portugal"},{ nombre:"Reino Unido"},{ nombre:"Grecia"},{ nombre:"Suecia"},
      { nombre:"Noruega"},{ nombre:"Irlanda"}
    ]
  },
  { nombre:"ASIA", emoji:"🏯", color:0xffd60a,
    rival:{ nombre:"DRAGÓN DE ASIA", vida:140, dano:18 },
    monstruo:"dragon",
    camaraFinal:"cenital",
    paises:[
      { nombre:"Japón"},{ nombre:"China"},{ nombre:"Corea del Sur"},{ nombre:"India"},
      { nombre:"Tailandia"},{ nombre:"Vietnam"},{ nombre:"Indonesia"},{ nombre:"Filipinas"},
      { nombre:"Turquía"},{ nombre:"Arabia Saudita"}
    ]
  },
  { nombre:"ÁFRICA", emoji:"🦁", color:0xff8c00,
    rival:{ nombre:"DEMONIO DE ÁFRICA", vida:170, dano:22 },
    monstruo:"demonio",
    camaraFinal:"orbital",
    paises:[
      { nombre:"Egipto"},{ nombre:"Sudáfrica"},{ nombre:"Kenia"},{ nombre:"Nigeria"},
      { nombre:"Marruecos"},{ nombre:"Etiopía"},{ nombre:"Ghana"},{ nombre:"Argelia"},
      { nombre:"Túnez"},{ nombre:"Senegal"}
    ]
  },
  { nombre:"OCEANÍA", emoji:"🌊", color:0x8b00ff,
    rival:{ nombre:"TITÁN DE OCEANÍA", vida:200, dano:26 },
    monstruo:"titan",
    camaraFinal:"dollyzoom",
    paises:[
      { nombre:"Australia"},{ nombre:"Nueva Zelanda"},{ nombre:"Fiyi"},
      { nombre:"Papúa Nueva Guinea"},{ nombre:"Samoa"},{ nombre:"Tonga"},
      { nombre:"Vanuatu"},{ nombre:"Islas Salomón"},{ nombre:"Palaos"},{ nombre:"Nauru"}
    ]
  }
];

const DANO_BASE = 18;
const DANO_COMBO = 4;
const X_JUGADOR = -6, X_ENEMIGO = 6;

/* ============================ ESTADO ============================ */
let E = {};
let sonidoOn = true;

let A = {
  jugador: { x:0, y:0, z:0, rotZ:0, rotY:0, rotX:0, escala:1, vel:0, estado:"idle" },
  enemigo: { x:0, y:0, z:0, rotZ:0, rotY:0, rotX:0, escala:1, vel:0, estado:"idle" }
};

let hitStop = 0;
let sacudidaExtra = 0;
let flashGlobal = 0;
let colorFlash = "#ffffff";

let timeScale = 1;
let timeScaleObjetivo = 1;
let slowMoActivo = false;

let modoCamara = "normal";
let camCine = { pos:new THREE.Vector3(0,7,22), lookAt:new THREE.Vector3(0,3,0), fov:60 };

/* ============================ THREE ============================ */
let scene, camera, renderer, clock;
let jugadorMesh, enemigoMesh;
let luzJugador, luzEnemigo, luzImpacto, luzClash;
let particulasSistema = [];
let estelasJugador = [], estelasEnemigo = [];
let ondasSistema = [];
let camaraShake = 0, camaraZoom = 0, camaraFOV = 60;
let velocidadImpacto = 0;

let camaraObjetivoY = 7;
let camaraObjetivoZ = 22;
let camaraObjetivoX = 0;

function initEscena() {
  const canvas = document.getElementById("escena3d");
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05010f);
  scene.fog = new THREE.Fog(0x05010f, 40, 140);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 400);
  camera.position.set(0, 7, 22);
  camera.lookAt(0, 3, 0);

  clock = new THREE.Clock();
  construirEscenario();
  construirPersonajes();
  construirLuces();

  window.addEventListener("resize", onResize);
  setTimeout(onResize, 50);
  setTimeout(onResize, 250);
  animar();
}

function construirEscenario() {
  const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({ color:0x0a0a1a, roughness:0.85, metalness:0.4 })
  );
  suelo.rotation.x = -Math.PI/2;
  suelo.receiveShadow = true;
  scene.add(suelo);

  const grid = new THREE.GridHelper(240, 140, 0x00f0ff, 0x2a1050);
  grid.position.y = 0.02;
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  scene.add(grid);

  const anillo = new THREE.Mesh(
    new THREE.RingGeometry(10, 11, 64),
    new THREE.MeshBasicMaterial({ color:0x00f0ff, side:THREE.DoubleSide, transparent:true, opacity:0.7 })
  );
  anillo.rotation.x = -Math.PI/2;
  anillo.position.y = 0.03;
  scene.add(anillo);

  const estGeo = new THREE.BufferGeometry();
  const pos = [];
  for (let i = 0; i < 1200; i++) {
    pos.push((Math.random()-0.5)*350, Math.random()*200+15, -Math.random()*280-10);
  }
  estGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  scene.add(new THREE.Points(estGeo, new THREE.PointsMaterial({ color:0xffffff, size:0.25 })));
}

function construirLuces() {
  scene.add(new THREE.AmbientLight(0x556688, 1.0));
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(8, 22, 12);
  dir.castShadow = true;
  scene.add(dir);

  luzJugador = new THREE.PointLight(0x00f0ff, 3, 22);
  luzJugador.position.set(-6, 3, 0);
  scene.add(luzJugador);

  luzEnemigo = new THREE.PointLight(0xff2e88, 3, 22);
  luzEnemigo.position.set(6, 3, 0);
  scene.add(luzEnemigo);

  luzImpacto = new THREE.PointLight(0xffffff, 0, 25);
  luzImpacto.position.set(0, 3, 0);
  scene.add(luzImpacto);

  luzClash = new THREE.PointLight(0xffffff, 0, 40);
  luzClash.position.set(0, 3, 0);
  scene.add(luzClash);

  const top = new THREE.PointLight(0xffd60a, 2, 70);
  top.position.set(0, 30, 0);
  scene.add(top);
}

/* ============================ HÉROE ============================ */
function crearHeroe() {
  const grupo = new THREE.Group();
  const color = 0x00f0ff;

  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 1.5, 20),
    new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:0.5, metalness:0.6, roughness:0.3 })
  );
  cuerpo.position.y = 1.5;
  cuerpo.castShadow = true;
  grupo.add(cuerpo);

  const base = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 20, 20),
    new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:0.5, metalness:0.6, roughness:0.3 })
  );
  base.position.y = 0.7;
  base.castShadow = true;
  grupo.add(base);

  const cabeza = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 24, 24),
    new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:0.6, metalness:0.7, roughness:0.25 })
  );
  cabeza.position.y = 2.8;
  cabeza.castShadow = true;
  grupo.add(cabeza);

  [-1, 1].forEach(s => {
    const ojo = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 12),
      new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0xffffff, emissiveIntensity:1.5 })
    );
    ojo.position.set(0.24*s, 2.85, 0.52);
    grupo.add(ojo);
  });

  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 24, 24),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.15, side:THREE.BackSide })
  );
  aura.position.y = 1.5;
  grupo.add(aura);

  const sombra = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 24),
    new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.5 })
  );
  sombra.rotation.x = -Math.PI/2;
  sombra.position.y = 0.04;
  scene.add(sombra);

  grupo.userData = { aura, cuerpo, cabeza, base, sombra, color, tipo:"heroe" };
  return grupo;
}

/* ============================ MONSTRUOS ============================ */
function crearMonstruo(tipo, colorBase) {
  const grupo = new THREE.Group();
  const color = colorBase;
  const partes = {};

  const matBase = new THREE.MeshStandardMaterial({
    color, emissive:color, emissiveIntensity:0.4, metalness:0.7, roughness:0.35
  });
  const matOscuro = new THREE.MeshStandardMaterial({
    color:0x1a0a2a, emissive:0x2a0044, emissiveIntensity:0.4, metalness:0.9, roughness:0.4
  });
  const matOjos = new THREE.MeshStandardMaterial({
    color:0xff0000, emissive:0xff0000, emissiveIntensity:3.0
  });
  const matBlanco = new THREE.MeshStandardMaterial({
    color:0xffffff, emissive:0xffffff, emissiveIntensity:0.3, metalness:0.3, roughness:0.6
  });

  const cuerpo = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 28, 28),
    matBase
  );
  cuerpo.position.y = 2.2;
  cuerpo.scale.set(1.0, 1.25, 0.95);
  cuerpo.castShadow = true;
  grupo.add(cuerpo);
  partes.cuerpo = cuerpo;

  const pecho = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 24, 24),
    matBase
  );
  pecho.position.set(0, 2.6, 0.3);
  pecho.scale.set(1.1, 0.9, 0.8);
  grupo.add(pecho);

  const cintura = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.0, 0.7, 16),
    matOscuro
  );
  cintura.position.y = 1.0;
  grupo.add(cintura);

  const cabeza = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 24, 24),
    matBase
  );
  cabeza.position.y = 4.3;
  cabeza.scale.set(1, 1.05, 1.1);
  cabeza.castShadow = true;
  grupo.add(cabeza);
  partes.cabeza = cabeza;

  const mandibula = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.4, 0.7),
    matOscuro
  );
  mandibula.position.set(0, 3.8, 0.5);
  grupo.add(mandibula);

  [-1, 1].forEach(s => {
    const cuernoBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.15, 0.5, 8),
      matOscuro
    );
    cuernoBase.position.set(s * 0.65, 4.7, 0);
    cuernoBase.rotation.z = s * -0.3;
    grupo.add(cuernoBase);

    const cuernoPunta = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.7, 8),
      matOscuro
    );
    cuernoPunta.position.set(s * 0.9, 5.2, 0);
    cuernoPunta.rotation.z = s * -0.5;
    cuernoPunta.castShadow = true;
    grupo.add(cuernoPunta);
  });

  [-1, 1].forEach(s => {
    const ojoBlanco = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      matBlanco
    );
    ojoBlanco.position.set(s * 0.35, 4.35, 0.8);
    grupo.add(ojoBlanco);

    const pupila = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      matOjos
    );
    pupila.position.set(s * 0.35, 4.35, 0.92);
    grupo.add(pupila);
  });

  const brazos = [];
  [-1, 1].forEach(s => {
    const hombro = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      matBase
    );
    hombro.position.set(s * 1.4, 3.0, 0);
    hombro.castShadow = true;
    grupo.add(hombro);

    const brazo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.3, 1.4, 12),
      matBase
    );
    brazo.position.set(s * 1.7, 2.1, 0);
    brazo.rotation.z = s * 0.15;
    brazo.castShadow = true;
    grupo.add(brazo);

    const puño = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      matOscuro
    );
    puño.position.set(s * 1.85, 1.3, 0);
    grupo.add(puño);

    brazos.push({ hombro, brazo, puño });
  });
  partes.brazos = brazos;

  [-1, 1].forEach(s => {
    const pierna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.35, 1.2, 12),
      matBase
    );
    pierna.position.set(s * 0.5, 0.6, 0);
    pierna.castShadow = true;
    grupo.add(pierna);

    const pie = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.8),
      matOscuro
    );
    pie.position.set(s * 0.5, 0.15, 0.2);
    grupo.add(pie);
  });

  if (tipo === "bestia") {
    [-1, 1].forEach(s => {
      const colmillo = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.35, 8),
        matBlanco
      );
      colmillo.position.set(s * 0.22, 3.7, 0.75);
      colmillo.rotation.x = Math.PI;
      grupo.add(colmillo);
    });
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const pelo = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.5, 6),
        matOscuro
      );
      pelo.position.set(Math.cos(ang) * 1.0, 4.3, Math.sin(ang) * 0.9);
      pelo.rotation.x = -Math.cos(ang) * 0.3;
      pelo.rotation.z = Math.sin(ang) * 0.3;
      grupo.add(pelo);
    }
    [-1, 1].forEach(s => {
      for (let g = 0; g < 3; g++) {
        const garra = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.3, 6),
          matBlanco
        );
        garra.position.set(s * 1.85 + (g-1)*0.12, 1.0, 0.3);
        garra.rotation.x = 0.5;
        grupo.add(garra);
      }
    });
  }

  if (tipo === "golem") {
    for (let i = 0; i < 7; i++) {
      const piedra = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35 + Math.random()*0.25),
        matOscuro
      );
      piedra.position.set((Math.random()-0.5)*1.2, 2 + Math.random()*2, -0.9);
      piedra.rotation.set(Math.random(), Math.random(), Math.random());
      piedra.castShadow = true;
      grupo.add(piedra);
    }
    for (let i = 0; i < 5; i++) {
      const runa = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshStandardMaterial({ color:0xffd60a, emissive:0xffd60a, emissiveIntensity:2 })
      );
      runa.position.set((Math.random()-0.5)*0.8, 2.5 + Math.random()*0.6, 1.0);
      grupo.add(runa);
    }
    [-1, 1].forEach(s => {
      const rocaPuno = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.55),
        matOscuro
      );
      rocaPuno.position.set(s * 1.85, 1.3, 0);
      grupo.add(rocaPuno);
    });
  }

  if (tipo === "dragon") {
    [-1, 1].forEach(s => {
      const alaHueso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.05, 2.5, 6),
        matOscuro
      );
      alaHueso.position.set(s * 1.3, 3.5, -0.4);
      alaHueso.rotation.z = s * 1.3;
      alaHueso.rotation.x = -0.3;
      grupo.add(alaHueso);

      const alaMembrana = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 2.0, 4),
        new THREE.MeshStandardMaterial({
          color:0x2a0044, emissive:color, emissiveIntensity:0.4,
          transparent:true, opacity:0.85, side:THREE.DoubleSide
        })
      );
      alaMembrana.position.set(s * 1.7, 3.3, -0.6);
      alaMembrana.rotation.z = s * 1.3;
      alaMembrana.rotation.x = -0.3;
      grupo.add(alaMembrana);

      if (s < 0) { partes.alaIzq = alaMembrana; partes.alaIzqHueso = alaHueso; }
      else { partes.alaDer = alaMembrana; partes.alaDerHueso = alaHueso; }
    });

    const colaSegmentos = [];
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 - i*0.03, 0.15 - i*0.03, 0.6, 8),
        matBase
      );
      seg.position.set(0, 1.2 - i*0.15, -1.2 - i*0.45);
      seg.rotation.x = -0.4 - i*0.1;
      grupo.add(seg);
      colaSegmentos.push(seg);
    }
    partes.colaSegmentos = colaSegmentos;

    const puntaCola = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.3),
      matOscuro
    );
    puntaCola.position.set(0, 0.2, -3.5);
    grupo.add(puntaCola);
    partes.puntaCola = puntaCola;

    for (let i = 0; i < 8; i++) {
      const escama = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.35, 4),
        matOscuro
      );
      escama.position.set(0, 2.2 + i * 0.28, -1.0);
      escama.rotation.x = -0.6;
      grupo.add(escama);
    }

    const fuego = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      new THREE.MeshBasicMaterial({ color:0xff5500, transparent:true, opacity:0.7 })
    );
    fuego.position.set(0, 3.7, 1.0);
    grupo.add(fuego);
    partes.fuego = fuego;
  }

  if (tipo === "demonio") {
    [[0.55,4.5],[0.55,4.1],[-0.55,4.5],[-0.55,4.1]].forEach(pos => {
      const ojo = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        matOjos
      );
      ojo.position.set(pos[0], pos[1], 0.88);
      grupo.add(ojo);
    });
    for (let i = 0; i < 8; i++) {
      const pua = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.6, 6),
        matOscuro
      );
      pua.position.set(0, 1.3 + i * 0.35, -1.1);
      pua.rotation.x = -0.7;
      pua.castShadow = true;
      grupo.add(pua);
    }
    const auraOscura = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 24, 24),
      new THREE.MeshBasicMaterial({
        color:0x220033, transparent:true, opacity:0.35, side:THREE.BackSide
      })
    );
    auraOscura.position.y = 2.2;
    grupo.add(auraOscura);
    partes.auraOscura = auraOscura;

    const sigilo = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.05, 8, 20),
      new THREE.MeshStandardMaterial({ color:0xff0000, emissive:0xff0000, emissiveIntensity:2.5 })
    );
    sigilo.position.set(0, 2.6, 1.15);
    grupo.add(sigilo);
    partes.sigilo = sigilo;
  }

  if (tipo === "titan") {
    cuerpo.scale.set(1.3, 1.6, 1.2);
    cuerpo.position.y = 2.6;
    cabeza.scale.setScalar(1.3);
    cabeza.position.y = 5.2;
    pecho.scale.set(1.4, 1.1, 1.0);
    pecho.position.y = 3.2;
    [-1, 1].forEach(s => {
      const brazoTitan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.45, 2.4, 12),
        matBase
      );
      brazoTitan.position.set(s * 2.1, 2.8, 0);
      brazoTitan.rotation.z = s * 0.2;
      brazoTitan.castShadow = true;
      grupo.add(brazoTitan);
    });
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const pua = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.65, 6),
        matOscuro
      );
      pua.position.set(Math.cos(ang) * 1.0, 6.2, Math.sin(ang) * 1.0);
      pua.rotation.x = -Math.cos(ang) * 0.4;
      pua.rotation.z = Math.sin(ang) * 0.4;
      grupo.add(pua);
    }
    const corazon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4),
      new THREE.MeshBasicMaterial({ color:0xff2e88 })
    );
    corazon.position.set(0, 3.0, 1.2);
    grupo.add(corazon);
    partes.corazon = corazon;
  }

  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 24, 24),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.15, side:THREE.BackSide })
  );
  aura.position.y = 2.5;
  grupo.add(aura);
  partes.aura = aura;

  const sombra = new THREE.Mesh(
    new THREE.CircleGeometry(1.7, 24),
    new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.55 })
  );
  sombra.rotation.x = -Math.PI/2;
  sombra.position.y = 0.04;
  scene.add(sombra);
  partes.sombra = sombra;

  grupo.userData = { ...partes, color, tipo:"monstruo", tipoMonstruo:tipo };
  return grupo;
}

function construirPersonajes() {
  jugadorMesh = crearHeroe();
  jugadorMesh.position.set(X_JUGADOR, 0, 0);
  jugadorMesh.rotation.y = Math.PI / 2;
  jugadorMesh.userData.sombra.position.set(X_JUGADOR, 0.04, 0);
  scene.add(jugadorMesh);

  enemigoMesh = crearMonstruo("bestia", 0xff2e88);
  enemigoMesh.position.set(X_ENEMIGO, 0, 0);
  enemigoMesh.rotation.y = -Math.PI / 2;
  enemigoMesh.userData.sombra.position.set(X_ENEMIGO, 0.04, 0);
  scene.add(enemigoMesh);
}

function reemplazarEnemigo(tipo, color) {
  if (enemigoMesh) {
    scene.remove(enemigoMesh);
    if (enemigoMesh.userData.sombra) scene.remove(enemigoMesh.userData.sombra);
    enemigoMesh.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
  enemigoMesh = crearMonstruo(tipo, color);
  enemigoMesh.position.set(X_ENEMIGO, 0, 0);
  enemigoMesh.rotation.y = -Math.PI / 2;
  enemigoMesh.userData.sombra.position.set(X_ENEMIGO, 0.04, 0);
  scene.add(enemigoMesh);
}

/* ============================ PARTÍCULAS ============================ */
function particulas3D(pos, color, cantidad = 25, fuerza = 8) {
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(cantidad * 3);
  const vels = [];
  for (let i = 0; i < cantidad; i++) {
    arr[i*3] = pos.x; arr[i*3+1] = pos.y; arr[i*3+2] = pos.z;
    vels.push(new THREE.Vector3(
      (Math.random()-0.5)*fuerza,
      Math.random()*fuerza*0.9 + 1,
      (Math.random()-0.5)*fuerza
    ));
  }
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const mat = new THREE.PointsMaterial({
    color, size:0.4, transparent:true, opacity:1,
    blending:THREE.AdditiveBlending, depthWrite:false
  });
  const puntos = new THREE.Points(geo, mat);
  scene.add(puntos);
  particulasSistema.push({ mesh:puntos, vels, vida:1.3 });
}

function actualizarParticulas(dt) {
  for (let i = particulasSistema.length - 1; i >= 0; i--) {
    const p = particulasSistema[i];
    const arr = p.mesh.geometry.attributes.position.array;
    for (let j = 0; j < p.vels.length; j++) {
      arr[j*3]   += p.vels[j].x * dt;
      arr[j*3+1] += p.vels[j].y * dt;
      arr[j*3+2] += p.vels[j].z * dt;
      p.vels[j].y -= 9 * dt;
    }
    p.mesh.geometry.attributes.position.needsUpdate = true;
    p.vida -= dt;
    p.mesh.material.opacity = Math.max(0, p.vida / 1.3);
    if (p.vida <= 0) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      particulasSistema.splice(i, 1);
    }
  }
}

/* ============================ ONDAS ============================ */
function crearOnda(pos, color, escalaMax = 20, dur = 0.7) {
  const geo = new THREE.RingGeometry(0.1, 0.4, 40);
  const mat = new THREE.MeshBasicMaterial({
    color, side:THREE.DoubleSide, transparent:true, opacity:1, blending:THREE.AdditiveBlending
  });
  const ring = new THREE.Mesh(geo, mat);
  ring.position.copy(pos);
  ring.lookAt(camera.position);
  scene.add(ring);
  ondasSistema.push({ mesh:ring, vida:dur, dur, escalaMax });
}

function crearOndaToro(pos, color) {
  const geo = new THREE.RingGeometry(0.6, 1.0, 48);
  const mat = new THREE.MeshBasicMaterial({
    color, side:THREE.DoubleSide, transparent:true, opacity:1, blending:THREE.AdditiveBlending
  });
  const ring = new THREE.Mesh(geo, mat);
  ring.position.set(pos.x, 0.05, pos.z);
  ring.rotation.x = -Math.PI/2;
  scene.add(ring);
  ondasSistema.push({ mesh:ring, vida:1.2, dur:1.2, escalaMax:55 });
}

function actualizarOndas(dt) {
  for (let i = ondasSistema.length - 1; i >= 0; i--) {
    const o = ondasSistema[i];
    o.vida -= dt;
    const k = 1 - o.vida / o.dur;
    o.mesh.scale.setScalar(1 + k * o.escalaMax);
    o.mesh.material.opacity = Math.max(0, 1 - k);
    if (o.vida <= 0) {
      scene.remove(o.mesh);
      o.mesh.geometry.dispose();
      o.mesh.material.dispose();
      ondasSistema.splice(i, 1);
    }
  }
}

/* ============================ ESTELAS ============================ */
function crearEstela(pos, color, tam = 0.6, dur = 0.4) {
  const geo = new THREE.SphereGeometry(tam, 12, 12);
  const mat = new THREE.MeshBasicMaterial({
    color, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending
  });
  const e = new THREE.Mesh(geo, mat);
  e.position.copy(pos);
  scene.add(e);
  return { mesh:e, vida:dur, dur };
}

function actualizarEstelas(dt, lista) {
  for (let i = lista.length - 1; i >= 0; i--) {
    const e = lista[i];
    e.vida -= dt;
    e.mesh.material.opacity = Math.max(0, e.vida / e.dur * 0.8);
    e.mesh.scale.setScalar(1 + (1 - e.vida/e.dur) * 1.5);
    if (e.vida <= 0) {
      scene.remove(e.mesh);
      e.mesh.geometry.dispose();
      e.mesh.material.dispose();
      lista.splice(i, 1);
    }
  }
}

/* ============================================================
   LOOP
   ============================================================ */
function animar() {
  requestAnimationFrame(animar);
  let dt = Math.min(clock.getDelta(), 0.05);

  timeScale += (timeScaleObjetivo - timeScale) * 0.1;
  const dtAnim = dt * timeScale;

  if (hitStop > 0) {
    hitStop -= dt;
    renderer.render(scene, camera);
    return;
  }

  const t = clock.elapsedTime;

  // Idle solo si NO está en estado "derrotado"
  if (A.jugador.estado === "idle") A.jugador.y = Math.sin(t*1.6) * 0.15;
  if (A.enemigo.estado === "idle") A.enemigo.y = Math.sin(t*1.6 + 1) * 0.15;

  // Animar partes del monstruo (solo si está vivo)
  if (enemigoMesh && enemigoMesh.userData.tipo === "monstruo" && A.enemigo.estado !== "derrotado") {
    const ud = enemigoMesh.userData;
    if (ud.alaIzq) ud.alaIzq.rotation.z = 1.3 + Math.sin(t * 4) * 0.4;
    if (ud.alaDer) ud.alaDer.rotation.z = -1.3 + Math.sin(t * 4) * 0.4;
    if (ud.alaIzqHueso) ud.alaIzqHueso.rotation.z = 1.3 + Math.sin(t * 4) * 0.4;
    if (ud.alaDerHueso) ud.alaDerHueso.rotation.z = -1.3 + Math.sin(t * 4) * 0.4;
    if (ud.colaSegmentos) {
      ud.colaSegmentos.forEach((seg, i) => {
        seg.rotation.z = Math.sin(t * 2 + i * 0.5) * 0.3;
      });
    }
    if (ud.puntaCola) ud.puntaCola.rotation.y = t * 2;
    if (ud.fuego) {
      ud.fuego.scale.setScalar(1 + Math.sin(t * 8) * 0.3);
      ud.fuego.material.opacity = 0.6 + Math.sin(t * 8) * 0.3;
    }
    if (ud.aura) ud.aura.material.opacity = 0.15 + Math.sin(t*2)*0.05;
    if (ud.sigilo) ud.sigilo.rotation.z = t * 2;
    if (ud.corazon) ud.corazon.rotation.y = t * 2;
    if (ud.auraOscura) ud.auraOscura.material.opacity = 0.35 + Math.sin(t*3)*0.1;
  }

  aplicarMesh(jugadorMesh, A.jugador, X_JUGADOR);
  aplicarMesh(enemigoMesh, A.enemigo, X_ENEMIGO);
  actualizarSombra(jugadorMesh);
  actualizarSombra(enemigoMesh);

  if (jugadorMesh && A.jugador.estado !== "derrotado") {
    jugadorMesh.userData.aura.material.opacity = 0.13 + Math.sin(t*2)*0.05;
  }

  if (A.jugador.vel > 0.5 && Math.random() < 0.85) {
    estelasJugador.push(crearEstela(jugadorMesh.position.clone(), jugadorMesh.userData.color));
  }
  if (A.enemigo.vel > 0.5 && Math.random() < 0.85) {
    estelasEnemigo.push(crearEstela(enemigoMesh.position.clone(), enemigoMesh.userData.color));
  }
  actualizarEstelas(dtAnim, estelasJugador);
  actualizarEstelas(dtAnim, estelasEnemigo);

  if (luzJugador) luzJugador.intensity = 3 + A.jugador.vel*3;
  if (luzEnemigo) luzEnemigo.intensity = 3 + A.enemigo.vel*3;
  if (luzImpacto) luzImpacto.intensity *= 0.85;
  if (luzClash) luzClash.intensity *= 0.88;

  camaraShake *= 0.9;
  flashGlobal *= 0.88;

  if (modoCamara === "cinematico") {
    camera.position.lerp(camCine.pos, 0.08);
    const lookAtActual = new THREE.Vector3();
    camera.getWorldDirection(lookAtActual);
    const nuevoLook = camera.position.clone().add(lookAtActual.multiplyScalar(10));
    const targetLook = camCine.lookAt;
    camera.lookAt(
      nuevoLook.x + (targetLook.x - nuevoLook.x) * 0.1,
      nuevoLook.y + (targetLook.y - nuevoLook.y) * 0.1,
      nuevoLook.z + (targetLook.z - nuevoLook.z) * 0.1
    );
    camaraFOV += (camCine.fov - camaraFOV) * 0.08;
    if (Math.abs(camera.fov - camaraFOV) > 0.1) {
      camera.fov = camaraFOV;
      camera.updateProjectionMatrix();
    }
  } else {
    const yProm = (A.jugador.y + A.enemigo.y) / 2;
    const xProm = (A.jugador.x + A.enemigo.x) / 2;
    const alturaMax = Math.max(A.jugador.y, A.enemigo.y);

    camaraObjetivoY = 7 + alturaMax * 0.7;
    camaraObjetivoZ = 22 + alturaMax * 0.3;
    camaraObjetivoX = xProm * 0.3;

    camera.position.x += (camaraObjetivoX - camera.position.x) * 0.08;
    camera.position.y += (camaraObjetivoY - camera.position.y) * 0.08;
    camera.position.z += (camaraObjetivoZ - camera.position.z) * 0.08;

    const sx = (Math.random()-0.5) * (camaraShake + sacudidaExtra);
    const sy = (Math.random()-0.5) * (camaraShake + sacudidaExtra);
    camera.position.x += sx;
    camera.position.y += sy;
    sacudidaExtra *= 0.88;

    camera.lookAt(xProm * 0.2, 3 + yProm * 0.6, 0);

    const fovSlowMo = slowMoActivo ? 15 : 0;
    const fovObjetivo = 60 + velocidadImpacto * 15 + fovSlowMo;
    camaraFOV += (fovObjetivo - camaraFOV) * 0.12;
    if (Math.abs(camera.fov - camaraFOV) > 0.1) {
      camera.fov = camaraFOV;
      camera.updateProjectionMatrix();
    }
  }
  velocidadImpacto *= 0.9;

  const ov = document.getElementById("flashOverlay");
  if (ov) {
    ov.style.opacity = flashGlobal > 0.01 ? flashGlobal : 0;
    ov.style.background = colorFlash;
  }

  actualizarParticulas(dtAnim);
  actualizarOndas(dtAnim);
  renderer.render(scene, camera);
}

function aplicarMesh(mesh, anim, xBase) {
  if (!mesh) return;
  mesh.position.x = xBase + anim.x;
  mesh.position.y = anim.y;
  mesh.position.z = anim.z;
  mesh.rotation.x = anim.rotX || 0;
  mesh.rotation.z = anim.rotZ;
  mesh.rotation.y = (xBase < 0 ? Math.PI/2 : -Math.PI/2) + anim.rotY;
  mesh.scale.setScalar(anim.escala);
}

function actualizarSombra(mesh) {
  if (!mesh || !mesh.userData.sombra) return;
  const s = mesh.userData.sombra;
  s.position.set(mesh.position.x, 0.04, mesh.position.z);
  const altura = mesh.position.y;
  const escala = Math.max(0.1, 1 - altura * 0.03);
  s.scale.setScalar(escala);
  s.material.opacity = Math.max(0.02, 0.5 - altura * 0.015);
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

/* ============================================================
   CÁMARAS CINEMATOGRÁFICAS
   ============================================================ */
function activarCamaraCine(tipo, atacante, defensor) {
  modoCamara = "cinematico";
  const centro = new THREE.Vector3(
    ((atacante.x) + (defensor.x)) / 2,
    ((atacante.y) + (defensor.y)) / 2 + 2,
    ((atacante.z) + (defensor.z)) / 2
  );

  if (tipo === "lateral") {
    camCine.pos.set(centro.x + 15, centro.y + 4, centro.z + 8);
    camCine.lookAt.copy(centro);
    camCine.fov = 55;
  } else if (tipo === "contrapicada") {
    camCine.pos.set(centro.x, centro.y - 8, centro.z + 14);
    camCine.lookAt.set(centro.x, centro.y + 8, centro.z);
    camCine.fov = 75;
  } else if (tipo === "cenital") {
    camCine.pos.set(centro.x, centro.y + 22, centro.z + 2);
    camCine.lookAt.set(centro.x, centro.y, centro.z);
    camCine.fov = 70;
  } else if (tipo === "orbital") {
    camCine.pos.set(centro.x - 12, centro.y + 6, centro.z + 12);
    camCine.lookAt.copy(centro);
    camCine.fov = 65;
    let angulo = 0;
    const orbitInterval = setInterval(() => {
      if (modoCamara !== "cinematico") { clearInterval(orbitInterval); return; }
      angulo += 0.03;
      camCine.pos.set(
        centro.x + Math.cos(angulo) * 15,
        centro.y + 6 + Math.sin(angulo * 2) * 2,
        centro.z + Math.sin(angulo) * 15
      );
    }, 30);
  } else if (tipo === "dollyzoom") {
    camCine.pos.set(centro.x + 8, centro.y + 5, centro.z + 20);
    camCine.lookAt.copy(centro);
    camCine.fov = 90;
    setTimeout(() => { camCine.fov = 45; }, 500);
    setTimeout(() => { camCine.fov = 80; }, 1200);
  }
}

function desactivarCamaraCine() {
  modoCamara = "normal";
}

/* ============================================================
   TWEEN
   ============================================================ */
function tween(dur, onUpdate) {
  return new Promise(resolve => {
    const inicio = performance.now();
    function paso(now) {
      const t = Math.min((now - inicio) / dur, 1);
      onUpdate(t);
      if (t < 1) requestAnimationFrame(paso);
      else resolve();
    }
    requestAnimationFrame(paso);
  });
}
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetAnim(nombre) {
  A[nombre] = { x:0, y:0, z:0, rotZ:0, rotY:0, rotX:0, escala:1, vel:0, estado:"idle" };
}

function activarSlowMo() {
  slowMoActivo = true;
  timeScaleObjetivo = 0.25;
  setTimeout(() => {
    timeScaleObjetivo = 1;
    slowMoActivo = false;
  }, 800);
}

function posicionAleatoria360(usaAire) {
  const angulo = Math.random() * Math.PI * 2;
  const radio = 3 + Math.random() * 7;
  const x = Math.cos(angulo) * radio;
  const z = Math.sin(angulo) * radio * 0.6;
  const y = usaAire ? 2 + Math.random() * 8 : Math.random() * 1.5;
  return { x, y, z };
}

/* ============================================================
   ATAQUE — FIX: usa posiciones ABSOLUTAS para que choquen
   ============================================================ */
function calcularGolpes(combo, vaAMorir) {
  if (vaAMorir) return 12;
  return Math.min(combo, 6);
}

async function ejecutarAtaque(esJugador, combo, dano, vaAMorir) {
  const atk = esJugador ? "jugador" : "enemigo";
  const def = esJugador ? "enemigo" : "jugador";
  const meshAtk = esJugador ? jugadorMesh : enemigoMesh;
  const meshDef = esJugador ? enemigoMesh : jugadorMesh;
  const colorAtaque = esJugador ? 0x00f0ff : E.continente.color;

  // Posiciones base (donde cada uno está "anclado")
  const baseXAtk = esJugador ? X_JUGADOR : X_ENEMIGO;
  const baseXDef = esJugador ? X_ENEMIGO : X_JUGADOR;

  A[atk].estado = "atacando";
  const numGolpes = calcularGolpes(combo, vaAMorir);

  if (combo >= 4 || vaAMorir) {
    activarSlowMo();
    mostrarTextoFx("⚡ SLOW-MO ⚡", "#ffd60a");
    await esperar(300);
  }

  await tween(180, t => {
    const k = Math.sin(t * Math.PI * 0.5);
    A[atk].escala = 1 - k * 0.1;
    A[atk].rotZ = k * 0.3;
  });

  for (let i = 0; i < numGolpes; i++) {
    const esMasivo = vaAMorir;
    const usaAire = esMasivo || i >= 2;

    // POSICIÓN ABSOLUTA actual del defensor
    const defXAbs = baseXDef + A[def].x;
    const defYAbs = A[def].y;
    const defZAbs = A[def].z;

    // POSICIÓN ABSOLUTA actual del atacante
    const atkXAbs = baseXAtk + A[atk].x;
    const atkYAbs = A[atk].y;
    const atkZAbs = A[atk].z;

    // El atacante se mueve EXACTAMENTE a la posición absoluta del defensor
    // Convertimos a offset relativo: destX_abs = defXAbs -> offsetX = defXAbs - baseXAtk
    const xDestinoOffset = defXAbs - baseXAtk;
    const yDestinoOffset = defYAbs;
    const zDestinoOffset = defZAbs;

    const xAtkOffsetIni = A[atk].x;
    const yAtkOffsetIni = A[atk].y;
    const zAtkOffsetIni = A[atk].z;

    A[atk].vel = 1;
    await tween(esMasivo ? 100 : 140, t => {
      const e = easeIn(t);
      A[atk].x = xAtkOffsetIni + (xDestinoOffset - xAtkOffsetIni) * e;
      A[atk].y = yAtkOffsetIni + (yDestinoOffset - yAtkOffsetIni) * e;
      A[atk].z = zAtkOffsetIni + (zDestinoOffset - zAtkOffsetIni) * e;
      A[atk].escala = 1 + Math.sin(t * Math.PI) * 0.25;
      A[atk].rotY = e * Math.PI * 2;
    });

    // AHORA están en la MISMA posición → el impacto se ve en el centro
    const puntoImpacto = new THREE.Vector3(
      defXAbs,
      defYAbs + 1.8,
      defZAbs
    );

    particulas3D(puntoImpacto, colorAtaque, esMasivo ? 40 : 25, esMasivo ? 18 : 14);
    particulas3D(puntoImpacto, 0xffffff, esMasivo ? 20 : 12, 20);
    crearOnda(puntoImpacto, colorAtaque, esMasivo ? 35 : 20, 0.45);
    crearOnda(puntoImpacto, 0xffffff, esMasivo ? 25 : 15, 0.35);

    flashGlobal = esMasivo ? 0.9 : 0.55;
    camaraShake = esMasivo ? 1.3 : 0.8;
    sacudidaExtra = esMasivo ? 40 : 22;
    luzClash.color.setHex(colorAtaque);
    luzClash.intensity = esMasivo ? 20 : 12;
    luzClash.position.copy(puntoImpacto);
    hitStop = esMasivo ? 0.06 : 0.04;

    const c = meshDef.userData.cuerpo;
    if (c) {
      c.material.emissive.setHex(0xffffff);
      c.material.emissiveIntensity = 3;
      setTimeout(() => {
        c.material.emissive.setHex(meshDef.userData.color);
        c.material.emissiveIntensity = 0.5;
      }, 100);
    }

    sonido("golpe");

    // Defensor sale despedido en 360°
    const xDefIni = A[def].x, yDefIni = A[def].y, zDefIni = A[def].z;
    const nuevaPos = posicionAleatoria360(usaAire);

    await tween(esMasivo ? 140 : 200, t => {
      const e = easeOut(t);
      A[def].x = xDefIni + (nuevaPos.x - xDefIni) * e;
      A[def].y = yDefIni + (nuevaPos.y - yDefIni) * e;
      A[def].z = zDefIni + (nuevaPos.z - zDefIni) * e;
      A[def].rotZ = Math.sin(t * Math.PI) * 0.8;
      A[def].rotY = Math.sin(t * Math.PI) * Math.PI * 2;
      A[def].escala = 1 - Math.sin(t * Math.PI) * 0.15;
    });

    await esperar(esMasivo ? 20 : 40);
  }

  if (vaAMorir) {
    await finisherFinal(esJugador, colorAtaque);
  } else {
    const xAtkIni = A[atk].x, yAtkIni = A[atk].y, zAtkIni = A[atk].z;
    const xDefIni = A[def].x, yDefIni = A[def].y, zDefIni = A[def].z;

    await tween(400, t => {
      const e = easeOut(t);
      A[atk].x = xAtkIni * (1 - e);
      A[atk].y = yAtkIni * (1 - e);
      A[atk].z = zAtkIni * (1 - e);
      A[atk].escala = 1;
      A[atk].rotZ = A[atk].rotZ * (1 - e);
      A[atk].rotY = 0;
      A[def].x = xDefIni * (1 - e);
      A[def].y = yDefIni * (1 - e);
      A[def].z = zDefIni * (1 - e);
      A[def].rotZ = A[def].rotZ * (1 - e);
      A[def].escala = 1;
    });
  }

  resetAnim(atk);
  resetAnim(def);
}

/* ============================================================
   FINISHER FINAL + DERROTA
   ============================================================ */
async function finisherFinal(esJugador, color) {
  const atk = esJugador ? "jugador" : "enemigo";
  const def = esJugador ? "enemigo" : "jugador";
  const meshAtk = esJugador ? jugadorMesh : enemigoMesh;
  const meshDef = esJugador ? enemigoMesh : jugadorMesh;
  const dirDef = esJugador ? 1 : -1;
  const tipoCam = E.continente.camaraFinal;
  const baseXDef = esJugador ? X_ENEMIGO : X_JUGADOR;
  const baseXAtk = esJugador ? X_JUGADOR : X_ENEMIGO;

  mostrarTextoFx("¡¡FINISHER AÉREO!!", "#ffd60a");
  activarSlowMo();
  await esperar(400);

  // 1. LANZAMIENTO AL AIRE
  const yDefIni = A[def].y;
  const zDefIni = A[def].z;

  await tween(700, t => {
    const e = easeOut(t);
    A[def].y = yDefIni + e * 22;
    A[def].z = zDefIni * (1 - e);
    A[def].rotY = e * Math.PI * 10;
    A[def].rotZ = e * 1.0;
  });

  // 2. TELETRANSPORTE
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const p = meshAtk.position.clone();
      p.x += (Math.random()-0.5)*3;
      p.y += Math.random() * 2;
      p.z += (Math.random()-0.5)*3;
      particulas3D(p, color, 10, 6);
    }, i * 25);
  }
  await esperar(200);

  // Posicionar atacante junto al defensor en el aire
  A[atk].x = A[def].x - (esJugador ? 1.5 : -1.5);
  A[atk].y = A[def].y;
  A[atk].z = A[def].z;
  const pAparecer = meshAtk.position.clone();
  particulas3D(pAparecer, color, 40, 18);
  particulas3D(pAparecer, 0xffffff, 20, 22);
  crearOnda(pAparecer, color, 30, 0.5);
  flashGlobal = 0.7;
  sonido("especial");

  // 3. CÁMARA CINEMATOGRÁFICA
  activarCamaraCine(tipoCam, A[atk], A[def]);
  await esperar(600);

  // 4. RÁFAGA AÉREA
  const totalGolpes = 14;
  for (let i = 0; i < totalGolpes; i++) {
    if (i > 0 && i % 4 === 0) {
      activarSlowMo();
      await esperar(200);
    }

    const angulo = (i / totalGolpes) * Math.PI * 2;
    const radio = 2 + Math.random() * 4;
    const xAtkNueva = A[def].x + Math.cos(angulo) * radio;
    const yAtkNueva = A[def].y + Math.sin(angulo) * radio * 0.5;
    const zAtkNueva = A[def].z + Math.sin(angulo) * radio;

    const xAtkIni = A[atk].x, yAtkIni = A[atk].y, zAtkIni = A[atk].z;

    await tween(80, t => {
      const e = easeIn(t);
      A[atk].x = xAtkIni + (xAtkNueva - xAtkIni) * e;
      A[atk].y = yAtkIni + (yAtkNueva - yAtkIni) * e;
      A[atk].z = zAtkIni + (zAtkNueva - zAtkIni) * e;
      A[atk].vel = 1;
      A[atk].escala = 1 + Math.sin(t * Math.PI) * 0.2;
    });

    const puntoImpacto = new THREE.Vector3(
      (meshAtk.position.x + meshDef.position.x) / 2,
      (meshAtk.position.y + meshDef.position.y) / 2 + 1.5,
      (meshAtk.position.z + meshDef.position.z) / 2
    );

    particulas3D(puntoImpacto, color, 28, 18);
    particulas3D(puntoImpacto, 0xffffff, 14, 22);
    crearOnda(puntoImpacto, color, 20, 0.35);

    flashGlobal = 0.6;
    camaraShake = 1.1;
    sacudidaExtra = 32;
    luzClash.color.setHex(color);
    luzClash.intensity = 16;
    luzClash.position.copy(puntoImpacto);
    hitStop = 0.03;

    const cDef = meshDef.userData.cuerpo;
    if (cDef) {
      cDef.material.emissive.setHex(0xffffff);
      cDef.material.emissiveIntensity = 3;
      setTimeout(() => {
        cDef.material.emissive.setHex(meshDef.userData.color);
        cDef.material.emissiveIntensity = 0.5;
      }, 80);
    }

    sonido("golpe");

    const xDefNueva = (Math.random() - 0.5) * 10;
    const yDefNueva = A[def].y + (Math.random() - 0.3) * 5;
    const zDefNueva = (Math.random() - 0.5) * 6;

    const xDefIni2 = A[def].x, yDefIni2 = A[def].y, zDefIni2 = A[def].z;
    await tween(90, t => {
      const e = easeOut(t);
      A[def].x = xDefIni2 + (xDefNueva - xDefIni2) * e;
      A[def].y = yDefIni2 + (yDefNueva - yDefIni2) * e;
      A[def].z = zDefIni2 + (zDefNueva - zDefIni2) * e;
      A[def].rotY += 0.6;
      A[def].rotZ = Math.sin(t * Math.PI) * 0.6;
    });
    await esperar(15);
  }

  // 5. CAÍDA DIVINA
  mostrarTextoFx("¡¡CAÍDA DIVINA!!", "#00f0ff");
  slowMoActivo = true;
  timeScaleObjetivo = 0.15;
  await esperar(500);

  const yAtkIni = A[atk].y, xAtkIni = A[atk].x, zAtkIni = A[atk].z;
  const yDefIni2 = A[def].y, xDefIni2 = A[def].x, zDefIni2 = A[def].z;

  await tween(300, t => {
    const e = easeOut(t);
    A[atk].y = yAtkIni + e * 4;
    A[def].y = yDefIni2 + e * 4;
    A[atk].x = xAtkIni * (1 - e * 0.3);
    A[def].x = xDefIni2 * (1 - e * 0.3);
    A[atk].z = zAtkIni * (1 - e * 0.3);
    A[def].z = zDefIni2 * (1 - e * 0.3);
  });

  await tween(700, t => {
    const e = easeIn(t);
    A[atk].y = (yAtkIni + 4) * (1 - e);
    A[atk].x = xAtkIni * (1 - e);
    A[atk].z = zAtkIni * (1 - e);
    A[atk].rotZ = e * 0.8;
    A[atk].escala = 1 + e * 0.4;
    A[def].y = (yDefIni2 + 4) * (1 - e);
    A[def].x = xDefIni2 * (1 - e);
    A[def].z = zDefIni2 * (1 - e);
    if (Math.random() < 0.7) {
      estelasJugador.push(crearEstela(meshAtk.position.clone(), color, 0.9, 0.3));
    }
  });

  timeScaleObjetivo = 1;
  slowMoActivo = false;

  // 6. IMPACTO MASIVO
  const posSuelo = new THREE.Vector3(0, 0.5, 0);

  colorFlash = "#ffffff";
  flashGlobal = 1.0;
  camaraShake = 2.2;
  sacudidaExtra = 70;
  velocidadImpacto = 4.0;
  hitStop = 0.28;

  luzClash.intensity = 28;
  luzImpacto.intensity = 28;
  luzImpacto.position.copy(posSuelo);

  crearOnda(posSuelo, color, 70, 1.1);
  crearOnda(posSuelo, 0xffffff, 60, 1.0);
  crearOndaToro(posSuelo, color);
  crearOndaToro(posSuelo, 0xffffff);
  crearOndaToro(posSuelo, 0xffd60a);

  particulas3D(posSuelo, color, 180, 25);
  particulas3D(posSuelo, 0xffffff, 100, 20);
  particulas3D(posSuelo, 0xffd60a, 60, 22);

  sonido("especial");
  mostrarDanoEnemigo("¡KO!", true);

  // 7. DEFENSOR SALE DESPEDIDO AL SUELO Y QUEDA DERROTADO
  await tween(500, t => {
    const e = easeOut(t);
    A[def].x = dirDef * 4 * e;
    A[def].y = Math.sin(t * Math.PI) * 2;
    A[def].z = 0;
    A[def].rotZ = dirDef * e * 1.2;
  });

  // 8. ATACANTE VUELVE A SU LUGAR, PERO SE MANTIENE EN PIE
  await tween(600, t => {
    const e = easeOut(t);
    A[atk].x = 0; A[atk].y = 0; A[atk].z = 0;
    A[atk].rotZ = 0; A[atk].rotY = 0; A[atk].rotX = 0; A[atk].escala = 1;

    const cDef = meshDef.userData.cuerpo;
    if (cDef) {
      cDef.material.emissive.setHex(meshDef.userData.color);
      cDef.material.emissiveIntensity = 0.3;
    }
  });

  desactivarCamaraCine();

  // 9. ⭐ EL DEFENSOR QUEDA TIRADO EN EL SUELO, DERROTADO
  A[def].estado = "derrotado";
  A[def].x = dirDef * 4;      // lejos del centro
  A[def].y = 0.3;             // pegado al suelo
  A[def].z = 0;
  A[def].rotX = Math.PI / 2;  // ACOSTADO (rotación X para que quede horizontal)
  A[def].rotZ = dirDef * 1.2;
  A[def].rotY = dirDef * 0.5;
  A[def].escala = 1;

  // Apagar aura del derrotado
  if (meshDef.userData.aura) {
    meshDef.userData.aura.material.opacity = 0.02;
  }
  if (meshDef.userData.auraOscura) {
    meshDef.userData.auraOscura.material.opacity = 0;
  }

  // Sonido de derrota
  sonido("dano");

  // Pequeña animación de caída
  await tween(300, t => {
    A[def].rotX = Math.PI / 2 + Math.sin(t * Math.PI) * 0.1;
  });

  A[def].rotX = Math.PI / 2;

  // NO reseteamos al defensor para que quede tirado
  resetAnim(atk);
}

/* ============================ JUEGO ============================ */
function iniciarJuego() {
  document.getElementById("inicio").classList.add("oculto");
  document.getElementById("accion").style.display = "block";
  document.querySelectorAll(".overlay").forEach(o => o.remove());
  crearOverlayFlash();

  resetAnim("jugador");
  resetAnim("enemigo");
  hitStop = 0; sacudidaExtra = 0; flashGlobal = 0;
  timeScale = 1; timeScaleObjetivo = 1; slowMoActivo = false;
  modoCamara = "normal";

  jugadorMesh.position.set(X_JUGADOR, 0, 0);
  jugadorMesh.rotation.set(0, Math.PI/2, 0);
  jugadorMesh.scale.setScalar(1);

  reemplazarEnemigo(CONTINENTES[0].monstruo, CONTINENTES[0].color);
  enemigoMesh.rotation.set(0, -Math.PI/2, 0);
  enemigoMesh.scale.setScalar(1);

  E = {
    nivel:0, puntos:0, combo:0, mejorCombo:0,
    vidaJugador:100, vidaEnemigo:CONTINENTES[0].rival.vida,
    continente:CONTINENTES[0],
    bloqueado:true, rivalesVencidos:0, paisesUsados:[]
  };

  cargarNivel(0);
  setTimeout(siguientePregunta, 500);
}

function crearOverlayFlash() {
  let ov = document.getElementById("flashOverlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "flashOverlay";
    ov.style.cssText = "position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:35;transition:opacity .08s;";
    document.body.appendChild(ov);
  }
}

function cargarNivel(idx) {
  E.nivel = idx;
  E.continente = CONTINENTES[idx];
  E.vidaEnemigo = E.continente.rival.vida;
  E.vidaJugador = 100;
  E.combo = 0;
  E.paisesUsados = [];
  E.bloqueado = true;

  document.getElementById("enemigoNombre").textContent = E.continente.rival.nombre;
  document.getElementById("hudNivel").textContent = `${E.continente.emoji} ${E.continente.nombre} (${idx+1}/${CONTINENTES.length})`;

  reemplazarEnemigo(E.continente.monstruo, E.continente.color);
  enemigoMesh.rotation.set(0, -Math.PI/2, 0);

  luzEnemigo.color.setHex(E.continente.color);

  // Resetear estados
  A.jugador.estado = "idle";
  A.enemigo.estado = "idle";
  A.jugador.rotX = 0;
  A.enemigo.rotX = 0;

  actualizarVidas(true);
  actualizarHUD();
}

function mostrarOverlayVictoria() {
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `
    <h2>¡CONTINENTE CONQUISTADO!</h2>
    <p>${E.continente.emoji} ${E.continente.nombre} — ${E.continente.rival.nombre} derrotado</p>
    <button class="btn-grande" id="btnSiguiente">SIGUIENTE CONTINENTE ▶</button>
  `;
  document.body.appendChild(ov);
  sonido("victoria");
  camaraZoom = 3;
  document.getElementById("btnSiguiente").onclick = () => {
    ov.remove();
    const next = E.nivel + 1;
    if (next >= CONTINENTES.length) terminar(true);
    else { cargarNivel(next); setTimeout(siguientePregunta, 400); }
  };
}

/* ============================ BANDERA SVG ============================ */
function crearSVGBandera(nombrePais) {
  const svgContenido = BANDERAS_SVG[nombrePais] || `<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#555"/></svg>`;
  return svgContenido.replace(
    "<svg ",
    `<svg style="width:70px;height:auto;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.5);display:inline-block;vertical-align:middle;margin:0 8px;border:1px solid rgba(255,255,255,.2);" `
  );
}

/* ============================ PREGUNTAS ============================ */
function siguientePregunta() {
  E.bloqueado = false;
  const paises = E.continente.paises;
  let disponibles = paises.filter(p => !E.paisesUsados.includes(p.nombre));
  if (disponibles.length === 0) { E.paisesUsados = []; disponibles = [...paises]; }
  const pais = disponibles[Math.floor(Math.random()*disponibles.length)];
  E.paisesUsados.push(pais.nombre);

  const svgBandera = crearSVGBandera(pais.nombre);

  document.getElementById("pregunta").innerHTML =
    `${E.continente.emoji} <b>${E.continente.nombre}</b> — ¿A qué país pertenece esta bandera? ${svgBandera}`;

  const otros = paises.filter(p => p.nombre !== pais.nombre).sort(()=>Math.random()-0.5).slice(0,2);
  const opciones = [pais, ...otros].sort(()=>Math.random()-0.5);

  const cont = document.getElementById("opciones");
  cont.innerHTML = "";
  opciones.forEach(op => {
    const b = document.createElement("button");
    b.className = "opcion";
    b.textContent = op.nombre;
    b.onclick = () => responder(op.nombre === pais.nombre, b, pais);
    cont.appendChild(b);
  });
}

function responder(acierto, btn, paisCorrecto) {
  if (E.bloqueado) return;
  E.bloqueado = true;
  document.querySelectorAll(".opcion").forEach(b => b.disabled = true);

  if (acierto) {
    btn.classList.add("correcta");
    atacar(true);
  } else {
    btn.classList.add("incorrecta");
    document.querySelectorAll(".opcion").forEach(b => {
      if (b.textContent === paisCorrecto.nombre) b.classList.add("correcta");
    });
    atacar(false);
  }
}

async function atacar(acierto) {
  if (acierto) {
    E.combo++;
    if (E.combo > E.mejorCombo) E.mejorCombo = E.combo;

    let dano = DANO_BASE + (E.combo - 1) * DANO_COMBO;
    const vaAMorir = (E.vidaEnemigo - dano) <= 0;

    E.vidaEnemigo = Math.max(0, E.vidaEnemigo - dano);
    E.puntos += dano;

    await ejecutarAtaque(true, E.combo, dano, vaAMorir);

    mostrarDanoEnemigo("-" + dano, vaAMorir);
    actualizarVidas(false);
    actualizarHUD();

    if (E.vidaEnemigo <= 0) {
      // Dar tiempo para ver al monstruo derrotado
      setTimeout(() => {
        E.rivalesVencidos++;
        if (E.nivel + 1 >= CONTINENTES.length) terminar(true);
        else mostrarOverlayVictoria();
      }, 1200);
    } else {
      setTimeout(siguientePregunta, 600);
    }

  } else {
    E.combo = 0;
    actualizarHUD();
    await esperar(400);

    const dano = E.continente.rival.dano;
    E.vidaJugador = Math.max(0, E.vidaJugador - dano);

    await ejecutarAtaque(false, 1, dano, false);

    sonido("dano");
    mostrarDanoJugador("-" + dano);
    actualizarVidas(false);
    if (E.vidaJugador <= 0) setTimeout(() => terminar(false), 700);
    else setTimeout(siguientePregunta, 600);
  }
}

/* ============================ HUD ============================ */
function actualizarVidas(instant) {
  const vj = document.getElementById("vidaJugador");
  const ve = document.getElementById("vidaEnemigo");
  if (instant) { vj.style.transition = "none"; ve.style.transition = "none"; }
  vj.style.width = E.vidaJugador + "%";
  ve.style.width = (E.vidaEnemigo / E.continente.rival.vida * 100) + "%";
  document.getElementById("vidaJugadorTxt").textContent = E.vidaJugador;
  document.getElementById("vidaEnemigoTxt").textContent = E.vidaEnemigo;
  if (instant) setTimeout(() => { vj.style.transition = ""; ve.style.transition = ""; }, 50);
}

function actualizarHUD() {
  const c = document.getElementById("hudCombo");
  c.textContent = "🔥 COMBO x" + E.combo;
  c.classList.toggle("on", E.combo >= 2);
  document.getElementById("hudPuntos").textContent = "⭐ " + E.puntos;
}

/* ============================ DAÑO / FX ============================ */
function proyectar3D(v3) {
  const v = v3.clone().project(camera);
  return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight };
}
function mostrarDanoEnemigo(texto, especial) {
  const p = proyectar3D(new THREE.Vector3(enemigoMesh.position.x, enemigoMesh.position.y + 1.8, enemigoMesh.position.z));
  crearDano(p.x, p.y, texto, especial ? "#ffd60a" : "#ff2e88");
}
function mostrarDanoJugador(texto) {
  const p = proyectar3D(new THREE.Vector3(jugadorMesh.position.x, jugadorMesh.position.y + 1.8, jugadorMesh.position.z));
  crearDano(p.x, p.y, texto, "#ff3131");
}
function crearDano(x, y, texto, color) {
  const d = document.createElement("div");
  d.className = "dano"; d.textContent = texto; d.style.color = color;
  d.style.left = x + "px"; d.style.top = y + "px";
  d.style.transform = "translate(-50%,-50%)";
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1000);
}
function mostrarTextoFx(texto, color) {
  const t = document.createElement("div");
  t.className = "texto-fx"; t.textContent = texto; t.style.color = color;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1100);
}

/* ============================ FINAL ============================ */
function terminar(gano) {
  document.getElementById("accion").style.display = "none";
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.innerHTML = `
    <h2>${gano ? "¡CAMPEÓN DEL MUNDO!" : "DERROTA..."}</h2>
    <div class="trofeo">${gano ? "🏆" : "💀"}</div>
    <div class="nuevo-record" id="nr"></div>
    <div class="stats">
      <div class="stat"><div class="num">${E.puntos}</div><div class="lbl">PUNTOS</div></div>
      <div class="stat"><div class="num">${E.rivalesVencidos}/${CONTINENTES.length}</div><div class="lbl">CONTINENTES</div></div>
      <div class="stat"><div class="num">x${E.mejorCombo}</div><div class="lbl">MEJOR COMBO</div></div>
    </div>
    <button class="btn-grande" id="btnReiniciar">OTRA VEZ 🔄</button>
  `;
  document.body.appendChild(ov);

  const record = getRecord();
  const nr = document.getElementById("nr");
  if (E.puntos > record) {
    setRecord(E.puntos);
    nr.textContent = "🎉 ¡NUEVO RÉCORD!";
    sonido("victoria");
  } else nr.textContent = "🏆 Récord: " + record + " pts";

  document.getElementById("btnReiniciar").onclick = () => { ov.remove(); iniciarJuego(); };
}
function getRecord() { return parseInt(localStorage.getItem("dueloRecord") || "0"); }
function setRecord(v) { localStorage.setItem("dueloRecord", v); }

/* ============================ SONIDOS ============================ */
let actx = null;
function sonido(tipo) {
  if (!sonidoOn) return;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    if (tipo === "golpe") [200, 120].forEach((f,i)=>tono(f, t+i*0.04, 0.15, "sawtooth", 0.1));
    else if (tipo === "especial") [400, 600, 900, 1200].forEach((f,i)=>tono(f, t+i*0.04, 0.15, "square", 0.09));
    else if (tipo === "dano") tono(80, t, 0.35, "sawtooth", 0.14);
    else if (tipo === "victoria") [523,659,784,1047,1319].forEach((f,i)=>tono(f, t+i*0.12, 0.25, "sine", 0.12));
  } catch(e) {}
}
function tono(freq, ini, dur, tipo, vol=0.12) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = tipo; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ini);
  g.gain.exponentialRampToValueAtTime(0.001, ini+dur);
  o.connect(g); g.connect(actx.destination);
  o.start(ini); o.stop(ini+dur);
}
function toggleSonido() {
  sonidoOn = !sonidoOn;
  document.getElementById("btnSonido").textContent = sonidoOn ? "🔊" : "🔇";
}

/* ============================ INIT ============================ */
window.addEventListener("load", () => {
  try {
    initEscena();
    crearOverlayFlash();
    document.getElementById("recordIni").textContent = "🏆 Récord: " + getRecord() + " pts";
  } catch(err) {
    console.error("Error al iniciar Three.js:", err);
    alert("Error al cargar la escena 3D. Revisa la consola (F12).");
  }
});