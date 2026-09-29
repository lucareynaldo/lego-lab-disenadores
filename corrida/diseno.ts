import {Modelo, grilla} from '../taller/src/dsl.ts';

// Acacia paraguas (Vachellia tortilis) en la sabana. Escala ~1:100.
//
// Sub-armados: suelo (base 12x12), tronco (raíces, tronco, collar y las cuatro ramas) y copa; al final, los nidos.
// La idea: cada rama es un paralelogramo de dos bisagras plegadas en V; la de abajo la inclina ~45° hacia
// afuera y la de arriba devuelve la punta a la horizontal. El ángulo exacto lo busca el script para que
// las cuatro puntas caigan en la grilla de la copa, que se encastra a presión desde arriba y deja todo
// trabado: una mesa verde sobre un vaso de ramas desnudas, sin poste central.

const m = new Modelo('Acacia paraguas');
const MARRON = 'Reddish_Brown';

// ---------- geometría auxiliar ----------
type V3 = [number, number, number];
type Pieza = ReturnType<typeof m.raiz.poner>;
type Sub = typeof m.raiz;
// Una capa: piezas centradas en su origen, con su grilla local w×h (antes de girarlas).
type Capa = {p: Pieza; w: number; h: number}[];

// Giro alrededor de Y igual al de `rot: 'Y<g>'` (múltiplos de 90).
const rotY = (g: number, [x, y, z]: V3): V3 => {
	const a = (g * Math.PI) / 180;
	const c = Math.round(Math.cos(a));
	const s = Math.round(Math.sin(a));
	return [c * x + s * z, y, -s * x + c * z];
};
const sumar = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Coordenadas locales (x, z) de un punto para una pieza girada alrededor de Y: Rᵀ · (p − t).
function local(p: Pieza, x: number, z: number): [number, number] {
	const r = p.tr.r;
	const dx = x - p.tr.t[0];
	const dz = z - p.tr.t[2];
	return [r[0] * dx + r[6] * dz, r[2] * dx + r[8] * dz];
}
const indice = (l: number, n: number) => (l + (n - 1) * 10) / 20;
const entero = (v: number, n: number) => Math.abs(v - Math.round(v)) < 1e-6 && v > -0.5 && v < n - 0.5;

// Qué pieza de la capa tiene un stud en el punto (x, z), y con qué índice propio.
function studEn(capa: Capa, x: number, z: number): {p: Pieza; ij: [number, number]} | undefined {
	for (const {p, w, h} of capa) {
		const [lx, lz] = local(p, x, z);
		const li = indice(lx, w);
		const lj = indice(lz, h);
		if (entero(li, w) && entero(lj, h)) return {p, ij: [Math.round(li), Math.round(lj)]};
	}
	return undefined;
}

// Pone una pieza w×h centrada en (cx, cz) con `giro`, encastrada en el primer stud de la capa que tenga abajo.
function apoyar(sub: Sub, capa: Capa, id: string, color: string, w: number, h: number, cx: number, cz: number, giro = 0): Pieza {
	const a = (-giro * Math.PI) / 180; // giro g = rotación Y(−g)
	const c = Math.cos(a);
	const s = Math.sin(a);
	for (let lj = 0; lj < h; lj++)
		for (let li = 0; li < w; li++) {
			const lx = -(w - 1) * 10 + 20 * li;
			const lz = -(h - 1) * 10 + 20 * lj;
			const base = studEn(capa, cx + c * lx + s * lz, cz - s * lx + c * lz);
			if (!base) continue;
			try {
				return sub.poner(id, color, {sobre: base.p, stud: base.ij, con: [li, lj], giro});
			} catch {
				// Ese stud o antistud no existe (borde redondeado): probar el siguiente.
			}
		}
	throw new Error(`${id} en (${cx}, ${cz}) no apoya en la capa`);
}

