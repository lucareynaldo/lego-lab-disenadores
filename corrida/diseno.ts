// Cerezo japonés (sakura) en flor.
// Base de pasto con raíces, tronco que se abre en molinete, copa de cinco cúpulas y ramitas en flor.
import {Modelo, grilla} from '../taller/src/dsl.ts';
import type {PiezaColocada, Submodelo} from '../taller/src/dsl.ts';
import {encastrar} from '../taller/src/encastre.ts';
import {biblioteca} from '../taller/src/entorno.ts';
import {archivoDe, conectoresPieza, ficha, puntoGrilla} from '../taller/src/ficha.ts';

type V3 = [number, number, number];
type Tr = {r: number[]; t: V3};
const bib = biblioteca();
const ID: Tr = {r: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0]};
const mulR = (a: number[], b: number[]) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]));
const apR = (r: number[], v: number[]): V3 => [0, 1, 2].map((i) => r[3 * i] * v[0] + r[3 * i + 1] * v[1] + r[3 * i + 2] * v[2]) as V3;
const comp = (a: Tr, b: Tr): Tr => ({r: mulR(a.r, b.r), t: apR(a.r, b.t).map((v, i) => v + a.t[i]) as V3});
function rotStr(r: readonly number[]): string {
	const d = (x: number) => ((x * 180) / Math.PI).toFixed(6);
	const b = Math.asin(Math.max(-1, Math.min(1, -r[6])));
	return `X${d(Math.atan2(r[7], r[8]))} Y${d(b)} Z${d(Math.atan2(r[3], r[0]))}`;
}

// Encastra `id` por su conector `propio` en el conector `n` de `base`, corrido `dist` LDU a lo largo del eje.
function enBarra(s: Submodelo, id: string, color: string, base: PiezaColocada, n: number, propio: number, dist: number) {
	const cb = conectoresPieza(bib, base.archivo)[n];
	const tr = encastrar(base.tr, cb, conectoresPieza(bib, archivoDe(id))[propio], 0) as unknown as Tr;
	const eg = apR((base.tr as unknown as Tr).r, cb.eje as number[]);
	const L = Math.hypot(...eg);
	return s.poner(id, color, {en: tr.t.map((v, i) => v + (eg[i] / L) * dist) as V3, rot: rotStr(tr.r)});
}

// Dónde está colocado cada submodelo dentro del modelo principal.
const lugar = new Map<Submodelo, Tr>();
const global = (p: PiezaColocada): Tr => comp(lugar.get(p.sub) ?? ID, p.tr as unknown as Tr);

// Coloca el submodelo `hijo` en `padre` de modo que el anti-stud `con` de su pieza `primera`
// encastre en el stud `stud` de la pieza `base` (de otro submodelo ya colocado).
function montar(padre: Submodelo, hijo: Submodelo, primera: PiezaColocada, base: PiezaColocada, stud: [number, number], con: [number, number] = [0, 0], giro = 0) {
	const cb = conectoresPieza(bib, base.archivo)[puntoGrilla(ficha(bib, base.archivo).studs, stud, 'stud').n];
	const cn = conectoresPieza(bib, primera.archivo)[puntoGrilla(ficha(bib, primera.archivo).antistuds, con, 'anti-stud').n];
	const g = encastrar(global(base) as never, cb, cn, giro) as unknown as Tr; // pieza primera en coords globales
	const inv = primera.tr as unknown as Tr; // se asume primera sin rotar dentro de su sub
	const tr: Tr = {r: g.r, t: g.t.map((v, i) => v - apR(g.r, inv.t)[i]) as V3};
	lugar.set(hijo, tr);
	padre.colocar(hijo, {en: tr.t, rot: rotStr(tr.r)});
}

const m = new Modelo('sakura');
const R = m.raiz;
const TR = 'Dark_Brown';

// Pieza suelta en el modelo principal, encastrada sobre el stud de una pieza de un sub-armado ya colocado.
function ponerSobre(padre: Submodelo, id: string, color: string, base: PiezaColocada, stud: [number, number]) {
	const cb = conectoresPieza(bib, base.archivo)[puntoGrilla(ficha(bib, base.archivo).studs, stud, 'stud').n];
	const cn = conectoresPieza(bib, archivoDe(id))[puntoGrilla(ficha(bib, archivoDe(id)).antistuds, [0, 0], 'anti-stud').n];
	const g = encastrar(global(base) as never, cb, cn, 0) as unknown as Tr;
	return padre.poner(id, color, {en: g.t, rot: rotStr(g.r)});
}

