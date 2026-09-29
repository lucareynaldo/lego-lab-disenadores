# Ficha — Cerezo llorón (shidarezakura)

## Especie y por qué

**Cerezo llorón japonés** (*Prunus itosakura* 'Pendula', *shidarezakura*), en plena floración.

- Junta las dos pistas más fuertes para reconocer un árbol de un vistazo: una **silueta llorona**, que
  según UF/IFAS es de las que más pesan a la vista, y un **color inconfundible**: flores rosas sin
  hojas verdes, porque el cerezo florece antes de sacar las hojas.
- Es lindo. Además, el armado cuenta una historia que funciona en un video corto: un árbol pelado de
  invierno que al final "llueve" flores.
- La forma pide una técnica que no es la de siempre: cortinas que cuelgan y se arman **hacia abajo**,
  desde la copa.

## Escala

- **≈ 1:60** (1 stud ≈ 0,5 m; 1 ladrillo ≈ 0,58 m). Tomo como referencia un ejemplar de jardín de unos
  8 m de alto y 7 m de copa. El modelo mide 16 × 16 studs de base y 15,5 ladrillos de alto (≈ 15 cm).
- El tronco está **exagerado a propósito**: mide 2 × 2 studs, alrededor de 1 m, cuando uno real mide
  40–50 cm. Es la licencia de siempre en los árboles micro para que el tronco se lea. A esta escala una
  minifig mediría 2,4 m, así que no lleva figuras: la escala la dan el farol de piedra (≈ 2 m) y las
  piedras de paso.

## Rasgos que no pueden faltar

1. **Las cortinas colgantes.** Las ramas arrancan arriba, se arquean y caen en cortinas verticales que
   llegan cerca del suelo (forma llorona). Sin ellas queda un árbol redondo cualquiera.
2. **Masa rosa sin hojas verdes**, en rosa claro y blanco. Sin eso se lee como sauce llorón.
3. **Un tronco oscuro, único y erguido**, con el ensanche de la base, que se vea entre las cortinas. Sin
   él la copa se lee como medusa, lámpara o arbusto.

## Tres conceptos

- **A. "Cascada rosa" (cerezo llorón).**
  - Silueta: domo con cortinas que caen alrededor de un tronco recto. Paleta: tronco marrón rojizo;
    flores en rosa claro, blanco y rosa oscuro; pasto verde con una alfombra de pétalos caídos.
  - Sub-armados: suelo, tronco con raíces, copa (armazón de ramas en paraguas y el domo) y una
    "cascada" que se repite y cuelga.
  - Revelación: primero se ve el paraguas de ramas pelado, como un árbol en invierno. Después va el
    domo y al final caen las cortinas una por una; la última es la de adelante.
- **B. "Cerezo en vaso" (somei-yoshino).**
  - Silueta: tronco corto y ensanchado que se abre en 3 ramas en ángulo (con bisagras), cada una con una
    nube de hojas rosas. Las ramitas finas son tallos de ramo de flores.
  - Sub-armados: base, tronco, una rama por sub-armado y las nubes.
  - Revelación: árbol pelado de invierno, que florece al final.
- **C. "Acacia de la sabana".**
  - Silueta: copa plana y extendida, como un paraguas, sobre un tronco en Y. Paleta: verde oliva y
    verde oscuro sobre una base de sabana en tan.
  - Sub-armados: suelo, tronco en Y y el "techo" armado boca abajo.
  - Revelación: la tapa plana de la copa, que entra al final.

**Elijo A.**
- La forma llorona tiene la silueta más fuerte de las tres y se tendría que leer aun en silueta a
  64 px.
- El rosa dice "cerezo" sin necesidad de ningún texto.
- Armar las cortinas colgando hacia abajo es la técnica que sorprende.
- La revelación funciona muy bien en vertical: el paraguas vacío se llena y se cierra con las
  cortinas.
- B se lee bien, pero es la solución de siempre (nubes de hojas sobre ramas). C se aprovecharía poco en
  formato vertical.

Durante el armado cambié dos cosas del concepto: el rosa oscuro quedó afuera (en el centro del domo se
leía como una mancha magenta) y la "cascada" dejó de ser un sub-armado aparte. Ahora es un grupo que se
repite dentro de la copa, porque cuelga de piezas de la copa.

## Cómo quedó

