# Ficha — Acacia paraguas de la sabana

## 1. Especie, escala y rasgos

**Especie elegida:** acacia paraguas (*Vachellia tortilis*, "umbrella thorn"), el árbol de la sabana africana.

**Por qué:**
- Tiene la silueta de árbol más reconocible que existe: una "mesa" verde plana sobre un tronco corto que se abre en V. Se lee aunque el modelo sea una mancha de 64 px.
- Es la forma **extendida** de la tabla (mucho más ancha que alta), que en los estudios citados en `hechos-arbol.md` es la más atractiva (Lohr y Pearson-Mims 2006) y la preferida entre culturas (forma de acacia: copa amplia, tronco corto; Sommer y Summit 1995-96).
- El hueco entre el tronco y la copa deja ver "cielo" y hace que el modelo respire; eso da detalle intermedio (fractal moderado) sin cargarlo.
- Crecimiento **decurrente**: el eje se pierde entre varias ramas de grosor parecido que suben abriéndose → excusa para una técnica de ramas en ángulo.

**Escala:** aproximadamente 1:100 (microescala de mesa, no escala minifigura). La copa de 16 studs ≈ 12,8 cm ≈ un árbol de 13 m de ancho; el modelo terminado mide 11,2 ladrillos de alto (≈ 10,7 cm ≈ 10,7 m). El tronco de 2x2 ≈ 1,6 m y las ramas de 1 stud ≈ 80 cm de diámetro; el termitero de 2x2x2 ≈ 2 m.

**Rasgos que no pueden faltar:**
1. **Copa plana y ancha**, bastante más ancha que alta, con la cara de abajo recta y oscura (la "sombra" de la mesa).
2. **Tronco corto que se divide bajo en varias ramas que suben abriéndose en V** (forma de vaso), con cielo visible entre ellas y debajo de la copa.
3. **Tronco con ensanche en la base** apoyado sobre suelo seco de sabana (dorado/tostado): sin el contexto seco y el ensanche parece un hongo o una mesa.

## 2. Tres conceptos

**A. Acacia paraguas en la sabana (elegido).** Silueta extendida: copa plana de 16 studs sobre un tronco corto que se abre en ramas inclinadas. Paleta: sand green y verde oscuro en la copa, marrón rojizo y marrón oscuro en el tronco, tan y dark tan con pasto amarillo en el suelo. Sub-armados: suelo, tronco con ramas, copa. Revelación: todo el video muestra un esqueleto de ramas desnudas y, al final, la copa plana "se abre" encima como un paraguas.

**B. Cerezo japonés en flor.** Silueta redonda y baja, tronco oscuro torcido con ramas en zigzag, copa de hojas verde claro que al final se cubre de flores rosas y blancas sueltas. Sub-armados: base con camino de piedras, tronco, copa. Revelación: la "lluvia" de flores rosas en los últimos pasos.

**C. Sauce llorón junto a un estanque.** Silueta llorona: tronco inclinado y ramas que caen hasta casi tocar el agua (cortinas de hojas colgando de barras con clips). Paleta verde lima y verde oscuro, estanque trans-azul. Revelación: las cortinas que caen en los últimos pasos.

**Elijo A** porque es la silueta más fuerte de las tres a 64 px (B se confunde con cualquier árbol redondo si falta el rosa, y C depende de piezas colgantes que en el celular se ven como ruido), porque es la forma que los estudios marcan como la más linda, y porque la copa plana permite una revelación muy clara: pasar del "árbol de invierno" a la mesa verde en un paso.

## 3. Cómo quedó

**108 piezas, 3 sub-armados (suelo, tronco, copa), 28 pasos.** Base 12x12 con esquinas redondeadas; la copa mide 16x14 (18x16 contando las hojas que asoman). Valida sin errores ni avisos, y cada sub-armado también (`--sub suelo|tronco|copa`).

- **Suelo (20 piezas).** Dos capas de placas tan / dark tan con las juntas corridas; un termitero (cono 2x2x2 marrón rojizo), una piedra gris con un canto rodado y seis matas de pasto seco (placas 1x1 con tres hojas en amarillo, naranja claro y lima).
- **Tronco (44 piezas).** Disco dark tan (la sombra bajo el árbol), dos ladrillos redondos 2x2 con cuatro raíces curvas en molinete (el ensanche de la base) y un collar redondo 4x4 marrón oscuro en la horqueta. Sobre el collar, cuatro ramas en molinete.
- **Copa (42 piezas).** Dos losas verde oscuro con las juntas corridas (la cara de abajo, plana y en sombra), ocho hojas 4x3 colgando bajo el borde, y encima dos molinetes de helechos 6x5 a dos alturas (verde y verde claro) más una mata central lima.
- **Final del modelo principal:** dos nidos de tejedor.

### La técnica: ramas-paralelogramo con bisagras plegadas en V

Cada rama es: placa-bisagra en el collar → tapa de bisagra abierta ~45° (la V de abajo) → columna de 3 ladrillos redondos 1x1 + un anillo 1x1 → otra bisagra plegada en V → placa horizontal en la punta. Las dos bisagras forman un paralelogramo: la columna se inclina hacia afuera pero la punta queda **exactamente horizontal**, y la copa se encastra a presión desde arriba sobre las cuatro puntas. No hay poste central: la mesa verde flota sobre un vaso de ramas desnudas, que es justo el rasgo 2.

El ángulo no está puesto a mano: el script arma una rama de prueba y busca por **bisección** el ángulo (≈ 45,1°) con el que la punta avanza exactamente 4 studs, así las cuatro puntas caen en la grilla de la copa (sube ≈ 104,6 LDU). Las cuatro ramas son la misma rama girada; como el encastre por conector mide el giro de forma absoluta, cada encastre compensa el rumbo de su rama y el script comprueba que cada pieza quede donde debe (si no, corta con error). Las bisagras son de las que traban ("locking"), así que el ángulo se sostiene solo, y una vez puesta la copa todo queda rígido.