// ---------- BASE ----------
// Un disco de pasto de 12x12 con esquinas redondeadas: cuatro cuartos unidos por la loma central.
const base = m.sub('base');
const loma = base.poner('11213', 'Green');
const cuartos = ([[[3, 2], 0], [[2, 2], 270], [[2, 3], 180], [[3, 3], 90]] as [[number, number], number][]).map(([a, giro]) =>
	base.poner('6003', 'Green', {debajo: loma, antistud: a, con: [0, 5], giro}));
base.paso();
// Raíces: cuatro pendientes en molinete alrededor del lugar del tronco.
for (const [st, giro] of [[[2, 1], 0], [[4, 2], 90], [[3, 4], 180], [[1, 3], 270]] as [[number, number], number][])
	base.poner('3040b', TR, {sobre: loma, stud: st, con: [0, 1], giro});
base.paso();
// Jardín: camino de piedras, hostas y matas de pasto.
for (const [q, st, c] of [[1, [3, 2], 'Light_Bluish_Grey'], [1, [2, 0], 'Dark_Bluish_Grey']] as [number, [number, number], string][])
	base.poner('14769', c, {sobre: cuartos[q], stud: st});
for (const [q, st] of [[0, [1, 1]], [3, [4, 4]], [2, [2, 0]]] as [number, [number, number]][]) base.poner('6255', 'Green', {sobre: cuartos[q], stud: st});
for (const [q, st] of [[0, [4, 1]], [3, [3, 1]], [2, [1, 1]], [1, [4, 5]]] as [number, [number, number]][]) base.poner('32607', 'Bright_Green', {sobre: cuartos[q], stud: st});
base.paso();

// ---------- FAROL DE PIEDRA (tōrō) ----------
const farol = m.sub('farol');
const f0 = farol.poner('3062b', 'Light_Bluish_Grey');
const f1 = farol.poner('33291', 'Light_Bluish_Grey', {sobre: f0, stud: [0, 0]});
const f2 = farol.poner('3062b', 'Trans_Yellow', {sobre: f1, stud: [0, 0]});
farol.paso();
const f3 = farol.poner('4740', 'Light_Bluish_Grey', {sobre: f2, stud: [0, 0]});
farol.poner('4589', 'Light_Bluish_Grey', {sobre: f3, stud: [0, 0]});
farol.paso();

// ---------- TRONCO ----------
type Dir = 'x+' | 'x-' | 'z+' | 'z-';
type Tramo = {p: PiezaColocada; punta: [number, number]};
// Un tramo de rama: pieza 1xN que apoya su primer stud sobre `stud` de `desde` y vuela hacia `dir`.
function tramo(s: Submodelo, id: string, desde: PiezaColocada, stud: [number, number], dir: Dir): Tramo {
	const n = Math.round(ficha(bib, archivoDe(id)).tamano.x) - 1;
	const op = {'x+': {con: [0, 0], giro: 0, punta: [n, 0]}, 'x-': {con: [n, 0], giro: 0, punta: [0, 0]}, 'z+': {con: [0, 0], giro: 90, punta: [n, 0]}, 'z-': {con: [0, 0], giro: 270, punta: [n, 0]}}[dir];
	const p = s.poner(id, TR, {sobre: desde, stud, con: op.con as [number, number], giro: op.giro});
	return {p, punta: op.punta as [number, number]};
}

const B2 = '3004', P3 = '3623';
const tronco = m.sub('tronco');
const n1 = tronco.poner('3003', TR);
const n2 = tronco.poner('3003', TR, {sobre: n1, stud: [0, 0]});
tronco.paso();
// Cuatro ramas en molinete: cada una apoya un stud en una esquina del tronco y vuela uno hacia afuera.
const arranque: [[number, number], Dir][] = [[[1, 0], 'x+'], [[1, 1], 'z+'], [[0, 1], 'x-'], [[0, 0], 'z-']];
const r1 = arranque.map(([st, d]) => tramo(tronco, B2, n2, st, d));
tronco.paso();
// El eje central sigue hacia arriba y traba las cuatro ramas.
const e1 = tronco.poner('3003', TR, {sobre: r1[0].p, stud: [0, 0], con: [1, 0]});
const e2 = tronco.poner('3003', TR, {sobre: e1, stud: [0, 0]});
const e3 = tronco.poner('3003', TR, {sobre: e2, stud: [0, 0]});
tronco.paso();
// Dos ramas opuestas siguen subiendo en escalera y se abren con una placa;
// las otras dos se abren enseguida, más bajas, como las puntas caídas del cerezo.
const SUBEN = [0, 2];
const r2 = arranque.map(([, d], k) => tramo(tronco, SUBEN.includes(k) ? B2 : P3, r1[k].p, r1[k].punta, d));
tronco.paso();
const puntas = arranque.map(([, d], k) => (SUBEN.includes(k) ? tramo(tronco, P3, r2[k].p, r2[k].punta, d) : r2[k]));
tronco.paso();

