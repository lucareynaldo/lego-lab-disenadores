# Ficha — Jacarandá en flor

## Especie y por qué

**Jacarandá** (*Jacaranda mimosifolia*) en plena floración, el de las veredas y plazas de Buenos Aires en noviembre.

- Es un caducifolio que florece **antes o junto con las hojas nuevas** (hechos §2, "Color según la estación"): durante unas semanas la copa es casi toda violeta sobre ramas oscuras. Eso da una paleta que ningún otro árbol tiene y que se lee en un segundo en un celular.
- La copa es **extendida / en vaso**: tronco corto que se abre en ramas que arquean hacia afuera y hacia arriba. Es la forma que la gente prefiere y que más alegría genera (Lohr y Pearson-Mims 2006; Sommer y Summit, hechos §3).
- Tiene una historia de armado natural para un video corto: primero un árbol pelado y oscuro (el "invierno"), después la explosión violeta, al final la alfombra de flores caídas en el pasto.

## Escala

≈ 1:70 (1 stud = 8 mm ≈ 56 cm; 1 ladrillo ≈ 67 cm).

- El modelo mide 25,5 × 25,5 studs de copa (≈ 20 cm) y 17 ladrillos de alto (≈ 16,5 cm). Es un jacarandá adulto de ~11,5 m de alto y ~14 m de copa, la proporción habitual de los de plaza, más anchos que altos.
- La base de 16 × 16 studs (≈ 13 cm) es un cantero de ~9 m de lado. La copa lo desborda, como en la vereda.
- El tronco está engrosado a propósito: unos 4 studs de ancho visible, más de 2 m a escala. Un tronco fiel (1 stud) desaparece bajo la copa en un celular. Además, el jacarandá suele abrirse en varios troncos desde abajo, y eso es lo que cuentan los cuatro cuellos.

## Rasgos sin los que deja de ser un jacarandá

1. **La copa violeta** en tres tonos (lila oscuro en la sombra, lavanda en el medio, lila claro arriba), casi sin verde.
2. **La forma de paraguas abierto**: tronco corto y oscuro que se divide en ramas largas y arqueadas, copa más ancha que alta, con huecos de cielo entre los racimos.
3. **La alfombra violeta**: flores caídas en el pasto debajo de la copa.

## Tres conceptos

1. **Paraguas violeta (jacarandá).** Silueta de paraguas/vaso: tronco corto con raíces que agarran la tierra y cuatro ramas arqueadas hechas con secciones de cola de dragón, que terminan en racimos de hojas lavanda. Paleta: tres violetas + marrón oscuro/rojizo + verde pasto. Sub-armados: base (cantero y raíces), tronco con ramas, racimos. Revelación: el árbol queda pelado y oscuro hasta el final; los racimos violetas se colocan de a uno y el último paso son las flores caídas.
2. **Sauce llorón junto al estanque.** Domo con una cortina de tiras colgantes que casi tocan el agua. Paleta: lima, verde y verde oliva, tronco marrón, agua transparente celeste. Sub-armados: base con estanque, tronco, anillo de copa con tiras. Revelación: la cortina "cae" en los últimos pasos.
3. **Pehuén (araucaria) sobre roca volcánica.** Tronco alto y recto, desnudo, con una copa de candelabro de ramas en pisos que se curvan hacia arriba (modelo de Rauh). Paleta: verde oscuro, gris roca, algo de nieve. Sub-armados: roca, tronco, pisos de ramas. Revelación: el candelabro de arriba.

**Elijo el 1 (jacarandá).** Es el más lindo y el más reconocible por color y forma a la vez; tiene una revelación clara (de ramas desnudas a flor) que además es botánicamente cierta; y las piezas de dragón dan ramas curvas de verdad, algo que con ladrillos suele salir escalonado. El sauce depende de una cortina que a 64 px se confunde con un hongo o una medusa, y la araucaria es muy local y pesa poco en color.

## Boceto

Bloques macizos para fijar proporciones antes de elegir piezas: `renders/boceto-tronco5*.png` y `renders/boceto-tronco7*.png`, con 4 vistas y silueta de 64 px.

