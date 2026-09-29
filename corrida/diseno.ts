import {Modelo, grilla} from '../taller/src/dsl.ts';
import type {PiezaColocada} from '../taller/src/dsl.ts';
import {rotacionEje, rotacionEntre} from '../taller/src/encastre.ts';

// Jacarandá de vereda. Unidades LDraw: 1 stud = 20, 1 placa = 8, −Y arriba.
const TRONCO = 'Reddish_Brown';
const E = process.env;

type V = [number, number, number];
const aplicar = (p: PiezaColocada, v: V): V => {
	const r = p.tr.r, t = p.tr.t;
	return [r[0] * v[0] + r[1] * v[1] + r[2] * v[2] + t[0], r[3] * v[0] + r[4] * v[1] + r[5] * v[2] + t[1], r[6] * v[0] + r[7] * v[1] + r[8] * v[2] + t[2]];
};
const mas = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const rotV = (p: PiezaColocada, v: V): V => {
	const r = p.tr.r;
	return [r[0] * v[0] + r[1] * v[1] + r[2] * v[2], r[3] * v[0] + r[4] * v[1] + r[5] * v[2], r[6] * v[0] + r[7] * v[1] + r[8] * v[2]];
};
const cruz = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const punto = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// Expresa la rotación de una pieza como 'Xa Yb' (inclinación y después giro), para colocar un submodelo igual.
// Giro que hay que pasarle a `sobre` para que la pieza nueva quede alineada con `base` (en una pieza inclinada
// y girada, el encastre por stud solo alinea el eje del stud; el giro fija el resto).
function giroAlineado(base: PiezaColocada): number {
	const eje = rotV(base, [0, -1, 0]);
	for (const g of [0, 90, 180, 270]) {
		const a = rotacionEje(eje, g), b = rotacionEntre([0, -1, 0], eje);
		const r = [0, 1, 2].flatMap((i) => [0, 1, 2].map((k) => a[i * 3] * b[k] + a[i * 3 + 1] * b[3 + k] + a[i * 3 + 2] * b[6 + k]));
		if (r.every((x, n) => Math.abs(x - base.tr.r[n]) < 1e-6)) return g;
	}
	throw new Error('no hay giro que alinee');
}
function comoRot(p: PiezaColocada): string {
	const r = p.tr.r;
	for (const b of [0, 90, 180, 270]) {
		const c = Math.cos((b * Math.PI) / 180), s = Math.sin((b * Math.PI) / 180);
		// R_Y(-b) · r: filas de R_Y(-b) = [c,0,-s],[0,1,0],[s,0,c]
		const q = [0, 1, 2].map((k) => [c * r[k] - s * r[6 + k], r[3 + k], s * r[k] + c * r[6 + k]]);
		const a = Math.atan2(q[1][2], q[2][2]);
		const x = [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
		const ok = [0, 1, 2].every((i) => [0, 1, 2].every((k) => Math.abs(q[k][i] - x[i * 3 + k]) < 1e-6));
		if (ok) return `X${((a * 180) / Math.PI).toFixed(4)} Y${b}`;
	}
	throw new Error('rotación no expresable como X·Y: ' + r.join(' '));
}


const m = new Modelo('jacaranda');

// ---------- Vereda ----------
// Baldosas 2 × 2 en grilla alrededor de una cazuela de 8 × 8 (borde gris oscuro + tierra de 6 × 6).
// En los huecos de 1 × 1 caen flores al final (placas de 5 pétalos, al ras de las baldosas).
const HUECOS: [number, number][] = [
	[5, 2], [8, 1], [9, 3], [11, 2], [3, 3], [6, 0], [13, 1], [2, 6], [3, 9], [1, 5], [12, 7], [13, 10], [7, 12], [10, 13], [4, 13],
];
const esHueco = (i: number, j: number) => HUECOS.some(([a, b]) => a === i && b === j);
const vereda = m.sub('vereda');
const losa = vereda.poner('91405', 'Light_Bluish_Grey');
const GRIS = 'Light_Bluish_Grey';
// borde de la cazuela
vereda.poner('4162', 'Dark_Bluish_Grey', {sobre: losa, stud: [4, 4]});
vereda.poner('4162', 'Dark_Bluish_Grey', {sobre: losa, stud: [4, 11]});
vereda.poner('6636', 'Dark_Bluish_Grey', {sobre: losa, stud: [4, 5], giro: 90});
vereda.poner('6636', 'Dark_Bluish_Grey', {sobre: losa, stud: [11, 5], giro: 90});
vereda.paso();
function baldosa(i: number, j: number) {
	const h = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => esHueco(i + a, j + b));
	if (!h.some(Boolean)) return void vereda.poner('3068b', GRIS, {sobre: losa, stud: [i, j]});
	// una fila entera libre → 1 × 2; lo que queda, 1 × 1
	for (const b of [0, 1]) {
		const fila = [h[b * 2], h[b * 2 + 1]];
		if (!fila[0] && !fila[1]) vereda.poner('3069b', GRIS, {sobre: losa, stud: [i, j + b]});
		else for (const a of [0, 1]) if (!fila[a]) vereda.poner('3070b', GRIS, {sobre: losa, stud: [i + a, j + b]});
	}
}
// por columnas de izquierda a derecha: cada paso levanta una parte distinta del perfil
const enCazuela = (i: number, j: number) => i >= 4 && i < 12 && j >= 4 && j < 12;
for (const [i0, i1] of [[0, 4], [4, 16]]) {
	for (let j = 0; j < 16; j += 2) for (let i = i0; i < i1; i += 2) if (!enCazuela(i, j)) baldosa(i, j);
	vereda.paso();
}

