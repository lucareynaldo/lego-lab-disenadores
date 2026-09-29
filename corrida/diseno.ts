// Cerezo en flor (sakura, Prunus × yedoensis) sobre un montículo de pasto.
import {Modelo, grilla} from '../taller/src/dsl.ts';

// Sub-armados: base (montículo, pétalos y farol) → tronco (el árbol "de invierno": cono de raíces, corteza
// de troncos, horqueta y cuatro ramas con bisagras) → cinco nubes de flor, de atrás hacia adelante, y la
// nube alta como revelación.

// ---------- geometría mínima para lo que el DSL no cubre ----------
// Dos casos: una flor que entra solo en la punta de un tallo (inserción parcial) y un sub-armado que se
// apoya sobre un stud inclinado. Todo se calcula a partir de piezas ya encastradas, no a mano.
type V = [number, number, number];
type M = number[];
const mul = (r: M, v: V): V => [r[0] * v[0] + r[1] * v[1] + r[2] * v[2], r[3] * v[0] + r[4] * v[1] + r[5] * v[2], r[6] * v[0] + r[7] * v[1] + r[8] * v[2]];
const norm = (v: V): V => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; };
const suma = (a: V, b: V, k = 1): V => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]];
const rotEje = (a: V, g: number): M => {
	const [x, y, z] = norm(a); const c = Math.cos(g), s = Math.sin(g), k = 1 - c;
	return [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k];
};
const rotEntre = (a: V, b: V): M => {
	const u = norm(a), v = norm(b); const c = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
	const k: V = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const s = Math.hypot(...k);
	if (s < 1e-9) return c > 0 ? [1, 0, 0, 0, 1, 0, 0, 0, 1] : rotEje([1, 0, 0], Math.PI);
	return rotEje(k, Math.atan2(s, c));
};
const grados = (x: number) => (x * 180) / Math.PI;
// Ángulos para `rot` ("X a Y b Z c" = Rz(c)·Ry(b)·Rx(a)); con b = ±90° (bloqueo de cardán) se fija c = 0.
const rotTexto = (r: M) => {
	let a: number, b: number, c: number;
	if (Math.abs(r[6]) > 1 - 1e-9) {
		b = -Math.sign(r[6]) * (Math.PI / 2);
		a = Math.atan2(-r[6] * r[1], r[4]);
		c = 0;
	} else {
		a = Math.atan2(r[7], r[8]);
		b = -Math.asin(r[6]);
		c = Math.atan2(r[3], r[0]);
	}
	return `X${grados(a).toFixed(6)} Y${grados(b).toFixed(6)} Z${grados(c).toFixed(6)}`;
};
type Colocada = {tr: {r: M; t: V}};
// Flor 24866 en la punta de un tallo del 19119: el conector del DSL la dejaría en la raíz del tallo;
// la punta (sección R2) entra en el agujero R2 de la flor a 16 LDU de la raíz. Base y eje de los seis
// tallos: conectores 1–6 de `piezas ver 19119`.
const TALLOS: [V, V][] = [
	[[-6.49999589, -10.06239278, 0], [-0.5, -0.866025, 0]],
	[[3.24997791, -10.06241343, 5.62866163], [0.25, -0.866025, 0.433013]],
	[[-3.75852542, -5.73656807, -6.50964556], [-0.469846, -0.34202, -0.813798]],
	[[3.24997791, -10.06241343, -5.62866163], [0.25, -0.866025, -0.433013]],
	[[-3.75852542, -5.73656807, 6.50964556], [-0.469846, -0.34202, 0.813798]],
	[[7.51706218, -5.73655724, 0], [0.939693, -0.34202, 0]],
];
const enPuntaDeTallo = (ramo: Colocada, k: number) => {
	const [base, eje] = TALLOS[k];
	const e = norm(mul(ramo.tr.r, eje));
	const p = suma(suma(ramo.tr.t, mul(ramo.tr.r, base)), e, 16);
	const r = rotEntre([0, -1, 0], e);
	return {en: suma(p, mul(r, [0, 8, 0]), -1), rot: rotTexto(r)};
};
// Transformación para colocar un sub-armado de modo que el punto `anti` (anti-stud de su pieza raíz, en
// coordenadas del sub-armado) quede sobre el punto `stud` de la pieza `punta` (que está en un sub-armado
// colocado en `offset` sin rotar). La orientación es la de `punta`.
const sobrePieza = (punta: Colocada, stud: V, anti: V, offset: V) => ({
	en: suma(offset, suma(punta.tr.t, mul(punta.tr.r, suma(stud, anti, -1)))),
	rot: rotTexto(punta.tr.r),
});

