# Ficha — Acacia paraguas de la sabana

## Especie y por qué

**Acacia paraguas** (*Vachellia tortilis*, la acacia de la sabana africana). Es el árbol que
cualquiera reconoce en un segundo como "sabana": tronco corto que se abre en varios tallos
inclinados y una copa **plana arriba, muy ancha y baja**, como un paraguas. Además es justo la forma
que la gente prefiere (Sommer y Summit: copa amplia, tronco corto) y la forma *extendida* resultó la
más atractiva en Lohr y Pearson-Mims 2006. En formato vertical de celular, una silueta horizontal
tan clara sobre un tronco finito se lee incluso en miniatura.

## Escala

Una acacia adulta mide ~8 m de alto y ~14 m de copa. El modelo mide ~9 ladrillos (~9 cm) de alto y
~17 studs (~13,5 cm) de copa (sin contar las puntas de las hojas): escala aproximada **1:100**, con
proporción alto/ancho ≈ 0,6. La base es un disco de sabana de 12 × 12 studs; la copa sobresale de
la base, como en la realidad (la sombra del árbol es más ancha que su pie).

## Rasgos que no pueden faltar

1. **Copa plana arriba y mucho más ancha que alta** (forma extendida / "paraguas"). Si la copa se
   redondea hacia arriba, se vuelve un roble cualquiera.
2. **Tronco corto que se bifurca en varios tallos inclinados hacia afuera** (crecimiento decurrente, en
   vaso) con **cielo entre los tallos y entre las nubes de hojas**. Si hay un solo eje recto hasta el
   centro, parece una sombrilla o un hongo.
3. **Pie en sabana seca** (suelo tostado, pasto amarillento): el contexto termina de decir "acacia".

## Tres conceptos

**A — "Los tres paraguas" (elegido).** Silueta: tronco corto con ensanche de raíces que se abre en
tres tallos inclinados con bisagras bloqueables (al final fueron cuatro: tres nubes y un brote); cada tallo termina en su propia "nube" de hojas hecha
con **platos de radar invertidos** (6×6 verde arena arriba, 4×4 y 3×3 verde oscuro abajo), y las
tres nubes quedan a alturas parecidas formando la línea plana. Paleta: marrón rojizo, verde arena /
verde oscuro / verde, suelo tan y tan oscuro. Sub-armados: suelo, tronco, tres ramas-nube. Revelación:
el último tallo cierra la copa y aparece de golpe la línea del paraguas.

**B — Acacia al atardecer.** Mismo árbol pero con placas en capas finas (copa de placas 2×… en
escalera) y un disco de suelo naranja oscuro como si el sol bajara detrás; la revelación es el suelo
cambiando de color. Más ilustrativo, pero la copa de placas escalonadas pierde la textura y el truco
de color no se ve desde la vista 3/4.

**C — Acacia con jirafa-escala.** Árbol más chico y una jirafa de ladrillos comiendo de la copa. La
jirafa roba el protagonismo al árbol y se va del encargo (y del conteo de piezas).

**Por qué A:** es el que mejor sostiene los dos rasgos críticos (copa plana + tallos abiertos con
cielo entre medio), tiene una técnica sorprendente doble —bisagras que inclinan los tallos y
platos de radar que hacen de nubes de follaje planas— y un momento de revelación claro al final del
video.

## Resultado

- **94 piezas**, 5 sub-armados (suelo, tronco con ramas, nube grande ×2, nube chica, brote),
  23 pasos. `validar`: 0 errores, 0 avisos en el modelo completo; cada sub-armado valida solo
  (las nubes, sueltas sobre la mesa, se apoyan inclinadas: es un aviso, no un error).
- **Técnica sorpresa 1 — platos de radar como follaje.** Cada "nube" de la copa es un plato invertido
  (8×8 y 6×6 en verde arena, 4×4 en el brote) levantado dos placas sobre una placa 2×4 verde oscuro,
  con hojas 6×5 / 4×3 que asoman por debajo del borde como flecos de sombra. El domo bajo del plato da
  justo la "nube plana" de la acacia, y a 64 px la copa se lee como una sola línea horizontal.
