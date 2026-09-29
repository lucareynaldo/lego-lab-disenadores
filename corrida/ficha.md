# Ficha — Cerezo en flor

## Especie y forma

**Cerezo japonés en plena floración (*Prunus* × *yedoensis*, 'Somei-yoshino').**

Por qué:

- Se reconoce al instante por el color: una copa rosa pálido sin una sola hoja verde, porque florece antes de echar hojas (§2, floración de primavera). Ningún otro árbol común se ve así.
- Su forma natural es **extendida, sobre un esqueleto en vaso**: un tronco corto que se abre enseguida en pocas ramas gruesas que salen hacia afuera y se curvan hacia arriba. Según §3, la copa amplia sobre tronco corto es la forma que más gusta y más alegría genera (Sommer y Summit; Lohr y Pearson-Mims 2006).
- El armado tiene una historia: primero se ve el árbol de invierno, que es solo la estructura de ramas (§2, color según la estación), y al final florece. Esa es la revelación del video.

## Escala

Maqueta de mesa, **1 stud ≈ 80 cm (≈ 1:100)**. Un yoshino adulto mide 8–12 m de alto y tiene una copa igual de ancha o más. El modelo mide 15 ladrillos de alto (≈ 14,5 cm, o sea ≈ 14,5 m reales) y la copa ocupa 16 studs (≈ 12,7 m): es un yoshino grande y viejo. El tronco de 2 × 2 (≈ 1,6 m) es más grueso que uno real. Lo exagero a propósito para que se lea a 64 px. El farol de piedra mide unos 3,5 m a esta escala y sirve de referencia de tamaño.

## Los rasgos que no pueden faltar

1. **Copa toda de flor, rosa pálido y blanco, sin verde.** Con verde sería un árbol cualquiera, y con un rosa fuerte y parejo parecería un árbol de fantasía. La mezcla de rosa claro y blanco es la del yoshino.
2. **Copa en nubes separadas, con huecos**, por donde se ven las ramas oscuras. El contraste entre la rama oscura y la flor clara es la imagen típica del cerezo (§2, huecos en la copa).
3. **Tronco corto y oscuro que se divide pronto en ramas gruesas que se curvan hacia afuera y hacia arriba** (crecimiento decurrente, §2), con el ensanche de raíces a ras del suelo.

Refuerzo, no imprescindible: los pétalos caídos alrededor del tronco y el farol de piedra, que ubica al árbol en un jardín japonés.

## Tres conceptos

**A. "Nubes sobre colas".** La silueta es un paraguas ancho de nubes rosas y blancas sobre un tronco corto. Paleta: rosa claro y blanco para la flor, marrón para la madera, pasto verde y pétalos rosas en el suelo. Las ramas son **colas de animal**, piezas curvas y afinadas que salen del tronco por pinzas. Sub-armados: base redonda, tronco con raíces y ramas, y nubes. Revelación: se arma un árbol pelado de invierno y en los últimos pasos florece, de abajo hacia la nube de la cima.

**B. "Cerezo llorón" (shidare-zakura).** Silueta de fuente: un tronco alto del que caen cortinas rosas hasta casi el suelo. Paleta: rosa oscuro y rosa claro sobre marrón. Sub-armados: base con estanque, tronco, arco de ramas y cortinas. Revelación: las cortinas se cuelgan al final y el árbol "llora". Riesgo: las piezas que cuelgan necesitan una pinza en cada punta, gastan muchas piezas y a 64 px la silueta se parece a una palmera.

**C. "Jacarandá en la vereda".** Copa extendida lila sobre un tronco en V, con la alfombra violeta sobre baldosas grises. Sub-armados: vereda, tronco en V y copa en dos mitades. Revelación: las dos mitades de la copa se cierran sobre el tronco. Riesgo: fuera del Río de la Plata un árbol violeta se lee como fantasía, porque el rasgo de especie depende de un color que no todos conocen.

**Elijo A.** Es la que mejor cumple con reconocerse al instante (rosa sobre ramas oscuras), la forma extendida es la preferida según §3, y la revelación sale de la biología: el árbol florece antes de tener hojas. Además, las colas de animal dan la curva afinada que un ladrillo recto no logra.