const RB = 'Reddish_Brown';
const DB = 'Dark_Brown';
const ROSA = 'Bright_Pink';
const BLANCO = 'White';
const PASTO = 'Green';
const MATA = 'Bright_Green';
const PIEDRA = 'Light_Bluish_Grey';

const m = new Modelo('cerezo');
type Sub = ReturnType<typeof m.sub>;

// ======================= base: montículo de pasto 12 x 12 =======================
// Se arma de atrás hacia adelante (la cámara 3/4 mira desde -X, -Z).
const base = m.sub('base');
base.poner('6003', PASTO, {en: grilla(9, 0, 9), rot: 'Y-90'});
base.poner('6003', PASTO, {en: grilla(3, 0, 9), rot: 'Y180'});
base.poner('6003', PASTO, {en: grilla(9, 0, 3)});
base.poner('6003', PASTO, {en: grilla(3, 0, 3), rot: 'Y90'});
base.paso();
// segundo piso 10 x 10: la placa 2 x 10 y las 2 x 4 traban las cuatro esquinas
base.poner('3832', PASTO, {en: grilla(6, 1, 6), rot: 'Y90'});
const franjaO = base.poner('3020', PASTO, {en: grilla(3, 1, 6)});
const franjaE = base.poner('3020', PASTO, {en: grilla(9, 1, 6)});
base.paso();
base.poner('30565', PASTO, {en: grilla(9, 1, 9), rot: 'Y-90'});
base.poner('30565', PASTO, {en: grilla(3, 1, 9), rot: 'Y180'});
const esquinaNE = base.poner('30565', PASTO, {en: grilla(9, 1, 3)});
base.poner('30565', PASTO, {en: grilla(3, 1, 3), rot: 'Y90'});
// matas de pasto
base.poner('32607', MATA, {sobre: franjaO, stud: [0, 1]});
base.poner('32607', MATA, {sobre: franjaE, stud: [3, 0]});
base.poner('32607', MATA, {sobre: franjaE, stud: [1, 1]});
base.paso();
// farol de piedra (tōrō): da la escala (≈ 2 m) y el contexto japonés
const pie = base.poner('18674', PIEDRA, {sobre: esquinaNE, stud: [1, 1]});
const poste = base.poner('3062b', PIEDRA, {sobre: pie, stud: [0, 0]});
const repisa = base.poner('4032a', PIEDRA, {sobre: poste, stud: [0, 0], con: [0, 0]});
// pétalos caídos (baldosas redondas 1 x 1): el video empieza con el pasto rosado, antes del árbol
const PETALOS: [number, number, number, string][] = [
	[2, 2, 3, ROSA], [3, 2, 8, BLANCO], [8, 2, 9, ROSA], [10, 2, 7, BLANCO], [5, 2, 9, ROSA],
	[3, 2, 5, ROSA], [6, 2, 8, BLANCO], [0, 1, 8, ROSA], [11, 1, 3, BLANCO],
];
for (const [x, capas, z, color] of PETALOS) base.poner('98138', color, {en: grilla(x + 0.5, capas, z + 0.5), nombre: 'petalo'});
base.paso();
const luz = base.poner('92947', PIEDRA, {sobre: repisa, stud: [0, 0]});
const alero = base.poner('18674', PIEDRA, {sobre: luz, stud: [0, 0]});
const techo = base.poner('43898', PIEDRA, {sobre: alero, stud: [0, 0]});
base.poner('4589', PIEDRA, {sobre: techo, stud: [0, 0]});
base.paso();

