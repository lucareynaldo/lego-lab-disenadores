// Jacarandá de vereda — árbol original en ladrillos.
// Sub-armados: vereda (calle, pasto con flores caídas, baldosas y cordón), tronco (disco de tierra, raíces y fuste) y copa
// (tallos, ramas de cola curva, hojas-nudo y flores).
import {Modelo, grilla} from '../taller/src/dsl.ts';

type Sub = Modelo['raiz'];
type Pieza = ReturnType<Sub['poner']>;
type V3 = [number, number, number];
type M3 = number[];

// ---------- geometría: la misma cuenta que usa el taller para encastrar por conector ----------
const norm = (v: V3): V3 => {
	const l = Math.hypot(...v);
	return [v[0] / l, v[1] / l, v[2] / l];
};
const cruz = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const aplicar = (r: M3, v: V3): V3 => [r[0] * v[0] + r[1] * v[1] + r[2] * v[2], r[3] * v[0] + r[4] * v[1] + r[5] * v[2], r[6] * v[0] + r[7] * v[1] + r[8] * v[2]];
const mult = (a: M3, b: M3): M3 => {
	const o: M3 = [];
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o.push(a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]);
	return o;
};
function rotEje(eje: V3, grados: number): M3 {
	const [x, y, z] = norm(eje);
	const a = (grados * Math.PI) / 180;
	const c = Math.cos(a), s = Math.sin(a), k = 1 - c;
	return [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k];
}
function rotEntre(a: V3, b: V3): M3 {
	const u = norm(a), v = norm(b);
	const c = dot(u, v);
	if (c > 1 - 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
	if (c < -1 + 1e-12) return rotEje(cruz(u, Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]), 180);
	const k = cruz(u, v);
	const s = Math.hypot(...k);
	return rotEje([k[0] / s, k[1] / s, k[2] / s], (Math.atan2(s, c) * 180) / Math.PI);
}
type Tr = {r: M3; t: V3};
type Con = {base: V3; eje: V3};
function encastre(base: Tr, cb: Con, cn: Con, giro: number): Tr {
	const pB = aplicar(base.r, cb.base).map((v, i) => v + base.t[i]) as V3;
	const aB = norm(aplicar(base.r, cb.eje));
	const r = mult(rotEje(aB, giro), rotEntre(cn.eje, aB));
	const q = aplicar(r, cn.base);
	return {r, t: [pB[0] - q[0], pB[1] - q[1], pB[2] - q[2]]};
}
const punto = (tr: Tr, p: V3): V3 => aplicar(tr.r, p).map((v, i) => v + tr.t[i]) as V3;

// Conectores usados (índices y datos de `piezas ver`).
const STUD_ARRIBA: Con = {base: [0, 0, 0], eje: [0, -1, 0]}; // stud de 85861 y 3062b, y el central de 2417
const TEJA_ANTI: Con = {base: [0, 8, 0], eje: [0, -1, 0]}; // 15712, conector 0
const TEJA_CLIP: Con = {base: [0, -6, -4], eje: [0, 0, 1]}; // 15712, conector 1
const COLA_BARRA: Con = {base: [0, 0, 0], eje: [0, 0, -1]}; // 40379, conector 0
const COLA_PUNTA: Con = {base: [0, -58.5, 69], eje: [0, -0.9612616951385826, 0.275637358606011]}; // 40379, conector 1
const STUD_N: Record<string, number> = {'85861.dat': 2, '3062b.dat': 2, '2417.dat': 21};

