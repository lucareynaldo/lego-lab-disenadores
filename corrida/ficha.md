# Ficha — Cerezo japonés en flor (sakura)

## Especie y por qué

**Cerezo japonés 'Somei-Yoshino' en plena floración.** Es un árbol que se reconoce en un segundo aunque esté muy estilizado: una nube rosa pálida sin una sola hoja verde, sostenida por un tronco oscuro que se abre bajo. Además el color cuenta la historia de la estación (hechos, §2: la floración de primavera llega antes que las hojas nuevas), y eso da el momento de "revelación" para el video: primero se ve un árbol pelado de invierno y al final brotan las flores.

La forma de copa que busco es **extendida / redonda**, con tronco corto (la preferida en los estudios de Sommer y Summit y de Lohr y Pearson-Mims, §3).

## Escala

Miniatura de exhibición, aprox. **1:150** (1 stud ≈ 1,2 m). El árbol real mide ~8–10 m de alto y ~12–15 m de ancho; el modelo mide unos 12 studs de alto (con base) por 14 de ancho de copa, sobre una base de 12 × 12.

## Rasgos que no pueden faltar

1. **Copa de flor rosa-blanca, sin verde**, ancha y en nubes con huecos: si la copa es verde o es una bola lisa, es "un árbol cualquiera".
2. **Tronco oscuro, corto y ensanchado en la base, que se abre enseguida en ramas gruesas** (crecimiento decurrente, §2): las ramas se tienen que ver por debajo de la copa.
3. **Flores de cinco pétalos** en el detalle cercano (y pétalos caídos en el pasto): lo que dice "cerezo" y no "algodón de azúcar".

## Tres conceptos

**A. "Nubes de cúpula" (elegido).** Silueta extendida: cúpula central alta y cuatro medias cúpulas más bajas en cruz, como un trébol visto desde arriba, con huecos en las diagonales donde se ve la madera. Paleta: rosa claro (Bright Pink) dominante, blanco en faldas de hojas y flores, tronco marrón oscuro, pasto verde. Sub-armados: base con raíces, tronco con ramas, copa central, lóbulo (×4), ramita en flor (×5). Revelación: el árbol pelado recibe las nubes y al final brotan las ramitas con flores de 5 pétalos.

**B. "Cerezo llorón" (shidare-zakura).** Silueta llorona, alta: eje central y ramas que cuelgan hasta casi el suelo hechas con tallos de flor invertidos (19119 colgando de las bases de placas) y flores en las puntas. Paleta: rosa fuerte y blanco. Revelación: se da vuelta el árbol y las ramas "caen". Muy lindo pero frágil y con riesgo de leerse como sauce o como fuente.

**C. "Bonsái de cerezo".** Tronco retorcido en maceta rectangular, copa en capas planas de hojas rosas (hojas 6×5 y 4×3 apiladas con separadores). Revelación: la maceta y el tronco sinuoso primero, luego las nubes. Se lee rápido como bonsái, pero el encargo es un árbol, y el bonsái lo desplaza hacia "planta en maceta".

**Elegí A** porque es la que más rápido se lee como árbol entero a 64 px (cúpula rosa sobre "Y" oscura), tiene una revelación clara (de invierno a primavera), y el uso ingenioso —el tallo de flor de seis brazos 19119 en marrón oscuro como ramita, con flores de cinco pétalos 24866 en las puntas— aparece justo en el final del video.

## Cómo quedó

118 piezas, base redondeada de 12 × 12, unos 11 ladrillos de alto y 15–16 studs de ancho con las ramitas. `validar` pasa sin errores ni avisos, y cada sub-armado valida solo. Métricas: dimensión fractal de la silueta 1,23; ningún paso invisible.

**Sub-armados y guion del video (22 pasos):**
1. **base**: disco de pasto (cuatro cuartos redondeados unidos por la loma central) → raíces (cuatro pendientes 45° en molinete, que ensanchan el pie del tronco) → jardín (camino de piedras, hostas, matas).
2. **tronco**: tronco de 2 × 2 → cuatro ramas que arrancan en molinete, una por esquina → eje central que las traba → escalera de ramas → placas finales (dos ramas suben más, dos quedan bajas, como puntas caídas). Es el tramo difícil.
3. **farol** de piedra (tōrō): el tramo tranquilo después del tronco, y además da escala.
4. **lóbulo** (se arma una vez y se pone ×4, de a pares opuestos): falda de hojas blancas, placa y media cúpula rosa con flores blancas en la cima.
5. **copa**: la cúpula central, por mitades.
6. **ramita** (se arma una vez y se pone ×5): **la revelación**. Primero brota una en la cima y en el último paso las otras cuatro en los huecos entre lóbulos, mientras caen los pétalos al pasto.

**Uso ingenioso:** el tallo de flor de seis brazos (19119), en marrón oscuro, hace de ramita de cerezo encastrada en una placa *jumper*. En cada brazo lleva una placa-flor de **cinco pétalos** (24866), deslizada hasta la punta de la barra, igual que la flor del cerezo. También las raíces en molinete y las esquinas-cúpula 3×3×2 (88293) usadas como nubes de flor.

## Qué salió bien

- A 64 px se lee como árbol en las cuatro vistas: masa rosa sobre una "Y" oscura sobre un disco verde.
- La secuencia invierno → primavera: el árbol pelado, las nubes y al final las ramitas en flor y los pétalos en el suelo. La revelación ocurre en los dos últimos pasos.
- La copa en trébol deja huecos en las diagonales. Ahí se ven la madera y las ramitas, y en 3/4 da un borde irregular (§2, huecos en la copa).
- Tronco corto con ensanche en la base y ramas que se abren enseguida (crecimiento decurrente).
- El farol y las piedras sitúan la escena en un jardín japonés sin explicarlo.

## Qué no me convence

- Las cúpulas son lisas y brillantes. De cerca la copa parece de "bolas de algodón" más que de flor; la textura depende de las ramitas y de las flores blancas en las cimas.
- En la vista de frente la copa tiene la base bastante plana (las faldas de hojas quedan casi escondidas debajo de las placas) y el tronco se ve como una pila de bloques.
- La simetría en molinete es muy regular para un cerezo real, que suele ser más irregular.
- La dimensión fractal (1,23) queda un poco debajo del rango preferido (1,3–1,5). Probé sumar ramitas en los lóbulos, pero chocaban con las cúpulas en todas las orientaciones y las descarté.

## Forma de copa (tabla de `hechos-arbol.md`)

**Extendida / redonda**: un domo más ancho que alto (unos 14 studs de copa contra 11 ladrillos de alto total, y la copa ocupa cerca de la mitad de la altura), con tronco corto y ramas que salen de abajo y se abren hacia afuera. Está en el límite con **en vaso** por cómo arrancan las ramas.
