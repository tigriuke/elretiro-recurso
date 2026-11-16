# Un gol entre todos

Pieza pedagógica digital del Laboratorio Social (Fase 3: Transformar) de Resolución Pacífica de Conflictos, UAO. Comunidad de Indagación 2, caso El Retiro (Cali).

## Abrirla

Doble clic en `index.html`. No necesita servidor ni conexión: las fuentes están dentro de `fonts/`.

Para publicarla, sube la carpeta tal cual a GitHub Pages o Netlify (es un sitio estático).

## Estructura

```
index.html        contenido (todo sale del informe de la Fase 3)
css/styles.css    estilos, paleta y animaciones
js/main.js        navegación, pestañas, capas y Gantt (sin dependencias)
fonts/            Fraunces e Inter Tight (licencia OFL)
og-image.png      imagen para compartir el enlace
fuente/           informe, guía y rúbrica originales
capturas/         capturas de verificación (375 px y 1440 px)
pruebas/          scripts de Playwright usados para verificar
```

## Volver a correr las pruebas

Con un servidor local en el puerto 8765 (`python -m http.server 8765`) y `playwright-cli` instalado:

```
playwright-cli open http://127.0.0.1:8765/
playwright-cli run-code --filename=pruebas/test.js
playwright-cli run-code --filename=pruebas/mobile.js
playwright-cli run-code --filename=pruebas/a11y.js
```
