# Mapa del Sistema — Versión Estudio

Mapa interactivo del marco normativo chileno de Gobierno Abierto: grafo navegable con
5 vistas (pirámide, grafo con física, temática, temporal, ficha de nodo), construido
como sitio estático (vanilla JS + D3.js vendored, sin backend ni build step).

**Estado:** Beta 0.4 (09-10-2026) — versión Estudio. URL pública:
<https://bedeberna-debug.github.io/mapa-del-sistema/> (GitHub Pages, rama `main`).
Historial de cambios en [CHANGELOG.md](CHANGELOG.md).
El modo ciudadanía se desarrollará como aplicación separada
(`plataforma/mapa-ciudadania/`, ver `plataforma/02 - brief modo ciudadania.md`).

## a) Cómo correrlo localmente

Requisito: Node.js (cualquier versión reciente; no hay dependencias npm).

```bash
cd plataforma/mapa-del-sistema
npm run dev                  # sirve en http://localhost:7100/ por defecto
node server.js --port 8080   # puerto personalizado
```

Alternativa sin Node: cualquier servidor estático, p.ej. `python -m http.server` desde
esta carpeta. El sitio es 100% estático y desplegable tal cual en GitHub Pages /
Netlify / Cloudflare Pages.

## b) Cómo se compila la data

La fuente de verdad es el acervo en `marco normativo/` (40 fichas `.md` + índice maestro).
El compilador vive **fuera** de esta carpeta: `plataforma/tools/compilar_grafo.py`.

```bash
python plataforma/tools/compilar_grafo.py    # desde la raíz del workspace
```

Genera/regenera:
- `data/grafo.json` — nodos + aristas del grafo
- `data/meta.json` — leyenda (tipos de arista, temas, tipos de nodo, alertas ⚠️)
- `fichas/*.html` — las 40 fichas pre-compiladas desde Markdown
- `pdfs/*.pdf` — 40 PDFs oficiales copiados del acervo (nombres normalizados en minúscula)
- `plataforma/tools/reporte_parseo.md` — reporte de verificación

**Reglas duras del build:**
1. Cada arista curada lleva una cita de evidencia que el compilador verifica como
   subcadena literal de la ficha indicada; si no existe, el build la reporta como error.
   Excepciones declaradas: aristas `responsable_de` (evidencia = texto oficial del 6° Plan
   en `_extractos/C/`, campo `fuente_evidencia`) y aristas mecánicas `se_aplica_a`
   (derivadas del atributo `nivel` del nodo, flag `mecanica: true`).
2. Ningún nodo sin `descripcion` (warning).
3. Ningún nodo aislado: si un nodo queda con grado 0, el build lo lista como error.
4. Todo PDF declarado en el mapa debe existir en el acervo; si falta, es error.

Último build: **86 nodos, 290 aristas, 40 PDFs, 0 errores, 0 avisos**.

**Regla de propiedad:** esta carpeta (`plataforma/mapa-del-sistema/`) es de la versión
Estudio. Los datos se corrigen en el acervo (`marco normativo/`) y se recompilan —
nunca se edita `grafo.json` a mano.

## c) Contrato del esquema de `grafo.json`

```json
{ "generado": "...", "total_nodos": 86, "total_aristas": 290,
  "nodos": [...], "aristas": [...] }
```

### Nodos — campos comunes

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador estable (ej. `ley-20285`, `comp-02`, `ods-16-6`, `inst-cplt`) |
| `tipo` | string | `norma` \| `institucion` \| `horizonte` \| `nivel` |
| `nombre` | string | Nombre para mostrar |
| `descripcion` | string | Texto descriptivo (obligatorio; el build advierte si falta) |
| `fuente_descripcion` | string\|null | Origen de la descripción |
| `pdf` | string\|null | Ruta relativa al documento oficial, ej. `pdfs/ley-20285.pdf` (null en instituciones y niveles) |
| `fuente_pdf` | string\|null | Fuente del documento (LeyChile BCN / 6° Plan / ONU) |
| `alerta` | string\|null | Dato vivo ⚠️ por verificar antes de publicar |
| `nota` | string\|null | Nota aclaratoria del acervo |
| `temas` | string[] | Subconjunto de: `transparencia`, `participacion`, `integridad`, `digital`, `datos` |

### Nodos `norma` (40) — campos adicionales

| Campo | Descripción |
|---|---|
| `ficha` | Número de ficha del acervo (1–40) |
| `anio` | Año de promulgación/emisión (para la vista temporal) |
| `rango` | `constitucional` \| `orgánica constitucional` \| `ley` \| `decreto` \| `DFL` \| `internacional (...)` \| `soft law` |
| `grupo` | Grupo del acervo: `A`–`F` |
| `nivel` | `nacional` \| `regional` \| `municipal` |
| `estado` | Estado de vigencia en texto libre |
| `fuente` | Fuente documental (ej. `LeyChile (BCN)`) |
| `ficha_html` | Ruta a la ficha compilada, ej. `fichas/ficha-02-....html` |

### Nodos `horizonte` — dos subtipos

