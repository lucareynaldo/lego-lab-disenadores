// Cerezo japonés en flor (sakura). Ver ficha.md.
import {Modelo, grilla} from '../taller/src/dsl.ts';

type Tr = {r: number[]; t: number[]};
type V3 = [number, number, number];

// --- utilidades -------------------------------------------------------------------------------
// Descompone una rotación como Rz·Ry·Rx, que es lo que arma el texto 'X.. Y.. Z..' de `rot`.
function textoRot(r: number[]): string {
	const b = -Math.asin(Math.max(-1, Math.min(1, r[6])));
	let a: number, c: number;
	if (Math.abs(Math.cos(b)) > 1e-9) {
		a = Math.atan2(r[7], r[8]);
		c = Math.atan2(r[3], r[0]);
	} else {
		a = Math.atan2(-r[5], r[4]);
		c = 0;
	}
	const g = (x: number) => ((x * 180) / Math.PI).toFixed(6);
	return `X${g(a)} Y${g(b)} Z${g(c)}`;
}
const mulR = (A: number[], B: number[]) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => A[3 * i] * B[j] + A[3 * i + 1] * B[3 + j] + A[3 * i + 2] * B[6 + j]));
const aplR = (A: number[], v: number[]): V3 => [0, 1, 2].map((i) => A[3 * i] * v[0] + A[3 * i + 1] * v[1] + A[3 * i + 2] * v[2]) as V3;
const componer = (p: Tr, l: Tr): Tr => ({r: mulR(p.r, l.r), t: aplR(p.r, l.t).map((x, i) => x + p.t[i])});
const ID: Tr = {r: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0]};
const ubic = (tr: Tr) => ({en: tr.t as V3, rot: textoRot(tr.r)});
const trDe = (p: {tr: unknown}) => p.tr as Tr;

