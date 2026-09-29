import {Modelo, grilla} from '../taller/src/dsl.ts';

// Cerezo llorón (shidarezakura) en flor.
// Sub-armados: suelo (zócalo, isla de pasto, piedras, farol, pétalos) · tronco (montículo, raíces, corteza) ·
// copa (paraguas de ramas, puntas SNOT y cortinas colgantes) · domo (hojas en bisagra, como varillas de paraguas).
const m = new Modelo('cerezo-lloron');
type P = ReturnType<typeof m.raiz.poner>;
type Sub = typeof m.raiz;
type V = [number, number, number];

// --- Álgebra mínima para elegir el giro de un encastre inclinado o lateral (misma convención que encastre.ts) ---
const norm = (v: V): V => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; };
const cruz = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const punto = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const ap = (r: readonly number[], v: V): V => [r[0] * v[0] + r[1] * v[1] + r[2] * v[2], r[3] * v[0] + r[4] * v[1] + r[5] * v[2], r[6] * v[0] + r[7] * v[1] + r[8] * v[2]];
const mul = (a: number[], b: number[]) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]));
function rotEje(e: V, g: number): number[] {
	const [x, y, z] = norm(e); const a = (g * Math.PI) / 180; const c = Math.cos(a), s = Math.sin(a), k = 1 - c;
	return [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k];
}
function rotEntre(a: V, b: V): number[] {
	const u = norm(a), v = norm(b), c = punto(u, v);
	if (c > 1 - 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
	if (c < -1 + 1e-12) return rotEje(cruz(u, Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]), 180);
	const k = cruz(u, v);
	return rotEje(norm(k), (Math.atan2(Math.hypot(...k), c) * 180) / Math.PI);
}
// Giro (0–359) que, al encastrar un conector de eje local `ejeNuevo` sobre uno de eje local `ejeBase` de `base`,
// lleva el vector local `v` de la pieza nueva a la dirección `quiero` (en el sistema del sub-armado).
function giroPara(base: P, ejeBase: V, ejeNuevo: V, v: V, quiero: V): number {
	const aB = norm(ap(base.tr.r, ejeBase));
	let mejor = 0, max = -2;
	for (let g = 0; g < 360; g++) {
		const d = punto(ap(mul(rotEje(aB, g), rotEntre(ejeNuevo, aB)), v), norm(quiero));
		if (d > max) { max = d; mejor = g; }
	}
	return mejor;
}
const ARRIBA: V = [0, -1, 0];
const ABAJO: V = [0, 1, 0];
const rad = (g: number) => (g * Math.PI) / 180;
const dir = (grados: number): V => [Math.cos(rad(grados)), 0, Math.sin(rad(grados))];
// Dirección que baja `incl` grados mirando hacia `g`, y la normal de un plano inclinado así.
const bajando = (g: number, incl: number): V => [Math.cos(rad(g)) * Math.cos(rad(incl)), Math.sin(rad(incl)), Math.sin(rad(g)) * Math.cos(rad(incl))];
const normalInclinada = (g: number, incl: number): V => [Math.cos(rad(g)) * Math.sin(rad(incl)), -Math.cos(rad(incl)), Math.sin(rad(g)) * Math.sin(rad(incl))];

const ROSA = 'Bright_Pink';
const BLANCO = 'White';
const PASTO = 'Green';

// Stud (i, j) de una placa rectangular de `w` x `d` (sin rotar sobre Y más que 0/90/180/270) que cae en (x, z) del sub-armado.
function studEn(placa: P, w: number, d: number, x: number, z: number): [number, number] | undefined {
	for (let i = 0; i < w; i++)
		for (let j = 0; j < d; j++) {
			const p = ap(placa.tr.r, [-10 * (w - 1) + 20 * i, 0, -10 * (d - 1) + 20 * j]);
			if (Math.abs(placa.tr.t[0] + p[0] - x) < 0.5 && Math.abs(placa.tr.t[2] + p[2] - z) < 0.5) return [i, j];
		}
	return undefined;
}