// ---------- Tronco (con las ramas peladas) ----------
const tronco = m.sub('tronco');
const tierra = tronco.poner('3958', 'Dark_Brown');
const nucleo = tronco.poner('3003', TRONCO, {sobre: tierra, stud: [2, 2]});
tronco.paso();
// raíces: pendientes con el lado alto contra el tronco
tronco.poner('3040b', TRONCO, {sobre: tierra, stud: [4, 2], con: [0, 1], giro: 90});
tronco.poner('3040b', TRONCO, {sobre: tierra, stud: [1, 3], con: [0, 1], giro: 270});
tronco.poner('3040b', TRONCO, {sobre: tierra, stud: [3, 1], con: [0, 1], giro: 0});
tronco.poner('3040b', TRONCO, {sobre: tierra, stud: [2, 4], con: [0, 1], giro: 180});
tronco.paso();
let c = nucleo;
for (let k = 0; k < 3; k++) c = tronco.poner('3941', TRONCO, {sobre: c, stud: [0, 0]});
tronco.paso();
const horqueta = tronco.poner('87081', TRONCO, {sobre: c, stud: [0, 0], con: [1, 1]});
let guia = tronco.poner('3941', TRONCO, {sobre: horqueta, stud: [1, 1]});
guia = tronco.poner('3941', TRONCO, {sobre: guia, stud: [0, 0]});
guia = tronco.poner('3941', TRONCO, {sobre: guia, stud: [0, 0]});
guia = tronco.poner('87580', TRONCO, {sobre: guia, stud: [0, 0]});
tronco.paso();

// Una rama: bisagra en el borde de la horqueta, inclinada `g` hacia afuera; `largo` ladrillos; codo con
// bisagra que deja la punta a `codo` grados; una placa 1 × 2 de separación. Devuelve la placa de la punta.
const ARRIBA: V = [0, -1, 0];
function rama(stud: [number, number], giro: number, afuera: V, largo: number, g: number, codo: number, alto: 0 | 5): PiezaColocada[] {
	const n = `rama${stud.join('')}`;
	const base = tronco.poner('3937', TRONCO, {sobre: horqueta, stud, giro, nombre: `${n}-bisagra`});
	const signo = punto(cruz(rotV(base, [1, 0, 0]), ARRIBA), afuera) > 0 ? 1 : -1;
	let p = tronco.poner('3938', TRONCO, {conector: {de: base, n: 2}, propio: 0, giro: signo * g});
	p = tronco.poner('35480', TRONCO, {sobre: p, stud: [0, 0], giro: giroAlineado(p), nombre: `${n}-arranque`});
	for (let k = 0; k < largo; k++) p = tronco.poner('3004', TRONCO, {sobre: p, stud: [0, 0], giro: giroAlineado(p), nombre: `${n}-ladrillo${k}`});
	const codoBase = tronco.poner('3937', TRONCO, {sobre: p, stud: [0, 0], giro: giroAlineado(p), nombre: `${n}-codo`});
	p = tronco.poner('3938', TRONCO, {conector: {de: codoBase, n: 2}, propio: 0, giro: signo * codo});
	// la punta se abre en dos: una placa 1 × 6 cruzada con un tallo en cada extremo (uno más alto)
	const cruce = tronco.poner('3666', TRONCO, {sobre: p, stud: [0, 0], con: [2, 0], giro: giroAlineado(p), nombre: `${n}-cruce`});
	const tallos = ([0, 5] as const).map((i) => {
		let t = tronco.poner('3062b', TRONCO, {sobre: cruce, stud: [i, 0], giro: giroAlineado(cruce), nombre: `${n}-tallo${i}`});
		if (i === alto) t = tronco.poner('3062b', TRONCO, {sobre: t, stud: [0, 0], giro: giroAlineado(t)});
		return t;
	});
	tronco.paso();
	return tallos;
}
const [LL, GL, CL] = [Number(E.LL ?? 3), Number(E.GL ?? 35), Number(E.CL ?? 15)];
const [LC, GC, CC] = [Number(E.LC ?? 2), Number(E.GC ?? 40), Number(E.CC ?? 20)];
const puntas = [
	// de atrás hacia adelante (la cámara 3/4 mira desde −X, −Z); la de adelante es más corta y más abierta
	...rama([1, 3], 0, [0, 0, 1], LL, GL, CL, 0),
	...rama([3, 1], 90, [1, 0, 0], LC, GC, CC, 5),
	...rama([0, 1], 90, [-1, 0, 0], LC, GC, CC, 5),
	...rama([1, 0], 0, [0, 0, -1], Number(E.LF ?? 2), Number(E.GF ?? 42), Number(E.CF ?? 15), 0),
];

