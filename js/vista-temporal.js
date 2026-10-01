/* Vista 4 — Temporal: slider de vigencia 1980 → 2027 */
const VistaTemporal = {
  render(cont, arg, app) {
    const normas = app.grafo.nodos.filter(n => n.tipo === 'norma' && n.anio);
    const anioMin = Math.min(...normas.map(n => n.anio));
    const ANIO_MAX = 2027;

    cont.innerHTML = `
      <p class="intro">Desliza para ver cómo se construyó el sistema año a año.
      Los nodos con ⚠️ tienen datos de vigencia por verificar.</p>
      <div class="slider-fila">
        <input type="range" id="slider-anio" min="${anioMin}" max="${ANIO_MAX}" value="${ANIO_MAX}" step="1">
        <span class="anio-actual" id="anio-actual">${ANIO_MAX}</span>
      </div>
      <div id="timeline"></div>`;

    const slider = cont.querySelector('#slider-anio');
    const etiqueta = cont.querySelector('#anio-actual');
    const timeline = cont.querySelector('#timeline');

    const pintar = (anio) => {
      etiqueta.textContent = anio;
      timeline.innerHTML = '';
      const visibles = normas.filter(n => n.anio <= anio)
        .sort((a, b) => b.anio - a.anio);
      const resumen = document.createElement('p');
      resumen.className = 'meta';
      resumen.textContent = `${visibles.length} de ${normas.length} normas ya existían en ${anio}.`;
      timeline.appendChild(resumen);

      let anioGrupo = null, grupo = null;
      visibles.forEach(n => {
        if (n.anio !== anioGrupo) {
          anioGrupo = n.anio;
          grupo = document.createElement('div');
          grupo.className = 'grupo-anio';
          grupo.innerHTML = `<h3>${n.anio}</h3>`;
          timeline.appendChild(grupo);
        }
        const t = document.createElement('div');
        t.className = 'tarjeta';
        t.innerHTML = `<div class="nombre">${n.nombre}${app.badgeAlerta(n)}</div>
          <div class="meta">${n.rango} · ${n.estado}</div>`;
        t.onclick = () => app.irANodo(n.id);
        grupo.appendChild(t);
      });
    };

    slider.oninput = () => pintar(+slider.value);
    pintar(ANIO_MAX);
  },
};
