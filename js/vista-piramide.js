/* Vista 1 — Pirámide de capas del sistema */
const VistaPiramide = {
  ORDEN_CAPAS: [
    { id: 'constitucional', titulo: 'Constitución y reformas constitucionales' },
    { id: 'orgánica constitucional', titulo: 'Leyes orgánicas constitucionales' },
    { id: 'ley', titulo: 'Leyes' },
    { id: 'DFL', titulo: 'Decretos con fuerza de ley' },
    { id: 'DS', titulo: 'Reglamentos (decretos supremos)' },
    { id: 'internacional', titulo: 'Instrumentos internacionales' },
    { id: 'soft law', titulo: 'Planes, políticas y soft law' },
  ],

  render(cont, arg, app) {
    const normas = app.grafo.nodos.filter(n => n.tipo === 'norma');
    cont.innerHTML = `<p class="intro">El marco ordenado por jerarquía normativa. Las normas del nivel
      municipal y regional llevan su distintivo. Clic en cualquier tarjeta para abrir su ficha.</p>`;
    const asignadas = new Set();
    const enCapa = (n, capa) =>
      capa.id === 'internacional' ? n.rango.startsWith('internacional') : n.rango === capa.id;
    for (const capa of this.ORDEN_CAPAS) {
      const nodos = normas.filter(n => enCapa(n, capa));
      nodos.forEach(n => asignadas.add(n.id));
      if (!nodos.length) continue;
      const div = document.createElement('div');
      div.className = 'capa';
      div.innerHTML = `<div class="capa-titulo">${capa.titulo} (${nodos.length})</div>`;
      const grid = document.createElement('div');
      grid.className = 'capa-nodos';
      nodos.sort((a, b) => (a.anio || 0) - (b.anio || 0));
      nodos.forEach(n => grid.appendChild(this.tarjeta(n, app)));
      div.appendChild(grid);
      cont.appendChild(div);
    }
    // Red de seguridad: ninguna norma queda invisible por rango no clasificado
    const sueltas = normas.filter(n => !asignadas.has(n.id));
    if (sueltas.length) {
      console.warn('Pirámide: normas sin capa clasificada:', sueltas.map(n => `${n.id} (rango "${n.rango}")`));
      const div = document.createElement('div');
      div.className = 'capa';
      div.innerHTML = `<div class="capa-titulo">⚠️ Sin clasificar (${sueltas.length})</div>`;
      const grid = document.createElement('div');
      grid.className = 'capa-nodos';
      sueltas.forEach(n => grid.appendChild(this.tarjeta(n, app)));
      div.appendChild(grid);
      cont.appendChild(div);
    }
  },

  tarjeta(n, app) {
    const t = document.createElement('div');
    t.className = 'tarjeta';
    const nivel = n.nivel !== 'nacional' ? `<span class="chip">${n.nivel}</span>` : '';
    t.innerHTML = `<div class="nombre">${n.nombre}${app.badgeAlerta(n)}</div>
      <div class="meta">${n.anio || 's/a'} · ${n.rango} ${nivel}</div>`;
    t.onclick = () => app.irANodo(n.id);
    return t;
  },
};
