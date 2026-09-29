// Cerezo en flor (Prunus × yedoensis 'Somei-yoshino') para video vertical.
//
// Tres clases de sub-armado: la base (pasto redondo con farol de piedra), el tronco (alcorque, raíces, tronco
// y ramas hechas con colas de animal) y las nubes de flor, que se enchufan en la punta de cada rama. El video
// arma primero el árbol pelado, como en invierno; las nubes llegan al final y el árbol florece.
import {Modelo, grilla} from '../taller/src/dsl.ts';

// ── Encastre entre sub-armados ──────────────────────────────────────────────────────────────────────────
// El DSL encastra solo dentro de un sub-armado. Cada nube es un sub-armado aparte que se enchufa en la punta
// de una rama: su ubicación sale de la misma cuenta que taller/src/encastre.ts, a partir de la rama ya
// colocada y de los conectores que lista `piezas ver`.
type V = [number, number, number];
type M = number[];
type Pieza = ReturnType<ReturnType<Modelo['sub']>['poner']>;
const mv = (r: M, v: V): V => [r[0] * v[0] + r[1] * v[1] + r[2] * v[2], r[3] * v[0] + r[4] * v[1] + r[5] * v[2], r[6] * v[0] + r[7] * v[1] + r[8] * v[2]];
const mm = (a: M, b: M): M => {
	const o = Array(9).fill(0);
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) o[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
	return o;
};
const unit = (v: V): V => {
	const l = Math.hypot(...v);
	return [v[0] / l, v[1] / l, v[2] / l];
};
const cruz = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function rotEje(e: V, grados: number): M {
	const [x, y, z] = unit(e);
	const a = (grados * Math.PI) / 180;
	const c = Math.cos(a), s = Math.sin(a), k = 1 - c;
	return [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k];
}
function rotEntre(a: V, b: V): M {
	const u = unit(a), v = unit(b);
	const c = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
	if (c > 1 - 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
	if (c < -1 + 1e-12) return rotEje(cruz(u, Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]), 180);
	const k = cruz(u, v);
	return rotEje(k, (Math.atan2(Math.hypot(...k), c) * 180) / Math.PI);
}
type Conector = {pos: V; eje: V};
// Dónde va un sub-armado cuyo conector `propio` (en su origen) tiene que calzar en el conector `en` de la
// pieza p, girado `giro` grados alrededor de ese eje. Devuelve {en, rot} para `colocar`.
function encastre(p: Pieza, en: Conector, propio: Conector, giro: number, desplazamiento: V) {
	const P = mv(p.tr.r as M, en.pos).map((x, i) => x + p.tr.t[i] + desplazamiento[i]) as V;
	const A = unit(mv(p.tr.r as M, en.eje));
	const r = mm(rotEje(A, giro), rotEntre(propio.eje, A));
	const q = mv(r, propio.pos);
	// parsearRot compone "Xa Yb Zc" como Rz·Ry·Rx.
	const b = Math.asin(Math.max(-1, Math.min(1, -r[6])));
	const g = (x: number) => ((x * 180) / Math.PI).toFixed(8);
	return {en: [P[0] - q[0], P[1] - q[1], P[2] - q[2]] as V, rot: `X${g(Math.atan2(r[7], r[8]))} Y${g(b)} Z${g(Math.atan2(r[3], r[0]))}`};
}
// De `piezas ver`: la barra de la punta de la cola 40379, el stud del 3062b y el anti-stud central de la hoja 2417.
const PUNTA_COLA: Conector = {pos: [0, -58.5, 69], eje: [0, -0.9612616951385826, 0.275637358606011]};
const STUD_REDONDO: Conector = {pos: [0, 0, 0], eje: [0, -1, 0]};
const CENTRO_HOJA: Conector = {pos: [0, 8, 0], eje: [0, -1, 0]};

const m = new Modelo('cerezo');

