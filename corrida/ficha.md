# Ficha — Jacarandá en flor

## Especie y por qué

**Jacarandá (*Jacaranda mimosifolia*) en plena floración.** Es el árbol de las veredas y plazas de Buenos Aires en noviembre: una copa ancha, en forma de vaso o paraguas, cubierta de flores lila azuladas, y debajo una alfombra lila de flores caídas.

- **Se reconoce al instante como árbol.** La forma extendida (tronco corto que se abre en pocas ramas gruesas y copa más ancha que alta) es la silueta de árbol "de sombra" por excelencia. Según los hechos (§3), la forma extendida es además la que más gusta y la que más alegría genera (Lohr y Pearson-Mims 2006; Sommer y Summit).
- **Es lindo y distinto.** Un árbol lila se destaca en un feed lleno de árboles verdes. La paleta sale de colores reales de piezas de follaje: *Lavender* y *Medium Lavender* (probé también *Medium Lilac*; ver más abajo).
- **Tiene una revelación natural para el video:** se arma el árbol pelado, con ramas de invierno, y al final florece. Los hechos (§2) lo respaldan: en invierno, los caducifolios muestran solo su estructura de ramas, y la floración llega antes o junto con las hojas.

## Escala

Un jacarandá adulto mide unos 10–12 m de alto y otro tanto de copa. El modelo mide ~15,5 ladrillos de alto (≈15 cm) con una copa de ~18–20 studs (≈15 cm), sobre una base de 16 × 16 (12,8 cm): la copa sobresale un poco de la base, como la de un árbol de plaza sobre su cantero. Escala ≈ **1:75**: 1 stud ≈ 0,6 m, 1 ladrillo ≈ 0,7 m. Es una escala de "maqueta de plaza", más chica que la de minifigura: una persona mediría ~2,5 ladrillos y una minifig mide ~4. Así el árbol entra entero en un cuadro vertical de celular, casi tan alto como ancho.

## Rasgos que, si faltan, dejan de leerse como jacarandá

1. **Copa ancha en paraguas o vaso, abierta y con huecos entre racimos** (forma extendida o en vaso de la tabla). Si la copa es una bola cerrada o un cono, se lee como otro árbol.
2. **La floración lila que cubre la copa, y su "sombra" lila en el suelo** (flores caídas). Sin el lila es un árbol genérico; la alfombra de flores es la firma del jacarandá en la ciudad.
3. **Tronco corto con ensanche de raíces que se abre en pocas ramas gruesas en V** (decurrente: no hay un eje que domine). Si el tronco sube recto hasta la punta, parece una conífera o un árbol de dibujo.

## Tres conceptos

**A. "Florece" (jacarandá en vaso).** Silueta de paraguas: tronco corto y ramas en cruz que se abren a 40°, con racimos lilas en las puntas y huecos entre ellos. Paleta: tronco *Reddish Brown*, ramitas *Dark Brown*, flores en lilas y pasto verde con flores caídas. Sub-armados: base, tronco con ramas, y racimos de flores. Revelación: primero queda el árbol pelado, de invierno, con ramitas de hoja 4×3 en marrón oscuro; después los racimos lilas se enganchan uno por uno y el último corona la copa.

**B. "Acacia de la sabana" (extendida).** Tronco fino que se bifurca en Y y una copa plana como una mesa, con mucho aire debajo. Paleta: *Dark Brown*, *Olive Green* y base *Tan* o *Dark Tan* con pasto seco. Sub-armados: base, tronco en Y y "bandeja" de copa. Revelación: la copa plana se apoya entera sobre las dos ramas, como una tapa.

**C. "Sauce llorón junto al agua" (llorona).** Domo con cortinas de hojas que caen hasta casi tocar el suelo, junto a un estanque. Paleta: *Bright Green* y *Lime* sobre tronco *Reddish Brown*, con agua *Trans Light Blue*. Sub-armados: base con estanque, tronco curvo y cortinas. Revelación: las cortinas se cuelgan al final y esconden el tronco.

**Elegido: A.** Tiene la silueta que más se reconoce y más gusta (extendida o en vaso), el color más llamativo para un video corto y la revelación más clara: de árbol pelado a árbol en flor. B es muy legible, pero ancho y bajo, y desaprovecha un cuadro vertical. C depende de cortinas colgantes que con piezas reales y encastres válidos quedan pesadas o rígidas.

