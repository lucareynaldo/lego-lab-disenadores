import {Modelo} from '../taller/src/dsl.ts';
import type {Submodelo} from '../taller/src/dsl.ts';

// Cerezo japonés (sakura) en flor — copa extendida, tronco corto.
const m = new Modelo('sakura');
const CAF = 'Reddish_Brown';

// ---------- BASE: pasto, ensanche de raíces, farol de piedra ----------
const base = m.sub('base');
const suelo = base.poner('41539', 'Green');
base.paso();
// ensanche de la raíz: 4 pendientes en molinete alrededor del tronco (studs 3..4)
base.poner('3040b', CAF, {sobre: suelo, stud: [4, 1], giro: 0});
base.poner('3040b', CAF, {sobre: suelo, stud: [3, 6], giro: 180});
base.paso();
base.poner('3040b', CAF, {sobre: suelo, stud: [1, 3], giro: 270});
base.poner('3040b', CAF, {sobre: suelo, stud: [6, 4], giro: 90});
base.paso();
// senderito de piedras
for (const [i, j] of [[7, 7], [6, 6], [7, 5], [7, 3]] as const) base.poner('6141', 'Light_Bluish_Grey', {sobre: suelo, stud: [i, j]});
base.paso();
// farol de piedra (tōrō)
const f1 = base.poner('3062b', 'Light_Bluish_Grey', {sobre: suelo, stud: [1, 6]});
const f2 = base.poner('3005', 'Light_Bluish_Grey', {sobre: f1, stud: [0, 0]});
const f3 = base.poner('4032a', 'Dark_Bluish_Grey', {sobre: f2, stud: [0, 0]});
base.poner('4740', 'Dark_Bluish_Grey', {sobre: f3, stud: [0, 0]});
base.paso();
// matas
base.poner('2423', 'Green', {sobre: suelo, stud: [0, 3], con: [0, 0], giro: 0});
base.poner('32607', 'Bright_Green', {sobre: suelo, stud: [6, 1]});
base.poner('32607', 'Bright_Green', {sobre: suelo, stud: [5, 6]});
base.paso();

// ---------- TRONCO ----------
const tronco = m.sub('tronco');
const t1 = tronco.poner('3941', CAF);
const t2 = tronco.poner('3941', CAF, {sobre: t1, stud: [0, 0]});
tronco.paso();
const t3 = tronco.poner('3941', CAF, {sobre: t2, stud: [0, 0]});
const cruz = tronco.poner('3022', CAF, {sobre: t3, stud: [0, 0]});
tronco.paso();
// ramas que se abren en cruz
tronco.poner('3710', CAF, {sobre: cruz, stud: [0, 0], con: [0, 0]});
tronco.poner('3710', CAF, {sobre: cruz, stud: [0, 1], con: [2, 0]});
tronco.paso();

// ---------- COPA ----------
// Domo escalonado de placas redondas: 8x8 → 6x6 → 4x4 → 2x2, todo en rosa.
type Pieza = ReturnType<Submodelo['poner']>;
// o: stud (en fracciones) donde cae el origen de la pieza
type Capa = {p: Pieza; cols: number; filas: number; o?: number; ok: (a: number, b: number) => boolean}[];
// stud de la copa (i, j en la grilla 8x8, centro en 3.5) → pieza de la capa y stud propio que cae ahí
const enCapa = (capa: Capa, i: number, j: number) => {
	const x = (i - 3.5) * 20, z = (j - 3.5) * 20;
	for (const {p, cols, filas, o, ok} of capa)
		for (let a = 0; a < cols; a++)
			for (let b = 0; b < filas; b++) {
				if (!ok(a, b)) continue;
				const lx = (a - (o ?? (cols - 1) / 2)) * 20, lz = (b - (o ?? (filas - 1) / 2)) * 20, r = p.tr.r, t = p.tr.t;
				if (Math.abs(r[0] * lx + r[2] * lz + t[0] - x) < 1 && Math.abs(r[6] * lx + r[8] * lz + t[2] - z) < 1) return {sobre: p, stud: [a, b] as [number, number]};
			}
	return undefined;
};
const flores = (capa: Capa, lugares: [number, number][]) => {
	for (const [i, j] of lugares) {
		const l = enCapa(capa, i, j);
		if (!l) continue;
		const flor = (i + j) % 2 === 0;
		copa.poner(flor ? '33291' : '6141', flor ? 'White' : (i + j) % 4 === 1 ? 'Bright_Pink' : 'Medium_Dark_Pink', l);
	}
};

const copa = m.sub('copa');
const c4 = copa.poner('3031', 'Bright_Pink');
const c6 = copa.poner('3958', 'Bright_Pink', {sobre: c4, stud: [0, 0], con: [1, 1]});
copa.paso();
// 4 placas de esquina redondeada = copa circular de 8x8
const capaA: Capa = [];
for (const [i, j, g] of [[5, 0, 0], [5, 5, 90], [0, 5, 180], [0, 0, 270]] as const) {
	const p = copa.poner('30565', 'Bright_Pink', {sobre: c6, stud: [i, j], con: [2, 1], giro: g});
	capaA.push({p, cols: 4, filas: 4, ok: (a, b) => !((b === 0 && a > 0) || (a === 3 && b < 3))});
	if (g === 90) copa.paso();
}
copa.paso();
const anillo = (k: number): [number, number][] => {
	const r: [number, number][] = [];
	for (let n = k; n <= 7 - k; n++) r.push([k, n], [7 - k, n], [n, k], [n, 7 - k]);
	return r;
};
flores(capaA, anillo(0));
copa.paso();
// segundo piso: 4 placas 3x3 con esquina redonda = círculo de 6x6
const capaB: Capa = [];
for (const [i, j, g] of [[5, 5, 0], [2, 5, 90], [2, 2, 180], [5, 2, 270]] as const) {
	const l = enCapa(capaA, i, j)!;
	capaB.push({p: copa.poner('30357', 'Bright_Pink', {...l, con: [1, 1], giro: g}), cols: 3, filas: 3, o: 0, ok: (a, b) => !(a === 2 && b === 2)});
}
copa.paso();
// flores del segundo piso (y del piso de arriba = -24)
anillo(1).forEach(([i, j]) => {
	if ((i === 1 || i === 6) && (j === 1 || j === 6)) return; // esquinas redondeadas
	const flor = (i + j) % 2 === 0;
	copa.poner(flor ? '33291' : '6141', flor ? 'White' : (i + j) % 4 === 1 ? 'Bright_Pink' : 'Medium_Dark_Pink', {en: [(i - 3.5) * 20, -32, (j - 3.5) * 20]});
});
copa.paso();
// tercer piso: placa redonda 4x4
const c4r = copa.poner('60474', 'Bright_Pink', {en: [0, -32, 0]});
copa.paso();
// cima: redonda 2x2 con cuatro flores (la revelación)
const cima = copa.poner('4032a', 'Medium_Dark_Pink', {sobre: c4r, stud: [1, 1]});
copa.poner('33291', 'White', {sobre: cima, stud: [0, 0]});
copa.poner('6141', 'Bright_Pink', {sobre: cima, stud: [1, 0]});
copa.poner('33291', 'White', {sobre: cima, stud: [1, 1]});
copa.poner('6141', 'Bright_Pink', {sobre: cima, stud: [0, 1]});
copa.paso();

m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(tronco, {en: [0, -24, 0]});
m.raiz.paso();
m.raiz.colocar(copa, {en: [0, -96, 0]});
m.raiz.paso();
m.guardar();