// Hojas de helecho: el tallo en (x, z) y el abanico hacia `dir`.
const GIRO_HOJA: Record<string, number> = {'+Z': 0, '-X': 90, '-Z': 180, '+X': 270};
// Índices del tallo como stud (para colgarla) y como antistud (para apoyarla).
const TALLO: Record<string, {stud: [number, number]; anti: [number, number]}> = {
	'2417': {stud: [2, 0], anti: [2, 0]},
	'2423': {stud: [1, 0], anti: [0, 0]},
};
function hoja(sub: Sub, capa: Capa, x: number, z: number, dir: string, color: string, id = '2423') {
	const b = studEn(capa, x, z);
	if (!b) throw new Error(`hoja: (${x}, ${z}) fuera de la capa`);
	return sub.poner(id, color, {sobre: b.p, stud: b.ij, con: TALLO[id].anti, giro: GIRO_HOJA[dir]});
}
function hojaAbajo(sub: Sub, capa: Capa, x: number, z: number, dir: string, color: string, id = '2423') {
	const b = studEn(capa, x, z);
	if (!b) throw new Error(`hoja: (${x}, ${z}) fuera de la capa`);
	return sub.poner(id, color, {debajo: b.p, antistud: b.ij, con: TALLO[id].stud, giro: GIRO_HOJA[dir]});
}
// Una pieza de 1x1 (o 2x2 centrada) sobre el stud de la capa en (x, z).
function sobreStud(sub: Sub, capa: Capa, x: number, z: number, id: string, color: string) {
	const b = studEn(capa, x, z);
	if (!b) throw new Error(`${id}: (${x}, ${z}) fuera de la capa`);
	return sub.poner(id, color, {sobre: b.p, stud: b.ij});
}

// ---------- rama: dos bisagras plegadas en V y una columna de ladrillos redondos ----------
// Abajo, la tapa de la bisagra se abre `grados` sobre la placa del collar y la columna nace inclinada hacia
// afuera; arriba, la otra bisagra en V deja la placa de la punta horizontal. `g` es el rumbo de la rama
// (0/90/180/270, como rot Y<g>); los giros de cada encastre compensan ese rumbo para que las cuatro ramas
// sean la misma rama girada.
const COLUMNA = ['3062b', '3062b', '85861', '3062b'];
type Apoyo = {p: Pieza; stud: [number, number]};
function armarRama(s: Sub, grados: number, g = 0, apoyo?: Apoyo, pasoAPaso = true) {
	const paso = () => pasoAPaso && s.paso();
	const rumbo = (360 - g) % 360; // en "sobre", giro −g equivale a rot Y<g>
	const pie = apoyo ? s.poner('44302a', MARRON, {sobre: apoyo.p, stud: apoyo.stud, giro: rumbo}) : s.poner('44302a', MARRON);
	const tapa = s.poner('44301a', MARRON, {conector: {de: pie, n: 2}, propio: 5, giro: grados});
	paso();
	let c = s.poner(COLUMNA[0], MARRON, {sobre: tapa, stud: [1, 0]});
	for (const id of COLUMNA.slice(1)) c = s.poner(id, MARRON, {sobre: c, stud: [0, 0]});
	paso();
	const hombro = s.poner('44302a', MARRON, {sobre: c, stud: [0, 0], con: [0, 0], giro: (180 + rumbo) % 360});
	const bisagra = s.poner('44301a', MARRON, {conector: {de: hombro, n: 2}, propio: 5, giro: 0});
	// Suplemento: el nudillo de la bisagra asoma 2 LDU sobre su placa; con una placa más, la copa no lo toca.
	const punta = s.poner('35480', MARRON, {sobre: bisagra, stud: [0, 0], con: [1, 0], giro: rumbo});
	s.paso();
	return {pie, tapa, hombro, bisagra, punta};
}
// El ángulo se busca por bisección para que la punta avance exactamente 4 studs: así las cuatro puntas caen
// en la grilla de la copa. Da ≈ 45,1° (las dos V quedan con holgura) y la punta sube ≈ 104,6 LDU.
const AVANCE = 80;
const avance = (grados: number) => armarRama(new Modelo('prueba').raiz, grados).bisagra.tr.t[0];
let lo = 40;
let hi = 50;
for (let k = 0; k < 40; k++) {
	const mid = (lo + hi) / 2;
	if (avance(mid) < AVANCE) lo = mid;
	else hi = mid;
}
const GRADOS = (lo + hi) / 2;