- `subtipo: "compromiso"` (12): campos adicionales `responsable` (institución oficial),
  `estado_avance` (evaluación IRM-OGP o "por verificar"), `avance_2026` (opcional;
  progreso registrado en la Actualización de Medio Término 2026). Todos comparten el
  mismo `pdf`: el 6° Plan de Estado Abierto 2023-2027 (Actualización 2026).
- `subtipo: "ods"` (16): `descripcion` = redacción oficial ONU de la meta/objetivo
  (A/RES/70/1) + relevancia derivada del acervo; `fuente_descripcion` = "Meta oficial
  ONU — Agenda 2030"; `pdf` = Agenda 2030 (ONU).

### Aristas

| Campo | Descripción |
|---|---|
| `origen`, `destino` | `id` de nodos |
| `tipo` | `modifica` \| `desarrolla_reglamenta` \| `complementa` \| `opera` (norma→institución) \| `da_soporte_a` (norma→compromiso/ODS) \| `se_aplica_a` (nivel territorial) \| `responsable_de` (institución→compromiso) |
| `evidencia` | Cita literal que respalda la arista |
| `ficha_evidencia` | Número de ficha donde se verificó la cita (`null` en aristas `responsable_de` y mecánicas) |
| `fuente_evidencia` | Solo en `responsable_de`: documento oficial de respaldo (6° Plan, Actualización 2026) |
| `mecanica` | `true` en las `se_aplica_a` generadas por regla desde el atributo `nivel` del nodo |
| `verificada` | `true` si el build validó la arista |

## d) Issues conocidos y pendientes

**Datos vivos ⚠️ (verificar antes de publicar):**
- `ley-21719` — vigencia 01-12-2026; Boletín 18.623-07 postergaría al 01-12-2027
  (Gobierno en evaluación, ago-2026; Agencia sin Consejo Directivo)
- `dfl-1-2020` — fin de vigencia 04-02-2026
- `ley-21595` — fin de vigencia 24-02-2027 (según LeyChile)
- `ley-20880` — modificada por Ley 21.735/2025, vigencia diferida al 01-03-2027
- `ley-19886` — transformación por Ley 21.634/2023 en vigencia gradual
- `irm-2025` — el documento del acervo es de pre publicación ("no citar o difundir"); usar versión final

**Resueltos:**
- (08/09-10-2026) Reglamentos faltantes incorporados: D.S. 2/2016, D.S. 661/2024
  (reemplaza al derogado D.S. 250/2004) y D.S. 295/2025 (fichas 38-40).
- (01-10-2026) Nodos aislados eliminados: arista `responsable_de` + `se_aplica_a`
  mecánicas; validación de grado 0 en el build.
- (30-09-2026) Número de compromisos del 6° Plan: la Actualización de Medio Término
  2026 agregó el compromiso 12 (ENIP); el plan vigente tiene **12 compromisos**
  (verificado contra el texto oficial, extracto en `marco normativo/_extractos/C/`).
- (30-09-2026) Discrepancias de las fichas 31 y 35 corregidas en el acervo.

**Pendientes:**
- Enlace del formulario "Comentarios y propuestas": placeholder `forms.gle/PENDIENTE`
  en el pie de página, a reemplazar por la URL real.
- Instructivo Presidencial 005/2012: PDF escaneado sin capa de texto; no citable hasta
  obtener versión con texto.
- El IRM 2025 evalúa el *diseño* del plan (potencial), no resultados de cumplimiento;
  la revisión de resultados corresponde al cierre del ciclo (2027-2028).
- Modo ciudadanía: se implementará como app separada (`plataforma/mapa-ciudadania/`).
- Fase 2 (no construida): simulador de solicitud Ley 20.285, visor de compromisos con
  estado de avance, capa municipal por comuna.

## Estructura

```
mapa-del-sistema/
├── index.html            # shell + router de vistas + pie de página
├── CHANGELOG.md          # historial de versiones (Beta 0.1 → 0.4)
├── css/app.css           # estilos (incluye reglas de la vista ficha en panel)
├── css/ficha.css         # estilos de fichas HTML abiertas sueltas
├── js/app.js             # carga de datos, router, estado global
├── js/ficha.js           # panel lateral: ficha / info de nodo + botón PDF
├── js/vista-piramide.js  # vista 1: capas por jerarquía normativa
├── js/vista-grafo.js     # vista 2: D3-force, filtros por tipo de arista y de nodo
├── js/vista-tematica.js  # vista 3: filtros por principio
├── js/vista-temporal.js  # vista 4: slider de vigencia 1986–2027
├── data/grafo.json       # GENERADO — no editar a mano
├── data/meta.json        # GENERADO — no editar a mano
├── fichas/*.html         # GENERADO — 40 fichas pre-compiladas
├── pdfs/*.pdf            # GENERADO — 40 PDFs oficiales del acervo (binarios vía .gitattributes)
├── vendor/d3.v7.min.js   # D3.js local (sin CDN)
├── server.js             # servidor estático de desarrollo (sin deps)
└── package.json          # npm run dev
```
