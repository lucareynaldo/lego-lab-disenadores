# Ficha — Cerezo japonés en flor (sakura)

## Especie y por qué

**Cerezo japonés (*Prunus × yedoensis*, 'Somei-yoshino') en plena floración.**

- Se reconoce al instante por una sola pista que nadie confunde: una nube rosa sobre un tronco oscuro. Funciona aunque el video se vea chico en el celular.
- Su copa es **extendida / en vaso abierto**: ramas gruesas que salen de un tronco corto y se abren hacia arriba y afuera. Según los hechos (Lohr y Pearson-Mims 2006; Sommer y Summit), los árboles extendidos resultan más atractivos y generan más alegría que los redondos o cónicos.
- Tiene un momento narrativo propio, ideal para un video corto: primero el árbol desnudo de invierno (solo estructura de ramas) y al final **la floración** (el *hanami*). Esa es la revelación.

## Escala

**Aprox. 1:55.** Un Somei-yoshino adulto de ~9 m de alto queda en ~17 cm (420 LDU); la copa mide 17 studs (~13,5 cm, ~7,5 m reales) sobre una base de 16 × 16. El farol de piedra (~4,5 cm) equivale a un tōrō real de ~2,5 m, así que sirve de referencia de escala en el video. Cada rama principal sale de un cuello de 2 × 2 studs y se afina hasta ~1 stud y después a una barra (la ramita): la rama siempre es menos de la mitad del grosor de lo que la sostiene, como en una unión fuerte real.

## Rasgos imprescindibles (si faltan, deja de ser un cerezo en flor)

1. **Masa de flor rosa-blanca en nubes separadas** (no una bola verde ni un cono): racimos con huecos de cielo entre ellos.
2. **Tronco corto y oscuro que se abre en pocas ramas gruesas y curvas** que suben y se abren (decurrente, en vaso). Sin eje central dominante.
3. **Pétalos caídos en el suelo** debajo de la copa: la "alfombra rosa" que lo distingue de cualquier árbol con flores genérico.

## Tres conceptos

**A. "Hanami" — ramas-cola que se abren como un paraguas (ELEGIDO).** Silueta extendida/vaso; paleta rosa fuerte + blanco + rosa oscuro sobre marrón oscuro y césped verde claro. Sub-armados: base con alfombra de pétalos, tronco con raíces en molinete y un nodo de ramas, ramas curvas hechas con **secciones de cola de animal** (pieza de dragón/gato) enchufadas por pin, y nubes de flor. Revelación: el árbol queda desnudo, como en invierno, y en los últimos pasos florecen las nubes una por una.

**B. Cerezo llorón (shidare-zakura).** Silueta llorona, de mucho peso visual: el tronco sube recto y cortinas rosas cuelgan hasta el piso, colgadas de clips y barras. Paleta rosa pálido y blanco. Sub-armados: tronco, anillo de clips y cortinas. Revelación: la última cortina completa la cúpula. Riesgo: las cortinas colgantes son difíciles de validar y la silueta se confunde con un sauce.

**C. Rama de cerezo en jarrón (bonsái/ikebana).** Silueta irregular, maceta baja y rama de flores con tallos de flor marrón oscuro. Muy fino, pero a 64 px se lee como "florero" y no como árbol.

**Elijo A** porque es la silueta que mejor se reconoce y la más atractiva según los hechos (extendida), tiene la revelación más clara para el video (invierno a floración) y el truco de las colas de animal como ramas curvas es una técnica que sorprende: dan la curva orgánica que los ladrillos rectos no logran, y el pin permite girarlas a cualquier ángulo.

## Resultado

**132 piezas, 4 submodelos (base, tronco, nube, nube-armada), 24 pasos en el script (20 en el video), `validar` sin errores ni avisos.** Métricas: copa de 17,1 × 17,1 studs, alto de 17,5 ladrillos, 12 colores, dimensión fractal de la silueta **1,39** (dentro del rango 1,3–1,5 que la gente prefiere, §3), y ningún paso invisible en la silueta.

**Cambios respecto del concepto A:** en el boceto las colas salían horizontales de un nodo de ladrillos redondos con agujeros (17485) y la copa quedaba enorme (24 studs) y baja, con aspecto de araña. El cuello de dragón (67361) resolvió tronco, ensanche y el arranque en vaso a la vez. Las nubes, que al principio eran racimos sueltos en cada punta, terminaron encastrando entre sí en una cúpula, con huecos chicos en lugar de cielo abierto entre racimos. La alfombra de pétalos pasó al último paso: cae con la floración.

