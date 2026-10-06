# taller


Node ≥ 23.6 ejecuta los `.ts` directamente. Reutiliza `verificador/` (importa sus módulos) y renderiza con `estudio/`.

## Uso

    npm install
    node --no-warnings src/cli.ts piezas buscar slope 45 --max 10
    node --no-warnings src/cli.ts piezas ver 3040
    node --no-warnings src/cli.ts construir diseno.ts --salida modelo.mpd
    node --no-warnings src/cli.ts validar modelo.mpd [--sub copa]
    node --no-warnings src/cli.ts render modelo.mpd --salida renders/ --vistas 34,frente,lado,34atras [--lado 64 --modo silueta] [--paso 3] [--sub copa]
    node --no-warnings src/cli.ts metricas modelo.mpd

`--paso` cuenta pasos globales, en el orden en que `LDrawLoader` los numera: primero los pasos de los sub-armados y después los del modelo principal.

## API del script de diseño

Está documentada al principio de [`src/dsl.ts`](src/dsl.ts). Resumen de los conectores:

- `{sobre: pieza, stud: [i, j]}`: el anti-stud propio (0,0, o el de `con`) queda sobre el stud `(i, j)` de `pieza`.
- `{debajo: pieza, antistud: [i, j]}`: el stud propio queda dentro del anti-stud `(i, j)` de `pieza`.
- `{conector: {de: pieza, n}, propio}`: encastra por índice de conector, tal como los lista `piezas ver` (sirve para pines, ejes, barras y agujeros).
- `{en: grilla(x, capas, z), rot: 'X90 Y45'}`: colocación libre; `en` en LDU y `rot` como giros por eje en grados. Se usa para clips y bisagras.
- `giro`: con `sobre` y `debajo` vale 0, 90, 180 o 270; con `conector` admite cualquier ángulo.

Sub-armados:

- La pieza base de `sobre`, `debajo` o `conector` puede estar en el mismo submodelo o dentro de un sub-armado ya colocado en él. Si ese sub-armado está colocado más de una vez, la pieza suelta es ambigua (error) y se elige la copia con la colocación: `const c = m.raiz.colocar(ala, …); … {sobre: c.pieza(punta), …}`. Las referencias se anidan: `c.pieza(d.pieza(x))`.
- `colocar(sub, {sobre, stud, ancla, con, giro})` (o `debajo`/`antistud`, o `conector`/`propio`) encastra el sub-armado entero: `ancla` es la pieza del sub-armado que hace el encastre, y queda donde quedaría como pieza suelta. Sin encastre, `colocar` sigue aceptando `en` y `rot`.
- `sub.poseDe(pieza)`: dónde está una pieza en el sistema de `sub`, sin cuentas a mano.

Notas de armado (optativas; LDraw las ignora, el verificador las lee):

- `sub.paso('raíces en molinete')` → `0 // PASO: …`. Mejor la función que la apariencia.
- `sub.paso('por abajo', {vista: 'debajo'})` → `0 ROTSTEP 180 0 0 ABS` (también `'atras'` o `[x, y, z]` en grados). El constructor gira el modelo: el verificador cambia qué es "abajo".
- `sub.revelar()` antes de cerrar el paso → `0 // REVELAR`. Aviso `intencion-revelar` si no queda en el último cuarto de los pasos de su archivo.

## Servidor de render persistente

Cada render sin servidor paga el empaquetado y el arranque de Remotion (~30 s). Con un servidor vivo baja a ~3–5 s:

    npm run servidor-render

- Puerto: variable `TALLER_RENDER_PUERTO` (7654 por defecto).
- El bundle se guarda en `../.cache/taller/bundle`, o en `TALLER_BUNDLE_DIR` si está definida.
- `render` prueba primero el servidor; si no responde, renderiza directo sin él (más lento, mismo resultado).




## Pruebas

    npm test             # rápidas
    npm run test:render  # renderizan con Remotion (minutos)

## Datos

Los mismos que el verificador, en `../.cache/`: biblioteca LDraw, shadow library y CSV de Rebrickable (`inventory_parts`, `colors`). El índice del catálogo se guarda en `../.cache/taller/catalogo.json` (`piezas reindexar` lo rehace).