**194 piezas · 4 sub-armados · 32 pasos · 9 colores.**
- `validar`: sin errores y **sin avisos**, tanto el modelo entero como cada sub-armado por separado
  (`--sub suelo | tronco | domo | copa`).
- `metricas`:
  - 16 × 16 studs × 15,5 ladrillos.
  - Dimensión fractal de la silueta **1,42**, dentro del 1,3–1,5 que se prefiere según §3.
  - 0 pasos invisibles.
  - 6,2 piezas por paso en promedio y 12 como máximo (pétalos y flores chicas).

| Sub-armado | Piezas | Qué es |
|---|---|---|
| `suelo` | 30 | Zócalo dark tan de 16 × 16 con una isla de pasto de esquinas redondeadas, piedras de paso, farol de piedra (*tōrō*) y 12 pétalos caídos |
| `tronco` | 13 | Montículo redondo, cuatro raíces curvas en molinete (el ensanche de la base) y un tronco en S de redondos 2 × 2 |
| `domo` | 55 | La parte de arriba de la copa: ocho hojas 6 × 5 en bisagra que caen como las varillas de un paraguas, con flores encima y un copete |
| `copa` | 96 (+ domo) | El paraguas de ramas, las 12 puntas, la columna que sostiene el domo y las 12 cortinas colgantes |

### Técnicas

1. **Cortinas armadas hacia abajo (lo que sorprende).**
   - En cada una de las 12 puntas del paraguas de ramas hay un ladrillo 1 × 1 con un stud al costado
     (87087) que mira hacia afuera. De ese stud cuelga una **cadena de hojas 4 × 3** (2423).
   - Cada hoja se engancha por el anti-stud de su tallo en el stud de la punta de la anterior: tallo
     arriba, hoja abajo, como un racimo que cae.
   - Con 3 o 4 hojas por cadena se cubren casi 10 cm de cortina con muy pocas piezas.
   - Las puntas más altas llevan cadenas más largas, así que el ruedo queda irregular y cerca del pasto,
     como en un llorón de verdad.
2. **El domo como un paraguas.**
   - Cuatro hojas 6 × 5 van sobre bisagras 1 × 2 (3937/3938) con el eje tangente, inclinadas 44° hacia
     abajo.
   - Las cuatro diagonales usan una **bisagra de clip dada vuelta**: una teja con clip y una placa con
     manija que queda boca abajo. La hoja se engancha **por su stud en el anti-stud** de esa placa, que
     mira hacia arriba (la hoja va al revés, pero no se nota).
   - Así el domo pasa de una silueta de sombrero plano a una campana redonda que se funde con las
     cortinas.
3. **Paraguas de ramas cada 30°.**
   - Seis placas largas (dos de 2 × 12 y cuatro de 1 × 12) se cruzan en el centro, apiladas.
   - Cada placa pivota sobre un único stud del piso de abajo, así que admite cualquier ángulo. El
     resultado son 12 puntas a distintas alturas.
   - Las dos placas bajas llevan un alza en las puntas para que las cortinas arranquen parejas bajo el
     domo.
4. **Flores sobre la madera.**
   - Placas 1 × 1 con tres hojas (32607), en rosa y blanco, sobre las ramas, las hojas del domo y las
     cadenas.
   - Debajo de las ramas bajas cuelgan **hebras de ramilletes armadas hacia abajo**, que forman una
     cortina interior y le dan profundidad.
5. **Pétalos con tejas 1 × 1 de punta redondeada** (24246): tienen forma de pétalo. Van en rosa y blanco,
   sobre la línea donde gotean las cortinas.
6. **Tronco con carácter.**
   - Es una S: un redondo 2 × 2 corrido un stud y otro que vuelve.
   - Abajo lleva un redondo con rejilla en dark brown (corteza gruesa y surcada) y las raíces en
     molinete.
   - Arriba sigue una columna de redondos 1 × 1 hasta el domo, como un eje central.

La copa se coloca sobre el tronco y el domo sobre la columna. El DSL no encastra sub-armados, así que la
posición sale de la transformación de la pieza sobre la que se apoyan (tope del tronco y `col2`), sin
números escritos a mano. Las piezas en ángulo se encastran por conector: un solo cálculo
(`giroPara`) busca el giro que deja cada pieza mirando hacia donde tiene que mirar.

