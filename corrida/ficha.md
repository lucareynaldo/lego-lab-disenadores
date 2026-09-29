# Ficha — Cerezo en flor (sakura)

## Especie y por qué

**Cerezo japonés en flor** (*Prunus × yedoensis*, 'Somei-Yoshino'). Es de los árboles que se reconocen
en un segundo en un celular: una nube rosa pálido sobre un tronco oscuro. Además trae su propia
historia de armado: en la floración el árbol todavía no tiene hojas verdes, así que en el video
se puede armar primero el esqueleto "de invierno" (tronco y ramas desnudas) y al final hacerlo florecer.

La forma es **en vaso**: tronco corto que se abre en pocas ramas principales hacia arriba y
afuera, con una copa más ancha que alta. Las copas anchas son, además, las que más gustan
(Lohr y Pearson-Mims 2006; Sommer y Summit 1995).

## Escala

Aproximadamente **1:100**, o sea 1 stud ≈ 80 cm. Un Yoshino adulto mide 8–12 m de alto y
10–14 m de ancho. El modelo terminado mide 17,5 studs de ancho de copa por ~15 ladrillos de alto
(≈ 14 × 14 cm), sobre un montículo de pasto de 12 × 12. El farol de piedra (≈ 3 ladrillos, unos 2 m
a esta escala) sirve de referencia.

## Rasgos que no pueden faltar

1. **Copa en nubes rosa pálido, sin verde**, con huecos entre los grupos donde se ve la rama
   (si es una bola compacta se lee como algodón de azúcar, y si es verde, como cualquier árbol).
2. **Tronco corto, marrón rojizo, ensanchado en la base, que se abre en V en pocas ramas gruesas**
   (el vaso). Sin esa horqueta baja se lee como un arbolito de lollipop.
3. **Flor de cinco pétalos** y pétalos caídos en el pasto: es la firma del sakura (hanami).

## Tres conceptos

- **A. Sakura en vaso.** Silueta de paraguas abierto: tronco corto con raíces que se abre en cuatro
  ramas inclinadas con bisagras, y encima cinco nubes rosas. Paleta: marrón rojizo,
  rosa claro y blanco sobre un montículo verde. Sub-armados: base, tronco
  con ramas desnudas, nubes de flor. Revelación: el árbol "de invierno" florece; al final, ramitas
  de tallos de flor marrón oscuro con flores de 5 pétalos que asoman de las nubes.
- **B. Acacia del Serengueti.** Copa plana en mesa sobre un tronco inclinado y bifurcado, suelo
  de sabana color arena. Paleta: marrón oscuro, verde oliva y arena. Sub-armados: suelo, tronco,
  "mesa" de hojas. Revelación: la mesa de hojas cae de una vez arriba del tronco. Silueta muy clara,
  pero la paleta es apagada para un video corto.
- **C. Arce japonés en otoño.** Copa baja en pisos horizontales (modelo de Massart), degradé de verde
  abajo a rojo arriba. Sub-armados: base con musgo, tronco, pisos. Revelación: el último piso rojo
  intenso. Lindo, pero los pisos planos lo acercan a un bonsái genérico.

**Elijo A.** Es la que se reconoce más rápido en un celular, el armado cuenta una historia
(invierno → primavera) que justifica dejar lo más vistoso para el final, y tiene una idea de
piezas propia: la flor de 5 pétalos es literalmente la flor del cerezo, y el tallo de flores
marrón oscuro funciona como ramita florida.

## Cómo quedó

192 piezas, 7 colores, 7 sub-armados, 38 pasos (31 con piezas nuevas). `validar` sin errores ni
avisos, y también cada sub-armado por separado (`--sub`). Se sostiene solo.

| Sub-armado | Piezas | Qué es |
|---|---|---|
| `base` | 30 | Montículo 12 × 12 en dos pisos (placas con esquina redonda), matas, 9 pétalos caídos y un farol de piedra (tōrō) |
| `tronco` | 32 | Cono 3 × 3 × 2 (ensanche de raíces), corteza de ladrillos *log*, horqueta, 4 ramas con bisagras y líder central |
| `nube-sur`, `-este`, `-norte`, `-oeste` | 25 c/u | Cúpula de 4 cuartos 88293, flecos de hojas 4 × 3 con flores y un ramito arriba |
| `nube-alta` | 30 | La misma nube con 4 flecos, montada sobre un solo stud y girada 45° |

