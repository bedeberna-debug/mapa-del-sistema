/* Vista 3 — Temática: filtros por principio de gobierno abierto */
const VistaTematica = {
  render(cont, arg, app) {
    const filtros = document.createElement('div');
    filtros.className = 'filtros';
    cont.appendChild(filtros);
    const lista = document.createElement('div');
    cont.appendChild(lista);

    let activo = null;
    const pintar = () => {
      lista.innerHTML = '';
      const normas = app.grafo.nodos.filter(n =>
        n.tipo === 'norma' && (!activo || (n.temas || []).includes(activo)));
      const aviso = document.createElement('p');
      aviso.className = 'meta';
      aviso.textContent = activo
        ? `${normas.length} normas en «${app.meta.temas.find(t => t.id === activo).etiqueta}».`
        : 'Elige un principio para filtrar el marco.';
      lista.appendChild(aviso);
      normas.sort((a, b) => (a.anio || 0) - (b.anio || 0));
      normas.forEach(n => {
        const t = document.createElement('div');
        t.className = 'tarjeta';
        t.innerHTML = `<div class="nombre">${n.nombre}${app.badgeAlerta(n)}</div>
          <div class="meta">${n.anio || 's/a'} · ${n.rango} · grupo ${n.grupo}</div>`;
        t.onclick = () => app.irANodo(n.id);
        lista.appendChild(t);
      });
    };

    app.meta.temas.forEach(t => {
      const b = document.createElement('button');
      b.textContent = t.etiqueta;
      b.onclick = () => {
        activo = activo === t.id ? null : t.id;
        filtros.querySelectorAll('button').forEach(x => x.classList.remove('activo'));
        if (activo) b.classList.add('activo');
        pintar();
      };
      filtros.appendChild(b);
    });
    pintar();
  },
};