// Banco de pruebas aparte (nunca se guarda) para calcular encastres sin agregar piezas al modelo.
const aux = new Modelo('aux').raiz;
const copia = (tr: Tr, id: string) => aux.poner(id, 0, ubic(tr));
function encastre(tr0: Tr, id0: string, n: number, id: string, propio: number, giro = 0): Tr {
	return trDe(aux.poner(id, 0, {conector: {de: copia(tr0, id0), n}, propio, giro}));
}
// Algunos conectores (el agujero de la punta del 67361, la barra 3L 87994) están descriptos al revés:
// el encastre directo mete la pieza hacia adentro. Se da vuelta 180° alrededor del medio del tramo encastrado.
function encastreDadoVuelta(tr0: Tr, id0: string, n: number, id: string, propio: number, giro: number, ejePropio: V3, pos: V3, mitad: number): Tr {
	const T = encastre(tr0, id0, n, id, propio, giro);
	const e = aplR(T.r, ejePropio); // eje del conector propio, ya ubicado
	const b = aplR(T.r, pos).map((x, i) => x + T.t[i]);
	const P = b.map((x, i) => x + mitad * e[i]);
	const aux2: V3 = Math.abs(e[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
	const u0: V3 = [e[1] * aux2[2] - e[2] * aux2[1], e[2] * aux2[0] - e[0] * aux2[2], e[0] * aux2[1] - e[1] * aux2[0]];
	const k = Math.hypot(...u0);
	const u = u0.map((x) => x / k);
	const R = [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => 2 * u[i] * u[j] - (i === j ? 1 : 0)));
	return {r: mulR(R, T.r), t: aplR(R, T.t.map((x, i) => x - P[i])).map((x, i) => x + P[i])};
}

const m = new Modelo('sakura');
type P0 = ReturnType<typeof m.raiz.poner>;

// Colores
const CORTEZA = 'Reddish_Brown';
const RAMA = 'Dark_Brown';
const ROSA = 'Bright_Pink';
const ROSA_OSC = 'Dark_Pink';
const BLANCO = 'White';
const PASTO = 'Bright_Green';
const TIERRA = 'Dark_Brown';

// === 1. Base ===================================================================================
// Placa de pasto 16x16 (stud (i, j) con i, j de 0 a 15; j chico = frente), camino de piedras y farol.
const base = m.sub('base');
const placa = base.poner('91405', PASTO, {nombre: 'placa'});
base.paso();
const PIEDRA = 'Light_Bluish_Grey';
const PIEDRA_OSC = 'Dark_Bluish_Grey';
for (const [i, j] of [[3, 0], [3, 2], [4, 4]] as [number, number][]) base.poner('14769', PIEDRA, {sobre: placa, stud: [i, j]});
for (const [i, j] of [[1, 6], [14, 9], [6, 1], [10, 14], [1, 14]] as [number, number][]) base.poner('32607', 'Green', {sobre: placa, stud: [i, j]});
// Farol de piedra (tōrō): pie y poste; después la luz, el techo y el remate.
const pie = base.poner('18674', PIEDRA_OSC, {sobre: placa, stud: [12, 2], nombre: 'farol-pie'});
const poste = base.poner('3062b', PIEDRA, {sobre: pie, stud: [0, 0]});
const poste2 = base.poner('3062b', PIEDRA, {sobre: poste, stud: [0, 0]});
base.paso();
const luz = base.poner('3062b', 'Trans_Yellow', {sobre: poste2, stud: [0, 0], nombre: 'farol-luz'});
const techo = base.poner('4740', PIEDRA_OSC, {sobre: luz, stud: [0, 0], nombre: 'farol-techo'});
base.poner('4589', PIEDRA_OSC, {sobre: techo, stud: [0, 0]});
base.paso();

// === 2. Tronco y ramas =========================================================================
const tronco = m.sub('tronco');
const raiz = tronco.poner('11213', TIERRA, {nombre: 'raiz'}); // alcorque de tierra oscura
// Busca cómo encastrar un 67361 sobre la raíz con su base 2x2 centrada en (cx, cz) y el cuello hacia (dx, dz).
function cuello(cx: number, cz: number, dx: number, dz: number, nombre: string) {
	const studs: [number, number][] = [[2, 0], [3, 0], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [1, 4], [2, 4], [3, 4], [4, 4], [2, 5], [3, 5]];
	for (const stud of studs)
		for (const con of [[0, 0], [1, 0], [0, 1], [1, 1]] as [number, number][])
			for (const giro of [0, 90, 180, 270]) {
				const tr = trDe(aux.poner('67361', 0, {sobre: copia(trDe(raiz), '11213'), stud, con, giro}));
				const d = aplR(tr.r, [0, 0, 1]);
				if (Math.abs(tr.t[0] - cx) < 1e-6 && Math.abs(tr.t[2] - cz) < 1e-6 && Math.abs(d[0] - dx) < 1e-6 && Math.abs(d[2] - dz) < 1e-6)
					return tronco.poner('67361', CORTEZA, {sobre: raiz, stud, con, giro, nombre});
			}
	throw new Error(`no encuentro cómo poner ${nombre}`);
}
// Cuatro cuellos curvos (67361): el tronco se abre en vaso. Cada cuello apunta hacia afuera.
// Orden de armado: de atrás hacia adelante (la cámara 3/4 mira desde adelante a la izquierda).
const cuello1 = cuello(20, 20, 0, 1, 'cuello-1');
tronco.paso();
const cuello4 = cuello(20, -20, 1, 0, 'cuello-4');
tronco.paso();
const cuello2 = cuello(-20, 20, -1, 0, 'cuello-2');
const cuello3 = cuello(-20, -20, 0, -1, 'cuello-3');
tronco.paso();
const cuellos = [cuello1, cuello2, cuello3, cuello4];
// Ramas: una cola de animal (40378) dada vuelta en la punta de cada cuello, que termina vertical,
// y una barra 3L (ramita) en la punta que sostiene la nube.
const giros = [180, 135, 0, 225]; // con estos giros la punta de cada cola queda vertical
const tallos: P0[] = [];
for (const i of [0, 3, 1, 2]) {
	const tr = encastreDadoVuelta(trDe(cuellos[i]), '67361', 5, '40378', 0, giros[i], [0, 0, -1], [0, 0, 0], 10);
	const media = tronco.poner('40378', RAMA, {...ubic(tr), nombre: `rama-${i + 1}`});
	const tt = encastreDadoVuelta(trDe(media), '40378', 1, '87994', 0, 0, [0, -1, 0], [0, 60, 0], 4);
	tallos[i] = tronco.poner('87994', RAMA, {...ubic(tt), nombre: `ramita-${i + 1}`});
	if (i !== 1) tronco.paso(); // las dos últimas ramas van juntas
}

// === 3. Nube de flores =========================================================================
const FLOR = 'Pink';
const FLOR_OSC = 'Medium_Dark_Pink';
type F = [number, number, string];
// Se arma de abajo hacia arriba, así cada pieza nueva se ve desde arriba. La hoja de ancla (la del medio)
// entra por su anti-stud (2,0) en la barra de la rama; la nube crece hacia el centro de la copa (j = 5) y
// sube hacia allá, así las cuatro nubes arman una cúpula. `conPasos` = false arma la misma nube en un solo
// paso: se usa para las nubes repetidas, que en el video se muestran ya armadas.
function hacerNube(nombre: string, conPasos: boolean) {
	const n = m.sub(nombre);
	const paso = () => conPasos && n.paso();
	const flores = (sobre: P0, lista: F[], id = '4728') => lista.map(([i, j, c]) => n.poner(id, c, {sobre, stud: [i, j]}));
	const baja2 = n.poner('2423', ROSA_OSC, {nombre: 'hoja-baja-2'}); // abajo, más chica y oscura: sombra
	const c2 = flores(baja2, [[0, 2, FLOR], [2, 1, BLANCO]]);
	paso();
	const baja = n.poner('2417', ROSA, {sobre: c2[0], stud: [0, 0], con: [2, 3], giro: 180, nombre: 'hoja-baja'});
	paso();
	const c1 = flores(baja, [[2, 3, FLOR], [0, 5, BLANCO]]); // (0,5) queda justo bajo el anti-stud (4,5) de la hoja
	paso();
	const hoja = n.poner('2417', ROSA, {sobre: c1[0], stud: [0, 0], con: [2, 3], giro: 90, nombre: 'hoja'});
	paso();
	const f1 = flores(hoja, [[0, 3, BLANCO], [2, 3, FLOR_OSC], [4, 3, FLOR], [1, 5, FLOR], [3, 5, BLANCO], [2, 0, FLOR]]);
	flores(hoja, [[1, 1, ROSA], [3, 1, BLANCO]], '24866');
	paso();
	const hoja2 = n.poner('2417', BLANCO, {sobre: f1[1], stud: [0, 0], con: [2, 3], giro: 180, nombre: 'hoja-2'});
	paso();
	const f2 = flores(hoja2, [[1, 2, FLOR], [3, 2, FLOR_OSC], [2, 0, BLANCO]]);
	paso();
	const hoja3 = n.poner('2423', ROSA, {sobre: f2[2], stud: [0, 0], con: [0, 0], giro: 180, nombre: 'hoja-3'});
	flores(hoja3, [[1, 3, FLOR]]);
	n.paso();
	return {n, hoja};
}
const nube = hacerNube('nube', true);
const nubeArmada = hacerNube('nube-armada', false);

// === Modelo principal ==========================================================================
const R = m.raiz;
R.colocar(base);
R.paso();
const enTronco: Tr = {r: ID.r, t: [0, -8, 0]}; // sobre la placa 16x16 (centro)
R.colocar(tronco, ubic(enTronco));
R.paso();
const rotY = (g: number): Tr => {
	const c = Math.cos(g), s = Math.sin(g);
	return {r: [c, 0, s, 0, 1, 0, -s, 0, c], t: [0, 0, 0]};
};
// Dónde va cada nube: la hoja de ancla se calza por su anti-stud de la punta (2,0) en la barra (6 LDU
// adentro), apuntando hacia el centro de la copa para que las nubes se junten arriba del tronco.
function dondeNube(p: P0): Tr {
	const B = trDe(p);
	const d = [-B.t[0], 0, -B.t[2]];
	const bx = aplR(B.r, [1, 0, 0]), bz = aplR(B.r, [0, 0, 1]);
	const th = Math.atan2(d[0] * bx[0] + d[2] * bx[2], d[0] * bz[0] + d[2] * bz[2]);
	const local = componer(componer({r: ID.r, t: [0, -2, 0]}, rotY(th)), {r: ID.r, t: [0, 0, 60]});
	const H = trDe(nube.hoja); // la hoja de ancla dentro del submodelo (igual en las dos versiones)
	const inv: Tr = {r: [H.r[0], H.r[3], H.r[6], H.r[1], H.r[4], H.r[7], H.r[2], H.r[5], H.r[8]], t: [0, 0, 0]};
	inv.t = aplR(inv.r, H.t).map((x) => -x);
	return componer(enTronco, componer(B, componer(local, inv)));
}
// Primera nube (atrás), armada paso a paso; después las demás ya armadas; la de adelante, al final.
R.colocar(nube.n, ubic(dondeNube(tallos[0])));
R.paso();
R.colocar(nubeArmada.n, ubic(dondeNube(tallos[3])));
R.paso();
R.colocar(nubeArmada.n, ubic(dondeNube(tallos[1])));
R.paso();
R.colocar(nubeArmada.n, ubic(dondeNube(tallos[2])));
// Con la última nube caen los pétalos sobre el pasto (encastrados en la placa de la base).
const PETALOS: [number, number, string][] = [
	[7, 4, ROSA], [7, 1, BLANCO], [8, 3, ROSA], [13, 5, ROSA], [13, 8, BLANCO], [3, 9, ROSA], [2, 6, BLANCO],
	[6, 12, ROSA], [9, 13, BLANCO], [12, 11, ROSA], [9, 1, ROSA_OSC], [1, 1, ROSA], [7, 14, ROSA], [14, 13, BLANCO],
	[1, 12, ROSA], [11, 6, BLANCO], [14, 2, ROSA], [5, 14, ROSA_OSC], [3, 11, BLANCO], [12, 8, ROSA],
];
for (const [i, j, c] of PETALOS) R.poner('24866', c, ubic(trDe(aux.poner('24866', 0, {sobre: copia(trDe(placa), '91405'), stud: [i, j]}))));
R.paso();

m.guardar();