// ---------- Ramillete (se repite) ----------
const ramillete = m.sub('ramillete');
const hojaA = ramillete.poner('2417', E.VERDE ?? 'Green', {nombre: 'hojaA'});
const hojaB = ramillete.poner('2417', 'Lavender', {sobre: hojaA, stud: [2, 3], con: [2, 3], giro: 180, nombre: 'hojaB'});
const hojaC = ramillete.poner('2417', 'Medium_Lavender', {sobre: hojaB, stud: [2, 3], con: [2, 3], giro: 90, nombre: 'hojaC'});
const hojaD = ramillete.poner('2417', 'Lavender', {sobre: hojaC, stud: [2, 3], con: [2, 3], giro: 270, nombre: 'hojaD'});
ramillete.paso();
const tallo = ramillete.poner('3062b', 'Lavender', {sobre: hojaD, stud: [2, 3]});
const hojaE = ramillete.poner('2417', 'Medium_Lavender', {sobre: tallo, stud: [0, 0], con: [2, 3], giro: 0, nombre: 'hojaE'});
const hojaF = ramillete.poner('2423', 'Lavender', {sobre: hojaE, stud: [2, 3], con: [0, 3], giro: 90, nombre: 'hojaF'});
ramillete.paso();

// ---------- Copa central (girada 45° sobre un ladrillo redondo 1 × 1) ----------
const copa = m.sub('copa');
const giratorio = copa.poner('3062b', TRONCO);
const cubo = copa.poner('60474', 'Dark_Brown', {sobre: giratorio, stud: [0, 0], con: [1, 1]});
copa.paso();
// cuatro hojas que salen del cubo hacia afuera (con la copa girada 45°, cubren las diagonales)
copa.poner('2423', 'Lavender', {sobre: cubo, stud: [1, 0], con: [0, 3], giro: 0, nombre: 'copa-n'});
copa.poner('2423', 'Medium_Lavender', {sobre: cubo, stud: [3, 1], con: [0, 3], giro: 90, nombre: 'copa-e'});
copa.poner('2423', 'Lavender', {sobre: cubo, stud: [2, 3], con: [0, 3], giro: 180, nombre: 'copa-s'});
copa.poner('2423', 'Medium_Lavender', {sobre: cubo, stud: [0, 2], con: [0, 3], giro: 270, nombre: 'copa-o'});
copa.paso();
const cima = copa.poner('3062b', 'Lavender', {sobre: cubo, stud: [1, 1]});
const cimaHoja = copa.poner('2417', 'Medium_Lavender', {sobre: cima, stud: [0, 0], con: [2, 3], giro: 90, nombre: 'cima'});
copa.poner('2423', 'Lavender', {sobre: cimaHoja, stud: [2, 3], con: [0, 3], giro: 0, nombre: 'cima2'});
copa.paso();

// ---------- Modelo ----------
const TR: V = [0, -8, 0]; // dónde va el tronco: la tierra encastra en los studs libres del centro de la vereda
m.raiz.colocar(vereda);
m.raiz.paso();
m.raiz.colocar(tronco, {en: TR});
m.raiz.paso();
const GIROS = (E.GIROS ?? '45,45,45,45,45,45,45,45').split(',').map(Number);
// ramilletes en la punta de cada rama: su anti-stud central (0, 8, 0) sobre el stud (0,0) de la placa
// de abajo hacia arriba, para que ningún ramillete tape el camino del siguiente
[...puntas].sort((a, b) => b.tr.t[1] - a.tr.t[1]).forEach((p, k) => {
	const stud = mas(TR, aplicar(p, [0, 0, 0]));
	const bajo = rotV(p, [0, 8, 0]);
	m.raiz.colocar(ramillete, {en: [stud[0] - bajo[0], stud[1] - bajo[1], stud[2] - bajo[2]], rot: `Y${GIROS[k]} ${comoRot(p)}`});
	if (k === 0 || k === 1 || k === 7) m.raiz.paso();
});
m.raiz.colocar(copa, {en: mas(TR, mas(aplicar(guia, [0, 0, 0]), [0, -24, 0])), rot: `Y${E.COPA ?? 45}`});
// la alfombra violeta: flores caídas en los huecos de la vereda y sobre la tierra
const TIERRA: [number, number][] = [[0, 1], [4, 0], [5, 4], [1, 5], [4, 5], [0, 4]];
HUECOS.forEach(([i, j], k) => m.raiz.poner('24866', k % 3 === 0 ? 'Medium_Lavender' : 'Lavender', {en: [-150 + 20 * i, -8, -150 + 20 * j], nombre: `flor${i},${j}`}));
TIERRA.forEach(([i, j], k) => m.raiz.poner('24866', k % 2 ? 'Medium_Lavender' : 'Lavender', {en: [-50 + 20 * i, -16, -50 + 20 * j]}));
m.raiz.paso();
m.guardar();