// Elige el giro de la teja-clip y el de la cola para que la punta de la rama caiga cerca de (x, z)
// subiendo al menos `sube` LDU y con la punta casi vertical (así la hoja queda casi horizontal).
type Objetivo = {x: number; z: number; sube?: number; incl?: number; giros?: number[]};
function resolver(padre: Pieza, stud: Con, obj: Objetivo) {
	const base: Tr = {r: [...padre.tr.r], t: [...padre.tr.t] as V3};
	let mejor = {g: 0, c: 0, puntaje: Infinity, punta: [0, 0, 0] as V3, sube: 0, incl: 0};
	const giros = obj.giros ?? Array.from({length: 72}, (_, k) => k * 5);
	for (const g of giros) {
		const teja = encastre(base, stud, TEJA_ANTI, g);
		for (let c = 0; c < 360; c += 5) {
			const cola = encastre(teja, TEJA_CLIP, COLA_BARRA, c);
			const b = cola.t;
			const p = punto(cola, COLA_PUNTA.base);
			const eje = norm(aplicar(cola.r, COLA_PUNTA.eje));
			const dist = Math.hypot(p[0] - obj.x, p[2] - obj.z);
			const sube = b[1] - p[1];
			const incl = (Math.acos(Math.min(1, -eje[1])) * 180) / Math.PI;
			const puntaje = dist + 3 * Math.max(0, (obj.sube ?? 50) - sube) + 2 * Math.max(0, incl - (obj.incl ?? 22));
			if (puntaje < mejor.puntaje) mejor = {g, c, puntaje, punta: p, sube, incl};
		}
	}
	return mejor;
}

const m = new Modelo('jacaranda');
const MARRON = 'Reddish_Brown';
const TIERRA = 'Dark_Brown';
const LILA = 'Medium_Lavender';
const LILA_CLARO = 'Lavender';
const BLANCO = 'White';
const PASTO = 'Green';
const PASTO_CLARO = 'Bright_Green';
const BALDOSA = 'Tan';
const CORDON = 'Light_Bluish_Grey';
const ASFALTO = 'Dark_Bluish_Grey';
const DEBUG = process.env.DEBUG === '1';

// ======================= VEREDA =======================
// Placa 16×16: stud (i, j) con i = 0..15 hacia +X y j = 0..15 hacia +Z; j = 0 es el frente (la calle).
// Filas: calle 0–2, cordón 3, franja de pasto 4–11 (el árbol en el centro), baldosas 12–15.
const vereda = m.sub('vereda');
const losa = vereda.poner('91405', ASFALTO, {nombre: 'losa'});
// Asfalto de la calle. En la cuneta quedan dos juntas sin tapar, donde se juntan flores.
for (const [id, i, j] of [['4162', 0, 0], ['4162', 8, 0], ['4162', 0, 1], ['4162', 8, 1], ['6636', 0, 2], ['2431', 7, 2], ['2431', 12, 2]] as const)
	vereda.poner(id, ASFALTO, {sobre: losa, stud: [i, j], nombre: 'asfalto'});
vereda.paso();
// Franja de pasto y alfombra de flores caídas bajo la copa (i = 3..12), en dos tandas: mitad izquierda y
// mitad derecha. Las 33291 (con pestañas) van sin vecinos pegados; las matas de pasto, sin nada alrededor.
const pasto = vereda.poner('92438', PASTO, {sobre: losa, stud: [0, 4], nombre: 'pasto'});
const caidas: [number, number, string, string][] = [
	[3, 9, '24866', LILA], [5, 4, '24866', LILA_CLARO], [5, 7, '24866', LILA_CLARO], [5, 10, '33291', LILA_CLARO],
	[7, 5, '24866', LILA], [7, 11, '24866', LILA_CLARO], [4, 8, '33291', LILA],
	[9, 4, '24866', LILA_CLARO], [10, 7, '24866', LILA], [8, 10, '24866', LILA_CLARO], [10, 10, '24866', LILA],
	[10, 9, '24866', LILA_CLARO], [12, 5, '33291', LILA_CLARO], [12, 10, '33291', LILA], [11, 11, '24866', LILA_CLARO],
];
const matas: [number, number][] = [[3, 6], [12, 8]];
for (const lado of [0, 1]) {
	const enLado = (i: number) => (lado === 0 ? i <= 7 : i >= 8);
	for (const [i, j, id, col] of caidas.filter(([i]) => enLado(i))) vereda.poner(id, col, {sobre: pasto, stud: [i, j - 4], nombre: 'flor-caida'});
	for (const [i, j] of matas.filter(([i]) => enLado(i))) vereda.poner('32607', PASTO_CLARO, {sobre: pasto, stud: [i, j - 4], nombre: 'mata'});
	vereda.poner('24866', LILA_CLARO, {sobre: losa, stud: [lado === 0 ? 6 : 11, 2], nombre: 'flor-cuneta'});
	vereda.paso();
}
// Vereda: contrapiso, baldosas con juntas trabadas (dos flores en un hueco) y cordón.
const contraA = vereda.poner('3030', BALDOSA, {sobre: losa, stud: [0, 12], nombre: 'contrapiso'});
const contraB = vereda.poner('3032', BALDOSA, {sobre: losa, stud: [10, 12], nombre: 'contrapiso'});
for (const [id, p, i, j] of [
	['69729', contraA, 0, 0], ['3068b', contraA, 6, 0], ['3069b', contraA, 8, 1], ['69729', contraB, 0, 0],
	['87079', contraA, 0, 2], ['69729', contraA, 4, 2], ['69729', contraB, 0, 2],
] as const)
	vereda.poner(id, BALDOSA, {sobre: p, stud: [i, j], nombre: 'baldosa'});
