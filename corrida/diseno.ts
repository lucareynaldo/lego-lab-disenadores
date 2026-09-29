import {Modelo, grilla} from '../taller/src/dsl.ts';

// Cerezo en flor (sakura): tronco corto con raíces en molinete que se abre en dos ramas
// y sostiene una copa extendida, más ancha que alta, con pétalos que desbordan el borde.
const m = new Modelo('cerezo');
const RB = 'Reddish_Brown', PK = 'Bright_Pink', DP = 'Dark_Pink', WH = 'White', G = 'Green';
type P = [number, number];

// ---------- BASE: pasto, raíces en molinete y pétalos caídos ----------
const base = m.sub('base');
const suelo = base.poner('41539', G);
base.paso();
base.poner('3003', RB, {sobre: suelo, stud: [3, 3]}); // pie del tronco (centro del modelo)
base.paso();
// raíces: cuatro pendientes 2x1 en molinete, la parte alta pegada al tronco (ensanche de la base)
base.poner('3040b', RB, {sobre: suelo, stud: [3, 1], giro: 0});
base.poner('3040b', RB, {sobre: suelo, stud: [6, 3], giro: 90});
base.poner('3040b', RB, {sobre: suelo, stud: [4, 6], giro: 180});
base.poner('3040b', RB, {sobre: suelo, stud: [1, 4], giro: 270});
base.paso();
// matas de pasto
for (const [i, j] of [[0, 1], [7, 6], [6, 0], [1, 7]] as P[]) base.poner('32607', 'Bright_Green', {sobre: suelo, stud: [i, j]});
base.paso();
// pétalos caídos: siempre del lado de afuera, como si el viento los hubiera juntado
for (const [i, j] of [[0, 0], [1, 1], [7, 7], [6, 7], [0, 6], [7, 2], [5, 1], [2, 6], [7, 4], [0, 3]] as P[])
	base.poner('3024', PK, {sobre: suelo, stud: [i, j]});
base.paso();

// ---------- TRONCO: se afina y se bifurca en dos ramas ----------
const tronco = m.sub('tronco');
const t0 = tronco.poner('3003', RB);
const t1 = tronco.poner('3003', RB, {sobre: t0, stud: [0, 0]});
tronco.paso();
// horqueta: dos ramas 1x1 en diagonal, cada una más fina que el tronco
const rA = tronco.poner('3005', RB, {sobre: t1, stud: [0, 0]});
const rB = tronco.poner('3005', RB, {sobre: t1, stud: [1, 1]});
tronco.paso();
const pA = tronco.poner('3021', RB, {sobre: rA, stud: [0, 0], con: [2, 1]});
const pB = tronco.poner('3021', RB, {sobre: rB, stud: [0, 0], con: [0, 0]});
tronco.paso();
const hA = tronco.poner('3005', RB, {sobre: pA, stud: [0, 0]});
const hB = tronco.poner('3005', RB, {sobre: pB, stud: [2, 1]});
tronco.paso();
tronco.poner('3005', RB, {sobre: hA, stud: [0, 0]});
tronco.poner('3005', RB, {sobre: hB, stud: [0, 0]});
tronco.paso();

// ---------- COPA ----------
const copa = m.sub('copa');
const cama = copa.poner('3958', DP); // cara de abajo en rosa oscuro: la sombra de la copa
copa.paso();
const nube = copa.poner('41539', PK, {sobre: cama, stud: [0, 0], con: [1, 1]});
copa.paso();
// racimos colgantes: flores de 3 hojas encastradas boca abajo bajo el alero de la copa
for (const [i, j] of [[0, 2], [0, 5], [7, 2], [7, 5], [2, 0], [5, 0], [2, 7], [5, 7]] as P[])
	copa.poner('32607', j === 0 || i === 7 ? WH : PK, {debajo: nube, antistud: [i, j]});
copa.paso();
// hojas-pétalo en molinete que desbordan el borde de la copa
const hojas: [number, P, string][] = [
	[0, [2, 6], WH], [0, [5, 6], PK],
	[90, [1, 2], PK], [90, [1, 5], WH],
	[180, [5, 1], WH], [180, [2, 1], PK],
	[270, [6, 5], PK], [270, [6, 2], WH],
];
hojas.slice(0, 2).forEach(([g, s, c]) => copa.poner('2423', c, {sobre: nube, stud: s, giro: g}));
copa.paso();
hojas.slice(2).forEach(([g, s, c]) => copa.poner('2423', c, {sobre: nube, stud: s, giro: g}));
copa.paso();
// cúpula: cuatro ladrillos 2x2 forman el bulto central de la copa
const cupula = ([[2, 2], [4, 2], [2, 4], [4, 4]] as P[]).map((st, k) => copa.poner('3003', k % 3 ? PK : DP, {sobre: nube, stud: st}));
copa.paso();
const cima = copa.poner('3031', PK, {sobre: cupula[0], stud: [0, 0]});
copa.paso();
// segundo piso de pétalos, girado respecto del primero
const arriba: [number, P, string][] = [[0, [1, 2], WH], [90, [1, 1], PK], [180, [2, 1], WH], [270, [2, 2], PK]];
const tope = arriba.map(([g, s, c]) => copa.poner('2423', c, {sobre: cima, stud: s, giro: g}));
copa.paso();
// remate: una flor en la punta de cada pétalo de arriba (color cruzado) y en las esquinas de la copa
tope.forEach((h, k) => copa.poner('32607', k % 2 ? WH : PK, {sobre: h, stud: [1, 3]}));
for (const [i, j] of [[0, 0], [7, 0], [0, 7], [7, 7]] as P[]) copa.poner('32607', WH, {sobre: nube, stud: [i, j]});
copa.paso();

m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(tronco, {en: grilla(0, 6, 0)});
m.raiz.paso();
m.raiz.colocar(copa, {en: grilla(0, 20, 0)});
m.raiz.paso();
m.guardar();
