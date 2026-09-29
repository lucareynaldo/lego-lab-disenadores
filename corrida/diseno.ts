import {Modelo, grilla} from '../taller/src/dsl.ts';

// ---------- geometría mínima para las bisagras (lo único que no encastra por stud) ----------
type V3 = [number, number, number];
type M3 = number[]; // 3x3 por filas, como LDraw
type Tr = {tr: {r: number[]; t: number[]}};
const mul = (a: M3, b: M3): M3 => {
	const r: number[] = [];
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]);
	return r;
};
const ap = (m: M3, v: V3): V3 => [0, 1, 2].map((i) => m[i * 3] * v[0] + m[i * 3 + 1] * v[1] + m[i * 3 + 2] * v[2]) as V3;
const suma = (a: V3 | number[], b: V3 | number[]): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const rad = (g: number) => (g * Math.PI) / 180;
const rotY = (g: number): M3 => { const c = Math.cos(rad(g)), s = Math.sin(rad(g)); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
const rotZ = (g: number): M3 => { const c = Math.cos(rad(g)), s = Math.sin(rad(g)); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
// Matriz -> "Xa Yb Zc" (parsearRot compone Rz·Ry·Rx).
const aTexto = (m: M3): string => {
	const b = Math.asin(Math.max(-1, Math.min(1, -m[6])));
	const a = Math.atan2(m[7], m[8]);
	const c = Math.atan2(m[3], m[0]);
	const g = (x: number) => ((x * 180) / Math.PI).toFixed(6);
	return `X${g(a)} Y${g(b)} Z${g(c)}`;
};

// Bisagra bloqueable 1x2: la hembra de un dedo (44301a) se engancha en los dos dedos de `a` (44302a)
// y gira `tita` grados alrededor del eje de los dedos (negativo = levanta la punta).
function posBisagra(a: Tr, tita: number) {
	const P: V3 = [30, 2, 0];
	const T0: V3 = [60, 0, 0];
	const d = ap(rotZ(tita), [T0[0] - P[0], T0[1] - P[1], T0[2] - P[2]]);
	const R = mul(a.tr.r, mul(rotZ(tita), rotY(180)));
	return {R, t: suma(a.tr.t, ap(a.tr.r, suma(P, d)))};
}
// Ángulo que deja la hembra nivelada (studs hacia arriba).
function titaNivel(a: Tr): number {
	let mejor = 0, err = 1e9;
	for (let t = -180; t <= 180; t += 0.25) {
		const e = Math.abs(posBisagra(a, t).R[4] - 1);
		if (e < err) { err = e; mejor = t; }
	}
	return mejor;
}
// Dónde va un sub-armado cuya primera pieza es una placa AxP en su origen, para que su anti-stud
// (0,0) quede sobre el stud `s` de la bisagra 1x2 `b` (que está en un sub-armado ubicado en `base`).
function sobreBisagra(b: Tr, s: number, ancho: number, prof: number, base: V3) {
	const T: V3 = [-10 + 20 * s + 10 * (ancho - 1), -8, 10 * (prof - 1)];
	return {en: suma(base, suma(b.tr.t, ap(b.tr.r, T))), rot: aTexto(b.tr.r)};
}

const m = new Modelo('acacia');
const MARRON = 'Reddish_Brown';

// ---------- SUELO ----------
// Disco de sabana de 12x12 hecho con cuatro placas 6x6 de esquina redonda.
const suelo = m.sub('suelo');
const CUARTOS: {c: V3; giro: number; nombre: string}[] = [
	{c: [60, 0, -60], giro: 0, nombre: 'NE'},
	{c: [-60, 0, -60], giro: 90, nombre: 'NO'},
	{c: [-60, 0, 60], giro: 180, nombre: 'SO'},
	{c: [60, 0, 60], giro: 270, nombre: 'SE'},
];
const cuartos = CUARTOS.map((q) => suelo.poner('6003', 'Dark_Tan', {en: q.c, rot: `Y${q.giro}`, nombre: `cuarto ${q.nombre}`}));
suelo.poner('3031', 'Tan', {sobre: cuartos[0], stud: [1, 4], con: [3, 0], nombre: 'centro'});
// Encastra sobre el suelo en la celda (ci, cj) del disco (-6..5; +X este, +Z sur), en el cuarto que toque.
function enSuelo(id: string, color: string, ci: number, cj: number, nombre: string, giro = 0) {
	const k = ci >= 0 ? (cj < 0 ? 0 : 3) : cj < 0 ? 1 : 2;
	const q = CUARTOS[k];
	const w: V3 = [20 * ci + 10 - q.c[0], 0, 20 * cj + 10 - q.c[2]];
	const l = ap(rotY(-q.giro), w);
	const stud: [number, number] = [Math.round((l[0] + 50) / 20), Math.round((l[2] + 50) / 20)];
	return suelo.poner(id, color, {sobre: cuartos[k], stud, giro, nombre});
}
suelo.paso();
// claros de arena
enSuelo('4032a', 'Tan', 2, 2, 'arena');
enSuelo('4032a', 'Tan', -5, -3, 'arena');
enSuelo('6141', 'Tan', 4, 3, 'arena');
enSuelo('6141', 'Tan', -3, -5, 'arena');
enSuelo('6141', 'Tan', 3, -4, 'arena');
// piedras
enSuelo('54200', 'Dark_Bluish_Grey', -4, 3, 'piedra', 90);
enSuelo('54200', 'Dark_Bluish_Grey', -4, 4, 'piedra', 180);
enSuelo('6141', 'Light_Bluish_Grey', -3, 4, 'piedrita');
suelo.paso();
// matas de pasto (seco y verde) y arbustos bajos
for (const [ci, cj, color] of [[4, -1, 'Lime'], [5, 0, 'Sand_Green'], [-4, -4, 'Lime'], [1, 5, 'Sand_Green']] as const)
	enSuelo('30176', color, ci, cj, 'pasto');
for (const [ci, cj, color] of [[3, -2, 'Pearl_Gold'], [-3, -3, 'Pearl_Gold'], [-2, 5, 'Pearl_Gold'], [-5, 1, 'Sand_Green'], [3, -5, 'Lime']] as const)
	enSuelo('32607', color, ci, cj, 'mata');
suelo.paso();

// ---------- TRONCO Y RAMAS ----------
const tronco = m.sub('tronco');
const raiz = tronco.poner('3031', MARRON, {nombre: 'raíces'});
// ensanche de la base: pendientes 1x1 mirando hacia afuera, dos por lado
for (const [i, j, g] of [[1, 0, 180], [2, 0, 180], [3, 1, 90], [3, 2, 90], [2, 3, 0], [1, 3, 0], [0, 2, 270], [0, 1, 270]] as const)
	tronco.poner('54200', MARRON, {sobre: raiz, stud: [i, j], giro: g, nombre: 'ensanche'});
tronco.paso();
const t1 = tronco.poner('3941', MARRON, {sobre: raiz, stud: [1, 1], nombre: 'tronco'});
const horq = tronco.poner('3031', MARRON, {sobre: t1, stud: [0, 0], con: [1, 1], nombre: 'horqueta'});
tronco.paso();

// Cada rama se arma primero en un marco canónico (hacia +X, con la bisagra del pie en el origen), donde
// el encastre por stud sobre piezas inclinadas da el rumbo correcto; después se copia girada a su lugar.
type PiezaRama = {id: string; color: string; nombre: string; r: M3; t: V3};
function ramaCanonica(beta: number, largo: number): {piezas: PiezaRama[]; punta: number} {
	const tmp = new Modelo('borrador').sub('canonica');
	const piezas: PiezaRama[] = [];
	const anotar = (id: string, nombre: string, p: Tr) => { piezas.push({id, color: MARRON, nombre, r: p.tr.r, t: p.tr.t as V3}); return p; };
	const a = anotar('44302a', 'bisagra pie', tmp.poner('44302a', MARRON));
	const p = posBisagra(a, -beta);
	const b = anotar('44301a', 'bisagra pie hembra', tmp.poner('44301a', MARRON, {en: p.t, rot: aTexto(p.R)}));
	const idViga = {4: '3710', 5: '78329', 6: '3666'}[largo]!;
	const viga = anotar(idViga, 'viga', tmp.poner(idViga, MARRON, {sobre: b as any, stud: [1, 0], con: [0, 0]}));
	const idAbajo = {4: '35480', 5: '3623', 6: '3710'}[largo]!;
	anotar(idAbajo, 'viga abajo', tmp.poner(idAbajo, MARRON, {debajo: viga as any, antistud: [2, 0], con: [0, 0]}));
	const idTeja = largo === 6 ? '2431' : largo === 5 ? '63864' : '3069b';
	anotar(idTeja, 'corteza', tmp.poner(idTeja, MARRON, {sobre: viga as any, stud: [0, 0], con: [0, 0]}));
	const a2 = anotar('44302a', 'bisagra punta', tmp.poner('44302a', MARRON, {sobre: viga as any, stud: [largo - 1, 0], con: [1, 0]}));
	const p2 = posBisagra(a2, titaNivel(a2));
	anotar('44301a', 'bisagra punta hembra', tmp.poner('44301a', MARRON, {en: p2.t, rot: aTexto(p2.R)}));
	return {piezas, punta: piezas.length - 1};
}
// `detalle`: la rama se muestra en dos pasos (bisagra y viga; después la punta). Las repetidas van en uno.
function rama(stud: [number, number], giro: number, beta: number, largo: number, nombre: string, detalle: boolean) {
	const a = tronco.poner('44302a', MARRON, {sobre: horq, stud, giro, nombre: `${nombre} bisagra pie`});
	const {piezas, punta} = ramaCanonica(beta, largo);
	let b2: Tr = a;
	piezas.forEach((pz, i) => {
		if (i === 0) return;
		const R = mul(a.tr.r, pz.r);
		const t = suma(a.tr.t, ap(a.tr.r, pz.t));
		const puesta = tronco.poner(pz.id, pz.color, {en: t, rot: aTexto(R), nombre: `${nombre} ${pz.nombre}`});
		if (i === punta) b2 = puesta;
		if (detalle && pz.nombre === 'viga abajo') tronco.paso();
	});
	tronco.paso();
	return b2;
}
// Las dos ramas empinadas (este y oeste) llevan las nubes grandes arriba; la del sur, más tendida, una
// nube chica un piso más abajo; la del norte, un brote chico que deja ver el tronco en la vista 3/4.
// Así los platos se superponen sin chocar y la copa queda en capas.
const norte = rama([2, 1], 270, 50, 4, 'norte', true);
const oeste = rama([1, 1], 180, 60, 5, 'oeste', true);
const este = rama([2, 2], 0, 63, 5, 'este', false);
const sur = rama([1, 2], 90, 40, 4, 'sur', false);

// ---------- NUBES DE COPA ----------
// Un plato de radar invertido hace de "nube" de follaje plana; debajo, hojas verde oscuro asoman como
// flecos. El plato va levantado dos placas para que las hojas pasen por debajo de su borde. Arriba,
// flores amarillo claro: la acacia en flor.
function nube(nombre: string, plato: '3961' | '44375b' | '3960', hojas: [string, string, number, number][]) {
	const n = m.sub(nombre);
	const sep = n.poner('35480', MARRON, {nombre: 'separador'});
	const p0 = n.poner('3020', 'Dark_Green', {sobre: sep, stud: [0, 0], con: [0, 0], nombre: 'asiento'});
	const r1 = n.poner('3022', MARRON, {sobre: p0, stud: [2, 0], nombre: 'realce'});
	const r2 = n.poner('3022', MARRON, {sobre: r1, stud: [0, 0], nombre: 'realce'});
	for (const [id, color, j, giro] of hojas)
		n.poner(id, color, {sobre: p0, stud: [0, j], con: id === '2417' ? [2, 0] : [0, 0], giro, nombre: 'hojas'});
	n.paso();
	const copa = n.poner(plato, 'Sand_Green', {sobre: r2, stud: [0, 0], con: [0, 0], nombre: `copa ${nombre}`});
	n.poner('24866', 'Bright_Light_Yellow', {sobre: copa, stud: [0, 0], nombre: 'flor'});
	if (plato !== '3960') n.poner('24866', 'Bright_Light_Yellow', {sobre: copa, stud: [1, 1], nombre: 'flor'});
	n.paso();
	return n;
}
const nubeG = nube('nube-grande', '3961', [['2417', 'Dark_Green', 0, 180], ['2423', 'Green', 1, 0]]);
const nubeC = nube('nube-chica', '44375b', [['2417', 'Green', 1, 0]]);
const nubeM = nube('brote', '3960', [['2417', 'Dark_Green', 1, 0]]);

// ---------- MONTAJE ----------
const EN_TRONCO: V3 = [0, -16, 0];
m.raiz.colocar(suelo);
m.raiz.paso();
m.raiz.colocar(tronco, {en: EN_TRONCO});
m.raiz.paso();
// la copa se arma de abajo hacia arriba: primero el brote y la nube chica, después las grandes; la del
// este cierra el paraguas al final
for (const [b2, nb] of [[norte, nubeM], [sur, nubeC], [oeste, nubeG], [este, nubeG]] as const) {
	m.raiz.colocar(nb, sobreBisagra(b2, 0, 2, 1, EN_TRONCO));
	m.raiz.paso();
}
m.guardar();