// ── Base: disco de pasto de 12 × 12 ─────────────────────────────────────────────────────────────────────
// Cuatro cuartos de 6 × 6 con esquina redonda, cosidos por las piedras que cruzan las juntas. Celdas (u, v):
// u de oeste a este, v del frente (−Z) al fondo. El cuarto NO va en el origen.
const PASTO = 'Green';
const PIEDRA = 'Light_Bluish_Grey';
const base = m.sub('base');
// Mitad oeste.
const qno = base.poner('6003', PASTO, {en: [0, 0, 0], rot: 'Y90'}); // esquina redonda en −X −Z
const piedraO = base.poner('14769', PIEDRA, {sobre: qno, stud: [0, 1], con: [0, 0]}); // celdas 1–2 × 5–6
base.poner('6003', PASTO, {debajo: piedraO, antistud: [0, 1], con: [4, 5], giro: 180}); // SO
base.paso();
// Mitad este, cosida por la piedra del frente.
const piedraN = base.poner('14769', PIEDRA, {sobre: qno, stud: [5, 5], con: [0, 0]}); // celdas 5–6 × 0–1
const qne = base.poner('6003', PASTO, {debajo: piedraN, antistud: [1, 0], con: [0, 0]}); // NE
const piedraE = base.poner('14769', PIEDRA, {sobre: qne, stud: [3, 5], con: [0, 0]}); // celdas 9–10 × 5–6
base.poner('6003', PASTO, {debajo: piedraE, antistud: [0, 1], con: [0, 2], giro: 90}); // SE
base.paso();
// Farol de piedra (tōrō) en la esquina del frente derecho, la más cercana a la cámara: celdas 9–10 × 1–2.
const farolPie = base.poner('18674', PIEDRA, {sobre: qne, stud: [3, 1], con: [0, 0]});
const farolPoste = base.poner('3062b', PIEDRA, {sobre: farolPie, stud: [0, 0]});
const farolLuz = base.poner('3062b', 'Trans_Yellow', {sobre: farolPoste, stud: [0, 0]});
const farolTecho = base.poner('4740', PIEDRA, {sobre: farolLuz, stud: [0, 0]});
base.poner('59900', PIEDRA, {sobre: farolTecho, stud: [0, 0]});
base.paso();

// ── Tronco ──────────────────────────────────────────────────────────────────────────────────────────────
const MADERA = 'Reddish_Brown';
const tronco = m.sub('tronco');
const tierra = tronco.poner('11213', 'Dark_Brown'); // alcorque redondo de 6 × 6
// Ensanche de la base: cuatro raíces en molinete; el extremo alto de cada pendiente toca el tronco.
for (const [stud, giro] of [[[2, 0], 0], [[5, 2], 90], [[3, 5], 180], [[0, 3], 270]] as [[number, number], number][])
	tronco.poner('11477', MADERA, {sobre: tierra, stud, giro});
const t1 = tronco.poner('3941', MADERA, {sobre: tierra, stud: [2, 2]});
tronco.paso();
const t2 = tronco.poner('3941', MADERA, {sobre: t1, stud: [0, 0]});
// Sobre una placa redonda con un solo stud central, el resto del tronco gira libre. Se lo gira 22,5° para
// que, de frente, las nubes bajas caigan cada una en su columna. `sobre` no arrastra ese giro, así que de acá
// para arriba todo se encastra por conector con el giro sumado.
const GIRO = 22.5;
const STUD_2x2 = {'3941': [10, 9, 8, 7], '3022': [8, 7, 6, 5]}; // studs (0,0) (1,0) (0,1) (1,1), de `piezas ver`
const esquina = (i: number, j: number) => i + 2 * j;
const encima = (id: string, base: Pieza, stud: number, giro = 0) =>
	tronco.poner(id, MADERA, {conector: {de: base, n: stud}, propio: 0, giro: GIRO + giro});