- La copa de paraguas, unas dos veces más ancha que alta, se lee como árbol en las cuatro siluetas.
- En la vista 3/4, con 5 ladrillos de tronco la copa tapa casi todo el tronco; con 7 el tronco corto se sigue viendo. El modelo final quedó más cerca del de 7: ≈ 8 ladrillos hasta el borde bajo de la copa.
- El boceto también mostró que una copa maciza pesa demasiado y no tiene huecos. Por eso la copa final se hizo con racimos sueltos.
- Del concepto al modelo cambiaron dos cosas. Las ramas pasaron de cuatro colas a cuatro cuellos más ocho colas. Y las flores caídas no esperan al final: caen con cada racimo, así que la revelación es el racimo de la cima.

## La idea que sorprende

- **Tronco y ramas con piezas de dragón.**
  - Cuatro cuellos de dragón (67361, marrón rojizo) salen de tocones redondos en **molinete** alrededor de una columna acanalada de cuatro columnas 1 × 1 × 6 (43888).
  - Cada cuello se afina y se curva de verdad. Se abre en diagonal, corrido 30–45° de su lado y todos en el mismo sentido: el tronco parece retorcido, como un jacarandá viejo.
  - En la boca de cada cuello entra una sección de cola (40378) que sigue arqueando hacia afuera. Otras cuatro colas salen de un collar con agujeros de pin (6222) a media altura.
  - Resultado: ramificación en vaso sin un solo escalón.
- **Conos con eje (11610) en lavanda como pedúnculos.** En la punta de cada rama hay un cono lavanda, el tallito del racimo. En el árbol pelado se ven como brotes a punto de abrir y anuncian dónde va a florecer.
- **Raíces con garras.** Cuatro placas con garras (27261) muerden el borde del círculo de tierra y bajan al pasto.
- **La alfombra se arma sola.** Cada racimo que florece deja caer dos flores 1 × 1 al pasto libre más cercano a su vertical. Cuando termina el video, la alfombra violeta queda en el piso como la sombra de la copa.

Todo encastra por conector: con `sobre`, `conector`, o calculado desde los datos de conectores de `piezas ver` cuando el DSL no lo hace solo (pin en la boca del cuello, pieza del modelo principal en un conector de un sub-armado). Solo el piso del cantero y las flores caídas se ubican en la grilla: el piso porque es lo primero y no hay dónde encastrarlo, y las flores porque van en studs de otro sub-armado.

## Sub-armados y pasos (video)

24 pasos en total: 2 del cantero, 8 del tronco y 14 del modelo principal.

**Cantero** (16 piezas, tramo fácil)

1. Piso de pasto 16 × 16: cuatro esquinas redondeadas y cuatro placas.
2. El círculo de tierra (cuatro cuartos redondeados 30565 que atan las ocho placas del piso) y las cuatro raíces con garras.

**Tronco** (35 piezas, tramo difícil)

3. Plato redondo 6 × 6 y la columna acanalada.
4. Cuellos izquierda y derecha (tocón, pie redondo, cuello).
5. Cuellos atrás y frente: se completa el molinete.
6. Atadura, collar con agujeros de pin y guía central.
7. Brazo 1 (placa 2 × 12 marrón).
8. Brazo 2 cruzado y tope.
9. Ramas altas: cola y cono en los cuellos izquierdo y derecho.
10. Cola y cono en los cuellos de atrás y del frente.

**Modelo principal** (151 piezas: medio, después fácil y repetitivo)

11. El tronco se planta en el cantero y se enchufan las cuatro ramas bajas en el collar. El árbol queda **pelado**: el invierno.
12. Primer racimo, mostrado despacio: base redonda y las dos primeras hojas (lila oscuro y lavanda).
13. El resto del primer racimo (dos hojas y cuatro flores) y las primeras dos flores caídas.
14. a 22. Un racimo completo por paso, con sus dos flores caídas. Van de abajo hacia arriba (ramas bajas, brazo 1, cuellos) y, dentro de cada capa, de atrás hacia adelante según la cámara 3/4. Así cada racimo nuevo se ve entero y no tapa el lugar del siguiente.
23. Los dos racimos del brazo 2 (frente y atrás) juntos. Solo, el de atrás casi no cambia la silueta de frente.
24. **Revelación**: el racimo de la guía cierra el paraguas en la cima.