**Técnicas y usos de piezas:**

- **Ramitos floridos.** El tallo de flores de 6 puntas (19119, marrón oscuro) es una ramita de cerezo;
  en cada punta va una placa 1 × 1 de 5 pétalos (24866). El DSL encastra la flor en la raíz del tallo,
  así que el script la corre 16 LDU por el eje hasta que la sección R2 de la punta entra en el agujero
  R2 de la flor, como en la pieza real.
- **Ramas que se abren y nubes que se nivelan.** Cada rama madre sale de una bisagra 1 × 2 a 45° y
  termina en otra bisagra que deja la nube inclinada solo 35° hacia afuera: la copa queda redondeada y los
  flecos de hojas cuelgan hacia afuera como el borde de una copa florida.
- **Corteza con lenticelas.** Los ladrillos *log* cruzados dan las rayas horizontales típicas de la corteza
  del cerezo. El cono 3 × 3 × 2 es el ensanche de la base.
- **Cuatro ramas de 1 stud sobre un tronco de 2 × 2:** la suma de secciones de las ramas iguala la del
  tronco (regla de Leonardo) y cada rama mide la mitad del tronco (unión fuerte).
- **Nube alta girada 45°** sobre una placa redonda 2 × 2 centrada en un solo stud: así sus flecos asoman
  en diagonal entre las cuatro nubes de abajo en lugar de chocar con ellas.

**Armado (video):** pasto con pétalos y farol → cono y corteza → horqueta → primera rama en dos pasos
(la bisagra sola, después la rama), las otras en un paso cada una, de atrás hacia adelante →
árbol de invierno completo → nubes de atrás hacia adelante (la primera en detalle; las repetidas en
raíz + flecos, cúpula y ramito) → **la nube alta con su ramito, al final**. Todos los pasos cambian la
silueta frontal (mínimo 1,3 %; 0 pasos invisibles). Hoja de pasos: `renders/pasos-34.png`.

## Qué salió bien

- Se lee como árbol en flor al instante, también en silueta a 64 px (`renders/silueta-64.png`):
  copa ancha y redondeada sobre un tronco corto con ensanche.
- La historia del video funciona: el árbol "de invierno" con sus cuatro ramas en V es claro por sí solo,
  y la floración llega nube por nube hasta la revelación de arriba.
- Los ramitos de tallo + flor de 5 pétalos son lo más sakura del modelo y rompen la silueta de la copa.
- El farol de piedra da escala y contexto japonés sin robarle protagonismo al árbol; los pétalos en el
  pasto anticipan la floración desde el primer segundo.
- Casi todo encastra por conector. Las únicas coordenadas escritas son la grilla de las placas del pasto,
  los pétalos y el lugar del tronco sobre el montículo; las de las nubes sobre bisagras inclinadas y las
  de las flores en las puntas de los tallos las calcula el script a partir de piezas ya encastradas.

## Qué no me convence

- **Las cúpulas lisas.** Las cinco nubes son medias esferas perfectas: de cerca se parecen a globos o
  a algodón de azúcar, justo el riesgo que anoté en los rasgos. Los flecos, las flores y los ramitos
  lo mitigan pero no del todo; la dimensión fractal de la silueta da 1,17, por debajo del 1,3–1,5 preferido.
- **Las ramas quedan casi tapadas.** La V del vaso se ve en el video mientras el árbol está desnudo, pero
  en el modelo terminado apenas asoman la horqueta y los nudos de las bisagras; faltan huecos de cielo
  entre nubes donde se vean ramas oscuras.
- **Los nudos de bisagra** y la placa redonda de la horqueta (marrón oscuro, porque no existe en marrón
  rojizo) se ven como bloques; un tronco real se abre de forma más continua.
- Es bastante simétrico; un cerezo viejo suele ser más irregular.
- La nube alta tiene 16 piezas en un paso (cúpula + 12 flores de los flecos).

## Forma de copa (tabla de `consigna/hechos-arbol.md`)

**En vaso**: ramas que salen de un tronco corto y se abren hacia arriba y afuera (cuatro ramas madre
a 45° desde una horqueta a un tercio de la altura). La silueta de la copa terminada queda entre
redonda y extendida: ≈ 17,5 studs de ancho por ≈ 11 de alto.