// ======================= tronco: el árbol de invierno =======================
const tronco = m.sub('tronco');
// el cono 3 x 3 x 2 es el ensanche de la base, donde nacen las raíces
const cono = tronco.poner('6233', RB);
tronco.paso();
// corteza: ladrillos "log" cruzados; sus ranuras horizontales imitan las lenticelas del cerezo
const log1 = tronco.poner('30136', RB, {sobre: cono, stud: [0, 0]});
tronco.poner('30136', RB, {sobre: cono, stud: [0, 1]});
tronco.paso();
const log2 = tronco.poner('30136', RB, {sobre: log1, stud: [0, 0], giro: 90});
tronco.poner('30136', RB, {sobre: log1, stud: [1, 0], giro: 90});
tronco.paso();
// horqueta: placa redonda 4 x 4 con studs en cruz para cuatro bisagras y el líder
const cruz = tronco.poner('60474', DB, {sobre: log2, stud: [0, 0], con: [1, 1]});
tronco.paso();
// Cuatro ramas madre (vaso): bisagra inclinada 45°, rama de troncos 1 x 2 y bisagra de punta que deja
// la nube inclinada 35° hacia afuera. El giro del conector de bisagra es absoluto; con la base girada
// 180° el 3938 queda invertido y se compensa con 180° más.
type Rama = {stud: [number, number]; giro: number; largo: number; nombre: string; detallada?: boolean};
const RAMAS: Rama[] = [
	{stud: [2, 3], giro: 180, largo: 1, nombre: 'sur', detallada: true},
	{stud: [3, 1], giro: 90, largo: 2, nombre: 'este'},
	{stud: [1, 0], giro: 0, largo: 2, nombre: 'norte'},
	{stud: [0, 2], giro: 270, largo: 1, nombre: 'oeste'},
];
const APERTURA = 45;
const INCLINACION_NUBE = 35;
const rama = (r: Rama) => {
	const vuelta = r.giro === 180 ? 180 : 0;
	const hb = tronco.poner('3937', RB, {sobre: cruz, stud: r.stud, giro: r.giro, nombre: `bisagra-${r.nombre}`});
	const ht = tronco.poner('3938', RB, {conector: {de: hb, n: 2}, propio: 0, giro: vuelta + APERTURA, nombre: `rama-${r.nombre}`});
	// la primera rama muestra la bisagra sola; las demás se arman en un paso
	if (r.detallada) tronco.paso();
	let c = tronco.poner('30136', RB, {sobre: ht, stud: [0, 0], giro: r.giro, nombre: `rama-${r.nombre}`});
	for (let k = 1; k < r.largo; k++) c = tronco.poner('30136', RB, {sobre: c, stud: [0, 0], giro: r.giro, nombre: `rama-${r.nombre}`});
	const hb2 = tronco.poner('3937', RB, {sobre: c, stud: [0, 0], giro: r.giro, nombre: `punta-${r.nombre}`});
	const pt = tronco.poner('3938', RB, {conector: {de: hb2, n: 2}, propio: 0, giro: vuelta + INCLINACION_NUBE, nombre: `punta-${r.nombre}`});
	tronco.paso();
	return pt;
};
// primero las ramas de atrás y la del frente, después el líder central y al final la de la izquierda
const puntas = RAMAS.slice(0, 3).map(rama);
// líder central: sostiene la nube alta
const lider0 = tronco.poner('3941', RB, {sobre: cruz, stud: [1, 1], nombre: 'lider'});
const lider1 = tronco.poner('3942c', RB, {sobre: lider0, stud: [0, 0], nombre: 'lider'});
let lider = tronco.poner('3062b', RB, {sobre: lider1, stud: [0, 0], nombre: 'lider'});
lider = tronco.poner('3062b', RB, {sobre: lider, stud: [0, 0], nombre: 'lider'});
tronco.paso();
puntas.push(...RAMAS.slice(3).map(rama));

