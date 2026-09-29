// Jacarandá en flor — diseño para video corto de armado.
//
// Sub-armados:
//   base      césped de 16×16 con flores ya caídas y matas de pasto
//   tronco    disco de tierra, raíces (placas con garras), tronco, ramas en cruz, líder en zigzag y ramitas:
//             termina como un árbol pelado de invierno
//   racimo-N  cada racimo de flores (hojas 6×5 lila apiladas girando + flor o ramillete) que se encastra
//             en un stud de una ramita
//
// Encastres: por conector (sobre / conector). Hay dos lugares calculados, nunca a ojo: el tallo 19119 se
// clava en el stud hueco de la hoja de arriba (posición sacada de la transformación de la hoja), y cada
// racimo, que es otro sub-armado, se coloca en el stud de su ramita (posición sacada de la transformación
// ya encastrada de la ramita). Las flores del tallo se encastran por conector y se corren hasta la punta.

import {Modelo, grilla} from '../taller/src/dsl.ts';

const RB = 'Reddish_Brown';
const DB = 'Dark_Brown';
const LAV = 'Lavender';
const MLAV = 'Medium_Lavender';

// Índices de conector (de `piezas ver` / listado de conectores) de los studs que se usan con `conector`.
const STUD_3941: Record<string, number> = {'0,0': 10, '1,0': 9, '0,1': 8, '1,1': 7}; // ladrillo redondo 2×2
const STUD_2417_CENTRO = 21; // hoja 6×5: stud central (2,3)
const ANTI_2417_CENTRO = 5; // hoja 6×5: anti-stud central (2,3)
const ANTI_2423_BASE = 1; // hoja 4×3: anti-stud del pie (0,3)
const STUD_27261 = [7, 6]; // placa con garras: los dos studs de arriba
const STUD_3062B = 2; // ladrillo redondo 1×1: stud
const TALLOS_19119 = [1, 2, 3, 4, 5, 6]; // tallo con 6 ramitas: una flor en cada punta
const ANTI_24866 = 1; // flor 1×1 de 5 pétalos: agujero central (entra la punta del tallo)
// Posición local de los studs que reciben racimos.
const STUD_2423_LOCAL: Record<string, number[]> = {'1,0': [0, 0, -60], '0,1': [-20, 0, -40], '2,1': [20, 0, -40], '0,2': [-20, 0, -20], '2,2': [20, 0, -20]};
const STUD_2X2_LOCAL: Record<string, number[]> = {'0,0': [-10, 0, -10], '1,0': [10, 0, -10], '0,1': [-10, 0, 10], '1,1': [10, 0, 10]};

type Tr = {r: number[]; t: number[]};
const aplicar = (tr: Tr, p: number[]) => [0, 1, 2].map((i) => tr.r[3 * i] * p[0] + tr.r[3 * i + 1] * p[1] + tr.r[3 * i + 2] * p[2] + tr.t[i]);