## Cómo se llegó (boceto → elementos → refinamiento)

- **Boceto.** Primero armé un tronco de ladrillos redondos 2×2 y una copa de hojas 6×5 lila. La primera copa quedó chica y chata, como una mesa. La hoja 6×5 es plana y de perfil es una raya, así que la copa necesita muchas alturas distintas. Probé apilar hojas por el stud central, cada una girada. El verificador acepta cualquier ángulo, no solo de a 90°, y eso da rosetas irregulares. A 64 px, la silueta de frente ya se leía como árbol: paraguas, tronco y la V de las ramas.
- **Elementos.** Sub-armado por sub-armado: raíces con garras, ramas con pendiente en cada peldaño, ramitas marrones, racimos y ramilletes. Con 15 racimos apretados en la copa, a mano chocaban. Escribí una búsqueda voraz, con retroceso, que prueba giros y alturas de cada racimo y se queda solo con los que pasan `validar` sin errores **ni avisos**. Los valores elegidos están escritos tal cual en `RACIMOS` dentro de `diseno.ts`.
- **Refinamiento.**
  - Subí el tronco un ladrillo para que se vea la estructura en vaso debajo de la copa.
  - Cambié el ladrillo redondo con rejilla (92947) por el liso: a tamaño de video se leía como una rejilla de ventilación y no como corteza.
  - Descarté *Medium Lilac* para dar sombra: sale índigo y hace manchas azules.
  - Las alzas pasaron a marrón oscuro para que se lean como tallos y no como postes.
  - Tapé la punta del líder con tres pimpollos.
  - Reagrupé los pasos para que ninguno quede invisible en la silueta.

## Técnicas y usos de piezas

1. **Ramitas de invierno con hojas 4×3 en *Dark Brown* (2423).** Una pieza de follaje hace de horqueta de ramitas. Encastrada por el pie y girada, catorce de ellas arman la copa pelada del árbol de invierno. Después sostienen los racimos en sus studs.
2. **Raíces con placas con garras de roca (27261).** La placa apoya en el borde del disco de tierra redondo (60474) y las garras bajan un plato hasta el césped, como raíces que se aferran. Encima, dos pendientes 1×1 por raíz ensanchan la base del tronco.
3. **Panículas con tallo de 6 ramitas (19119) en *Dark Brown*.** El tallo va clavado en el stud hueco de la hoja más alta, con una flor de 5 pétalos en la punta de cada ramita. Es la flor en racimo del jacarandá, en 3D y con aire entre flores. Seis racimos lo llevan, y el último corona el árbol.
4. **Ramas inclinadas sin bisagras.** Cada nivel es un ladrillo redondo 2×2 corrido un stud, así las ramas suben a unos 40°. Una pendiente 1×1 en cada peldaño convierte la escalera en rama inclinada. Las ramas se trenzan en el centro y el árbol queda firme.
5. **Líder en zigzag.** Cada ladrillo del eje central está corrido y deja dos studs libres a distinta altura para las ramitas altas.
6. **Pétalos caídos con baldosas de cuarto de círculo (25269)**, redondas y flores giradas, más densas bajo el borde de la copa: la "sombra lila".

## Armado (44 pasos en el archivo, 27 cuadros de video)

| Tramo | Pasos | Qué cambia en la silueta |
|---|---|---|
| **Base** | 1 césped 16×16 · 2 seis matas · 3 lluvia de 25 flores caídas | aparece el suelo, ya manchado de lila (anticipa el final) |
| **Tronco** (difícil) | 1 disco + 4 raíces · 2 primer ladrillo + pendientes de la base · 3-4 tronco · 5 la horqueta en V · 6-8 ramas en cruz con sus pendientes · 9-10 ramitas (primero las del lado lejano a la cámara, después las cercanas) · 11-12 líder en zigzag + ramitas altas + pimpollos | el árbol pelado de invierno crece paso a paso |
| **Primer racimo** (se muestra entero) | hojas · tallo · flores | se ve cómo se arma un racimo y un ramillete |
| **Floración** (tranquilo) | un paso por racimo o por pareja: atrás → costados → arriba al medio → adelante | la copa se llena de atrás hacia adelante, sin tapar lo que viene |
| **Revelación** | el copete con su ramillete | corona la copa |