vereda.poner('24866', LILA_CLARO, {sobre: contraA, stud: [8, 0], nombre: 'flor-vereda'});
vereda.poner('24866', LILA, {sobre: contraA, stud: [9, 0], nombre: 'flor-vereda'});
const cordonA = vereda.poner('3460', CORDON, {sobre: losa, stud: [0, 3], nombre: 'cordon'});
const cordonB = vereda.poner('3460', CORDON, {sobre: losa, stud: [8, 3], nombre: 'cordon'});
vereda.poner('4162', CORDON, {sobre: cordonA, stud: [0, 0], nombre: 'cordon'});
vereda.poner('4162', CORDON, {sobre: cordonB, stud: [0, 0], nombre: 'cordon'});
vereda.paso();

// ======================= TRONCO =======================
// Origen: centro del disco de tierra 4x4 redondo, apoyado en la franja de pasto con el tronco en x = 0, z = 0.
const tronco = m.sub('tronco');
const disco = tronco.poner('60474', TIERRA, {nombre: 'disco'});
let fuste = tronco.poner('3941', MARRON, {sobre: disco, stud: [1, 1], nombre: 'fuste'});
tronco.paso();
// raíces: quesitos que bajan del tronco al disco (ensanche de la base); en el hueco que queda cayó una flor
for (const [i, j, g] of [[1, 0, 0], [2, 0, 0], [0, 1, 270], [0, 2, 270], [3, 1, 90], [1, 3, 180], [2, 3, 180]] as const)
	tronco.poner('54200', MARRON, {sobre: disco, stud: [i, j], giro: g, nombre: 'raiz'});
tronco.poner('24866', LILA_CLARO, {sobre: disco, stud: [3, 2], nombre: 'flor-caida'});
fuste = tronco.poner('3941', MARRON, {sobre: fuste, stud: [0, 0], nombre: 'fuste'});
tronco.paso();
fuste = tronco.poner('3941', MARRON, {sobre: fuste, stud: [0, 0], nombre: 'fuste'});
tronco.paso();

// ======================= COPA =======================
// Origen: centro de la placa-horqueta 2x2 redonda que se apoya en el tope del tronco.
const copa = m.sub('copa');
const horqueta = copa.poner('4032b', MARRON, {nombre: 'horqueta'});