// ===================== SUELO =====================
const suelo = m.sub('suelo');
const zocalo = suelo.poner('91405', 'Dark_Tan', {nombre: 'zocalo'});
suelo.paso();
const pastos: [P, number, number][] = [];
pastos.push([suelo.poner('3958', PASTO, {sobre: zocalo, stud: [5, 5], nombre: 'pasto-centro'}), 6, 6]);
pastos.push([suelo.poner('3032', PASTO, {sobre: zocalo, stud: [5, 1]}), 6, 4]);
pastos.push([suelo.poner('3032', PASTO, {sobre: zocalo, stud: [5, 11]}), 6, 4]);
suelo.paso();
pastos.push([suelo.poner('3032', PASTO, {sobre: zocalo, stud: [4, 5], giro: 90}), 6, 4]);
pastos.push([suelo.poner('3032', PASTO, {sobre: zocalo, stud: [14, 5], giro: 90}), 6, 4]);
pastos.push([suelo.poner('30565', PASTO, {sobre: zocalo, stud: [1, 4], giro: 270, nombre: 'esquina-frente'}), 4, 4]);
pastos.push([suelo.poner('30565', PASTO, {sobre: zocalo, stud: [11, 1], giro: 0}), 4, 4]);
pastos.push([suelo.poner('30565', PASTO, {sobre: zocalo, stud: [14, 11], giro: 90}), 4, 4]);
pastos.push([suelo.poner('30565', PASTO, {sobre: zocalo, stud: [4, 14], giro: 180, nombre: 'esquina-farol'}), 4, 4]);
suelo.paso();
// Pone una pieza sobre el pasto con su anti-stud `con` en el punto (x, z) del sub-armado.
function sobrePasto(id: string, color: string, x: number, z: number, op: {con?: [number, number]; giro?: number; nombre?: string} = {}): P {
	for (const [placa, w, d] of pastos) {
		const s = studEn(placa, w, d, x, z);
		if (!s) continue;
		try {
			return suelo.poner(id, color, {sobre: placa, stud: s, con: op.con, giro: op.giro, nombre: op.nombre});
		} catch {
			// Ese stud no existe (esquina redondeada): probar otra placa.
		}
	}
	throw new Error(`no hay pasto en (${x}, ${z})`);
}
// Piedras de paso que vienen desde la esquina del frente hacia el tronco.
sobrePasto('14769', 'Light_Bluish_Grey', -110, -110, {nombre: 'piedra1'});
sobrePasto('14769', 'Light_Bluish_Grey', -70, -70, {nombre: 'piedra2'});
sobrePasto('24246', 'Light_Bluish_Grey', -130, -70, {giro: 90, nombre: 'piedra3'});
// Farol de piedra (tōrō) en la esquina izquierda.
const farolBase = sobrePasto('18674', 'Dark_Bluish_Grey', -110, 110, {nombre: 'farol-base'});
const farolPoste = suelo.poner('3062b', 'Light_Bluish_Grey', {sobre: farolBase, stud: [0, 0]});
const farolLuz = suelo.poner('3062b', 'Trans_Yellow', {sobre: farolPoste, stud: [0, 0]});
const farolTecho = suelo.poner('4740', 'Dark_Bluish_Grey', {sobre: farolLuz, stud: [0, 0]});
suelo.poner('4589', 'Dark_Bluish_Grey', {sobre: farolTecho, stud: [0, 0], nombre: 'farol-punta'});
suelo.paso();
// Pétalos caídos: tejas 1x1 con un extremo redondeado, sobre la línea donde gotean las cortinas.
const petalos: [number, number, string, number][] = [
	[-130, 10, ROSA, 0], [-110, 50, BLANCO, 90], [-70, 110, ROSA, 180], [-30, 130, ROSA, 270],
	[30, 110, BLANCO, 0], [90, 90, ROSA, 90], [130, 30, ROSA, 180], [110, -50, BLANCO, 270],
	[70, -110, ROSA, 90], [10, -130, ROSA, 0], [-30, -110, BLANCO, 180], [-130, -30, ROSA, 270],
];
petalos.forEach(([x, z, color, giro], k) => sobrePasto('24246', color, x, z, {giro, nombre: `petalo${k + 1}`}));
suelo.paso();