// ---------- suelo: 12x12 de esquinas redondeadas, sabana seca ----------
const suelo = m.sub('suelo');
suelo.poner('6003', 'Dark_Tan', {en: grilla(3, 0, -3)});
suelo.poner('6003', 'Dark_Tan', {en: grilla(-3, 0, -3), rot: 'Y90'});
suelo.poner('6003', 'Dark_Tan', {en: grilla(-3, 0, 3), rot: 'Y180'});
suelo.poner('6003', 'Dark_Tan', {en: grilla(3, 0, 3), rot: 'Y270'});
suelo.paso();
// Segunda capa con las juntas corridas: traba las cuatro esquinas.
const centro = suelo.poner('3029', 'Tan', {en: grilla(0, 1, 0), rot: 'Y90'});
const tierra: Capa = [
	{p: centro, w: 12, h: 4},
	{p: suelo.poner('3031', 'Tan', {en: grilla(4, 1, 0)}), w: 4, h: 4},
	{p: suelo.poner('3031', 'Tan', {en: grilla(-4, 1, 0)}), w: 4, h: 4},
];
tierra.push(
	{p: suelo.poner('30565', 'Tan', {en: grilla(4, 1, -4)}), w: 4, h: 4},
	{p: suelo.poner('30565', 'Dark_Tan', {en: grilla(-4, 1, -4), rot: 'Y90'}), w: 4, h: 4},
	{p: suelo.poner('30565', 'Tan', {en: grilla(-4, 1, 4), rot: 'Y180'}), w: 4, h: 4},
	{p: suelo.poner('30565', 'Dark_Tan', {en: grilla(4, 1, 4), rot: 'Y270'}), w: 4, h: 4},
);
suelo.paso();
// Un termitero, y una piedra con un canto rodado.
apoyar(suelo, tierra, '3942c', MARRON, 2, 2, -80, 80);
suelo.paso();
apoyar(suelo, tierra, '15068', 'Dark_Bluish_Grey', 2, 2, 80, -80, 90);
sobreStud(suelo, tierra, 90, -50, '6141', 'Light_Bluish_Grey');
suelo.paso();
// Pasto seco en matas.
sobreStud(suelo, tierra, -90, 30, '32607', 'Bright_Light_Orange');
sobreStud(suelo, tierra, -30, -90, '32607', 'Yellow');
sobreStud(suelo, tierra, 30, 90, '32607', 'Bright_Light_Yellow');
sobreStud(suelo, tierra, 90, 50, '32607', 'Yellow');
sobreStud(suelo, tierra, -90, -70, '32607', 'Lime');
sobreStud(suelo, tierra, 50, -90, '32607', 'Bright_Light_Yellow');
suelo.paso();

// La rama modelo, parada en el origen: de acá salen la punta y la comprobación de las cuatro ramas reales.
const modelo = armarRama(new Modelo('prueba').raiz, GRADOS);