## Proceso

- **Boceto** (`boceto.ts`, `renders/boceto.png`): tronco de ladrillos 2 × 2 y una cruz de placas con cinco bloques de nube. A 64 px ya se leía como árbol (`renders/boceto-silueta-64.png`), pero la copa era baja y plana y parecía una mesa. Eso me llevó a una copa en dos pisos con cima.
- **Pasada de elementos**, sub-armado por sub-armado, validando cada uno con `--sub`:
  - **Base:** cuatro cuartos de 6 × 6 con esquina redonda forman un disco de 12 × 12, cosido por las piedras que cruzan las juntas. En el centro va el alcorque de tierra y en la esquina del frente, el farol.
  - **Tronco:** ladrillos redondos 2 × 2 y cuatro pendientes curvas en molinete para el ensanche de raíces. Hay dos pisos de ramas hechas con colas de animal.
  - **Nubes:** hojas apiladas en espiral y flores de cinco pétalos.
- **Refinamiento** con renders en 4 vistas, a 64 px y paso a paso:
  - cambié la rejilla del tronco, que se veía gris, por ladrillo liso;
  - di vuelta las raíces, que tenían la punta alta hacia afuera;
  - pasé el pasto a verde medio, que asienta el modelo y hace saltar el rosa;
  - saqué los acentos magenta;
  - moví el farol dos veces para que no tapara el tronco en la vista 3/4;
  - separé los pisos un ladrillo más para que se vean ramas entre las nubes;
  - probé cimas de 3 y 4 capas.

## La idea que sorprende

1. **Colas de animal como ramas.** La "Animal Tail Section End" (40379) en marrón rojizo es un cuerno curvo y afinado, con una barra en cada punta. Enganchada en pinzas y girada sobre su eje (el giro de la pinza), cada rama sale del tronco, se abre y se levanta distinta a las demás. Es la curva orgánica que no dan los ladrillos, y cada una termina en una barra donde se enchufa una nube.
2. **Nubes en espiral áurea.** Cada nube apila hojas de planta (2417 y 2423), rosas y blancas, y cada capa gira 137,5° respecto de la anterior: es el ángulo con que se ordenan las hojas en un tallo (filotaxis). Así ninguna hoja repite dirección y la nube se ve llena desde cualquier lado. Las flores son placas de cinco pétalos (24866), y la flor del cerezo tiene cinco.
3. **Un tronco que gira 22,5°.** A mitad del tronco hay una placa redonda con un solo stud central. Encima, el tronco gira libre, y lo giré 22,5° para que, vistas de frente, las cuatro nubes bajas caigan cada una en su columna y ninguna quede escondida detrás de otra. Por eso cada paso de la floración cambia la silueta.
4. **Regla de Leonardo en la horqueta alta.** La sección de 2 × 2 del tronco se reparte en tres ramas y una guía de 1 stud cada una (§2).

## Armado (22 pasos en la vista del video)

| Pasos | Sub-armado | Qué pasa |
|---|---|---|
| 1–2 | base | Mitad oeste del disco; después la mitad este, cosida por las piedras |
| 3 | base | Farol de piedra en la esquina más cercana a la cámara |
| 4–5 | tronco | Alcorque con raíces en molinete; el tronco sube y gira sobre su placa de un stud |
| 6–8 | tronco | Ramas bajas: la primera sola, la segunda sola y las otras dos juntas, de atrás hacia adelante (tramo difícil) |
| 9 | tronco | Tres ladrillos más de tronco (tramo tranquilo) |
| 10–11 | tronco | Horqueta alta con tres ramas; la guía suelta la rama del oeste y sube. **Queda el árbol pelado de invierno.** |
| 12–14 | nube-primera | La primera nube, capa por capa: se ve la espiral |
| 15–21 | nubes | Las demás nubes, ya armadas y de a una: primero el piso bajo, de atrás hacia adelante, y después el alto |
| 22 | nube-cima | **La cima corona el árbol y caen los primeros pétalos** |