Detalles de la solución:
- La V de abajo necesita ≥ 40° para que la tapa no pise los studs del collar; con 45° queda holgura.
- El nudillo de la bisagra de arriba asomaba 2 LDU sobre su placa y rozaba la copa: una placa 1x2 de puntas redondas encima de cada punta lo resuelve.
- Regla de Leonardo: el tronco 2x2 tiene sección de 4 studs y las cuatro ramas 1x1 suman 4; cada rama mide la mitad del diámetro del tronco (el límite para uniones fuertes).

### Usos de piezas que me gustan

- **Hojas de helecho 6x5 y 4x3 como follaje de acacia:** su forma ramificada imita las hojas bipinnadas de la acacia, y a dos alturas dejan pasar luz ("huecos en la copa"). El segundo molinete apoya cada hoja en un taco sobre el tallo de una hoja del primero.
- **Conos 1x1 tan como nidos de tejedor**, colgados con el stud hacia arriba de la punta de dos hojas del borde: los tejedores cuelgan el nido de la punta de las ramas de las acacias, lejos de las víboras.
- **Cono 2x2x2 como termitero**, el vecino típico de la acacia en la sabana.

### Armado (pensado para el video)

1. **Suelo:** esquinas → capa de arriba → termitero → piedra → pasto.
2. **Tronco:** disco y primer ladrillo → raíces → segundo ladrillo y collar → ramas. Las dos primeras ramas (las de atrás, vistas desde el 3/4) se muestran en tres pasos cada una (bisagra, columna, bisagra de arriba); las otras dos, iguales, en un paso cada una. Primero las de atrás para que cada rama nueva se vea y no tape a la siguiente. El termitero va a un costado para no tapar el tronco.
3. **Copa:** espinazo sobre las puntas (el momento en que la copa "se apoya") → alas → segunda losa → flecos colgando → primer molinete (dos pasos) → segundo molinete (dos pasos) → mata central. Tramo tranquilo (placas grandes) después del difícil (bisagras).
4. **Modelo principal:** se ubican los tres sub-armados y, como cierre, llegan los nidos.

Revelación: el árbol pasa todo el tronco "de invierno" (ramas desnudas en V) y la copa aparece al final; lo más llamativo, la explosión de helechos verdes, son los últimos pasos antes de los nidos.

### Números (`metricas`)

108 piezas, 28 pasos, 13 colores, 88 % de piezas no básicas, 3,96 piezas por paso (máx. 9), 18 x 16 studs de planta y 11,2 ladrillos de alto, **dimensión fractal 1,40** (dentro del rango preferido 1,3–1,5), 1 paso sin cambio en la silueta de frente (una pieza que queda detrás del tronco en esa vista; en la 3/4 se ve).

## 4. Balance

**Qué salió bien**
- La silueta: de frente y de costado es inconfundible (mesa plana, vaso de ramas, tronco corto con ensanche), también a 64 px.
- La estructura es honesta: la copa se sostiene de verdad en las cuatro ramas inclinadas, no en un poste escondido, y se arma a presión desde arriba.
- El ángulo calculado por el script: cambiar el largo de la columna o el avance y la rama se recalcula sola.
- La copa dejó de parecer una tapa de mesa cuando pasé de discos y capas lisas a helechos a dos alturas: desde arriba se lee como follaje y la dimensión fractal quedó en 1,40.
- Los nidos colgando: es un detalle chico que cuenta una historia y cierra el video.

**Qué no me convence**
- El contorno de la copa sigue siendo un rectángulo de esquinas redondeadas; en la 3/4 se nota un poco el "almohadón". Una acacia real es más irregular.
- El molinete de ramas es perfectamente simétrico (las cuatro iguales); una acacia real tiene ramas de distinto largo y ángulo. Con cuatro puntas a la misma altura, variar una rama obliga a encontrar otro par columna/avance con la misma subida, y no lo resolví.
- De frente y de costado, las dos ramas que se inclinan hacia la cámara se ven como un poste central.
- Las bisagras, vistas de cerca, tienen un aire mecánico (nudillos en las V).
- Un paso de la copa (la segunda losa) pone 9 placas juntas; es rápido pero rompe la regla de una pieza significativa por paso.

**Forma de copa según la tabla de `hechos-arbol.md`: Extendida** (mucho más ancha que alta, domo bajo y amplio). Debajo, la estructura de ramas es **en vaso** (ramas que salen de un tronco corto y se abren hacia arriba y afuera), y el crecimiento es decurrente.

## 5. Proceso (resumen)

1. Boceto con piezas simples y ramas con bisagra en ángulo: se leía como árbol, pero con codos que colgaban hacia abajo parecía una mesa con patas de araña.
2. Probé pasadores Technic en vez de bisagras (ramas que salen limpias del tronco) y los descarté: con ejes en dos direcciones la copa no se puede encastrar físicamente.
3. Bisagras plegadas en V en los dos extremos: sin codos colgando y encastre a presión desde arriba. El ángulo, por bisección.
4. Copa: losa fina (mesa) → losa con anillo de ladrillos (torta) → discos → dos molinetes de helechos. Paleta final verde oscuro abajo y verde claro/lima arriba (en el concepto había pensado sand green; con verde oscuro la cara de abajo se lee como sombra).
5. Refinamiento del armado: sub-armados que validan solos, ramas de atrás primero, termitero a un costado, nidos al final del modelo principal.