const eje = tronco.poner('18674', MADERA, {sobre: t2, stud: [0, 0]});
const t3 = tronco.poner('3941', MADERA, {conector: {de: eje, n: 6}, propio: 4, giro: GIRO});
tronco.paso();
// Piso bajo: cuatro placas con pinza en molinete. Las colas arrancan de costado y se abren hacia afuera.
const MOLINETE: [number, number, number][] = [[0, 0, 0], [1, 0, 90], [1, 1, 180], [0, 1, 270]];
const nudo = MOLINETE.map(([i, j, giro]) => encima('61252', t3, STUD_2x2['3941'][esquina(i, j)], giro));
const bajas: Pieza[] = [];
const ramaBaja = (k: number) => (bajas[k] = tronco.poner('40379', MADERA, {conector: {de: nudo[k], n: 1}, propio: 0, giro: -30}));
// De atrás hacia adelante, mirando desde la vista 3/4: la primera rama sola, la segunda sola, las otras dos juntas.
ramaBaja(2);
tronco.paso();
ramaBaja(1);
tronco.paso();
ramaBaja(3);
ramaBaja(0);
tronco.paso();
// El tronco sigue tres ladrillos más.
const t4 = encima('3941', nudo[0], 2);
const t5 = encima('3941', t4, STUD_2x2['3941'][0]);
const t6 = encima('3941', t5, STUD_2x2['3941'][0]);
tronco.paso();
// Horqueta alta: tres pinzas radiales con sus ramas y, en la cuarta esquina, la pinza de la guía.
const horqueta = encima('3022', t6, STUD_2x2['3941'][0]);
const pinzas = MOLINETE.slice(0, 3).map(([i, j, giro]) => encima('15712', horqueta, STUD_2x2['3022'][esquina(i, j)], giro));
const pinzaGuia = encima('61252', horqueta, STUD_2x2['3022'][esquina(0, 1)], 180);
const altas = pinzas.map((p, k) => tronco.poner('40379', MADERA, {conector: {de: p, n: 1}, propio: 0, giro: [0, 40, 40][k]}));
tronco.paso();
// La guía suelta la rama del oeste y sube hasta la cima.
const oeste = tronco.poner('40379', MADERA, {conector: {de: pinzaGuia, n: 1}, propio: 0, giro: 20});
let guia = pinzaGuia;
for (let k = 0; k < 4; k++) guia = encima('3062b', guia, 2);
tronco.paso();

// ── Nubes de flor ───────────────────────────────────────────────────────────────────────────────────────
// Hojas apiladas en espiral con el ángulo áureo (137,5°), como las hojas de un tallo, separadas por placas
// redondas de stud abierto. Arriba de cada hoja, flores de cinco pétalos: la flor del cerezo tiene cinco.
type Capa = {hoja: '2417' | '2423'; color: string; flores?: [number, number][]; flor?: string};
function nube(nombre: string, capas: Capa[], cima: string, pasoAPaso: boolean) {
	const s = m.sub(nombre);
	let soporte: Pieza | null = null;
	capas.forEach((c, k) => {
		const grande = c.hoja === '2417';
		const hoja: Pieza = soporte
			? s.poner(c.hoja, c.color, {conector: {de: soporte, n: 2}, propio: grande ? 5 : 1, giro: k * 137.5})
			: s.poner(c.hoja, c.color);
		for (const stud of c.flores ?? []) s.poner('24866', c.flor ?? 'White', {sobre: hoja, stud});
		soporte = s.poner('85861', 'White', {sobre: hoja, stud: grande ? [2, 3] : [1, 3]});
		if (k === capas.length - 1) s.poner('32607', cima, {sobre: soporte, stud: [0, 0]});
		if (pasoAPaso || k === capas.length - 1) s.paso();
	});
	return s;
}
const PUNTAS: [number, number][] = [[2, 0], [0, 3], [4, 3], [0, 5], [4, 5]];
const TRES: [number, number][] = [[2, 0], [0, 5], [4, 5]];
const ROSA: Capa[] = [
	{hoja: '2417', color: 'Bright_Pink', flores: TRES},
	{hoja: '2423', color: 'White'},
	{hoja: '2417', color: 'Bright_Pink', flores: PUNTAS},
];
const BLANCA: Capa[] = [
	{hoja: '2417', color: 'White', flores: TRES, flor: 'Bright_Pink'},
	{hoja: '2423', color: 'Bright_Pink'},
	{hoja: '2417', color: 'Bright_Pink', flores: PUNTAS},
];
const ALTA: Capa[] = [
	{hoja: '2417', color: 'Bright_Pink', flores: TRES},
	{hoja: '2417', color: 'White', flores: [[2, 0], [4, 5]], flor: 'Bright_Pink'},
	{hoja: '2423', color: 'Bright_Pink'},
	{hoja: '2423', color: 'White'},
];
const CIMA: Capa[] = [...ROSA, {hoja: '2423', color: 'White'}];
// La primera nube se arma capa por capa; las demás llegan armadas, una por paso.
const nubePrimera = nube('nube-primera', ROSA, 'White', true);
const nubeRosa = nube('nube-rosa', ROSA, 'White', false);
const nubeBlanca = nube('nube-blanca', BLANCA, 'Bright_Pink', false);
const nubeAlta = nube('nube-alta', ALTA, 'Bright_Pink', false);
const nubeCima = nube('nube-cima', CIMA, 'White', false);

