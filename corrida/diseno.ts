import {Modelo, grilla} from '../taller/src/dsl.ts';

// Cerezo japonés (sakura) en plena floración.
// Marco global: stud (i, j) centrado en (20i+10, 20j+10); el eje del tronco pasa por (120, 120).
// Capa c = cara superior a y = -8c. at(): origen (centro, cara superior) de una pieza W×D con esquina menor (i, j).
const at = (i: number, j: number, w: number, d: number, c: number) => grilla(i + w / 2, c, j + d / 2);
type V3 = [number, number, number];

// Simetría de 4: gira una posición k·90° alrededor del eje del tronco (misma convención que rot 'Y').
const EJE = 120;
function girar([x, y, z]: V3, k: number): V3 {
	let dx = x - EJE;
	let dz = z - EJE;
	for (let n = 0; n < ((k % 4) + 4) % 4; n++) [dx, dz] = [dz, -dx];
	return [EJE + dx, y, EJE + dz];
}
const rotY = (k: number) => `Y${(((90 * k) % 360) + 360) % 360}`;
const subir = ([x, y, z]: V3, placas: number): V3 => [x, y - 8 * placas, z];

const m = new Modelo('cerezo');
const CORTEZA = 'Reddish_Brown';
const RAMITA = 'Dark_Brown';
const SOMBRA = 'Dark_Pink';
const ROSA = 'Bright_Pink';
const BLANCO = 'White';

// ================= base: disco de césped con pétalos caídos =================
const base = m.sub('base');
base.poner('41539', 'Dark_Green', {en: at(2, 2, 8, 8, 1)});
base.paso();
for (let k = 0; k < 4; k++) base.poner('6003', 'Green', {en: girar(at(6, 0, 6, 6, 2), k), rot: rotY(k)});
base.paso();
for (let k = 0; k < 4; k++) base.poner('30565', 'Bright_Green', {en: girar(at(6, 2, 4, 4, 3), k), rot: rotY(k)});
base.paso();
// pétalos caídos: tejas redondas 1x1 sobre el césped (i, j, capa del apoyo)
const PETALOS: [number, number, number][] = [
	[1, 4, 2], [0, 7, 2], [3, 10, 2], [8, 11, 2], [10, 8, 2], [11, 5, 2],
	[7, 1, 2], [4, 0, 2], [8, 3, 3], [3, 8, 3], [2, 5, 3], [9, 6, 3],
];
PETALOS.forEach(([i, j, c], n) => base.poner('98138', n % 3 === 2 ? BLANCO : ROSA, {en: at(i, j, 1, 1, c + 1)}));
base.paso();

// ================= tronco: raíces, fuste y ramas en vaso =================
const tronco = m.sub('tronco');
// raíces: placa redonda 6x6 y pendientes curvas en molinete, con la parte alta contra el tronco
const suelo = tronco.poner('11213', 'Green', {en: at(3, 3, 6, 6, 4)});
for (let k = 0; k < 4; k++) tronco.poner('11477', CORTEZA, {en: girar([110, -8 * 4, 80], k), rot: rotY(k)});
tronco.paso();
const t1 = tronco.poner('3003', CORTEZA, {sobre: suelo, stud: [2, 2]});
const t2 = tronco.poner('3941', CORTEZA, {sobre: t1, stud: [0, 0]});
const anillo = tronco.poner('4032a', RAMITA, {sobre: t2, stud: [0, 0]});
tronco.paso();
// ramas: placa 1x2 de puntas redondas + ladrillo redondo 1x1, en escalera (cada tramo: 1 stud afuera, 4 placas arriba)
function rama(stud: [number, number], giro: number, tramos: number, remate: boolean) {
	let p = tronco.poner('35480', CORTEZA, {sobre: anillo, stud, giro});
	for (let k = 1; k < tramos; k++) {
		const r = tronco.poner('3062b', CORTEZA, {sobre: p, stud: [1, 0]});
		p = tronco.poner('35480', CORTEZA, {sobre: r, stud: [0, 0], giro});
	}
	if (remate) {
		const r = tronco.poner('3062b', CORTEZA, {sobre: p, stud: [1, 0]});
		tronco.poner('6141', CORTEZA, {sobre: r, stud: [0, 0]});
	}
}
rama([1, 0], 0, 3, false);
tronco.paso();
rama([0, 1], 180, 3, false);
tronco.paso();
rama([1, 1], 90, 2, true);
rama([0, 0], 270, 2, true);
tronco.paso();
// plataforma que ata las cuatro puntas (queda en sombra bajo la copa)
const D = 22; // cara superior del disco de la copa
tronco.poner('41539', SOMBRA, {en: at(2, 2, 8, 8, D - 1)});
tronco.paso();

// ================= copa: nube de cúpulas =================
const copa = m.sub('copa');
// nubes colgantes: cúpulas invertidas que redondean la panza de la copa
for (let k = 0; k < 4; k++)
	for (let n = 0; n < 3; n++) copa.poner('15395', n === 1 && k % 2 === 0 ? BLANCO : ROSA, {en: girar([80 + 40 * n, -8 * (D - 1) + 16, 20], k)});