// Studs de la hoja 2417 por índice de conector: 21 = centro.
const STUD_HOJA: Record<number, V3> = {21: [0, 0, 0]};
// Una rama: teja con clip sobre un stud y cola curva enganchada, con los giros que da `resolver`.
// `teja` y `cola` se pueden colocar en pasos distintos.
function preparar(padre: Pieza, obj: Objetivo, nombre: string, n = STUD_N[padre.archivo]) {
	const stud: Con = {base: padre.archivo === '2417.dat' ? STUD_HOJA[n] : [0, 0, 0], eje: [0, -1, 0]};
	const s = resolver(padre, stud, obj);
	if (DEBUG) console.error(nombre, 'g', s.g, 'c', s.c, 'sube', Math.round(s.sube), 'incl', Math.round(s.incl), 'punta', s.punta.map(Math.round).join(' '));
	let clip: Pieza | undefined;
	return {
		teja: (sub: Sub) => (clip = sub.poner('15712', MARRON, {conector: {de: padre, n}, propio: 0, giro: s.g, nombre: nombre + '-clip'})),
		cola: (sub: Sub) => sub.poner('40379', MARRON, {conector: {de: clip!, n: 1}, propio: 0, giro: s.c, nombre}),
	};
}
function rama(sub: Sub, padre: Pieza, obj: Objetivo, nombre: string) {
	const r = preparar(padre, obj, nombre);
	r.teja(sub);
	return r.cola(sub);
}
function tallo(sub: Sub, stud: [number, number], alturas: string[], nombre: string) {
	let p = horqueta;
	let s: [number, number] = stud;
	for (const id of alturas) {
		p = sub.poner(id, MARRON, {sobre: p, stud: s, nombre: nombre + '-tallo'});
		s = [0, 0];
	}
	return p;
}
function hoja(sub: Sub, cola: Pieza, color: string, giro: number, nombre: string) {
	return sub.poner('2417', color, {conector: {de: cola, n: 1}, propio: 5, giro, nombre});
}
// Viste un nudo (hoja 6x5): flores colgando debajo, flores y racimos en las puntas, hoja 4x3 encima apuntando
// hacia afuera del nudo y hoja 4x3 elevada en una ramita, apuntando al eje del árbol.
// Studs de la 2417 en su grilla: (i, j) → (−40 + 20i, 0, −60 + 20j).
type Vestido = {chica?: [number, number, string]; elevada?: [number, number, string]; flores?: [number, number, string][]; racimos?: [number, number, ...string[]][]; cuelgan?: [number, number, string][]};
// giro (con `sobre`) que apunta el +Z local de la pieza hacia el vector (x, z) del plano
const giroHacia = (x: number, z: number) =>
	[0, 90, 180, 270].reduce((m, g) => {
		const d = -Math.sin((g * Math.PI) / 180) * x + Math.cos((g * Math.PI) / 180) * z;
		return d > m.d ? {g, d} : m;
	}, {g: 0, d: -Infinity}).g;
function vestir(sub: Sub, h: Pieza, v: Vestido, nombre: string) {
	const studMundo = (i: number, j: number) => punto({r: h.tr.r, t: h.tr.t as V3}, [-40 + 20 * i, 0, -60 + 20 * j]);
	for (const [i, j, col] of v.cuelgan ?? []) sub.poner('32607', col, {debajo: h, antistud: [i, j], nombre: nombre + '-cuelga'});
	// ninguna flor asoma fuera de la base de 16 × 16 (±160 LDU; la flor mide ±10 y la hoja está inclinada)
	const dentro = (i: number, j: number) => studMundo(i, j).every((v, k) => k === 1 || Math.abs(v) <= 142);
	for (const [i, j, col] of v.flores ?? []) if (dentro(i, j)) sub.poner('24866', col, {sobre: h, stud: [i, j], nombre: nombre + '-flor'});
	// racimo: flores apiladas (dos o tres), como las panojas erguidas del jacarandá
	for (const [i, j, ...colores] of v.racimos ?? []) {
		if (!dentro(i, j)) continue;
		let f = sub.poner('24866', colores[0], {sobre: h, stud: [i, j], nombre: nombre + '-racimo'});
		for (const c of colores.slice(1)) f = sub.poner('24866', c, {sobre: f, stud: [0, 0], nombre: nombre + '-racimo'});
	}
	if (v.chica) {
		const [i, j, col] = v.chica;
		const s = studMundo(i, j);
		sub.poner('2423', col, {sobre: h, stud: [i, j], con: [0, 0], giro: giroHacia(s[0] - h.tr.t[0], s[2] - h.tr.t[2]), nombre: nombre + '-chica'});
	}
	if (v.elevada) {
		const [i, j, col] = v.elevada;
		const s = studMundo(i, j);
		const ramita = sub.poner('3062b', MARRON, {sobre: h, stud: [i, j], nombre: nombre + '-ramita'});
		sub.poner('2423', col, {sobre: ramita, stud: [0, 0], con: [0, 3], giro: giroHacia(s[0], s[2]), nombre: nombre + '-elevada'});
	}
}
const g90 = [0, 90, 180, 270];