// ===================== TRONCO =====================
const tronco = m.sub('tronco');
const monticulo = tronco.poner('11213', PASTO, {nombre: 'monticulo'});
let t = tronco.poner('3941', 'Reddish_Brown', {sobre: monticulo, stud: [2, 2]});
// Raíces: cuatro curvas en molinete que ensanchan la base.
tronco.poner('11477', 'Reddish_Brown', {sobre: monticulo, stud: [5, 2], giro: 90, nombre: 'raiz-e'});
tronco.poner('11477', 'Reddish_Brown', {sobre: monticulo, stud: [0, 3], giro: 270, nombre: 'raiz-o'});
tronco.poner('11477', 'Reddish_Brown', {sobre: monticulo, stud: [2, 0], giro: 0, nombre: 'raiz-n'});
tronco.poner('11477', 'Reddish_Brown', {sobre: monticulo, stud: [3, 5], giro: 180, nombre: 'raiz-s'});
tronco.paso();
// Corteza: abajo, un redondo de rejilla oscuro (corteza gruesa y surcada); arriba, redondos lisos.
t = tronco.poner('92947', 'Dark_Brown', {sobre: t, stud: [0, 0]});
t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [0, 0]});
tronco.paso();
t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [1, 0], nombre: 'quiebre'}); // corrido un stud: el tronco se tuerce
t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [0, 0]});
tronco.paso();
t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [0, 0], con: [1, 0], nombre: 'contraquiebre'}); // y vuelve: queda en S
t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [0, 0]});
t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [0, 0], nombre: 'tope'});
tronco.paso();
const tope = t;

// ===================== DOMO =====================
// Ocho hojas grandes en bisagra, inclinadas hacia abajo como las varillas de un paraguas.
const domo = m.sub('domo');
const hoja = (sub: Sub, id: string, base: P, nStud: number, v: V, color: string, nombre?: string) =>
	sub.poner(id, color, {conector: {de: base, n: nStud}, propio: 0, giro: giroPara(base, ARRIBA, ARRIBA, [0, 0, 1], v), nombre});
// Ramillete: placa 1x1 redonda con tres hojas, sobre un stud (propio 0) o colgada de un anti-stud (propio 1).
const flor = (sub: Sub, base: P, n: number, color: string, giro: number, propio = 0, nombre?: string) =>
	sub.poner('32607', color, {conector: {de: base, n}, propio, giro, nombre});
const INCL = 44;
const cubo = domo.poner('11213', BLANCO, {nombre: 'cubo'});
// Copete: núcleo bajo y un ramillete que tapa el nudo de las bisagras.
const nucleo = domo.poner('3941', ROSA, {sobre: cubo, stud: [2, 2], nombre: 'nucleo'});
// 3941 studs: (0,0)#10 (1,0)#9 (0,1)#8 (1,1)#7
const c1 = flor(domo, nucleo, 10, BLANCO, 90, 0, 'copete1');
flor(domo, nucleo, 9, ROSA, 120, 0, 'copete2');
flor(domo, nucleo, 8, ROSA, 0, 0, 'copete3');
flor(domo, nucleo, 7, BLANCO, 270, 0, 'copete4');
flor(domo, c1, 1, ROSA, 135, 0, 'copete5');
domo.paso();
// Lados: bisagra 1x2 (base + tapa) con el largo tangente; la tapa se inclina hacia afuera.
// 11213, lados: -Z (2,0)#48 · +X (5,2)#45 · +Z (3,5)#47 · -X (0,3)#42
for (const [n, g] of [[42, 180], [48, 270], [45, 0], [47, 90]] as [number, number][]) {
	const base = domo.poner('3937', BLANCO, {conector: {de: cubo, n}, propio: 0, giro: giroPara(cubo, ARRIBA, ARRIBA, [1, 0, 0], dir(g + 90)), nombre: `bis${g}`});
	const tapa = domo.poner('3938', BLANCO, {conector: {de: base, n: 2}, propio: 0, giro: giroPara(base, [1, 0, 0], [1, 0, 0], ARRIBA, normalInclinada(g, INCL)), nombre: `tapa${g}`});
	const ala = hoja(domo, '2417', tapa, 3, bajando(g, INCL), ROSA, `ala${g}`);
	// Flores sobre la hoja: le dan bulto al domo.
	flor(domo, ala, 21, BLANCO, g, 0, `flor-ala${g}-c`);
	flor(domo, ala, 24, ROSA, g + 150, 0, `flor-ala${g}-i`);
	flor(domo, ala, 23, BLANCO, g + 90, 0, `flor-ala${g}-d`);
	if (g !== 0) domo.paso(); // las dos primeras se muestran solas; las dos últimas, juntas
}
// Diagonales: bisagra de clip sobre un alza (teja con clip + placa con manija, que queda boca abajo);
// la hoja se engancha por su stud en el anti-stud de la placa, que mira hacia arriba.
// 11213: (1,1)#26 225° · (4,1)#39 315° · (1,4)#32 135° · (4,4)#37 45°
const INCL_D = 36;
for (const [n, g] of [[32, 135], [26, 225], [39, 315], [37, 45]] as [number, number][]) {
	const alza = domo.poner('3024', BLANCO, {conector: {de: cubo, n}, propio: 0, nombre: `alza${g}`});
	const teja = domo.poner('15712', BLANCO, {conector: {de: alza, n: 2}, propio: 0, giro: giroPara(alza, ARRIBA, ARRIBA, [0, 0, 1], dir(g - 90)), nombre: `teja${g}`});
	const pl = domo.poner('60478', BLANCO, {conector: {de: teja, n: 1}, propio: 2, giro: giroPara(teja, [0, 0, 1], [0, 0, -1], [-1, 0, 0], bajando(g, INCL_D)), nombre: `manija${g}`});
	const color = g === 45 || g === 225 ? BLANCO : ROSA;
	const alad = domo.poner('2417', color, {conector: {de: pl, n: 0}, propio: 27, giro: giroPara(pl, ARRIBA, ARRIBA, [0, 0, 1], bajando(g, INCL_D)), nombre: `alad${g}`});
	flor(domo, alad, 5, color === BLANCO ? ROSA : BLANCO, g, 1, `flor-alad${g}-c`);
	flor(domo, alad, 1, ROSA, g - 90, 1, `flor-alad${g}-i`);
	if (g === 225 || g === 45) domo.paso();
}