// ======================= nubes de flor =======================
// Ramito: tallo de flores de 6 puntas (19119, marrón oscuro) con una flor de 5 pétalos en cada punta.
const flores6 = (n: Sub, tallo: Colocada, nombre: string) => {
	for (let k = 0; k < 6; k++) n.poner('24866', k % 3 ? ROSA : BLANCO, {...enPuntaDeTallo(tallo, k), nombre: nombre + ':flor-ramito'});
};
// hacia arriba: la barra entra en el stud hueco central de una placa 2 x 2 con un stud
const ramitoArriba = (n: Sub, sobre: Colocada, nombre: string) => {
	const j = n.poner('87580', ROSA, {sobre: sobre as any, stud: [0, 0], nombre: nombre + ':ramito'});
	flores6(n, n.poner('19119', DB, {conector: {de: j, n: 11}, propio: 0, nombre: nombre + ':ramito'}), nombre);
};
type Fleco = [[number, number], number];
type Nube = {flecos: Fleco[]; ramito?: boolean; eje?: boolean; detallado?: boolean; floresAparte?: boolean};
// Cúpula de cuatro cuartos (88293) sobre una placa 4 x 4, con flecos de hojas 4 x 3 colgados del borde.
// En la nube, -Z local apunta hacia afuera del árbol.
const nube = (nombre: string, o: Nube) => {
	const n = m.sub(nombre);
	// con `eje`, la raíz va sobre una placa redonda 2 x 2 que se centra en un solo stud y puede girar
	const cubo = o.eje ? n.poner('4032a', RB, {nombre: nombre + ':cubo'}) : undefined;
	const raiz = cubo
		? n.poner('3031', ROSA, {sobre: cubo, stud: [0, 0], con: [1, 1], nombre: nombre + ':raiz'})
		: n.poner('3031', ROSA, {nombre: nombre + ':raiz'});
	const hojas = o.flecos.map(([a, g]) => n.poner('2423', BLANCO, {debajo: raiz, antistud: a, con: [1, 3], giro: g, nombre: nombre + ':fleco'}));
	const floresFleco = () => hojas.forEach((h) => [[1, 0], [0, 1], [2, 1]].forEach((st) => n.poner('24866', ROSA, {sobre: h, stud: st as [number, number], nombre: nombre + ':flor'})));
	const cupula = (k: number) =>
		n.poner('88293', ROSA, {sobre: raiz, stud: [[2, 1], [2, 2], [1, 2], [1, 1]][k] as [number, number], con: [0, 2], giro: 90 * k, nombre: nombre + ':cupula'});
	let cuartos: Colocada[];
	if (o.detallado) {
		// la primera nube, en detalle: raíz y flecos; flores y media cúpula; la otra media
		n.paso();
		floresFleco();
		cuartos = [cupula(0), cupula(1)];
		n.paso();
		cuartos.push(cupula(2), cupula(3));
		n.paso();
	} else if (o.floresAparte) {
		n.paso();
		floresFleco();
		cuartos = [0, 1, 2, 3].map(cupula);
		n.paso();
	} else {
		// las repetidas se agrupan: raíz con flecos y flores; cúpula
		floresFleco();
		n.paso();
		cuartos = [0, 1, 2, 3].map(cupula);
		n.paso();
	}
	if (o.ramito) ramitoArriba(n, cuartos[3], nombre);
	else cuartos.forEach((c, k) => n.poner('24866', k % 2 ? ROSA : BLANCO, {sobre: c, stud: [0, 0], nombre: nombre + ':flor'}));
	n.paso();
	return n;
};
// a los costados y uno hacia afuera, que con la nube inclinada cuelga como el borde de la copa
const A_LOS_LADOS: Fleco[] = [[[0, 1], 270], [[3, 1], 90]];
const AFUERA: Fleco = [[2, 0], 0];
const nubes = {
	sur: nube('nube-sur', {flecos: [...A_LOS_LADOS, AFUERA], detallado: true, ramito: true}),
	este: nube('nube-este', {flecos: [[[0, 2], 270], [[3, 2], 90], AFUERA], ramito: true}),
	norte: nube('nube-norte', {flecos: [...A_LOS_LADOS, AFUERA], ramito: true}),
	oeste: nube('nube-oeste', {flecos: [...A_LOS_LADOS, AFUERA], ramito: true}),
	alta: nube('nube-alta', {flecos: [[[1, 0], 0], [[3, 1], 90], [[2, 3], 180], [[0, 2], 270]], ramito: true, eje: true, floresAparte: true}),
};

// ======================= modelo principal =======================
// Un paso por sub-armado, en el orden del video (LDraw muestra primero los pasos de cada sub-armado).
m.raiz.colocar(base);
m.raiz.paso();
// el cono (3 x 3) centrado en el stud (5, 5) del montículo
const OFS_TRONCO: V = [110, -8 - 48, 110];
m.raiz.colocar(tronco, {en: OFS_TRONCO});
m.raiz.paso();
// florece de atrás hacia adelante: la raíz de cada nube apoya sus anti-studs (1,2) y (2,2) sobre los
// dos studs de la bisagra de punta de su rama
RAMAS.forEach((r, i) => {
	m.raiz.colocar(nubes[r.nombre as keyof typeof nubes], sobrePieza(puntas[i], [-10, 0, 0], [-10, 8, 10], OFS_TRONCO));
	m.raiz.paso();
});
// la revelación: la nube alta, girada 45° sobre el stud del líder para que sus flecos asomen entre las otras
m.raiz.colocar(nubes.alta, {en: suma(OFS_TRONCO, suma(lider.tr.t, [0, -8, 0])), rot: 'Y45'});
m.raiz.paso();
m.guardar();
