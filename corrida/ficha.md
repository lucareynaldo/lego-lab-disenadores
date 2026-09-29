# Ficha — Acacia de sabana

## Especie y por qué

**Acacia paraguas** (*Vachellia tortilis*, la acacia de la sabana africana). Su silueta es un ícono: tronco
corto que se abre en pocas ramas diagonales y, arriba, una copa **plana como una mesa**. Se reconoce
aunque sea una mancha negra de 64 px. Además, según `hechos-arbol.md` §3, la forma de acacia (copa amplia,
tronco corto) es la que la gente prefiere en varios países, y las copas **extendidas** son las que más
gustan y alegran (Lohr y Pearson-Mims 2006). Tiene lindo contraste de color (verde contra el ocre del pasto
seco) y la forma "mesa sobre patas" da un momento de revelación natural en el video: la copa baja al final.

## Escala

Árbol de ~8 m de alto y ~10 m de copa. A 16 studs de ancho de copa, **1 stud ≈ 0,6 m**, con el
modelo de ~14 studs de alto. Es una miniatura de paisaje (sin minifiguras a escala).

## Rasgos que no pueden faltar

1. **Copa plana y ancha, más ancha que alta**, con el borde irregular y el techo casi horizontal.
2. **Ramas diagonales en vaso**: el tronco se abre bajo, en pocas ramas que suben en diagonal y dejan ver
   cielo entre ellas (crecimiento decurrente: no hay eje central que llegue a la copa).
3. **Tronco corto, más grueso que cada rama**, con ensanche en la base, sobre suelo de sabana seco.

## Tres conceptos

- **A. "La mesa sobre patas" (acacia).** Silueta: tronco corto, cuatro ramas en diagonal verdadera (no
  escalonada) y una copa-bandeja de 16 studs. Paleta: marrón rojizo, verde oscuro por debajo y verde por
  arriba, suelo tan / dark tan con pasto dorado. Sub-armados: base, tronco con ramas, copa. Revelación: la
  copa entera se apoya al final sobre las cuatro puntas de rama y el árbol "aparece".
- **B. Cerezo japonés en flor.** Silueta en vaso bajo, copa redondeada hecha de racimos rosas y blancos,
  pétalos caídos en la base. Sub-armados: base, tronco, 3–4 racimos. Revelación: los racimos rosas al final.
  Lindo, pero la silueta en negro es la de cualquier árbol redondo: depende del color.
- **C. Sauce llorón.** Tronco grueso y ramas que cuelgan hasta el piso, hechas de cadenas o tallos de
  plantas colgados de una corona. Revelación: la cortina de ramas. La copa llorona tapa el tronco y las
  ramas colgantes piden piezas flexibles que el validador y la estabilidad complican.

**Elijo A.** Es la de silueta más inconfundible (pasa la prueba de 64 px sin color) y la que mejor aprovecha
una técnica que sorprende: **ramas en diagonal real montadas con pernos Technic**, en ángulos de ternas
pitagóricas (3-4-5 y 5-12-13), de modo que cada punta vuelve a caer exacto en la grilla de studs y la copa
encastra arriba como una mesa. La copa pesada queda sostenida por las cuatro ramas, igual que en el árbol real.

## Boceto

Primero armé el esqueleto con piezas simples: tronco de ladrillos redondos 2 x 2, cuatro ramas de ladrillos
redondos 1 x 1 y una copa de dos placas grandes. Validó a la primera vuelta de ajustes y, a 64 px en
silueta, la vista de frente ya era una "Y" con techo plano: se leía como acacia. En la vista 3/4 era un hongo.

## Pasada de elementos (sub-armado por sub-armado, cada uno validado con `--sub`)

- **Ramas (`rama-larga` x2, `rama-corta` x2).** El truco del modelo: cada rama se arma recta y se clava de
  costado en el tronco con un perno Technic (2780) metido en un ladrillo 1 x 1 con agujero (6541). El perno
  deja girar la rama a cualquier ángulo; elegí ángulos de **ternas pitagóricas**, 3-4-5 (36,87°, la rama avanza
  6 studs y sube 160 LDU) y 5-12-13 (22,62°, avanza 2 studs y sube 96 LDU). Arriba, otro perno lleva un
  "nudillo" girado al revés, que queda derecho y **cae exacto sobre la grilla de studs**. Así la copa
  encastra de verdad sobre las cuatro puntas, como una mesa sobre patas en diagonal real (no escalonada).
  El script comprueba que cada punta quede derecha y en la grilla. Las cuatro ramas abren en abanico (dos
  largas afuera, dos cortas adentro), a dos alturas del tronco.
- **Tronco.** Ladrillos redondos 2 x 2 color marrón rojizo, con dos pisos donde van los ladrillos Technic,
  trabados por placas redondas. Cuatro ramas de 1 stud sobre un tronco de 2 x 2: la sección se conserva,
  como pide la regla de Leonardo.
