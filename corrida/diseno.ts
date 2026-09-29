import {Modelo, grilla, Submodelo} from '../taller/src/dsl.ts';

// Acacia de sabana: base de tierra, tronco que se abre en escalera, copa plana en "mesa" con nidos de tejedor colgando.
const m = new Modelo('acacia');
const TR = 'Reddish_Brown';

// ---------- base ----------
const base = m.sub('base');
const suelo = base.poner('91405', 'Tan');
base.paso();
base.poner('60474', 'Dark_Brown', {sobre: suelo, stud: [7, 7], con: [1, 1]}); // ensanche de raíces
base.poner('3020', 'Dark_Tan', {sobre: suelo, stud: [1, 12]});
base.poner('3022', 'Dark_Tan', {sobre: suelo, stud: [12, 2]});
base.poner('3710', 'Dark_Tan', {sobre: suelo, stud: [10, 12]});
base.paso();
for (const [i, j] of [[1, 1], [3, 2], [13, 13], [14, 9], [2, 10], [12, 4], [5, 14], [0, 6]] as [number, number][])
	base.poner('32607', 'Green', {sobre: suelo, stud: [i, j]});
base.poner('6141', 'Dark_Bluish_Grey', {sobre: suelo, stud: [14, 14]});
base.poner('6141', 'Light_Bluish_Grey', {sobre: suelo, stud: [13, 1]});
base.paso();
m.raiz.colocar(base);
m.raiz.paso();

// posiciones de mundo: réplica sin sub para calcular anclajes
const aux = new Submodelo('aux');
const sueloA = aux.poner('91405', 'Tan');
const flareA = aux.poner('60474', 'Dark_Brown', {sobre: sueloA, stud: [7, 7], con: [1, 1]});
const t0 = aux.poner('3941', TR, {sobre: flareA, stud: [1, 1]});

// ---------- tronco ----------
const tronco = m.sub('tronco');
const pie = tronco.poner('3941', TR);
let top = pie;
for (let k = 0; k < 2; k++) top = tronco.poner('3941', TR, {sobre: top, stud: [0, 0]});
tronco.paso();
// primer piso de ramas: placa 2x6 que cruza en X
const p1 = tronco.poner('3795', TR, {sobre: top, stud: [0, 0], con: [2, 0]});
tronco.paso();
const rA = tronco.poner('3062b', TR, {sobre: p1, stud: [0, 0]});
const rB = tronco.poner('3062b', TR, {sobre: p1, stud: [5, 1]});
const rA2 = tronco.poner('3062b', TR, {sobre: rA, stud: [0, 0]});
const rB2 = tronco.poner('3062b', TR, {sobre: rB, stud: [0, 0]});
tronco.paso();
// segundo piso: placa 2x10, ramas más abiertas
const p2 = tronco.poner('3832', TR, {sobre: rA2, stud: [0, 0], con: [2, 0]});
tronco.paso();
const tipA = tronco.poner('3062b', TR, {sobre: p2, stud: [0, 0]});
const tipB = tronco.poner('3062b', TR, {sobre: p2, stud: [9, 1]});
tronco.paso();
m.raiz.colocar(tronco, {en: t0.tr.t});
m.raiz.paso();

// ---------- copa ----------
const suma = (a: number[], b: number[]) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]] as [number, number, number];
const puntaA = aux.poner('3062b', TR, {en: suma(t0.tr.t, tipA.tr.t)});
const anclaCopa = aux.poner('3029', 'Dark_Green', {sobre: puntaA, stud: [0, 0], con: [1, 1]});

const copa = m.sub('copa');
const A = copa.poner('3029', 'Dark_Green'); // 4x12 central, se apoya en las dos puntas
const L = copa.poner('3958', 'Green', {sobre: A, stud: [0, 0], con: [0, 1]});
const R = copa.poner('3958', 'Green', {sobre: A, stud: [6, 0], con: [0, 1]});
copa.paso();
const B1 = copa.poner('3832', 'Green', {debajo: L, antistud: [1, 0], con: [0, 1]});
const B2 = copa.poner('3832', 'Green', {debajo: L, antistud: [1, 5], con: [0, 0]});
copa.paso();
const T1 = copa.poner('3034', 'Green', {sobre: B1, stud: [1, 0], con: [0, 1]});
const T2 = copa.poner('3034', 'Green', {sobre: B2, stud: [1, 1], con: [0, 0]});
copa.poner('3666', 'Dark_Green', {debajo: T1, antistud: [1, 0]});
copa.poner('3666', 'Dark_Green', {debajo: T2, antistud: [1, 1]});
copa.paso();
// nidos de tejedor colgando bajo la copa
for (const [p, i, j] of [[B1, 1, 0], [B2, 7, 1], [R, 5, 0]] as [typeof A, number, number][]) {
	const n = copa.poner('3062b', 'Tan', {debajo: p, antistud: [i, j]});
	copa.poner('4589', 'Tan', {debajo: n, antistud: [0, 0]});
}
copa.paso();
const cima = copa.poner('3035', 'Bright_Green', {sobre: L, stud: [2, 1]});
copa.paso();
for (const [p, i, j] of [[T1, 0, 0], [T1, 5, 0], [T2, 2, 1], [T2, 7, 1], [R, 5, 5], [L, 0, 0], [L, 0, 5], [R, 5, 0], [cima, 0, 0], [cima, 7, 3], [cima, 3, 0], [cima, 4, 3], [L, 0, 3], [R, 5, 3], [B1, 0, 0], [B1, 9, 0], [B2, 0, 1], [B2, 9, 1], [T1, 3, 0], [T2, 5, 1]] as [typeof A, number, number][])
	copa.poner('32607', 'Bright_Green', {sobre: p, stud: [i, j]});
copa.paso();
m.raiz.colocar(copa, {en: anclaCopa.tr.t});
m.raiz.paso();
m.guardar();