// ---------- tronco ----------
const tronco = m.sub('tronco');
const disco = tronco.poner('11213', 'Dark_Tan');
const t1 = tronco.poner('3941', MARRON, {sobre: disco, stud: [2, 2]});
tronco.paso();
// Raíces: cuatro curvas en molinete, la parte alta contra el tronco (ensanche de la base).
tronco.poner('11477', MARRON, {sobre: disco, stud: [5, 3], giro: 90});
tronco.poner('11477', MARRON, {sobre: disco, stud: [0, 2], giro: 270});
tronco.poner('11477', MARRON, {sobre: disco, stud: [2, 5], giro: 180});
tronco.poner('11477', MARRON, {sobre: disco, stud: [3, 0], giro: 0});
tronco.paso();
const t2 = tronco.poner('3941', MARRON, {sobre: t1, stud: [0, 0]});
// Horqueta: un collar redondo 4x4 donde apoyan las cuatro ramas en molinete, todas a la misma altura.
const collar = tronco.poner('60474', 'Dark_Brown', {sobre: t2, stud: [0, 0], con: [1, 1]});
tronco.paso();
const yPie = collar.tr.t[1] - 8;
// Cuatro ramas en molinete. Primero las de atrás (vistas desde el frente 3/4), así cada rama nueva queda a
// la vista; las dos primeras se muestran paso a paso y las otras dos, iguales, en un solo paso cada una.
const pies: {en: V3; g: number}[] = [
	{en: [10, yPie, 20], g: 270},
	{en: [20, yPie, -10], g: 0},
	{en: [-20, yPie, 10], g: 180},
	{en: [-10, yPie, -20], g: 90},
];
const cerca = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.01;
pies.forEach((p, k) => {
	// El pie apoya su antistud (0,0) en el stud del collar que le queda abajo.
	const [ax, , az] = sumar(p.en, rotY(p.g, [-10, 0, 0]));
	const stud: [number, number] = [(ax - collar.tr.t[0] + 30) / 20, (az - collar.tr.t[2] + 30) / 20];
	const r = armarRama(tronco, GRADOS, p.g, {p: collar, stud}, k < 2);
	for (const n of ['pie', 'tapa', 'hombro', 'bisagra', 'punta'] as const)
		if (!cerca(r[n].tr.t, sumar(p.en, rotY(p.g, modelo[n].tr.t)))) throw new Error(`rama ${k}: ${n} fuera de lugar`);
});
const puntas = pies.map((p) => sumar(p.en, rotY(p.g, modelo.punta.tr.t)));