- **Técnica sorpresa 2 — tallos con bisagras bloqueables.** Cada tallo sale de la horqueta con una
  bisagra 1×2 bloqueable (dedos 44302 + 44301) inclinada entre 40° y 63°, es una viga laminada (placa
  1×4/1×5 + placa de abajo + teja lisa de corteza) y termina en otra bisagra que vuelve a nivelar la
  nube. Cada tallo lleva su propia nube, así que no hay ningún circuito cerrado que obligue a que los
  ángulos "cierren": el armado real es robusto.
- **Copa en pisos.** Las dos ramas empinadas (este/oeste) llevan las nubes grandes arriba; la del sur,
  más tendida, una nube chica un piso más abajo; la del norte un brote. Los platos se superponen en
  planta sin chocarse, que es exactamente la copa en capas de una *Vachellia tortilis*.
- **Detalles:** ensanche de raíces con ocho pendientes 1×1; sabana con claros de arena, piedras,
  matas de bambú en lima y verde arena como pasto y plantitas de tres hojas en dorado perla como
  pasto seco; flores 1×1 amarillo claro arriba de cada nube (la floración crema de la acacia).

## Armado (para el video)

1. **Suelo** (3 pasos): cuatro placas 6×6 de esquina redonda + la placa central que las une →
   claros de arena y piedras → pasto y matas.
2. **Tronco y ramas** (8 pasos): placa de raíces + ensanche → tronco + horqueta → rama norte en
   detalle (bisagra + viga, después punta) → rama oeste en detalle → este y sur, ya agrupadas.
   Es el tramo difícil (bisagras en ángulo).
3. **Nubes** (2 pasos cada una, tramo tranquilo): asiento con hojas → plato + flores. La nube grande
   se muestra una vez y se usa dos veces.
4. **Montaje:** suelo → tronco → brote → nube chica → nube grande oeste → **nube grande este**: la
   última cierra el paraguas y aparece la silueta plana completa (revelación).

Ningún paso deja la silueta frontal igual (`metricas`: 0 pasos invisibles).

## Qué salió bien

- La silueta: de frente y de costado es inconfundiblemente una acacia de sabana (copa plana, ancha y
  en capas sobre tallos abiertos en V con cielo entre medio), también a 64 px en silueta.
- El uso de los platos de radar: pocas piezas, forma exacta, y un momento lindo para el video
  ("¿un plato de antena? ... ah, es la copa").
- Las bisagras dan ángulos que un árbol de ladrillos escalonados no logra, y el tronco con sus ramas
  se sostiene solo como sub-armado.
- El brote chico del lado norte deja ver el tronco y la V de los tallos desde la vista 3/4.

## Qué no me convence

- Desde arriba (vista 3/4) los platos siguen leyéndose un poco como "platillos" separados; una copa
  real es más continua. Una capa extra de hojas entre platos la uniría, pero sube piezas y choques.
- Las hojas 6×5 son muy regulares ("copos"); con más variedad de follaje (hojas 4×3, plantas de tres
  hojas) el borde sería más natural.
- Las vigas de los tallos, vistas de canto, muestran la lámina de placas y el hueco de la bisagra:
  se nota que es mecánico.
- El suelo es correcto pero plano; faltaría algún detalle de escala (un termitero, un animal chico).
- La copa (≈18 × 20 studs con las puntas de hojas) sobresale bastante de la base de 12 × 12: es fiel a
  la acacia, pero en la mesa se siente un poco pesada arriba.

## Forma de copa (tabla de `consigna/hechos-arbol.md`)

**Extendida**: mucho más ancha que alta, domo bajo y amplio (copa ≈ 17 studs de ancho y ≈ 5 ladrillos de
alto contando sus pisos; árbol entero con proporción alto/ancho ≈ 0,6), sostenida por un tronco corto que se abre
**en vaso** (crecimiento decurrente, varios tallos). Es la forma que la tabla marca como de peso visual
bajo y la que Lohr y Pearson-Mims encontraron más atractiva.
