# Changelog — Mapa del Sistema

## Beta 0.4 — PDFs + footer + reglamentos (09-10-2026)
- 3 nuevos nodos-norma desde el acervo (fichas 38–40): D.S. 2/2016 (reglamento Ley 20.880), D.S. 661/2024 (reglamento Ley 19.886, reemplaza al derogado D.S. 250/2004) y D.S. 295/2025 (reporte de incidentes de ciberseguridad, art. 23 Ley 21.663), con sus aristas verificadas.
- Campo `pdf` en la data: botón "Ver documento oficial (PDF)" en normas y "Ver documento de referencia (PDF)" en compromisos y ODS; 40 PDFs oficiales del acervo servidos desde `pdfs/`.
- Alerta ⚠️ actualizada en Ley 21.719 (Boletín 18.623-07: posible postergación de vigencia al 01-12-2027).
- Pie de página con autoría (Universidad de Concepción), versión, changelog, formulario de comentarios y GitHub Issues.

## Beta 0.3 — Nodos aislados y legibilidad del grafo (01-10-2026)
- Nueva arista tipo 7 `responsable_de` (institución → compromiso) y aristas mecánicas `se_aplica_a` para nivel nacional: ningún nodo queda aislado (validación dura de build).
- Nuevas instituciones: MinCiencia, Ministerio de Energía, SUBPESCA.
- Física del grafo más espaciosa; componentes satélite atraídos suavemente a la red principal.
- Nodos de nivel territorial ocultos por defecto, con toggle por tipo en la leyenda.

## Beta 0.2 — Panel de detalle y descripciones (30-09-2026)
- Descripciones de nodos-horizonte: metas ODS con redacción oficial ONU (Agenda 2030) y compromisos del 6° Plan con texto oficial de la Actualización de Medio Término 2026.
- Validación de build: ningún nodo sin descripción.

## Beta 0.1 — Build inicial (30-09-2026)
- Grafo completo desde las 37 fichas del acervo: nodos-norma, institución, horizonte y nivel; 6 tipos de aristas con evidencia literal verificada.
- 5 vistas: pirámide, grafo con física, temática, temporal con slider de vigencia y ficha de detalle.
- Sitio estático desplegado en GitHub Pages.