Cada paso tiene una pieza o un sub-armado principal. Los grupos repetidos (ramas y nubes) se muestran enteros una vez y después se agrupan. El orden va de atrás hacia adelante y de abajo hacia arriba, para que en la vista 3/4 lo nuevo se vea y no tape lo que viene. La nube de la cima va al final por la historia. Por construcción no puede ir más baja: con una guía más corta, las hojas de las nubes altas le traban la bajada y el validador lo avisa. Hoja de pasos: `renders/pasos.png`.

## Números (`metricas`)

- 188 piezas, 7 submodelos y 7 colores.
- `validar`: 0 errores y 0 avisos, en el modelo y en cada sub-armado.
- Base de 12 × 12; la copa mide 15,8 × 16 studs y el modelo, 15,2 ladrillos de alto.
- Dimensión fractal de la silueta: **1,35**, dentro del 1,3–1,5 preferido (§3).
- Cambio de silueta por paso: media 5 %, mínimo 1,1 %, **0 pasos invisibles** en 22 cuadros.
- Se sostiene solo: el validador no marca vuelco.

## Qué salió bien

- A 64 px se lee como árbol en las cuatro vistas, y en color se lee como cerezo: rosa y blanco sobre madera oscura, con el farol que lo ubica en un jardín japonés.
- Las colas de animal dan ramas curvas y afinadas que parecen crecidas, no armadas. Se ven entre las nubes, así que la copa tiene los huecos del rasgo 2.
- El giro de 22,5° del tronco resolvió de una vez tres problemas: las nubes no se tapan entre sí de frente, cada paso cambia la silueta y la copa queda pareja vista desde arriba.
- La historia del video funciona: a los 11 pasos hay un árbol pelado casi tétrico, y en los 11 siguientes florece hasta la cima.
- La espiral de 137,5° llena las nubes desde cualquier ángulo sin tener que pensar hoja por hoja.

## Qué no me convence

- **De frente y de costado, a la altura de los ojos, se nota que las nubes son capas planas apiladas.** La copa se lee en dos pisos con una cima encima, casi como una pagoda. La vista 3/4 del video la disimula, pero la vista frontal delata la técnica.
- Las hojas 2417 y 2423 son caladas y de cerca parecen copos de nieve rosas; las flores de cinco pétalos lo compensan solo en parte.
- El tronco es una columna recta. Un yoshino viejo tiene el tronco retorcido y apenas inclinado, y acá esa torsión existe (22,5°) pero no se ve porque el ladrillo es redondo.
- Las nubes son sub-armados aparte. Como el DSL no encastra entre sub-armados, su ubicación en la punta de cada rama se calcula en el script con la misma cuenta que el encastre y con los conectores copiados de `piezas ver`. Funciona y valida, pero es más frágil que un encastre directo.
- Las nubes repetidas entran en un solo paso de 14 a 17 piezas, y el último paso suma además los ocho pétalos. En el video se ven como un sub-armado ya hecho, pero `metricas` cuenta todas esas piezas en ese paso.
- La cima no puede bajar más: si baja, las nubes altas le traban la entrada (el validador lo avisa). Por eso sobresale un poco en la vista de frente.
- La copa quedó más redonda que extendida (1,25 : 1). Un yoshino de parque suele ser más achatado y más ancho, pero achatarlo más pedía ramas más largas o una base más grande que 12 × 12.

## Forma de copa según la tabla (§1)

**Redonda, con tendencia a extendida.** Es un domo lleno de unos 16 studs de ancho (≈ 12,7 cm) y 10 cm de alto de copa: 1,25 veces más ancho que alto. Por la tabla, "redonda" es tan ancha como alta y "extendida" es mucho más ancha que alta, así que está más cerca de la redonda. Va sobre un **esqueleto en vaso**: las ramas salen de un tronco corto y se abren hacia arriba y afuera. La copa ocupa el 70 % de la altura total, como un árbol que crece al descubierto y conserva la copa completa (§2, proporción de copa).
