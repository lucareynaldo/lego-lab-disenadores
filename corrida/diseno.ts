import {Modelo} from '../taller/src/dsl.ts';

// Cerezo en flor (Prunus serrulata): tronco corto con ensanche de raíces, copa extendida en pisos
// rosados, flores blancas arriba y pétalos caídos en el césped.
const m = new Modelo('cerezo');

// ---- BASE: césped 8x8, raíces en cruz, pasto y pétalos caídos
const base = m.sub('base');
const cesped = base.poner('41539', 'Bright_Green');
base.paso();
const r1 = base.poner('3020', 'Reddish_Brown', {sobre: cesped, stud: [2, 3]});
base.paso();
const r2 = base.poner('3020', 'Reddish_Brown', {sobre: r1, stud: [1, 0], con: [0, 1], giro: 90});
base.paso();
for (const [i, j] of [[0, 0], [7, 0], [0, 7], [7, 7], [1, 4], [6, 3], [4, 7], [3, 0], [0, 2], [7, 2], [2, 1], [5, 6], [1, 3], [6, 4], [2, 6], [5, 2]]) base.poner('6141', 'Green', {sobre: cesped, stud: [i, j]});
base.paso();
const petalos: [number, number, string][] = [[0, 5, 'White'], [1, 6, 'Bright_Pink'], [6, 1, 'White'], [7, 5, 'Bright_Pink'], [1, 1, 'Bright_Pink'], [6, 6, 'White'],
	[5, 0, 'Bright_Pink'], [2, 7, 'White']];
for (const [i, j, c] of petalos) base.poner('24866', c, {sobre: cesped, stud: [i, j]});
base.paso();

// ---- TRONCO: dos tramos gruesos y se divide en dos ramas finas
const tronco = m.sub('tronco');
const t0 = tronco.poner('3941', 'Reddish_Brown');
const t1 = tronco.poner('3941', 'Reddish_Brown', {sobre: t0, stud: [0, 0]});
tronco.paso();
tronco.paso();
const t2 = t1;
const t3 = tronco.poner('3062b', 'Reddish_Brown', {sobre: t2, stud: [0, 0]});
const t4 = tronco.poner('3062b', 'Reddish_Brown', {sobre: t2, stud: [1, 1]});
tronco.poner('3062b', 'Reddish_Brown', {sobre: t3, stud: [0, 0]});
tronco.poner('3062b', 'Reddish_Brown', {sobre: t4, stud: [0, 0]});
tronco.paso();

// ---- COPA: pisos que alternan la dirección de las hojas (textura de nube de flores)
const copa = m.sub('copa');
const p1 = copa.poner('3958', 'Dark_Pink');
copa.paso();
copa.poner('2423', 'Bright_Pink', {sobre: p1, stud: [0, 1]});
copa.poner('2423', 'Bright_Pink', {sobre: p1, stud: [5, 1]});
copa.paso();
const n1 = copa.poner('3941', 'Bright_Pink', {sobre: p1, stud: [2, 2]});
const flores1 = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [1, 1], [4, 1], [1, 4], [4, 4]];
for (const [i, j] of [[2, 1], [3, 1], [2, 4], [3, 4]]) copa.poner('3062b', 'Bright_Pink', {sobre: p1, stud: [i, j]});
copa.paso();
for (const [i, j] of flores1) copa.poner('24866', 'White', {sobre: p1, stud: [i, j]});
copa.paso();
const p2 = copa.poner('3031', 'Dark_Pink', {sobre: n1, stud: [0, 0], con: [1, 1]});
copa.poner('2423', 'Bright_Pink', {sobre: p2, stud: [0, 0], giro: 90});
copa.poner('2423', 'Bright_Pink', {sobre: p2, stud: [0, 3], giro: 90});
copa.paso();
const n2 = copa.poner('3941', 'Bright_Pink', {sobre: p2, stud: [1, 1]});
for (const [i, j] of [[0, 1], [0, 2], [3, 1], [3, 2]]) copa.poner('24866', 'White', {sobre: p2, stud: [i, j]});
copa.paso();
copa.poner('24866', 'White', {sobre: n2, stud: [0, 0]});
copa.paso();

// ---- Ensamble: una copia auxiliar calcula dónde apoya cada sub-armado
const aux = new Modelo('calc').sub('aux');
const aB = aux.poner('41539', 'Bright_Green');
const ar1 = aux.poner('3020', 'Reddish_Brown', {sobre: aB, stud: [2, 3]});
const ar2 = aux.poner('3020', 'Reddish_Brown', {sobre: ar1, stud: [1, 0], con: [0, 1], giro: 90});
const at0 = aux.poner('3941', 'Reddish_Brown', {sobre: ar2, stud: [0, 1]});
const at1 = aux.poner('3941', 'Reddish_Brown', {sobre: at0, stud: [0, 0]});
const at2 = at1;
const at3 = aux.poner('3062b', 'Reddish_Brown', {sobre: at2, stud: [0, 0]});
const at5 = aux.poner('3062b', 'Reddish_Brown', {sobre: at3, stud: [0, 0]});
const ap1 = aux.poner('3958', 'Dark_Pink', {sobre: at5, stud: [0, 0], con: [2, 2]});

m.raiz.colocar(base); m.raiz.paso();
m.raiz.colocar(tronco, {en: at0.tr.t}); m.raiz.paso();
m.raiz.colocar(copa, {en: ap1.tr.t}); m.raiz.paso();
m.guardar();