copa.paso();
// disco de 12x12 con esquinas redondas: las cúpulas colgantes de cada lado lo atan
for (let k = 0; k < 4; k++) copa.poner('6003', ROSA, {en: girar(at(6, 0, 6, 6, D), k), rot: rotY(k)});
copa.paso();
const ALTO = -8 * (D + 6);
// corona: primero las cuatro esquinas redondas 3x3x2...
const esquinas: V3[] = [];
for (let k = 0; k < 4; k++) {
	const p = girar([190, ALTO, 50], k);
	copa.poner('88293', ROSA, {en: p, rot: rotY(k)});
	esquinas.push(p);
}
copa.paso();
// ...y en cada lado, dos más forman una media cúpula
const hojitas: [V3, number][] = [];
for (let k = 0; k < 4; k++) {
	copa.poner('88293', ROSA, {en: girar([130, ALTO, 50], k), rot: rotY(k)});
	copa.poner('88293', k % 2 ? BLANCO : ROSA, {en: girar([110, ALTO, 50], k), rot: rotY(k + 1)});
	hojitas.push([girar([130, ALTO, 50], k), k], [girar([110, ALTO, 50], k), k + 1]);
	// remates del borde: donde la media cúpula no llega, una teja redonda en cada punta
	for (const i of [3, 8]) copa.poner('98138', k % 2 ? BLANCO : ROSA, {en: girar(at(i, 0, 1, 1, D + 1), k)});
}
copa.paso();
// cúpula central, levantada dos ladrillos
const columna = copa.poner('3003', ROSA, {en: at(5, 5, 2, 2, D + 3)});
copa.poner('3003', ROSA, {sobre: columna, stud: [0, 0]});
for (let k = 0; k < 4; k++) copa.poner('88293', ROSA, {en: girar([130, -8 * (D + 12), 110], k), rot: rotY(k)});
copa.paso();
// hojitas sobre los studs de las medias cúpulas, abiertas hacia afuera
hojitas.forEach(([p, k], n) => copa.poner('32607', n % 3 === 1 ? ROSA : BLANCO, {en: subir(p, 1), rot: rotY(k)}));
// receptores de los ramilletes: placa redonda 1x1 con stud abierto en cada esquina, pompón con stud hueco en la cima
const enchufes: V3[] = [];
for (const p of esquinas) {
	copa.poner('85861', SOMBRA, {en: subir(p, 1)});
	enchufes.push(subir(p, 1.5));
}
const cima = at(5, 5, 2, 2, D + 15);
copa.poner('30367c', ROSA, {en: cima});
enchufes.push(subir(cima, 0.5));
copa.paso();

// ================= ramillete: tallo con 6 flores =================
const ramillete = m.sub('ramillete');
ramillete.poner('19119', RAMITA, {en: [0, 0, 0]});
// pines del tallo (de `piezas ver 19119`): base, eje y largo
const PINES: [V3, V3, number][] = [
	[[-6.5, -10.0624, 0], [-0.5, -0.866025, 0], 25.5],
	[[3.25, -10.0624, 5.62866], [0.25, -0.866025, 0.433014], 25.5],
	[[-3.75853, -5.73657, -6.50965], [-0.469847, -0.342019, -0.813798], 24.5],
	[[3.25, -10.0624, -5.62866], [0.25, -0.866025, -0.433014], 25.5],
	[[-3.75853, -5.73657, 6.50965], [-0.469847, -0.342019, 0.813798], 24.5],
	[[7.51706, -5.73656, 0], [0.939693, -0.342019, 0], 24.5],
];
const FLORES = [ROSA, BLANCO, 'Pink', ROSA, BLANCO, ROSA];
const grados = (r: number) => Math.round(((r * 180) / Math.PI) * 100) / 100;
PINES.forEach(([b, a, largo], k) => {
	// La flor mira hacia afuera: su -Y local queda sobre el eje del pin y su agujero, en la punta.
	const v: V3 = [-a[0], -a[1], -a[2]];
	const alfa = grados(Math.acos(v[1]));
	const beta = grados(Math.atan2(v[2], -v[0]));
	const s = largo - 4;
	ramillete.poner('3742', FLORES[k], {en: [b[0] + a[0] * s, b[1] + a[1] * s, b[2] + a[2] * s], rot: `Z${alfa} Y${beta}`});
});
ramillete.paso();

// ================= armado principal =================
m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(tronco);
m.raiz.paso();
m.raiz.colocar(copa);
m.raiz.paso();
// la revelación: los ramilletes en flor, uno primero, tres juntos y el último en la cima
enchufes.forEach((p, k) => {
	m.raiz.colocar(ramillete, {en: p, rot: `Y${(k * 47) % 360}`});
	if (k === 0 || k >= 3) m.raiz.paso();
});
m.guardar();
