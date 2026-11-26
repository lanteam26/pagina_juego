// Para añadir una historia, agrega una entrada con id, título, portada y enlace.
// Sin href se muestra como «Próximamente» y nunca abre un enlace incompleto.
window.HISTORIAS = [
  { id: 'principito', title: 'El Principito', cover: 'assets/principito.png',
    description: 'Una aventura para descubrir el valor de la amistad y mirar el mundo con curiosidad.' },
  { id: 'bertha', title: 'La gran aventura de Bertha Benz', cover: 'assets/bertha.png',
    href: 'cuentos/bertha-benz/index.html', kicker: 'Historia e inventos',
    description: 'Acompaña a Bertha y a sus hijos en el viaje que ayudó a demostrar que el automóvil podía recorrer grandes distancias. Una aventura sobre ingenio, valentía y perseverancia.' },
  { id: 'cerditos', title: 'Los tres cerditos', cover: 'assets/cerditos.png', href: 'cuentos/los-tres-cerditos/index.html',
    description: 'Tres hermanos construyen sus casas y descubren la importancia del esfuerzo y la colaboración.' },
  { id: 'ada', title: 'Ada Lovelace', shortTitle: 'Ada Lovelace', cover: 'cuentos/ada-lovelace/assets/portada.png', href: 'cuentos/ada-lovelace/index.html', symbol: '⚙',
    kicker: 'Imaginación y tecnología', description: 'Conoce a una pionera de la programación y explora cómo las matemáticas y la imaginación pueden trabajar juntas.' },
  {"id": "olga", "title": "Olga Lock Sing", "shortTitle": "Olga Lock Sing", "cover": "assets/olga.png", "href": "cuentos/olga-lock-sing/index.html", "kicker": "Ciencia y naturaleza", "description": "Conoce a una científica peruana que investigó las plantas, compartió sus conocimientos y nunca dejó de aprender."},
  { id: 'nueva-aventura', title: 'Una nueva aventura', shortTitle: 'Próximamente', symbol: '✦', tone: 'garnet',
    description: 'Un nuevo libro llegará pronto a nuestra biblioteca. ¡Todavía hay muchas aventuras por descubrir!' },
  { id: 'nueva-historia', title: 'Una historia por descubrir', shortTitle: 'Próximamente', symbol: '✧', tone: 'forest',
    description: 'Estamos preparando más historias para seguir aprendiendo, imaginando y explorando juntos.' }
];

// Categories stay separate from the story definitions so new books reuse the same UI.
window.SECCIONES=[{id:'fabulas',title:'Fábulas',cover:'assets/categorias/fabula.png'},{id:'cuentos',title:'Cuentos',cover:'assets/categorias/cuentos.png'},{id:'mujeres',title:'Mujeres que marcaron la historia',cover:'assets/categorias/mujeres.png'}];
for(const story of window.HISTORIAS)story.category=['bertha','ada','olga'].includes(story.id)?'mujeres':story.id==='nueva-historia'?'fabulas':'cuentos';