// ---------- copa: losa 16x14 y dos molinetes de helechos ----------
const copa = m.sub('copa');
// Losa de abajo, verde oscuro (la sombra de la mesa). Se apoya suelta; la traba la losa de arriba.
const losa: Capa = [
	{p: copa.poner('3029', 'Dark_Green', {en: grilla(0, 0, 0), rot: 'Y90'}), w: 12, h: 4},
	{p: copa.poner('3710', 'Dark_Green', {en: grilla(0, 0, 6.5)}), w: 4, h: 1},
	{p: copa.poner('3710', 'Dark_Green', {en: grilla(0, 0, -6.5)}), w: 4, h: 1},
];
copa.paso();
losa.push(
	{p: copa.poner('3795', 'Dark_Green', {en: grilla(5, 0, 0)}), w: 6, h: 2},
	{p: copa.poner('3795', 'Dark_Green', {en: grilla(-5, 0, 0)}), w: 6, h: 2},
	{p: copa.poner('6003', 'Dark_Green', {en: grilla(5, 0, -4)}), w: 6, h: 6},
	{p: copa.poner('6003', 'Dark_Green', {en: grilla(-5, 0, -4), rot: 'Y90'}), w: 6, h: 6},
	{p: copa.poner('6003', 'Dark_Green', {en: grilla(-5, 0, 4), rot: 'Y180'}), w: 6, h: 6},
	{p: copa.poner('6003', 'Dark_Green', {en: grilla(5, 0, 4), rot: 'Y270'}), w: 6, h: 6},
);
copa.paso();
// Losa de arriba con las juntas corridas.
const losa2: Capa = [
	{p: apoyar(copa, losa, '3036', 'Dark_Green', 8, 6, 0, 0), w: 8, h: 6},
	{p: apoyar(copa, losa, '3035', 'Dark_Green', 8, 4, 0, 100), w: 8, h: 4},
	{p: apoyar(copa, losa, '3035', 'Dark_Green', 8, 4, 0, -100), w: 8, h: 4},
];
losa2.push(
	{p: apoyar(copa, losa, '3032', 'Dark_Green', 6, 4, 120, 0, 90), w: 6, h: 4},
	{p: apoyar(copa, losa, '3032', 'Dark_Green', 6, 4, -120, 0, 90), w: 6, h: 4},
	{p: apoyar(copa, losa, '30565', 'Dark_Green', 4, 4, 120, -100, 0), w: 4, h: 4},
	{p: apoyar(copa, losa, '30565', 'Dark_Green', 4, 4, -120, -100, 270), w: 4, h: 4},
	{p: apoyar(copa, losa, '30565', 'Dark_Green', 4, 4, -120, 100, 180), w: 4, h: 4},
	{p: apoyar(copa, losa, '30565', 'Dark_Green', 4, 4, 120, 100, 90), w: 4, h: 4},
);
copa.paso();
// Flecos: hojas colgando bajo el borde, entre las puntas de las ramas.
const flecos = [
	hojaAbajo(copa, losa, 110, 50, '+X', 'Dark_Green'),
	hojaAbajo(copa, losa, 110, -70, '+X', 'Dark_Green'),
	hojaAbajo(copa, losa, -110, -50, '-X', 'Dark_Green'),
	hojaAbajo(copa, losa, -110, 70, '-X', 'Dark_Green'),
];
copa.paso();
flecos.push(
	hojaAbajo(copa, losa, -70, 90, '+Z', 'Dark_Green'),
	hojaAbajo(copa, losa, 50, 90, '+Z', 'Dark_Green'),
	hojaAbajo(copa, losa, 70, -90, '-Z', 'Dark_Green'),
	hojaAbajo(copa, losa, -50, -90, '-Z', 'Dark_Green'),
);
copa.paso();
// Primer molinete de helechos grandes, abiertos hacia afuera: cubre medio techo y pasa el borde.
const molino = [hoja(copa, losa2, 50, 50, '+Z', 'Green', '2417'), hoja(copa, losa2, 50, -50, '+X', 'Green', '2417')];
copa.paso();
molino.push(hoja(copa, losa2, -50, 50, '-X', 'Green', '2417'), hoja(copa, losa2, -50, -50, '-Z', 'Green', '2417'));
copa.paso();
// Segundo molinete, girado al revés y una placa más arriba (cada hoja en un taco sobre el tallo de otra):
// tapa los huecos del primero. Con hojas a dos alturas, la copa se ve mullida y deja pasar luz.
const GIRO2 = ['+X', '-Z', '+Z', '-X'];
molino.forEach((h, k) => {
	const taco = copa.poner('85861', 'Green', {sobre: h, stud: [2, 0]});
	copa.poner('2417', 'Bright_Green', {sobre: taco, stud: [0, 0], con: [2, 0], giro: GIRO_HOJA[GIRO2[k]]});
	if (k % 2 === 1) copa.paso();
});
// La mata del centro: un disco, un tronquito y el helecho más alto, con un brote.
const disco4 = apoyar(copa, losa2, '60474', 'Green', 4, 4, 0, 0);
const tronquito = copa.poner('3062b', 'Green', {sobre: disco4, stud: [1, 1]});
const cima = copa.poner('2417', 'Lime', {sobre: tronquito, stud: [0, 0], con: [2, 3], giro: GIRO_HOJA['+X']});
copa.poner('32607', 'Lime', {sobre: cima, stud: [2, 3]});
copa.paso();
// ---------- modelo ----------
// Primero la base, el árbol pelado y la copa, que baja sobre las cuatro puntas horizontales.
m.raiz.colocar(suelo);
const yTronco = centro.tr.t[1] - 8;
m.raiz.colocar(tronco, {en: [0, yTronco, 0]});
const yCopa = yTronco + puntas[0][1] - 8;
m.raiz.colocar(copa, {en: [0, yCopa, 0]});
m.raiz.paso();
// Final: llegan los tejedores. Dos nidos colgando de la punta de dos flecos (el tejedor cuelga el nido de
// la punta de la rama, lejos de las víboras). El cono entra por su stud en el antistud (0,3) del fleco,
// que está 8 LDU debajo del origen de la hoja.
for (const f of [flecos[2], flecos[7]]) m.raiz.poner('4589', 'Tan', {en: sumar([0, yCopa, 0], sumar(f.tr.t, [0, 8, 0]))});
m.raiz.paso();
m.guardar();