// ---------------------------------------------------------------------------------------------
// Racimos: dónde van y cómo son. `giros`: giro de cada hoja sobre la anterior (alrededor de su stud
// central). `rot`: giro del racimo entero. `alza`: ladrillos redondos 1×1 debajo (para subir el racimo).
// Los giros salieron de una búsqueda que descarta cualquier choque con el verificador.
type Racimo = {rama: string; stud: string; alza: number; rot: number; giros: number[]; colores: string[]; flor?: string; ramo?: {rot: number; colores: string[]}};
const RACIMOS: Record<string, Racimo> = {
	'C7': {rama: 'C7', stud: '1,0', alza: 1, rot: 74, giros: [215, 273], colores: [LAV, MLAV], ramo: {rot: 246, colores: [LAV, MLAV]}},
	'C6-a': {rama: 'C6-a', stud: '1,0', alza: 1, rot: 224, giros: [121, 149], colores: [LAV, MLAV], ramo: {rot: 137, colores: [MLAV, LAV]}},
	'C6-b': {rama: 'C6-b', stud: '2,1', alza: 1, rot: 45, giros: [107, 150], colores: [MLAV, LAV], ramo: {rot: 175, colores: [LAV, MLAV]}},
	'C4-a': {rama: 'C4-a', stud: '1,0', alza: 0, rot: 248, giros: [260], colores: [MLAV, LAV], flor: LAV},
	'C4-b': {rama: 'C4-b', stud: '1,0', alza: 0, rot: 299, giros: [88], colores: [LAV, MLAV], flor: MLAV},
	'C5-a': {rama: 'C5-a', stud: '2,1', alza: 1, rot: 36, giros: [254, 267], colores: [LAV, MLAV], ramo: {rot: 153, colores: [LAV, MLAV]}},
	'C5-b': {rama: 'C5-b', stud: '1,0', alza: 0, rot: 202, giros: [226, 84], colores: [MLAV, LAV], flor: LAV},
	'B-a': {rama: 'B-a', stud: '0,2', alza: 2, rot: 154, giros: [225], colores: [MLAV, LAV], flor: LAV},
	'B-b': {rama: 'B-b', stud: '1,0', alza: 0, rot: 245, giros: [162, 71], colores: [LAV, MLAV], flor: MLAV},
	'R-a': {rama: 'R-a', stud: '0,1', alza: 0, rot: 174, giros: [185, 88], colores: [MLAV, LAV], flor: LAV},
	'R-b': {rama: 'R-b', stud: '1,0', alza: 1, rot: 307, giros: [131], colores: [LAV, MLAV], ramo: {rot: 282, colores: [MLAV, LAV]}},
	'L-a': {rama: 'L-a', stud: '2,1', alza: 2, rot: 70, giros: [211, 235], colores: [MLAV, LAV], flor: LAV},
	'L-b': {rama: 'L-b', stud: '2,2', alza: 1, rot: 72, giros: [124], colores: [LAV, MLAV], flor: MLAV},
	'F-a': {rama: 'F-a', stud: '2,1', alza: 2, rot: 255, giros: [186], colores: [LAV, MLAV], ramo: {rot: 115, colores: [LAV, MLAV]}},
	'F-b': {rama: 'F-b', stud: '2,1', alza: 1, rot: 83, giros: [118], colores: [MLAV, LAV], flor: LAV},
};

const m = new Modelo('jacaranda');

// ---------------------------------------------------------------------------------------------
// BASE: césped con matas y la "sombra lila" de flores caídas.
const base = m.sub('base');
const cesped = base.poner('91405', 'Green', {nombre: 'cesped'});
base.paso();
for (const [i, j] of [[1, 12], [3, 14], [14, 2], [14, 13], [0, 7], [9, 15]] as [number, number][])
	base.poner('32607', 'Bright_Green', {sobre: cesped, stud: [i, j], giro: ((i * 7 + j * 3) % 4) * 90, nombre: `mata-${i}-${j}`});
base.paso();
// la "sombra lila": flores de 5 pétalos, baldosas de cuarto de círculo (pétalos sueltos) y redondas, todas de
// una vez, como una lluvia de flores; más densas bajo el borde de la copa
const CAIDAS: [number, number, string, string][] = [
	[10, 3, '24866', MLAV], [12, 4, '25269', LAV], [11, 2, '6141', LAV], [13, 6, '24866', LAV], [12, 11, '24866', LAV], [11, 13, '25269', MLAV],
	[13, 9, '6141', MLAV], [10, 11, '25269', LAV], [4, 12, '24866', MLAV], [3, 10, '25269', LAV], [5, 13, '6141', LAV], [2, 9, '24866', LAV],
	[3, 3, '24866', LAV], [5, 2, '25269', MLAV], [2, 5, '25269', LAV], [4, 5, '6141', MLAV], [1, 3, '24866', MLAV], [6, 4, '24866', LAV],
	[9, 4, '25269', MLAV], [7, 2, '24866', LAV], [2, 1, '25269', MLAV], [5, 0, '6141', LAV], [3, 6, '24866', MLAV], [0, 4, '25269', LAV],
	[8, 1, '25269', MLAV],
];
for (const [i, j, id, col] of CAIDAS) base.poner(id, col, {sobre: cesped, stud: [i, j], giro: ((i + 2 * j) % 4) * 90, nombre: `caida-${i}-${j}`});
base.paso();