Los racimos que se repiten se muestran enteros una vez y después se colocan de a uno o de a dos por paso. Las parejas agrupadas son las que de frente se superponen: si fueran por separado, el segundo paso sería invisible.

## Números finales (`validar` y `metricas`)

- `validar`: **0 errores, 0 avisos**. Cada sub-armado también valida solo (`--sub`).
- 201 piezas, 44 pasos en el archivo (27 cuadros de video), 17 sub-armados: base, tronco y 15 racimos. Se usan 6 colores: *Green*, *Bright Green*, *Reddish Brown*, *Dark Brown*, *Lavender* y *Medium Lavender*. El 100 % de las piezas no son básicas.
- Tamaño: 20,1 × 17,9 studs de copa y 15,6 ladrillos de alto, sobre una base de 16 × 16. La copa ocupa ~50 % de la altura total, en el rango de los árboles vigorosos que crecen al descubierto (§2).
- Dimensión fractal del borde: 1,26, cerca del rango que se prefiere (1,3–1,5, §3).
- Cambio de silueta por cuadro: media 4 %, mínimo 1,2 %, **0 pasos invisibles**.
- Hay en promedio 5 piezas por paso. El paso más cargado es la lluvia de 25 flores caídas: son piezas chicas y conviene que caigan todas juntas.

## Qué salió bien

- **Se lee como árbol al instante**, también a 64 px y en silueta. De frente: paraguas ancho, tronco con ensanche y la V de las ramas asomando bajo la copa. De 3/4: una copa lila tupida sobre un tronco con raíces que se aferran.
- **El relato del video.** El suelo ya aparece salpicado de lila, crece un árbol pelado de invierno con ramitas y pimpollos, y florece de atrás hacia adelante hasta el copete. Ningún paso queda invisible.
- **Los usos de piezas:**
  - hojas 4×3 marrones como ramitas;
  - placas con garras como raíces;
  - el tallo de 6 ramitas con flores como panícula;
  - pendientes 1×1 que convierten la escalera de ladrillos en ramas inclinadas sin bisagras.
- **Todo encastra por conector.** Los racimos se colocan calculando, desde la transformación ya encastrada de cada ramita, dónde queda su stud. No hay coordenadas a ojo. Es sólido: las ramas se trenzan en el centro y el verificador no marca vuelco.

## Qué no me convence

- **De frente y de costado, la copa se ve en pisos**, como capas horizontales, porque las hojas 6×5 son planas. En 3/4 no se nota, pero de perfil es más "pagoda" que "nube". También deja ver el líder marrón entre pisos: da profundidad, pero a veces parece un poste.
- **La copa se pasa de la base:** mide ~20 studs contra 16. Es fiel a un jacarandá de plaza y es estable, pero en 3/4 la copa pesa un poco más que la base.
- **Falta un toque azul.** El lila del jacarandá real es más azulado que *Lavender* y *Medium Lavender*. El único lila más oscuro con hojas reales, *Medium Lilac*, sale índigo y lo descarté.
- **Algunos detalles no se lucen a escala de celular:** los pimpollos de la punta del líder, algunas flores caídas bajo la copa y el giro de cada hoja apenas se ven. Y la simetría en cruz del tronco se nota si se mira de arriba.
- **Los racimos son 15 sub-armados únicos.** Es muy fiel al armado real, porque cada racimo se arma en la mano y se engancha, pero son muchos submodelos para instrucciones impresas.

## Forma de copa según la tabla (`consigna/hechos-arbol.md`)

**Extendida**: mucho más ancha que alta, un domo bajo y amplio en forma de paraguas (≈20 studs de ancho contra ≈9,5 studs de alto de copa). La sostiene una **estructura en vaso**: ramas gruesas que salen de un tronco corto y se abren hacia arriba y hacia afuera. Es el crecimiento decurrente del jacarandá, sin un eje que domine a la vista. El líder central existe solo como estructura, escondido dentro de la copa.