- **Base.** Suelo de sabana de 12 x 12 con esquinas redondeadas (30565), **más chica que la copa**, para que se
  lea el paraguas. Tierra pelada dark tan al pie, raíces en molinete con curvas 2 x 1 (el ensanche de la
  base), matas de pasto verde arena sobre terroncitos, matas secas doradas (1 x 1 con hojas en Pearl Gold) y
  piedras.
- **Copa.** Cuatro capas que se achican hacia arriba (16 x 12 → 14 x 10 → 12 x 8), todas con esquinas
  redondeadas: techo plano con hombros suaves, verde oscuro abajo y verde arriba. Cada escalón lleva un
  borde festoneado de hojitas 1 x 1 que apuntan hacia afuera, y el techo lleva hojitas en tresbolillo en
  cinco verdes.
- **Nidos de tejedor.** Dos nidos colgando del ala de la copa (un cono 1 x 1 con la punta arriba y un
  ladrillo redondo tan abajo), típicos de las acacias de la sabana.

Probé y descarté: frondas 6 x 5 (2417) para la copa, que en el render se ven como estrellas ralas; pasto
"Grass Stem" (15279), que se ve como un helecho enrulado; un plato de radar invertido como panza de la
copa, que casi no se veía; y seis ramas (dos más inclinadas hacia los costados), que ensuciaban la vista
de frente.

## Refinamiento

- La copa pasó de 14 a 16 studs y la base de 14 x 14 a 12 x 12: el voladizo hace al paraguas.
- Saqué las hojitas del ala en los extremos izquierdo y derecho: se pasaban de 16 studs (daba 17,6).
- Bajé la proporción de hojitas verde arena, que se leían como hojas secas grises, y sumé verde oscuro.
- Las matas de pasto rozaban el suelo con las hojas caídas: las subí a un terroncito de 1 placa.
- Ramas cortas: las pasé del plano lateral al plano de las largas. De frente el abanico es mucho más
  claro (antes parecía un tridente).

## Armado (28 pasos, 5 sub-armados)

1. **Base** (6 pasos): franja central → las dos filas redondeadas (la silueta se ensancha) → trabas y tierra
   pelada → raíces → pasto y piedras, en dos tandas.
2. **Rama larga** (2 pasos, x2): el palo recto con su perno → la punta con el nudillo.
3. **Rama corta** (2 pasos, x2): igual, más corta.
4. **Tronco** (6 pasos): pie → primer piso Technic → **se clavan las dos ramas largas en diagonal** (momento
   sorpresa del armado) → tramo tranquilo del tronco → segundo piso → las dos ramas cortas.
5. **Copa** (8 pasos): capa oscura → ala de 16 x 12 → borde de hojitas → segunda capa → borde → techo →
   hojitas del techo en dos tandas. Alterno placas grandes (difíciles de ver venir) con hojitas (tranquilos).
6. **Modelo**: base → tronco → **la copa baja entera sobre las cuatro puntas (revelación)** → epílogo: los
   dos nidos.

Ningún paso deja la silueta igual (0 pasos invisibles en `metricas`) y el paso más cargado tiene 12 piezas
(una tanda de hojitas).

## Números finales

149 piezas, 12 colores, 5 sub-armados, 28 pasos, 16 x 14,2 studs de planta. `validar`: 0 errores y
0 avisos (también cada sub-armado por separado).

## Qué salió bien

- La silueta: de frente y en 3/4 es inconfundiblemente una acacia (copa plana y ancha sobre ramas en abanico),
  también a 64 px en silueta.
- La técnica de las ramas: son diagonales reales (no escaleras de pendientes) y estructurales, porque la copa
  se apoya y encastra sobre ellas. Los ángulos pitagóricos hacen que todo cierre sin trampas en la grilla.
- El armado tiene dos buenos momentos para video: las ramas rectas que se giran al clavarlas, y la copa que
  baja entera al final.
- La paleta (marrón rojizo, verdes, tan y dorado seco) cuenta "sabana" sin carteles, y los nidos le dan una
  historia.

## Qué no me convence

- **La vista de costado** es la más débil. Como las cuatro ramas abren en un solo plano, de lado se ven dos
  postes paralelos bajo la copa (una "Π"). Con pernos en un solo eje no encontré cómo inclinar ramas en
  diagonal en planta sin romper la grilla de la copa.
- Los nudillos Technic y las cabezas de los pernos se ven en las puntas de las ramas; se leen como nudos,
  pero delatan la técnica.
- La copa es fina y, de frente, se lee como un listón. Es fiel a la acacia real, pero más grosor la haría
  más "follaje".
- El suelo tiene mucho stud a la vista. Un poco más de tile lo haría más prolijo.

## Forma de copa (tabla de `hechos-arbol.md`)

**Extendida**: mucho más ancha que alta (16 studs de ancho contra ~2 ladrillos de espesor), domo bajo y
amplio con techo plano. El crecimiento es **decurrente**: no hay eje central que llegue a la copa; el tronco
se reparte en cuatro ramas en vaso.
