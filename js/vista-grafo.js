/* Vista 2 — Grafo de relaciones con física (D3-force) */
const VistaGrafo = {
  render(cont, arg, app) {
    // Leyenda con filtros de tipo de arista
    const leyenda = document.createElement('div');
    leyenda.className = 'leyenda';
    const tiposOff = new Set();
    app.meta.tipos_arista.forEach(t => {
      const item = document.createElement('span');
      item.className = 'item';
      item.innerHTML = `<span class="muestra" style="background:${t.color}"></span>${t.etiqueta}`;
      item.onclick = () => {
        tiposOff.has(t.id) ? tiposOff.delete(t.id) : tiposOff.add(t.id);
        item.classList.toggle('apagado');
        aplicarFiltros();
      };
      leyenda.appendChild(item);
    });
    [['norma', 'var(--c-norma)'], ['institucion', 'var(--c-institucion)'],
     ['horizonte', 'var(--c-horizonte)'], ['nivel', 'var(--c-nivel)']].forEach(([tipo, color]) => {
      const item = document.createElement('span');
      item.className = 'item';
      item.innerHTML = `<span class="punto" style="background:${color}"></span>${tipo}`;
      leyenda.appendChild(item);
    });
    const nota = document.createElement('span');
    nota.className = 'meta';
    nota.textContent = ' Clic en un nodo: resalta vecinos y abre su detalle.';
    leyenda.appendChild(nota);
    cont.appendChild(leyenda);

    const svg = d3.select(cont).append('svg').attr('id', 'grafo-svg');
    const { width, height } = svg.node().getBoundingClientRect();

    const nodos = app.grafo.nodos.map(n => ({ ...n }));
    const aristas = app.grafo.aristas.map(a => ({ ...a, source: a.origen, target: a.destino }));
    const colorNodo = { norma: '#1e6fd9', institucion: '#8e44ad', horizonte: '#1e9e6a', nivel: '#c98a1e' };
    const colorArista = Object.fromEntries(app.meta.tipos_arista.map(t => [t.id, t.color]));
    const radio = { norma: 9, institucion: 8, horizonte: 6, nivel: 7 };

    const g = svg.append('g');
    svg.call(d3.zoom().scaleExtent([0.3, 4]).on('zoom', ev => g.attr('transform', ev.transform)));

    svg.append('defs').selectAll('marker').data(app.meta.tipos_arista).join('marker')
      .attr('id', d => `flecha-${d.id}`).attr('viewBox', '0 -5 10 10')
      .attr('refX', 16).attr('refY', 0).attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', d => d.color);

    const sim = d3.forceSimulation(nodos)
      .force('link', d3.forceLink(aristas).id(d => d.id).distance(70))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('colision', d3.forceCollide(16));

    const link = g.append('g').selectAll('line').data(aristas).join('line')
      .attr('stroke', d => colorArista[d.tipo]).attr('stroke-width', 1.3).attr('stroke-opacity', .6)
      .attr('marker-end', d => `url(#flecha-${d.tipo})`);

    const node = g.append('g').selectAll('g').data(nodos).join('g')
      .attr('class', 'nodo-svg')
      .call(d3.drag()
        .on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append('circle')
      .attr('r', d => radio[d.tipo] || 7)
      .attr('fill', d => colorNodo[d.tipo] || '#999')
      .attr('stroke', '#fff').attr('stroke-width', 1.5);
    node.append('text')
      .attr('x', 11).attr('y', 3)
      .text(d => d.nombre.length > 34 ? d.nombre.slice(0, 31) + '…' : d.nombre);
    node.append('title').text(d => `${d.nombre}${d.alerta ? '\n⚠️ ' + d.alerta : ''}`);
    // anillo de alerta ⚠️
    node.filter(d => !!d.alerta).append('circle')
      .attr('r', d => (radio[d.tipo] || 7) + 3.5)
      .attr('fill', 'none').attr('stroke', '#b3261e').attr('stroke-dasharray', '3 2');

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // clic: resalta vecinos y abre detalle
    const vecinos = new Map();
    aristas.forEach(a => {
      const s = a.source.id || a.source, t = a.target.id || a.target;
      if (!vecinos.has(s)) vecinos.set(s, new Set());
      if (!vecinos.has(t)) vecinos.set(t, new Set());
      vecinos.get(s).add(t); vecinos.get(t).add(s);
    });
    let seleccion = null;
    node.on('click', (ev, d) => {
      ev.stopPropagation();
      if (seleccion === d.id) { seleccion = null; node.classed('atenuado', false); link.classed('atenuado', false); return; }
      seleccion = d.id;
      const v = vecinos.get(d.id) || new Set();
      node.classed('atenuado', n => n.id !== d.id && !v.has(n.id));
      link.classed('atenuado', a => {
        const s = a.source.id || a.source, t = a.target.id || a.target;
        return s !== d.id && t !== d.id;
      });
      app.abrirNodo(d.id);
    });
    svg.on('click', () => { seleccion = null; node.classed('atenuado', false); link.classed('atenuado', false); });

    function aplicarFiltros() {
      link.style('display', d => tiposOff.has(d.tipo) ? 'none' : null);
    }
  },
};