// ---------------------------------------------------------------------------------------------
// TRONCO: de la tierra a las ramitas de invierno.
const t = m.sub('tronco');
// raíces: disco de tierra redondo y cuatro placas con garras de roca; la placa apoya en el borde del disco
// y las garras bajan un plato hasta el césped, como raíces que se aferran al suelo
const disco = t.poner('60474', DB, {nombre: 'disco-tierra'});
const raiz = (stud: [number, number], giro: number, nombre: string) => t.poner('27261', RB, {sobre: disco, stud, con: [0, 1], giro, nombre});
const raices: [any, number, string][] = [
	[raiz([2, 3], 180, 'raiz-fondo'), 180, 'fondo'],
	[raiz([3, 1], 90, 'raiz-derecha'), 90, 'derecha'],
	[raiz([1, 0], 0, 'raiz-frente'), 0, 'frente'],
	[raiz([0, 2], 270, 'raiz-izquierda'), 270, 'izquierda'],
];
t.paso();
// ensanche de la base: pendientes 1×1 sobre cada raíz, altas contra el tronco
const tr0 = t.poner('3941', RB, {sobre: disco, stud: [1, 1], nombre: 'tronco-0'});
for (const [g, giro, nombre] of raices) STUD_27261.forEach((n, k) => t.poner('54200', RB, {conector: {de: g, n}, propio: 0, giro, nombre: `falda-${nombre}-${k}`}));
t.paso();
const R = (sobre: any, stud: [number, number], con: [number, number], nombre: string) => t.poner('3941', RB, {sobre, stud, con, nombre});
const tr1 = R(tr0, [0, 0], [0, 0], 'tronco-1');
const tr2 = R(tr1, [0, 0], [0, 0], 'tronco-2');
t.paso();
const tr3 = R(tr2, [0, 0], [0, 0], 'tronco-3');
t.paso();
// ramas en cruz: cada ladrillo corrido un stud sube a unos 40°; una pendiente 1×1 en cada peldaño
// convierte la escalera en una rama inclinada
const peldano = (de: any, studs: string[], giro: number) => studs.forEach((st) => t.poner('54200', RB, {conector: {de, n: STUD_3941[st]}, propio: 0, giro, nombre: `peldano-${de.nombre}-${st}`}));
const L1 = R(tr3, [0, 0], [1, 0], 'izq-1');
const R1 = R(tr3, [1, 0], [0, 0], 'der-1');
t.paso();
const L2 = R(L1, [0, 0], [1, 0], 'izq-2');
const R2 = R(R1, [1, 0], [0, 0], 'der-2');
const F2 = R(L1, [1, 0], [0, 1], 'frente-2');
const B2 = R(L1, [1, 1], [0, 0], 'fondo-2');
t.paso();
const L3 = R(L2, [0, 0], [1, 0], 'izq-3');
const R3 = R(R2, [1, 0], [0, 0], 'der-3');
const F3 = R(F2, [0, 0], [0, 1], 'frente-3');
const B3 = R(B2, [0, 1], [0, 0], 'fondo-3');
const C3 = R(F2, [0, 1], [0, 0], 'lider-3');
peldano(L2, ['1,0', '1,1'], 90);
peldano(R2, ['0,0', '0,1'], 270);
t.paso();
const L4 = R(L3, [0, 0], [1, 0], 'izq-4');
const B4 = R(B3, [0, 1], [0, 0], 'fondo-4');
const C4 = R(C3, [0, 0], [0, 0], 'lider-4');
peldano(L3, ['1,0', '1,1'], 90);
peldano(R3, ['0,0', '0,1'], 270);
peldano(F3, ['0,1', '1,1'], 180);
peldano(B3, ['0,0', '1,0'], 0);
t.paso();
// ramitas: hoja 4×3 en marrón oscuro, encastrada por el pie; `giro` = rumbo de la punta
const RAMITAS: Record<string, any> = {};
const ramita = (nombre: string, de: any, stud: string, giro: number) =>
	(RAMITAS[nombre] = t.poner('2423', DB, {conector: {de, n: STUD_3941[stud]}, propio: ANTI_2423_BASE, giro, nombre: `ramita-${nombre}`}));
peldano(L4, ['1,0', '1,1'], 90);
peldano(B4, ['0,0', '1,0'], 0);
ramita('B-a', B4, '0,1', 210);
ramita('B-b', B4, '1,1', 150);
ramita('R-a', R3, '1,0', 60);
ramita('R-b', R3, '1,1', 120);
t.paso();
ramita('L-a', L4, '0,0', 300);
ramita('L-b', L4, '0,1', 240);
ramita('F-a', F3, '0,0', 330);
ramita('F-b', F3, '1,0', 30);
t.paso();
// líder en zigzag: cada ladrillo corrido deja dos studs libres para ramitas
const C5 = R(C4, [1, 0], [0, 0], 'lider-5');
ramita('C4-a', C4, '0,0', 315);
ramita('C4-b', C4, '0,1', 225);
t.paso();
const C6 = R(C5, [0, 0], [1, 0], 'lider-6');
const C7 = R(C6, [0, 0], [0, 1], 'lider-7');
ramita('C5-a', C5, '1,0', 45);
ramita('C5-b', C5, '1,1', 135);
ramita('C6-a', C6, '0,1', 225);
ramita('C6-b', C6, '1,1', 135);
// en la punta del líder, tres pimpollos: el primer lila del árbol todavía pelado
for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]] as [number, number][])
	if (RACIMOS['C7'].stud !== `${i},${j}`) t.poner('24866', MLAV, {sobre: C7, stud: [i, j], nombre: `pimpollo-${i}-${j}`});