Ritmo:

- fácil (cantero);
- difícil (tronco, con piezas en ángulo);
- medio (ramas bajas);
- el racimo enseñado en dos pasos;
- una racha fácil y rítmica de racimos que va cambiando el color del video de marrón a violeta;
- cierre arriba.

Cada paso cambia la silueta: ningún paso invisible, cambio mínimo 1 %.

## Métricas finales (`metricas modelo.mpd`)

- Válido: 0 errores, 0 avisos. `validar --sub cantero` y `validar --sub tronco` también sin errores ni avisos.
- 202 piezas en 24 pasos, 2 submodelos, 8 colores, 97 % de piezas no básicas.
- Piezas por paso: media 8,5, máximo 22 (el paso doble del brazo 2).
- Tamaño: 25,5 × 25,5 studs × 17,2 ladrillos.
- Dimensión fractal 1,41, dentro del rango preferido de 1,3 a 1,5 (hechos §3).
- Cambio de silueta por paso: media 5 %, mínimo 1 %, 0 pasos invisibles.

## Forma de copa (tabla de hechos §1)

**Extendida**: mucho más ancha que alta, domo bajo y amplio.

- La copa mide ≈ 25,5 studs de ancho por ≈ 9 ladrillos de alto, más de dos veces más ancha que alta, y ocupa ~50 % de la altura total.
- Se apoya sobre una **ramificación en vaso**: tronco corto que se abre hacia arriba y afuera en cuatro cuellos y ocho colas.
- Crecimiento decurrente: los cuatro cuellos son iguales y el eje central se pierde entre ellos.

## Qué salió bien

- Se reconoce al instante: la silueta de 64 px es un árbol en las cuatro vistas (`renders/final-silueta64.png`), y el color dice "jacarandá". Tres violetas sobre tronco oscuro y pasto verde, sin nada más compitiendo.
- Las ramas curvas y afinadas de las piezas de dragón: el tronco parece retorcido y las ramas arquean como en el árbol real, sin escalones.
- La historia del video es botánicamente cierta: invierno pelado, floración racimo por racimo y la alfombra que se va formando debajo de cada racimo.
- El orden de los racimos, por capas y de atrás hacia adelante, deja cada pieza visible desde la 3/4 y el armado posible en el orden del archivo, sin avisos del validador.
- La base trabaja. Los cuartos de tierra atan las ocho placas del piso y las raíces con garras rodean el pie del tronco y bajan al pasto.

## Qué no me convence

- **El pie del tronco es grueso.** El plato 6 × 6 y los cuatro cuellos dan un pie de ombú más que de jacarandá. Un tronco más fino no sostenía los cuatro cuellos en molinete.
- **Los racimos son chatos.** Las hojas 2417 apiladas se ven de costado como pisos o "almohadones" (se nota en la vista `lado`). No representan el follaje plumoso del jacarandá, solo sus flores. Tampoco me termina de gustar la flor blanca de cada racimo, que puse de brillo, aunque el jacarandá no tiene flores blancas.
- **Los brazos 2 × 12 se ven como tablones** desde abajo y de costado. Resolvieron dónde sostener los racimos altos pero no parecen ramas.
- **Los racimos bajos cuelgan inclinados 47°**, porque los agujeros del collar son horizontales. Se leen como racimos colgantes pero muestran la parte de abajo de las hojas.
- **Para video vertical**, el árbol es más ancho (20 cm) que alto (16,5 cm). En 9:16 sobra aire arriba y abajo; es el precio de la copa extendida.
- **El paso 23 junta dos racimos** (22 piezas) y rompe la regla de una pieza importante por paso. Separado, uno de los dos no se notaba en la silueta.
