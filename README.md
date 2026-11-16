# Un gol entre todos

Pieza pedagógica digital sobre el conflicto del barrio **El Retiro** (Distrito de Aguablanca, Cali) y una propuesta para transformarlo de forma pacífica. Es una página de una sola pantalla larga, en español, pensada para recorrerse en menos de cinco minutos.

Trabajo académico de la asignatura Resolución Pacífica de Conflictos (Laboratorio Social, Fase 3), Ingeniería Informática, Universidad Autónoma de Occidente. No es un sitio oficial de la Alcaldía de Cali ni de la Secretaría de Paz y Cultura Ciudadana.

## Qué muestra

Seis secciones, en este orden:

1. **Contexto:** el laboratorio comunitario de cinco momentos y la mirada histórica traída del Bogotazo.
2. **Interpretación:** violencia directa, cultural y estructural (Galtung) y tres modelos: adversarial, relacional y estructural-transformador.
3. **Propuesta:** «Un gol entre todos», con cuatro líneas.
4. **Fundamentación:** por qué es necesario transformar el conflicto y por qué la propuesta es transformadora, con sus límites y riesgos.
5. **Ruta:** 12 meses en 4 etapas, con indicadores de seguimiento.
6. **Horizonte:** cómo se vería El Retiro si la propuesta funciona y qué aprendió el equipo.

## Estructura del repositorio

```
.
├── index.html          Página única
├── assets/
│   ├── css/            Estilos
│   ├── js/             Interacciones (línea de tiempo, pestañas, Gantt, navegación)
│   ├── fonts/          Tipografías autoalojadas
│   └── img/            Gráficos SVG propios y vista previa para redes (og-image)
├── docs/
│   └── informe.docx    Informe escrito que sirve de fuente del contenido
└── README.md
```

La página es estática: no necesita instalar dependencias ni compilar nada.

## Ejecutar en local

Abre `index.html` en el navegador, o sirve la carpeta para que las fuentes y los scripts carguen igual que en producción:

```bash
python3 -m http.server 8000
# luego visita http://localhost:8000
```

## Publicar

Al ser un sitio estático, sirve cualquier hosting de archivos. Con GitHub Pages: en el repositorio, **Settings → Pages**, elige la rama `main` y la carpeta raíz (`/`).

## Decisiones de diseño

- **Paleta:** negro, blanco cálido y un solo acento cálido. No lleva azul.
- **Tipografía:** una serif para titulares y una sans para el texto, autoalojadas.
- **Animación:** pocas y sobrias; se desactivan si el sistema pide movimiento reducido (`prefers-reduced-motion`).
- **Accesibilidad:** contraste AA, foco visible, navegación completa con teclado y texto alternativo en los gráficos.
- **Responsive:** probada en móvil (375 px), tablet y escritorio (1440 px).

## Contenido y privacidad

- Todo el contenido proviene del informe en `docs/`. Las actas se citan como «Acta 168», «Acta 200», etc.
- La página no incluye nombres de vecinos, jóvenes, la líder ni funcionarios, ni teléfonos, correos o fotos de menores. La líder aparece solo como «la líder articuladora»; las niñas, niños y jóvenes, solo como colectivo.

## Límites del trabajo

El análisis se basa en cinco actas de la Secretaría de Paz y Cultura Ciudadana (Hablámelo con Cultura Ciudadana, Alcaldía de Santiago de Cali, 2025), sin trabajo de campo propio. La propuesta es una hipótesis que habría que ajustar con la comunidad.

## Fuentes principales

Actas 154, 161, 168, 173 y 200 de Hablámelo con Cultura Ciudadana; Galtung (1990); Muñoz (2004); Lederach (1998); Arias (1998); Comisión de la Verdad (2022); Pizarro Leongómez (1989). La lista completa está en el informe.

## Equipo

Comunidad de Indagación 2, Ingeniería Informática, UAO.

- Samuel Lopez Gutierrez
- Juan Sebastian Bermudez
- Emmanuel Beltran
- Matthew Arana

Docente: Cesar Andres Garzon Valencia.