// Cuatro tallos 1x1 de distinta altura sobre la horqueta (regla de Leonardo: 4 × 1x1 ≈ la sección del 2x2).
const tA = tallo(copa, [1, 1], ['85861'], 'tA'); // fondo-derecha, el más bajo
const tB = tallo(copa, [0, 1], ['3062b', '85861'], 'tB'); // fondo-izquierda
const tC = tallo(copa, [0, 0], ['85861', '85861'], 'tC'); // frente-izquierda
const tD = tallo(copa, [1, 0], ['3062b', '85861', '85861'], 'tD'); // frente-derecha, el más alto
// Las tejas-clip de los tallos van todas acá, de la más baja a la más alta, para que ninguna tape a otra al bajar.
const pA = preparar(tA, {x: 16, z: 100, incl: 34, giros: g90}, 'rA'); // fondo
const pC = preparar(tC, {x: -10, z: -100, incl: 34, giros: g90}, 'rC'); // frente
const pB = preparar(tB, {x: -100, z: -8, incl: 34}, 'rB'); // izquierda
const pD = preparar(tD, {x: 100, z: -6, incl: 34}, 'rD'); // derecha
for (const p of [pA, pC, pB, pD]) p.teja(copa);
copa.paso();

// Piso bajo, rama por rama, de atrás hacia la cámara 3/4 (que mira desde el frente-izquierda):
// fondo, derecha, izquierda y frente. Cada rama: cola curva con su hoja-nudo (que ya trae flores colgando
// debajo); después, su vestido, distinto en cada nudo. Las dos últimas ramas se colocan juntas.
const hojaBaja = (cola: Pieza, giro: number, nombre: string) => {
	const h = hoja(copa, cola, LILA, giro, nombre);
	vestir(copa, h, {cuelgan: [[0, 5, LILA], [4, 5, LILA]]}, nombre);
	return h;
};
const rA = pA.cola(copa); // fondo
const hA = hojaBaja(rA, 0, 'hA');
copa.paso();
vestir(copa, hA, {chica: [0, 3, LILA_CLARO], elevada: [4, 3, LILA], flores: [[1, 1, LILA_CLARO], [3, 1, LILA_CLARO], [3, 5, LILA_CLARO], [2, 0, LILA], [0, 5, LILA_CLARO]], racimos: [[1, 5, LILA, LILA_CLARO]]}, 'hA');
copa.paso();
const rD = pD.cola(copa); // derecha
const hD = hojaBaja(rD, 90, 'hD');
copa.paso();
vestir(copa, hD, {chica: [4, 3, LILA_CLARO], elevada: [0, 3, LILA_CLARO], flores: [[1, 1, LILA], [3, 1, LILA_CLARO], [1, 5, LILA_CLARO], [4, 5, LILA]], racimos: [[3, 5, LILA, LILA_CLARO]]}, 'hD');
copa.paso();
const rB = pB.cola(copa); // izquierda
const hB = hojaBaja(rB, 90, 'hB');
const rC = pC.cola(copa); // frente
const hC = hojaBaja(rC, 180, 'hC');
copa.paso();
vestir(copa, hB, {chica: [0, 3, LILA_CLARO], elevada: [4, 3, LILA], flores: [[3, 1, LILA_CLARO], [1, 5, LILA_CLARO], [3, 5, LILA], [0, 5, LILA_CLARO]], racimos: [[1, 1, LILA, LILA_CLARO]]}, 'hB');
copa.paso();
vestir(copa, hC, {chica: [4, 3, LILA_CLARO], elevada: [0, 3, LILA], flores: [[1, 1, LILA_CLARO], [3, 1, LILA], [1, 5, LILA_CLARO], [2, 0, LILA_CLARO], [4, 5, LILA_CLARO]], racimos: [[3, 5, LILA, LILA_CLARO]]}, 'hC');
copa.paso();

