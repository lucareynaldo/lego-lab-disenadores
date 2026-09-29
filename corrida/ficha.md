# Ficha — Acacia de sabana

## Especie y por qué
Acacia paraguas (*Vachellia tortilis*). Es la forma de árbol que la gente prefiere en varios países (Sommer y Summit) y la forma **extendida** fue la mejor valorada en Lohr y Pearson-Mims 2006. Además tiene una silueta que se lee al instante incluso a 64 px: una "T" ancha y plana sobre un tronco corto, muy distinta de un árbol genérico redondo.

## Escala
Microescala de mesa: ~1:150. El tronco de 2 studs representa ~2,5 m de circunferencia; el árbol mide ~15 placas hasta la copa baja y la copa ocupa los 16 studs del ancho de la base.

## Rasgos imprescindibles
1. **Copa plana y mucho más ancha que alta** (paraguas). Si se redondea, pasa a ser un árbol cualquiera.
2. **Tronco corto que se abre en vaso** en varias ramas inclinadas (decurrente).
3. **Suelo seco** (tan/dark tan) con pasto escaso: el contexto sabana.

## Tres conceptos
1. **Paraguas en dos pisos (elegido).** Silueta en T con dos capas de copa separadas por ramitas marrones que dejan ver cielo entre pisos. Paleta tan / marrón rojizo / tres verdes. Sub-armados: base, tronco, copa baja, copa alta. Revelación: el piso alto, más claro, se apoya al final sobre las ramitas.
2. **Acacia en la estación seca.** Copa ralita en Olive/Lime con hojas sueltas, una jirafa de ladrillos al costado. Descartado: la jirafa se come la atención y las piezas.
3. **Tronco inclinado por el viento.** Forma irregular, copa desplazada. Descartado: más difícil de sostener y se lee peor de frente.

Elijo el 1 porque los pisos con huecos son el rasgo más reconocible de una acacia real (§2 "huecos en la copa") y dan un momento de video claro.

## Técnicas
- **Ramas en escalera:** cada rama sube alternando ladrillo 2x2 y placa 2x3 desplazada un stud hacia afuera; a dos pisos da una rama que se abre en ángulo sin bisagras.
- **Uso ingenioso:** las **hojas 6x5 (2417) se clavan por debajo** de las placas de la copa (stud de la hoja en el anti-stud de la placa), así la copa "gotea" hacia abajo en los bordes en vez de tener hojas encima.
- **Ramitas pasantes:** ladrillos redondos 1x1 marrones sostienen el segundo piso y se ven entre las dos capas verdes, como ramas que atraviesan el follaje.
- Ensanche de base: placa 4x4 bajo el tronco redondo, con cuatro placas redondas 1x1 marrón oscuro en las esquinas como raíces.

## Armado (resumen)
- Base (3 pasos): suelo, manchas de tierra, pasto.
- Tronco (8 pasos): raíces → fuste → horqueta → rama izquierda (2 pasos) → rama derecha → líder central.
- Copa baja (5 pasos): placa oscura con hojas colgantes → capa verde → hojas del frente/fondo → texturas → ramitas.
- Copa alta (3 pasos) y modelo principal: base, tronco, copa baja, **copa alta al final**.

## Forma de copa (tabla de `hechos-arbol.md`)
**Extendida**, con ramificación en vaso desde un tronco corto.

## Qué salió bien
- Pasa `validar` sin errores y cada sub-armado valida por separado (74 piezas, 4 submodelos).
- Todo se encastra por conector; las únicas coordenadas son las alturas de colocación de los sub-armados, derivadas de las piezas.
- Silueta simple y fuerte, simétrica y estable (el peso de la copa cae sobre tres ramas).

## Qué no me convence
- **No pude ver ningún render:** el contenedor no tiene WebGL y el render falla (también el de la prueba del taller). Todo el ajuste de proporciones se hizo por cálculo, sin mirar el modelo. Por eso falta `renders/final.png`.
- La copa quizá quede demasiado rectangular vista de arriba; faltaría redondear esquinas con cuñas.
- El tronco es algo recto y liso; una acacia real es más retorcida.