// ── Montaje ─────────────────────────────────────────────────────────────────────────────────────────────
// El alcorque va en el centro del disco (celdas 3–8): x 60, z 60 desde el origen de la base, sobre el pasto.
const EN_TRONCO: V = grilla(3, 1, 3);
m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(tronco, {en: EN_TRONCO});
m.raiz.paso();
// Florece: primero el piso bajo, de atrás hacia adelante; después el alto y, al final, la cima.
const florecer = (sub: ReturnType<Modelo['sub']>, rama: Pieza, conector: Conector, giro: number, cierre = () => {}) => {
	m.raiz.colocar(sub, encastre(rama, conector, CENTRO_HOJA, giro, EN_TRONCO));
	cierre();
	m.raiz.paso();
};
florecer(nubePrimera, bajas[2], PUNTA_COLA, 166);
florecer(nubeBlanca, bajas[1], PUNTA_COLA, 83);
florecer(nubeBlanca, bajas[3], PUNTA_COLA, 249);
florecer(nubeRosa, bajas[0], PUNTA_COLA, 0);
florecer(nubeBlanca, altas[2], PUNTA_COLA, 138);
florecer(nubeAlta, altas[1], PUNTA_COLA, 55);
florecer(nubeAlta, oeste, PUNTA_COLA, 221);
florecer(nubeBlanca, altas[0], PUNTA_COLA, 332);
// La cima corona el árbol y, con ella, caen los primeros pétalos: sobre el pasto (celda u, v) y sobre el
// alcorque, una placa más arriba.
const celda = (u: number, v: number, capas = 1): V => [-50 + 20 * u, -8 * capas, -50 + 20 * v];
const PETALOS: [number, number, number, string, string][] = [
	[2, 4, 1, '98138', 'Bright_Pink'], [9, 3, 1, '24866', 'White'], [8, 10, 1, '98138', 'Bright_Pink'], [3, 9, 1, '98138', 'White'],
	[10, 8, 1, '24866', 'Bright_Pink'], [4, 4, 2, '98138', 'Bright_Pink'], [7, 7, 2, '24866', 'White'], [4, 7, 2, '98138', 'Bright_Pink'],
];
florecer(nubeCima, guia, STUD_REDONDO, 20, () => {
	for (const [u, v, capas, pieza, color] of PETALOS) m.raiz.poner(pieza, color, {en: celda(u, v, capas)});
});
m.guardar();