t.paso();
const PUNTAS: Record<string, any> = {C7};

// ---------------------------------------------------------------------------------------------
// RACIMOS
function racimo(nombre: string, rc: Racimo, detallado: boolean) {
	const s = m.sub(`racimo-${nombre}`);
	let prev: any = null;
	for (let a = 0; a < rc.alza; a++)
		prev = prev
			? s.poner('3062b', DB, {conector: {de: prev, n: STUD_3062B}, propio: 0, nombre: `alza-${a}`})
			: s.poner('3062b', DB, {nombre: `alza-${a}`});
	let h = prev
		? s.poner('2417', rc.colores[0], {conector: {de: prev, n: STUD_3062B}, propio: ANTI_2417_CENTRO, nombre: 'hoja-0'})
		: s.poner('2417', rc.colores[0], {nombre: 'hoja-0'});
	rc.giros.forEach((g, i) => {
		h = s.poner('2417', rc.colores[(i + 1) % rc.colores.length], {conector: {de: h, n: STUD_2417_CENTRO}, propio: ANTI_2417_CENTRO, giro: g, nombre: `hoja-${i + 1}`});
	});
	if (rc.ramo) {
		// ramillete: tallo de 6 ramitas clavado en el stud hueco de la hoja de arriba, con una flor en cada punta
		if (detallado) s.paso();
		const ramo = s.poner('19119', DB, {en: aplicar(h.tr, [0, -4, 0]) as any, rot: `Y${rc.ramo.rot}`, nombre: 'ramillete'});
		if (detallado) s.paso();
		TALLOS_19119.forEach((n, i) => {
			const f = s.poner('24866', rc.ramo!.colores[i % rc.ramo!.colores.length], {conector: {de: ramo, n}, propio: ANTI_24866, nombre: `flor-${n}`});
			// el encastre deja la flor en la raíz del tallo: se la corre 17 LDU a lo largo del tallo, hasta la punta
			const eje = [-f.tr.r[1], -f.tr.r[4], -f.tr.r[7]];
			(f as any).tr = {r: f.tr.r, t: f.tr.t.map((v: number, q: number) => Math.round((v + 17 * eje[q]) * 1000) / 1000)};
		});
	} else if (rc.flor) {
		s.poner('24866', rc.flor, {sobre: h, stud: [2, 3], nombre: 'flor'});
	}
	s.paso();
	return s;
}

// ---------------------------------------------------------------------------------------------
// ARMADO FINAL
const T = grilla(0, 1, 0); // el tronco arranca un plato arriba: su disco de tierra apoya sobre el césped
m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(t, {en: T});
m.raiz.paso();

function colocarRacimo(nombre: string, detallado: boolean) {
	const rc = RACIMOS[nombre];
	const s = racimo(nombre, rc, detallado);
	const S = (rc.rama in RAMITAS ? aplicar(RAMITAS[rc.rama].tr, STUD_2423_LOCAL[rc.stud]) : aplicar(PUNTAS[rc.rama].tr, STUD_2X2_LOCAL[rc.stud])).map((v, i) => v + T[i]);
	const ancla = rc.alza > 0 ? 24 : 8; // altura del anti-stud del primer elemento del racimo
	m.raiz.colocar(s, {en: [S[0], S[1] - ancla, S[2]] as any, rot: `Y${rc.rot}`});
}
// orden de la floración: primero un racimo alto que se muestra entero (hojas, tallo, flores); después de
// atrás hacia adelante según la vista 3/4 (que mira desde adelante-izquierda), sin tapar lo que viene. Las
// parejas que de frente se superponen van en el mismo paso, así cada paso cambia la silueta. El copete, al final.
const ORDEN: string[][] = [
	['C6-b'],
	['B-b', 'B-a'],
	['R-b', 'R-a'],
	['C5-b'],
	['C4-b'],
	['C6-a'],
	['L-b', 'L-a'],
	['C5-a', 'C4-a'],
	['F-b', 'F-a'],
	['C7'],
];
ORDEN.forEach((grupo, k) => {
	for (const nombre of grupo) colocarRacimo(nombre, k === 0);
	m.raiz.paso();
});
m.guardar();