### Cómo está hecho

- **Tronco y ramas = cuatro "cuellos de dragón" + cuatro colas de animal.** El tronco es cuatro *Brick 2 × 2 Round with Tail/Neck Curved Extension* (67361, marrón rojizo) en los cuadrantes de un alcorque de tierra 6 × 6. Cada uno ya trae el **ensanche de la base** y el **afinamiento hacia arriba** (los dos rasgos del §2) en una sola pieza; juntos se leen como un tronco corto que se abre en cuatro ramas. En la punta de cada cuello entra, por pin, una *Animal Tail Section Middle* (40378, marrón oscuro) que sigue la curva en S y termina vertical; una *Bar 3L* hace de ramita. El agujero de la punta del 67361 está descripto "al revés" en la biblioteca, así que el script da vuelta el encastre 180° alrededor del medio del pin; el giro de cada cola (180/135/0/225°) se buscó numéricamente para que la punta quede vertical.
- **Nube de flores (sub-armado repetido ×4).** Capas de hojas *Plant Leaves 6 × 5* y *4 × 3* (rosa, blanco y rosa oscuro abajo, como sombra) separadas por flores 2 × 2 (4728) en rosa, blanco y rosa medio oscuro, más placas de 5 pétalos (el cerezo tiene 5 pétalos). La hoja de ancla entra por su anti-stud de la **punta** (no del centro) en la barra, y la nube crece hacia adentro y sube: **las cuatro nubes idénticas se encastran entre sí en una sola cúpula** sin tocarse (si se gira una rama 15°, ya chocan).
- **Base.** Placa 16 × 16 verde claro, camino de 3 piedras redondas, matas de pasto, un farol de piedra (tōrō) con luz amarilla translúcida y 20 pétalos caídos (rosa, blanco y rosa oscuro).

### Armado (video)

1–3 base: placa → piedras, pasto y pie del farol → luz y techo del farol.
4–9 tronco: alcorque + primer cuello (atrás) → cuello derecho → los dos de adelante → cola atrás (el paso más alto) → cola derecha → las dos últimas colas. **Paso 9 = el árbol desnudo, de invierno.**
10–17 la primera nube armada paso a paso sobre la rama de atrás (de abajo hacia arriba, cada pieza se ve).
18–20 **la floración**: las otras nubes aparecen ya armadas (grupo repetido), la de adelante al final junto con los pétalos que caen al pasto.

Ritmo: base fácil → tronco (piezas grandes, cambios grandes de silueta) → nube (detallista) → final rápido y espectacular.

### Qué salió bien

- Se lee como cerezo en flor al instante, también a 64 px en 3/4: nube rosa-blanca sobre tronco oscuro que se abre en vaso.
- La técnica sorprendente: piezas de animales (cuello de dragón y colas) como tronco y ramas; dan curvas orgánicas, ensanche y afinamiento que con ladrillos rectos no salen.
- El relato del video funciona: árbol de invierno en el paso 9 y floración en los últimos tres pasos.
- Las cuatro nubes son el mismo sub-armado y aun así forman una copa continua.
- Paleta contenida (rosa claro, blanco, rosa oscuro solo de acento, dos marrones, verde) y detalle fractal moderado (1,39).

### Qué no me convence

- **De frente y de costado** la copa se ve algo cuadrada y apoyada sobre cuatro puntas iguales (tipo "copa de vino"); en 3/4 se ve bien, pero la simetría de 4 ramas es muy prolija para un cerezo real. Probé torcer ramas y las nubes chocan.
- La parte desnuda (cuellos + colas) ocupa ~55 % del alto: un Somei-yoshino real tiene la copa más baja y más ancha. Es lo más lindo del armado, pero le resta "extendido".
- No hay corteza con lenticelas horizontales (el rasgo de corteza del cerezo); las colas son lisas.
- Las flores 2 × 2 tienen un tallito que de costado se ve como columnas entre las hojas.
- Las nubes se ubican calculando la transformación (no hay conector entre submodelos), y el agujero invertido del 67361 obliga a dar vuelta el encastre a mano en el script.

### Forma de copa (tabla de `hechos-arbol.md`)

**En vaso**: tronco muy corto que se divide en cuatro ramas que salen hacia arriba y afuera, con la copa arriba y más ancha que el arranque. Queda entre "en vaso" y "redonda": no llega a "extendida" porque es más alta (17,5 ladrillos, unos 21 studs) que ancha (17 studs).