// ===================== COPA =====================
const copa = m.sub('copa');
// Paraguas de ramas: seis ramas cruzadas (12 puntas, una cada 30°), apiladas en el centro.
const A = copa.poner('2445', 'Reddish_Brown', {nombre: 'A'});
const B = copa.poner('2445', 'Reddish_Brown', {sobre: A, stud: [5, 0], con: [5, 1], giro: 90, nombre: 'B'});
// Flores a lo largo de las ramas (el cerezo florece sobre la madera). 2445 (i,j) #: (1,1)#34 (10,0)#37 (1,0)#46 (10,1)#25
flor(copa, A, 34, BLANCO, 30, 0, 'flor-A1'); flor(copa, A, 37, ROSA, 200, 0, 'flor-A2');
flor(copa, B, 46, ROSA, 120, 0, 'flor-B1'); flor(copa, B, 25, BLANCO, 300, 0, 'flor-B2');
copa.paso();
// Cortina interior: hebras cortas de ramilletes colgadas debajo de las ramas bajas, armadas hacia abajo.
const hebra = (base: P, a: [number, number], colores: string[], giro0: number, nombre: string) => {
	let p = copa.poner('32607', colores[0], {debajo: base, antistud: a, giro: giro0, nombre: `${nombre}-1`});
	colores.slice(1).forEach((c, k) => { p = copa.poner('32607', c, {debajo: p, antistud: [0, 0], giro: (giro0 + 90 * (k + 1)) % 360, nombre: `${nombre}-${k + 2}`}); });
};
hebra(A, [2, 0], [ROSA, BLANCO, ROSA], 0, 'hebraA1');
hebra(A, [9, 1], [BLANCO, ROSA, ROSA], 180, 'hebraA2');
hebra(B, [2, 1], [ROSA, ROSA, BLANCO], 90, 'hebraB1');
hebra(B, [9, 0], [ROSA, BLANCO, ROSA], 270, 'hebraB2');
copa.paso();
const sep = copa.poner('3024', 'Reddish_Brown', {sobre: B, stud: [5, 0], nombre: 'sep'});
const ramas: P[] = [];
let prev = sep, nPrev = 2;
for (const [k, g] of [30, 120, 60, 150].entries()) {
	const r = copa.poner('60479', 'Reddish_Brown', {conector: {de: prev, n: nPrev}, propio: 5, giro: giroPara(prev, ARRIBA, ARRIBA, [1, 0, 0], dir(g)), nombre: `rama${g}`});
	ramas.push(r);
	prev = r; nPrev = 29;
	if (k === 1) copa.paso();
}
// Más flores sobre las ramas altas. 60479 (i,0)#(34-i)
ramas.forEach((r, k) => { flor(copa, r, 32, k % 2 ? ROSA : BLANCO, 60 * k, 0, `flor-r${k}a`); flor(copa, r, 25, k % 2 ? BLANCO : ROSA, 60 * k + 180, 0, `flor-r${k}b`); });
copa.paso();
// Puntas: ladrillo con un stud al costado mirando hacia afuera (las dos ramas bajas llevan un alza).
const STUD_LADO: V = [0, 0, -1]; // 87087 n=2
const puntas = new Map<number, P>();
const punta = (arm: P, nStud: number, grados: number, alza = false) => {
	let base = arm, n = nStud;
	if (alza) { base = copa.poner('3005', ROSA, {conector: {de: arm, n: nStud}, propio: 0}); n = 1; }
	puntas.set(grados, copa.poner('87087', ROSA, {conector: {de: base, n}, propio: 0, giro: giroPara(base, ARRIBA, ARRIBA, STUD_LADO, dir(grados)), nombre: `punta${grados}`}));
};
punta(A, 47, 180, true); punta(A, 24, 0, true);
punta(B, 35, 270, true); punta(B, 36, 90, true);
copa.paso();
[30, 120, 60, 150].forEach((g, k) => { punta(ramas[k], 34, g + 180); punta(ramas[k], 23, g); });
// Columna que sigue el tronco hasta el domo (va en el mismo paso: sola casi no se ve).
const col1 = copa.poner('3062b', 'Reddish_Brown', {conector: {de: ramas[3], n: 29}, propio: 0, nombre: 'col1'});
const col2 = copa.poner('3062b', 'Reddish_Brown', {sobre: col1, stud: [0, 0], nombre: 'col2'});
copa.paso();
// Y encima, el domo.
// El anti-stud (3,2) del cubo (10, 8, -10) va sobre el stud de col2: así el domo queda centrado sobre el tronco.
copa.colocar(domo, {en: [col2.tr.t[0] - 10, col2.tr.t[1] - 8, col2.tr.t[2] + 10]});
copa.paso();
// Cortinas: cadenas de hojas 4x3 colgadas de cada punta, de atrás hacia adelante (la cámara 3/4 mira desde 225°).
const cadenas: [number, number, string[], boolean][] = [
	// [ángulo, largo, colores de arriba hacia abajo, lleva ramillete]. Las puntas más altas llevan cadenas más largas:
	// el ruedo queda irregular y cerca del pasto.
	[0, 3, [ROSA, ROSA, BLANCO], false], [30, 3, [ROSA, BLANCO, ROSA], false],
	[90, 3, [ROSA, BLANCO, ROSA], true], [60, 4, [BLANCO, ROSA, ROSA, BLANCO], true],
	[330, 4, [ROSA, BLANCO, ROSA, ROSA], true], [120, 3, [ROSA, ROSA, BLANCO], false],
	[300, 3, [BLANCO, ROSA, ROSA], false], [150, 4, [ROSA, ROSA, BLANCO, ROSA], true],
	[270, 3, [ROSA, BLANCO, ROSA], true], [180, 3, [ROSA, ROSA, BLANCO], false],
	[240, 4, [ROSA, BLANCO, ROSA, ROSA], true], [210, 3, [ROSA, BLANCO, ROSA], true],
];
// Dos cadenas por paso (una de atrás con una del borde, para que siempre se vea algo nuevo); las dos del frente, solas.
const porPaso = [2, 2, 2, 2, 2, 1, 1];
let c = 0;
for (const n of porPaso) {
	for (let k = 0; k < n && c < cadenas.length; k++, c++) {
		const [g, largo, colores, ramillete] = cadenas[c];
		const b = puntas.get(g);
		if (!b) continue;
		let h = copa.poner('2423', colores[0], {conector: {de: b, n: 2}, propio: 0, giro: giroPara(b, STUD_LADO, ARRIBA, [0, 0, 1], ABAJO), nombre: `cadena${g}-1`});
		if (ramillete) flor(copa, h, 9, colores[0] === ROSA ? BLANCO : ROSA, g, 0, `ramillete${g}`);
		for (let e = 1; e < largo; e++) h = copa.poner('2423', colores[e], {conector: {de: h, n: 6}, propio: 0, giro: giroPara(h, ARRIBA, ARRIBA, [0, 0, 1], ABAJO), nombre: `cadena${g}-${e + 1}`});
	}
	copa.paso();
}

// ===================== MONTAJE =====================
// El tronco va sobre el pasto; la copa, con sus anti-studs sobre el tope del tronco.
const EN_TRONCO = grilla(0, 2, 0);
m.raiz.colocar(suelo);
m.raiz.paso();
m.raiz.colocar(tronco, {en: EN_TRONCO});
m.raiz.paso();
m.raiz.colocar(copa, {en: [EN_TRONCO[0] + tope.tr.t[0], EN_TRONCO[1] + tope.tr.t[1] - 8, EN_TRONCO[2] + tope.tr.t[2]]});
m.raiz.paso();
m.guardar();
