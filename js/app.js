/* Mapa del Sistema — núcleo: carga de datos, router, estado global */
const App = {
  grafo: null, meta: null, nodos: new Map(), vista: null,

  async iniciar() {
    const [grafo, meta] = await Promise.all([
      fetch('data/grafo.json').then(r => r.json()),
      fetch('data/meta.json').then(r => r.json()),
    ]);
    this.grafo = grafo; this.meta = meta;
    grafo.nodos.forEach(n => this.nodos.set(n.id, n));
    document.getElementById('pie-stats').textContent =
      `${grafo.total_nodos} nodos · ${grafo.total_aristas} relaciones verificadas contra las fichas`;

    document.getElementById('panel-cerrar').onclick = () => this.cerrarPanel();
    window.addEventListener('hashchange', () => this.ruta());
    this.ruta();
  },

  setModo() { /* la versión Estudio es el único modo; el modo ciudadanía será app separada */ },

  ruta() {
    const hash = location.hash.replace('#/', '') || 'piramide';
    const [vista, arg] = hash.split('/');
    this.vista = vista;
    document.querySelectorAll('#nav-vistas a').forEach(a =>
      a.classList.toggle('activa', a.dataset.vista === vista));
    const cont = document.getElementById('vista');
    cont.innerHTML = '';
    const vistas = {
      piramide: VistaPiramide, grafo: VistaGrafo,
      temas: VistaTematica, tiempo: VistaTemporal,
    };
    (vistas[vista] || VistaPiramide).render(cont, arg, this);
    if (arg) this.abrirNodo(arg);
  },

  irANodo(id) { location.hash = `#/${this.vista}/${id}`; },

  abrirNodo(id) {
    const nodo = this.nodos.get(id);
    if (!nodo) return;
    if (nodo.tipo === 'norma') Ficha.mostrar(nodo, this);
    else Ficha.mostrarInfoNodo(nodo, this);
  },

  cerrarPanel() {
    document.getElementById('panel').classList.add('oculto');
  },

  abrirPanel() {
    document.getElementById('panel').classList.remove('oculto');
  },

  // Conexiones de un nodo (entrantes y salientes) para el panel de info
  conexiones(id) {
    return this.grafo.aristas.filter(a => a.origen === id || a.destino === id);
  },

  etiquetaArista(tipo) {
    const t = this.meta.tipos_arista.find(t => t.id === tipo);
    return t ? t.etiqueta : tipo;
  },

  nombreCorto(nodo) {
    return nodo.nombre.length > 60 ? nodo.nombre.slice(0, 57) + '…' : nodo.nombre;
  },

  badgeAlerta(nodo) {
    return nodo.alerta ? ' <span class="alerta" title="' + nodo.alerta + '">⚠️</span>' : '';
  },
};