// ---------- COPA ----------
const ROSA = 'Bright_Pink';
// Cúpula central: placa 6x6 y cuatro esquinas-cúpula 3x3x2 (una media esfera).
const copa = m.sub('copa');
const c0 = copa.poner('3958', ROSA);
const CUARTOS: [[number, number], number][] = [[[3, 2], 0], [[2, 2], 270], [[2, 3], 180], [[3, 3], 90]];
// Primero la mitad izquierda, después la derecha (con dos flores blancas en la cima).
const cupula: PiezaColocada[] = [];
for (const mitad of [[1, 2], [0, 3]]) {
	for (const k of mitad) cupula[k] = copa.poner('88293', ROSA, {sobre: c0, stud: CUARTOS[k][0], con: [0, 2], giro: CUARTOS[k][1]});
	if (mitad[0] === 0) for (const k of [2, 3]) copa.poner('24866', 'White', {sobre: cupula[k], stud: [0, 0]});
	copa.paso();
}

// Lóbulo: falda de hojas blancas, placa 2x6 y media cúpula (dos cuartos) con flores en la cima.
const lobulo = m.sub('lobulo');
const l0 = lobulo.poner('2417', 'White');
const l1 = lobulo.poner('3795', ROSA, {sobre: l0, stud: [2, 3], con: [2, 1]});
const domosLob = ([[[3, 1], 0], [[2, 1], 270]] as [[number, number], number][]).map(([st, giro]) => {
	const d = lobulo.poner('88293', ROSA, {sobre: l1, stud: st, con: [0, 2], giro});
	lobulo.poner('24866', 'White', {sobre: d, stud: [0, 0]});
	return d;
});
lobulo.paso();

// Ramita en flor: el tallo de flor de seis brazos, en marrón oscuro, hace de ramita;
// en cada punta, una flor de cinco pétalos como las del cerezo.
const ramita = m.sub('ramita');
const j0 = ramita.poner('15573', TR);
const tallo = ramita.poner('19119', TR, {conector: {de: j0, n: 4}, propio: 0});
for (let k = 1; k <= 6; k++) enBarra(ramita, '24866', k % 2 ? 'White' : ROSA, tallo, k, 1, 19);
ramita.paso();

// ---------- MODELO PRINCIPAL ----------
lugar.set(base, ID);
R.colocar(base);
R.paso();
montar(R, tronco, n1, loma, [2, 2]);
R.paso();
montar(R, farol, f0, cuartos[2], [4, 3]);
R.paso();
// Los cuatro lóbulos, uno en la punta de cada rama, de a pares opuestos: atrás y adelante, después los costados.
const giroLob = [90, 180, 270, 0];
const lugarLob: Tr[] = [];
for (const grupo of [[1, 3], [0, 2]]) {
	for (const k of grupo) {
		montar(R, lobulo, l0, puntas[k].p, puntas[k].punta, [2, 3], giroLob[k]);
		lugarLob[k] = lugar.get(lobulo)!;
	}
	R.paso();
}
montar(R, copa, c0, e3, [0, 0], [2, 2]);
R.paso();
// La revelación: brotan las ramitas en flor, primero en la cima...
montar(R, ramita, j0, cupula[0], [0, 0]);
R.paso();
// ...después en los cuatro huecos entre lóbulos, y caen los primeros pétalos al pasto.
for (const [st, g] of [[[0, 0], 270], [[5, 0], 0], [[5, 5], 90], [[0, 5], 180]] as [[number, number], number][]) montar(R, ramita, j0, c0, st, [0, 0], g);
const PETALOS: [number, [number, number], string][] = [
	[0, [3, 3], ROSA], [0, [5, 4], 'White'], [1, [5, 4], ROSA], [1, [1, 0], 'White'], [2, [3, 1], ROSA],
	[2, [5, 5], 'White'], [3, [1, 1], ROSA], [3, [4, 2], 'White'], [1, [0, 2], ROSA],
];
for (const [q, st, c] of PETALOS) ponerSobre(R, '24866', c, cuartos[q], st);
R.paso();

m.guardar();
