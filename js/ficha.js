/* Panel de ficha e info de nodo */
const Ficha = {
  async mostrar(nodo, app) {
    app.abrirPanel();
    const cont = document.getElementById('panel-contenido');
    cont.innerHTML = '<p class="meta">Cargando ficha…</p>';
    try {
      const r = await fetch(nodo.ficha_html);
      const htmlText = await r.text();
      const doc = new DOMParser().parseFromString(htmlText, 'text/html');
      const cuerpo = doc.querySelector('main.ficha');
      cont.innerHTML = '';
      const env = document.createElement('div');
      env.className = 'ficha';
      env.innerHTML = cuerpo.innerHTML;
      cont.appendChild(env);
      cont.prepend(this.bloqueMeta(nodo, app));
    } catch (e) {
      cont.innerHTML = '<p>No se pudo cargar la ficha.</p>';
    }
  },

  botonPdf(nodo) {
    if (!nodo.pdf) return '';
    const etiqueta = nodo.tipo === 'norma' ? 'Ver documento oficial (PDF)' : 'Ver documento de referencia (PDF)';
    const fuente = nodo.fuente_pdf ? `<span class="ev">Fuente: ${nodo.fuente_pdf}</span>` : '';
    return `<p class="pdf-cta"><a class="btn-pdf" href="${nodo.pdf}" target="_blank" rel="noopener">
      <span class="ico">⬇</span> ${etiqueta}</a> ${fuente}</p>`;
  },

  mostrarInfoNodo(nodo, app) {
    app.abrirPanel();
    const cont = document.getElementById('panel-contenido');
    cont.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'info-nodo';
    const tipoEt = { institucion: 'Institución', horizonte: 'Horizonte', nivel: 'Nivel territorial' }[nodo.tipo] || nodo.tipo;
    let html = `<h2>${nodo.nombre}${app.badgeAlerta(nodo)}</h2>
      <p class="meta"><span class="chip">${tipoEt}</span>${nodo.subtipo ? `<span class="chip">${nodo.subtipo}</span>` : ''}</p>
      ${nodo.alerta ? `<p class="alerta">⚠️ ${nodo.alerta}</p>` : ''}
      ${this.botonPdf(nodo)}`;
    if (nodo.descripcion) {
      html += `<p class="desc">${nodo.descripcion}</p>`;
      if (nodo.fuente_descripcion) html += `<p class="ev">Fuente: ${nodo.fuente_descripcion}</p>`;
    } else {
      html += `<p class="alerta">⚠️ Descripción por verificar.</p>`;
    }
    if (nodo.responsable) html += `<dl><dt>Institución responsable</dt><dd>${nodo.responsable}</dd></dl>`;
    if (nodo.estado_avance) html += `<dl><dt>Evaluación IRM-OGP</dt><dd>${nodo.estado_avance}</dd></dl>`;
    if (nodo.avance_2026) html += `<dl><dt>Avance registrado (Actualización 2026)</dt><dd>${nodo.avance_2026}</dd></dl>`;
    if (nodo.nota) html += `<p class="ev">${nodo.nota}</p>`;
    div.innerHTML = html;
    div.appendChild(this.listaConexiones(nodo, app));
    cont.appendChild(div);
  },

  bloqueMeta(nodo, app) {
    const div = document.createElement('div');
    div.className = 'info-nodo';
    let html = this.botonPdf(nodo) + `<dl>`;
    if (nodo.anio) html += `<dt>Año</dt><dd>${nodo.anio}</dd>`;
    html += `<dt>Rango</dt><dd>${nodo.rango}</dd>
      <dt>Estado</dt><dd>${nodo.estado}${nodo.alerta ? ` <span class="alerta">⚠️ ${nodo.alerta}</span>` : ''}</dd>
      <dt>Nivel</dt><dd>${nodo.nivel}</dd>`;
    if (nodo.fuente) html += `<dt>Fuente</dt><dd>${nodo.fuente}</dd>`;
    if (nodo.nota) html += `<dt>Nota del acervo</dt><dd>${nodo.nota}</dd>`;
    html += `</dl>`;
    div.innerHTML = html;
    div.appendChild(this.listaConexiones(nodo, app));
    return div;
  },

  listaConexiones(nodo, app) {
    const conex = app.conexiones(nodo.id);
    const div = document.createElement('div');
    div.className = 'info-nodo';
    if (!conex.length) { div.innerHTML = '<p class="meta">Sin conexiones registradas.</p>'; return div; }
    const items = conex.map(a => {
      const saliente = a.origen === nodo.id;
      const otro = app.nodos.get(saliente ? a.destino : a.origen);
      if (!otro) return '';
      const flecha = saliente ? '→' : '←';
      return `<li>${flecha} <strong>${app.etiquetaArista(a.tipo)}</strong> ·
        <a href="#/${app.vista}/${otro.id}">${app.nombreCorto(otro)}</a>${app.badgeAlerta(otro)}
        <span class="ev">«${a.evidencia}» (ficha-${String(a.ficha_evidencia).padStart(2, '0')})</span></li>`;
    }).join('');
    div.innerHTML = `<h3>Conexiones (${conex.length})</h3><ul class="conexiones">${items}</ul>`;
    return div;
  },
};