### Armado (guion del video)

- **Suelo (5 pasos):**
  1. Zócalo.
  2. Pasto del centro, con los bordes de adelante y de atrás.
  3. Bordes de los costados y esquinas redondeadas.
  4. Piedras de paso y farol.
  5. Pétalos: paso tranquilo.
- **Tronco (4 pasos):**
  1. Montículo y raíces.
  2. Corteza.
  3. Quiebre.
  4. Contraquiebre y tope.
- **Copa:**
  - Ramas bajas con flores.
  - Hebras interiores.
  - Ramas altas, en 2 pasos; el segundo trae las flores de esas ramas.
  - Puntas, en 2 pasos; la columna va con el segundo.
  - Acá el árbol está **pelado, como en invierno**: un paraguas de ramas marrones.
- **Domo (6 pasos):**
  1. El **capullo**: el cubo con el copete de flores.
  2. Primera hoja en bisagra.
  3. Segunda hoja.
  4. Las dos hojas que faltan, juntas.
  5. Las dos primeras diagonales de clip.
  6. Las dos diagonales que faltan.
  - El paraguas rosa se abre alrededor del capullo. Es el tramo difícil; le sigue un tramo tranquilo y
    repetitivo.
- **Cortinas (7 pasos):**
  - Se cuelgan de atrás hacia adelante; la cámara 3/4 mira desde −X −Z.
  - Cada paso junta una cortina de atrás con una del borde, para que siempre se vea algo nuevo en la
    vista 3/4.
  - Las dos de adelante van solas y son **la revelación**: el árbol "se pone a llorar".
- Cada paso cambia la silueta de frente en más del 1 % (0 pasos invisibles). Las piezas nuevas se ven
  desde 3/4 y no tapan lo que viene.

## Qué salió bien

- **Se lee al instante como un cerezo llorón.** A 64 px, en silueta de frente y de costado, se ven la
  campana, las cortinas y el tronco en el medio (`renders/silueta-64.png`), y el rosa y el blanco dicen
  "cerezo".
- **La técnica de las cortinas rinde mucho.** Cada cortina es una cadena de 3 o 4 hojas, sin piezas
  especiales, y cae casi hasta el pasto.
- **El domo en bisagras** le dio la forma redonda que no lograba con hojas planas apiladas, que parecían
  discos flotando o un techo de pagoda.
- **El video tiene una historia**: suelo → tronco → paraguas pelado → capullo → se abre el paraguas →
  caen las cortinas.
- **La base cuenta dónde estamos** con muy pocas piezas: farol, piedras de paso y pétalos en la línea de
  goteo. Además, el zócalo le da terminación de todos lados.
- Todo valida limpio (sin avisos), entra justo en 16 × 16 y se sostiene solo.

## Qué no me convence

- **Las cadenas de hojas 4 × 3 son muy regulares.** Parecen "espinas de pescado" y, en rosa, pueden
  recordar a racimos de glicina más que a ramitas de cerezo. Sumé ramilletes a varias, pero la repetición
  se sigue notando.
- **Se nota la estructura.** Desde el frente se ven las ramas bajas del paraguas como tablones marrones
  horizontales y los ladrillos rosas de las puntas como cubitos. En un llorón real las ramas se arquean;
  acá son rectas.
- **Hay mucho blanco en el centro del domo.** Las bisagras y el cubo son blancos porque no salieron en
  rosa claro: en rosa oscuro quedaba una mancha magenta. Se lee como flores blancas, pero es un compromiso.
- **La S del tronco se ve como escalones de un stud**, no como una curva. Con redondos 2 × 2 no encontré
  forma de correrlo medio stud.
- **Las cortinas del fondo casi no se ven en 3/4**, porque quedan detrás del tronco y del domo. Lo
  compensé agrupándolas con cortinas del borde.
- **Es frágil en la mano.** El domo son ocho hojas en bisagra sobre una columna de redondos 1 × 1, y las
  cadenas cuelgan de un solo stud. Alcanza para una mesa y para el video, pero no para jugar.

## Forma de copa según la tabla de `consigna/hechos-arbol.md`

**Llorona**: las puntas de las ramas cuelgan hacia el suelo, como en el sauce o el abedul llorón. Arriba
tiene un domo redondeado, con un eje central (tronco y columna) del que salen las ramas en paraguas.