// Piso alto: desde el centro de cada hoja-nudo sale otra cola. Tres giran hacia las diagonales;
// la de la derecha vuelve sobre el eje y arma la cúpula, que se coloca al final.
const alto = (flores: [number, number, string][], racimos: [number, number, ...string[]][]): Vestido => ({chica: [4, 3, LILA], flores, racimos});
const hojaAlta = (cola: Pieza, giro: number, nombre: string) => {
	const h = hoja(copa, cola, LILA_CLARO, giro, nombre);
	vestir(copa, h, {cuelgan: [[0, 5, LILA]]}, nombre);
	return h;
};
const u4 = rama(copa, hA, {x: 57, z: 30}, 'u4'); // fondo-derecha
const u1 = rama(copa, hB, {x: -50, z: 45}, 'u1'); // fondo-izquierda
copa.paso();
const h4 = hojaAlta(u4, 270, 'h4');
const h1 = hojaAlta(u1, 0, 'h1');
copa.paso();
vestir(copa, h4, alto([[0, 3, LILA], [2, 0, LILA_CLARO], [1, 1, LILA]], [[1, 5, LILA, LILA_CLARO], [2, 3, LILA, LILA, LILA_CLARO], [3, 5, LILA, LILA_CLARO]]), 'h4');
copa.paso();
vestir(copa, h1, alto([[0, 3, LILA], [2, 0, LILA_CLARO], [3, 1, LILA]], [[1, 5, LILA, LILA_CLARO], [2, 3, LILA, LILA, LILA_CLARO], [3, 5, LILA, LILA_CLARO]]), 'h1');
copa.paso();
const u2 = rama(copa, hC, {x: -48, z: -42}, 'u2'); // frente-izquierda
const h2 = hojaAlta(u2, 0, 'h2');
copa.paso();
vestir(copa, h2, alto([[0, 3, LILA], [2, 0, LILA], [1, 1, LILA_CLARO]], [[1, 5, LILA, BLANCO], [2, 3, LILA, LILA, LILA_CLARO], [3, 5, LILA, LILA_CLARO]]), 'h2');
copa.paso();
const u0 = rama(copa, hD, {x: 4, z: -2}, 'u0'); // centro: la cúpula
const h0 = hojaAlta(u0, 90, 'h0');
vestir(copa, h0, {chica: [4, 3, LILA]}, 'h0');
copa.paso();
// La revelación: la cúpula florece al final, con las panojas más altas y claras, con reflejos blancos.
vestir(copa, h0, {flores: [[0, 3, LILA], [2, 0, LILA], [1, 1, LILA_CLARO]], racimos: [[1, 5, LILA, LILA_CLARO, BLANCO], [2, 3, LILA, LILA_CLARO, BLANCO], [3, 5, LILA, LILA, LILA_CLARO], [3, 1, LILA, LILA_CLARO, LILA_CLARO]]}, 'h0');
copa.paso();

// ======================= MODELO =======================
m.raiz.colocar(vereda);
m.raiz.paso();
m.raiz.colocar(tronco, {en: [0, -16, 0]});
m.raiz.paso();
m.raiz.colocar(copa, {en: [0, -16 - 72 - 8, 0]});
m.raiz.paso();
m.guardar();
